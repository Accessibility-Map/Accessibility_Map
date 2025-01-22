import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
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
  const map = useMap();

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
  const handleDeleteImages = async (imageUrl) => {
    console.log("Delete button clicked for Image URL:", imageUrl);

    // Ensure the URL starts with a leading slash
    const relativePath = imageUrl
      .replace(process.env.REACT_APP_API_URL, "")
      .trim();

    const normalizedPath = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;

    console.log("Normalized Relative Image URL being sent:", normalizedPath);

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/delete-image`,
        {
          data: { imageUrl: normalizedPath },
        }
      );

      // Update the UI
      setImages((prevImages) =>
        prevImages.filter((image) => image !== imageUrl)
      );
      console.log("Image removed from frontend.");
    } catch (error) {
      console.error(
        "Error deleting image:",
        error.response?.data || error.message
      );
    }
  };

  const handleReplaceImage = async (newFile, oldImageUrl) => {
    const relativePath = oldImageUrl
      .replace(`${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}`, "")
      .replace(/^\/?/, "/");
  
    const formData = new FormData();
    formData.append("file", newFile);
    formData.append("oldImageUrl", relativePath);
    console.log("Sending oldImageUrl:", relativePath);
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/replace-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        const newImageUrl = response.data.imageUrl;
  
        // Update the images array to reflect the new image immediately
        setImages((prevImages) =>
          prevImages.map((img) =>
            img === oldImageUrl ? `${process.env.REACT_APP_API_URL}${newImageUrl.replace(/^\/+/, "")}` : img
          )
        );
  
        console.log("Image replaced successfully:", newImageUrl);
      }
    } catch (error) {
      console.error("Error replacing the image:", error);
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
        const imageUrls = response.data.map(
          (picture) =>
            `${process.env.REACT_APP_API_URL.replace(
              /\/+$/,
              ""
            )}/${picture.imageUrl.replace(/^\/+/, "")}`
        );
        setImages(imageUrls);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]); // Handle errors by clearing images
    }
  };

  // Call fetchImages whenever the location changes
  useEffect(() => {
    if (location?.locationID) {
      fetchImages();
    }
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
    FeatureService.getFeaturesByLocationID(location.locationID).then(
      (features) => {
        setFeaturesList(features);
      }
    );
  }, [location.locationID]);

  const handleMarkerClick = (locationID) => {
    const bounds = map.getBounds();
    const bottom = bounds.getNorth();
    const center = bounds.getCenter();
    const difference = bottom - center.lat;
    console.log("Difference:", difference);
    map.setView([(location.latitude + (difference * .9)), location.longitude], 17);
    setOpenPopupId(locationID);
  };

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{
        click: () => handleMarkerClick(location.locationID),
      }}
    >
      <Popup
        onClose={handleClosePopup}
        autoPan={false}
        closeOnClick={false}
        maxWidth={700}
        className={`leaflet-popup ${isEditing ? "edit-mode" : ""}`}
      >
        <div
          className="leaflet-popup-content"
          style={{
            width: isEditing ? "500px" : "400px",
          }}
        >
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
              <ImageScroller
                images={images} // Use the `images` state
                onDelete={handleDeleteImages} // Use the defined `handleDeleteImages`
                onReplace={handleReplaceImage} // Callback to handle image replacement
                heightParam="250px"
              />

              <Divider>
                <Chip label="Features" size="small"></Chip>
              </Divider>
              <FeaturesListWithToggle featuresList={featuresList} />
              <StarRating locationID={location.locationID} userID={userID} />
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

