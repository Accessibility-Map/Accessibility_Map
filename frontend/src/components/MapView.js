import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "../styles/MapView.css";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import SearchBar from "./SearchBar";
import MarkerPopup from "./MarkerPopup";
import AddMarkerOnClick from "./AddMarkerOnClick";

const UCCoordinates = [39.1317, -84.515];

const MapView = () => {
  const [openPopupId, setOpenPopupId] = useState(null); 

  const [locations, setLocations] = useState([]);
  const [newMarker, setNewMarker] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [accessibilityFeatures, setAccessibilityFeatures] = useState("");
  const [accessibilityDescriptions, setAccessibilityDescriptions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/locations`
        );
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchLocations();
  }, []);
 // Function to handle setting the popup ID (you can also include this inline)
 const handleOpenPopup = (id) => {
  setOpenPopupId(id);
};
  const handleAddMarker = (location) => {
    setNewMarker(location);
    setLocationName("");
    setAccessibilityFeatures("");
    setAccessibilityDescriptions("");
  };
  const handleEditClick = (location) => {
    setEditingLocation(location); 
    setLocationName(location.locationName); 
    setAccessibilityFeatures(location.accessibilityFeatures);
    setAccessibilityDescriptions(location.accessibilityDescriptions);
    setIsEditing(true); 
  };
  const saveEdit = async (location) => {
    if (editingLocation) {
      const updatedLocation = {
        ...editingLocation,
        locationName,
        accessibilityFeatures,
        accessibilityDescriptions,
      };
  
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/locations/${editingLocation.locationID}`,
          updatedLocation
        );
  
        setLocations(locations.map((loc) =>
          loc.locationID === editingLocation.locationID ? response.data : loc
        ));
  
        // Keep popup open after saving
        setIsEditing(false);
        setEditingLocation(null);
      } catch (error) {
        console.error("Error saving edited location:", error);
      }
    }
  };

  const deleteMarker = async (locationID) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/locations/${locationID}`);
      setLocations(locations.filter((location) => location.locationID !== locationID));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };
  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOptions={["Ramp", "Elevator", "Parking", "Restroom"]}
        selectedFilters={selectedFilters}
        toggleFilter={(filter) =>
          setSelectedFilters((prev) =>
            prev.includes(filter)
              ? prev.filter((f) => f !== filter)
              : [...prev, filter]
          )
        }
      />
      <MapContainer
        center={UCCoordinates}
        zoom={17}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <MarkerPopup
            key={location.locationID}
            location={location}
            isEditing={isEditing}
            editingLocation={editingLocation}
            locationName={locationName}
            setLocationName={setLocationName}
            accessibilityFeatures={accessibilityFeatures}
            setAccessibilityFeatures={setAccessibilityFeatures}
            accessibilityDescriptions={accessibilityDescriptions}
            setAccessibilityDescriptions={setAccessibilityDescriptions}
            saveEdit={saveEdit}
            deleteMarker={deleteMarker}
            handleEditClick={handleEditClick}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId} 
          />
        ))}
        <AddMarkerOnClick onAddMarker={handleAddMarker} />
      </MapContainer>
    </div>
  );
};

export default MapView;
