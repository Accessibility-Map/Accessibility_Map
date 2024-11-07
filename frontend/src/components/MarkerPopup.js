import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import FeatureService from "./services/FeatureService.ts";
import AddFeatureButton from "./AddFeatureButton.tsx";
import StarRating from "./StarRating.tsx";
import axios from "axios";
import FeaturesListWithToggle from "./FeaturesListWithToggle"; // Import the new component
import "./styles/MarkerPopup.css";

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
}) => {
  const markerRef = useRef(null);
  const [featuresList, setFeaturesList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState("");
  const [accessibilityDescriptions, setAccessibilityDescriptions] =
    useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing && editingLocation?.locationID === location.locationID) {
      setLocationName(location.locationName || "");
    }
  }, [isEditing, editingLocation?.locationID, location.locationID]);

  const handleEditLocation = () => {
    setTimeout(() => {
      setLocationName(location.locationName || "");
      setEditingLocation(location);
      setIsEditing(true);
    }, 0);
  };

  const handleDeleteFeature = (featureId) => {
    setFeaturesList((prevFeatures) =>
      prevFeatures.filter((feature) => feature.id !== featureId)
    );
  };

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

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/pictures`
        );
        if (response.status === 200 && response.data.length > 0) {
          setImages(
            response.data.map(
              (picture) =>
                `${process.env.REACT_APP_API_URL.replace(
                  /\/+$/,
                  ""
                )}/${picture.imageUrl.replace(/^\/+/, "")}`
            )
          );
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
      }
    };

    fetchImages();
  }, [location.locationID]);

  const apiUrl = process.env.REACT_APP_API_URL.replace(/\/+$/, "");

  const handleSaveEdit = async () => {
    const updatedLocation = {
      ...location,
      locationName,
      accessibilityFeatures,
      accessibilityDescriptions,
    };

    try {
      // Save location changes
      await saveEdit(updatedLocation);

      // Update features with the corrected URL
      await Promise.all(
        featuresList.map((feature) => {
          const featureUrl = `${apiUrl}/api/features/${feature.id}`;
          console.log("Updating feature URL:", featureUrl);

          return axios.put(featureUrl, feature);
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

  const getAccessibilityFeatures = async (locationID) => {
    let features = await FeatureService.getFeaturesByLocationID(locationID);
    return features;
  };

  useEffect(() => {
    getAccessibilityFeatures(location.locationID).then((features) => {
      console.log("Fetched features:", features);
      setFeaturesList(features);
    });
  }, [location.locationID]);

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
    }
  };

  console.log("Rendering with locationName:", locationName);

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
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Location Name"
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
                        const updatedFeatures = [...featuresList];
                        updatedFeatures[index].Notes = e.target.value;
                        setFeaturesList(updatedFeatures);
                      }}
                      placeholder="Notes"
                      rows={2}
                    />
                    <button
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="delete-feature-button"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                <textarea
                  value={accessibilityDescriptions}
                  onChange={(e) => setAccessibilityDescriptions(e.target.value)}
                  placeholder="Accessibility Description"
                  rows={2}
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
              <FeaturesListWithToggle featuresList={featuresList} />
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
