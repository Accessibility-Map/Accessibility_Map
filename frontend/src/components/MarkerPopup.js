import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import FeatureService from "../services/FeatureService.ts";
import "../styles/MarkerPopup.css";
import AddFeatureButton from "./AddFeatureButton.tsx";
import StarRating from "./StarRating.tsx";

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

  // Open the popup programmatically
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

  // Ensure the default popup opens when the map starts
  useEffect(() => {
    if (openDefaultPopupOnStart && openPopupId === location.locationID) {
      openPopup();
    }
  }, [openDefaultPopupOnStart, openPopupId, location.locationID]);

  // Ensure the popup opens when editing starts
  useEffect(() => {
    if (isEditing && editingLocation?.locationID === location.locationID) {
      console.log(
        "Popup opened during editing for location:",
        location.locationID
      );
      openPopup();
    }
  }, [isEditing, editingLocation, location.locationID]);

  // Handle opening popup during edit
  const handleEdit = (location) => {
    console.log("Edit clicked for location:", location.locationID);
    handleEditClick(location);
    setOpenPopupId(location.locationID);
    openPopup();
  };

  const handleSaveEdit = () => {
    console.log("Save clicked for location:", location.locationID);
    saveEdit(location);
    setOpenPopupId(location.locationID);
    openPopup();
  };

  const handleClosePopup = () => {
    console.log("Closing popup for location:", location.locationID);
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
                  onChange={(e) => {
                    console.log("Editing location name:", e.target.value);
                    setLocationName(e.target.value);
                  }}
                />
                {/* <input
                  type="text"
                  placeholder="Accessibility Features"
                  value={accessibilityFeatures}
                  onChange={(e) => {
                    console.log(
                      "Editing accessibility features:",
                      e.target.value
                    );
                    setAccessibilityFeatures(e.target.value);
                  }}
                /> */}
                {/* <input
                  type="text"
                  placeholder="Accessibility Description"
                  value={accessibilityDescriptions}
                  onChange={(e) => {
                    console.log(
                      "Editing accessibility descriptions:",
                      e.target.value
                    );
                    setAccessibilityDescriptions(e.target.value);
                  }}
                /> */}
                <button
                  type="button"
                  className="popup-button"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </form>
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
              <button
                className="popup-button-delete"
                onClick={() => {
                  console.log(
                    "Delete clicked for location:",
                    location.locationID
                  );
                  deleteMarker(location.locationID);
                }}
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
