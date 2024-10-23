import React, { useRef, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";

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
                <input
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
                />
                <input
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
                />
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
              <p>Features: {location.accessibilityFeatures}</p>
              <p>Description: {location.accessibilityDescriptions}</p>
              <button
                className="popup-button"
                onClick={() => handleEdit(location)}
              >
                Edit Location
              </button>
              <button
                className="popup-button"
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
