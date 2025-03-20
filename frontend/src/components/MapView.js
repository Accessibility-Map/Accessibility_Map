import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Icon } from "leaflet";
import MarkerPopup from "./MarkerPopup.js";
import AddMarkerOnClick from "./AddMarkerOnClick.js";
import "./styles/MapView.css";
import AvatarButton from "./AvatarButton.tsx";

const UCCoordinates = [39.1317, -84.515];

const customMarkerIcon = new Icon({
  iconUrl: "/Icons/Mapmarker.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
});

const MapView = ({ showSearch, searchTerm = "", selectedFilters = [] }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const locationIDFromURL = queryParams.get("locationID");

  const [features, setFeatures] = useState([]);
  const [openPopupId, setOpenPopupId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [user, setUser] = useState(null);
  const [newMarker, setNewMarker] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (locationIDFromURL) {
      setOpenPopupId(parseInt(locationIDFromURL));
    }
  }, [locationIDFromURL]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/locations`);
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();
  }, []);

  useEffect(() => {
    const fetchFeaturesData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/features`);
        console.log("✅ Features API Response:", response.data);
        setFeatures(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching features data:", error);
        setFeatures([]);
      }
    };
    fetchFeaturesData();
  }, []);

  useEffect(() => {
    const storedLocation = JSON.parse(sessionStorage.getItem("selectedLocation") || "null");

    if (storedLocation && storedLocation.locationID) {
      console.log("📌 Opening location from favorites:", storedLocation);
      setOpenPopupId(storedLocation.locationID);

      setLocations((prevLocations) => {
        const exists = prevLocations.some((loc) => loc.locationID === storedLocation.locationID);
        return exists ? prevLocations : [...prevLocations, storedLocation];
      });

      sessionStorage.removeItem("selectedLocation");
    }
  }, []);

  console.log("📌 All locations before filtering:", locations);
  console.log("📌 All features:", features);

  const filteredLocations = locations.filter((location) => {
    console.log("🔍 Processing location:", location);

    if (!location?.locationName || typeof location.locationName !== "string") {
      console.warn("⚠️ Skipping location due to missing name:", location);
      return false;
    }

    // ✅ Ensures features are properly assigned to locations
    const locationFeatures = features
      .filter(feature => Number(feature.locationID) === Number(location.locationID))
      .map(feature => feature.locationFeature.trim().toLowerCase());

    console.log(`📌 Features for location ${location.locationID}:`, locationFeatures);
    console.log("🎯 Selected Filters:", selectedFilters);

    const matchesSearchTerm =
      location.locationName.toLowerCase().includes(searchTerm.toLowerCase());

    if (searchTerm && !matchesSearchTerm) return false;

    if (selectedFilters.length === 0) return true;

    // ✅ Fix: Use `every()` to ensure ALL selected filters match
    const matchesFilters = selectedFilters.every((filter) =>
      locationFeatures.includes(filter.trim().toLowerCase())
    );

    console.log("✅ matchesSearch:", matchesSearchTerm, "✅ matchesFilters:", matchesFilters);

    return matchesSearchTerm && matchesFilters;
  });

  const handleAddMarker = async (e) => {
    try {
      const payload = {
        locationName: locationName || "New Location",
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        description: description || "",
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/locations`, payload);
      const newLocation = response.data;

      setLocations((prevLocations) => [...prevLocations, newLocation]);
      setNewMarker(newLocation);
      setLocationName(newLocation.locationName || "");
      setDescription(newLocation.description || "");
      setOpenPopupId(newLocation.locationID);
    } catch (error) {
      console.error("❌ Error creating new marker:", error);
    }
  };

  return (
    <div>
      <AvatarButton UpdateUser={(newUser) => setUser(newUser)} />

      <MapContainer center={UCCoordinates} zoom={17} style={{ height: "100vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {filteredLocations.map((location) => (
          <MarkerPopup key={location.locationID} location={location} openPopupId={openPopupId} setOpenPopupId={setOpenPopupId} user={user} />
        ))}

        <AddMarkerOnClick onAddMarker={handleAddMarker} />
      </MapContainer>
    </div>
  );
};

export default MapView;
