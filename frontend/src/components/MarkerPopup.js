import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import FeatureService from "../services/FeatureService.ts";
import "../styles/MarkerPopup.css";
import AddFeatureButton from "./AddFeatureButton.tsx";
import StarRating from "./StarRating.tsx";
import axios from "axios";

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
  accessibilityFeatures,
  setAccessibilityFeatures,
  accessibilityDescriptions,
  setAccessibilityDescriptions,
  saveEdit,
  deleteMarker,
  handleEditClick,
  openPopupId,
  setOpenPopupId,
  openDefaultPopupOnStart,
}) => {
  const markerRef = useRef(null);
  const [featuresList, setFeaturesList] = useState([]);


  const openPopup = () => {
    if (markerRef.current && markerRef.current._popup) {
      const popup = markerRef.current._popup;
      const mapInstance = markerRef.current._map;
      if (mapInstance) {
        popup.openOn(mapInstance);
      } else {
        console.error("Map instance is not available.");
      }
    }
  };

  useEffect(() => {
    if (openDefaultPopupOnStart && openPopupId === location.locationID) {
      openPopup();
    }
  }, [openDefaultPopupOnStart, openPopupId, location.locationID]);

  useEffect(() => {
    if (isEditing && editingLocation?.locationID === location.locationID) {
      openPopup();
    }
  }, [isEditing, editingLocation, location.locationID]);

  // Fetch existing images for the location when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/locations/${location.locationID}/pictures`
        );
        setImages(
          response.data.map(
            (picture) => `${process.env.REACT_APP_API_URL}${picture.imageUrl}`
          )
        );
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchImages();
  }, [location.locationID]);

  // Handle opening popup during edit
  const handleEdit = (location) => {
    handleEditClick(location);
    setOpenPopupId(location.locationID);
    setLocationName(location.locationName || "");
    setAccessibilityFeatures(location.accessibilityFeatures || "");
    setAccessibilityDescriptions(location.accessibilityDescriptions || "");
    openPopup();
  };

  const handleSaveEdit = () => {
    saveEdit(location);
    setOpenPopupId(location.locationID);
    openPopup();
  };

  const handleClosePopup = () => {
    setOpenPopupId(null);
  };


  const getAccessibilityFeatures = async (locationID) => {
    let features = await FeatureService.getFeaturesByLocationID(locationID);
    return features;
  }

  useEffect(() => {
    getAccessibilityFeatures(location.locationID).then((features) => {
      console.log("features", features);
      const list = features.map(feature =>
        <p key={feature.id}>
          <span className="feature">{feature.LocationFeature}</span><br/>
          <span className="feature-description">{feature.Notes}</span>
        </p>  
      );
      console.log("Marker",list);
      setFeaturesList(list); // Update the state with the list of features
    });
  }, [location.locationID]);

  // Handle image file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle image upload
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
        `${process.env.REACT_APP_API_URL}/api/locations/${location.locationID}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setImages((prevImages) => [
        ...prevImages,
        `${process.env.REACT_APP_API_URL}${response.data.imageUrl}`,
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
    >
      <Popup onClose={handleClosePopup} autoPan={false} closeOnClick={false}>
        <div className="popup-content">
          {isEditing && editingLocation?.locationID === location.locationID ? (
            <>
              <div className="popup-header">Edit Location</div>
              <form className="popup-form">
                <input
                  type="text"
                  placeholder="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
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
              <p>Location ID: {location.locationID}</p>
              <p>Features:</p>
              <div>{featuresList}</div>
              <p>Description: {location.accessibilityDescriptions}</p>
              <StarRating locationID={location.locationID} />
              <AddFeatureButton locationID={location.locationID} />

              {images &&
                images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt="Uploaded location"
                    style={{ width: "100%", marginTop: "10px" }}
                  />
                ))}
              <button
                className="popup-button"
                onClick={() => handleEdit(location)}
              >
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
