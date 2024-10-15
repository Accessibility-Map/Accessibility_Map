import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios";
import "../styles/MapView.css";
import 'leaflet/dist/leaflet.css';

const UCCoordinates = [39.1317, -84.515]; // University of Cincinnati coordinates

// Custom Marker Icon
const customMarkerIcon = new Icon({
  iconUrl: "/Icons/Mapmarker.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
});

const AddMarkerOnClick = ({ onAddMarker }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAddMarker({ latitude: lat, longitude: lng });
    },
  });
  return null;
};

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [newMarker, setNewMarker] = useState(null);
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5232/api/locations");
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleAddMarker = (location) => {
    setNewMarker(location);
  };

  const saveMarker = async () => {
    try {
      if (newMarker) {
        const markerWithDetails = { ...newMarker, locationName }; 
        const response = await axios.post(
          "http://localhost:5232/api/locations",
          markerWithDetails
        );
        setLocations([...locations, response.data]);
        setNewMarker(null);
        setLocationName("");
      }
    } catch (error) {
      console.error("Error saving marker:", error);
    }
  };

  const deleteMarker = async (id) => {
    try {
      await axios.delete(`http://localhost:5232/api/locations/${id}`);
      setLocations(locations.filter((location) => location.locationID !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <MapContainer
      center={UCCoordinates}
      zoom={17.5}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location) => (
        <Marker
          key={location.locationID}
          position={[location.latitude, location.longitude]}
          icon={customMarkerIcon}
        >
          <Popup>
            <div className="popup-content">
              <div className="popup-header">{location.locationName}</div>
              <p>id: {location.locationID}</p>
              <p>latitude: {location.latitude}</p>
              <p>longitude: {location.longitude}</p>
              <button
                className="popup-button"
                onClick={() => deleteMarker(location.locationID)}
              >
                Delete Location
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {newMarker && (
        <Marker
          position={[newMarker.latitude, newMarker.longitude]}
          icon={customMarkerIcon}
        >
          <Popup>
            <div className="popup-content">
              <div className="popup-header">New Location</div>
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
                  onClick={saveMarker}
                >
                  Save Location
                </button>
              </form>
            </div>
          </Popup>
        </Marker>
      )}

      <AddMarkerOnClick onAddMarker={handleAddMarker} />
    </MapContainer>
  );
};

export default MapView;
