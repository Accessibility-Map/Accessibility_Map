import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios";
import FeatureService from "./services/FeatureService.ts";
import AddFeatureButton from "./AddFeatureButton.tsx";
import StarRating from "./StarRating.tsx";
import FeaturesListWithToggle from "./FeaturesListWithToggle";
import "./styles/MarkerPopup.css";
import ImageScroller from "./ImageScroller";

import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

const customMarkerIcon = new Icon({
  iconUrl: "/Icons/Mapmarker.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
});

const MarkerPopup = ({
  location,
  isEditing,
  editingLocation,
  locationName,
  setLocationName,
  saveEdit,
  deleteMarker,
  setEditingLocation,
  setIsEditing,
  openPopupId,
  setOpenPopupId,
  openDefaultPopupOnStart,
  userID
}) => {
  const markerRef = useRef(null);
  const [featuresList, setFeaturesList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing && editingLocation?.locationID === location.locationID) {
      setLocationName(location.locationName || "");
      setDescription(location.description || "");
    }
  }, [isEditing, editingLocation?.locationID, location.locationID]);

  useEffect(() => {
    if (openPopupId === location.locationID && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [openPopupId, location.locationID]);

  const handleEditLocation = () => {
    setTimeout(() => {
      setLocationName(location.locationName || "");
      setEditingLocation(location);
      setIsEditing(true);
    }, 0);
  };
// Define handleFileChange function here
const handleFileChange = (e) => {
  setSelectedFile(e.target.files[0]);
};

const handleUpload = async () => {
  if (!selectedFile) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  setUploading(true);
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Image URL from response:", response.data.imageUrl);

    setImages((prevImages) => [
      ...prevImages,
      `${process.env.REACT_APP_API_URL.replace(
        /\/+$/,
        ""
      )}/${response.data.imageUrl.replace(/^\/+/, "")}`,
    ]);
  } catch (error) {
    console.error("Error uploading file:", error);
  } finally {
    setUploading(false);
  }
};

  const handleDeleteFeature = async (featureId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}api/features/${featureId}`
      );
      setFeaturesList((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== featureId)
      );
      setIsEditing(true);
    } catch (error) {
      console.error("Error deleting feature:", error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/pictures`
      );
      if (response.status === 200 && response.data.length > 0) {
        const imageUrls = response.data
          .filter((picture) => picture.imageUrl)
          .map((picture) =>
            `${process.env.REACT_APP_API_URL}${picture.imageUrl.replace(/^\/+/, "")}`
          );
        setImages(imageUrls);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [location.locationID]);

  const apiUrl = process.env.REACT_APP_API_URL.replace(/\/+$/, "");

  const handleSaveEdit = async () => {
    const updatedLocation = {
      ...location,
      locationName,
      description,
    };

    try {
      await saveEdit(updatedLocation);
      await Promise.all(
        featuresList.map((feature) => {
          const featureUrl = `${apiUrl}/api/features/${feature.id}`;
          return axios.put(featureUrl, {
            id: feature.id,
            locationFeature: feature.locationFeature,
            notes: feature.notes,
          });
        })
      );
      setIsEditing(false);
      setEditingLocation(null);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleClosePopup = () => {
    setOpenPopupId(null);
  };

  useEffect(() => {
    FeatureService.getFeaturesByLocationID(location.locationID).then((features) => {
      setFeaturesList(features);
    });
  }, [location.locationID]);

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{
        click: () => setOpenPopupId(location.locationID), // Open popup on click
      }}
    >
     <Popup onClose={handleClosePopup} autoPan={false} closeOnClick={false}>
  <div className="popup-content">
    {isEditing && editingLocation?.locationID === location.locationID ? (
      <>
        <div className="popup-header">Edit Location</div>
        <form className="popup-form">
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Location Name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Building Description"
            rows={2}
          />

          <h4>Features</h4>
          {featuresList.map((feature, index) => (
            <div key={feature.id} className="feature-item">
              <input
                type="text"
                value={feature.locationFeature}
                onChange={(e) => {
                  const updatedFeatures = featuresList.map((f, i) =>
                    i === index
                      ? { ...f, locationFeature: e.target.value }
                      : f
                  );
                  setFeaturesList(updatedFeatures);
                }}
                placeholder="Feature"
              />
              <textarea
                value={feature.notes || ""}
                onChange={(e) => {
                  const updatedFeatures = featuresList.map((f, i) =>
                    i === index ? { ...f, notes: e.target.value } : f
                  );
                  setFeaturesList(updatedFeatures);
                }}
                placeholder="Notes"
                rows={2}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFeature(feature.id);
                }}
                className="delete-feature-button"
              >
                🗑️
              </button>
            </div>
          ))}

          <button
            type="button"
            className="popup-button"
            onClick={handleSaveEdit}
          >
            Save Changes
          </button>
        </form>
        <div className="upload-section">
          <h3>Upload Image</h3>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </>
    ) : (
      <>
        <div className="popup-header">{location.locationName}</div>
        <p>{location.description}</p>
        <ImageScroller images={images} heightParam="250px" />
        <Divider>
          <Chip label="Features" size="small"></Chip>
        </Divider>
        <FeaturesListWithToggle featuresList={featuresList} />
        <StarRating locationID={location.locationID} userID={userID}/>
        <AddFeatureButton locationID={location.locationID} />

        <button className="popup-button" onClick={handleEditLocation}>
          Edit Location
        </button>

        <button
          className="popup-button-delete"
          onClick={() => deleteMarker(location.locationID)}
        >
          Delete Location
        </button>
      </>
    )}
  </div>
</Popup>
    </Marker>
  );
};

export default MarkerPopup;
