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
  const [accessibilityFeatures, setAccessibilityFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);

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


  const handleAddMarker = (location) => {
    setNewMarker(location);
    setLocationName("");
    setAccessibilityFeatures("");
  };

  const deleteMarker = async (locationID) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/locations/${locationID}`
      );
      setLocations(
        locations.filter((location) => location.locationID !== locationID)
      );
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
            locationName={locationName}
            setLocationName={setLocationName}
            accessibilityFeatures={accessibilityFeatures}
            setAccessibilityFeatures={setAccessibilityFeatures}
            deleteMarker={deleteMarker}
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
