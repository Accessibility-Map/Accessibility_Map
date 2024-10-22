import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "../styles/MapView.css"; // Link to external CSS
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Button } from "semantic-ui-react";
import { Icon } from "leaflet";
import StarRating from "./StarRating.tsx";

const filterExamples = [
  {
    id: 1,
    locationID: 7,
    feature: "Elevator",
    notes: "Located on 1-5 floor, east side of the building",
  },
  {
    id: 2,
    locationID: 6,
    feature: "Ramp",
    notes: "West entrance of the building",
  },
  {
    id: 3,
    locationID: 14,
    feature: "Restroom",
    notes: "Equipped in every bathroom",
  },
];

// Available filter options
const filterOptions = ["Ramp", "Elevator", "Parking", "Restroom"];

const UCCoordinates = [39.1317, -84.515]; // University of Cincinnati coordinates

// Custom Marker Icon
const customMarkerIcon = new Icon({
  iconUrl: "/Icons/Mapmarker.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
});

// AddMarker component to handle adding new markers
const AddMarkerOnClick = ({ onAddMarker }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAddMarker({ latitude: lat, longitude: lng });
    },
  });
  return null;
};

// Main MapView Component
const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [newMarker, setNewMarker] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [accessibilityFeatures, setAccessibilityFeatures] = useState("");
  const [accessibilityDescriptions, setAccessibilityDescriptions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]); // State to manage selected filters
  const [editingLocation, setEditingLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // New state for editing mode

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

  // Filter logic based on selected filters
  const matchesFilters = (location) => {
    const locationFeatures = filterExamples
      .filter((f) => f.locationID === location.locationID)
      .map((f) => f.feature);

    if (selectedFilters.length === 0) {
      return true; // Show all locations if no filters are selected
    }
    return selectedFilters.some((filter) => locationFeatures.includes(filter));
  };

  // Handle filter toggle
  const toggleFilter = (filter) => {
    setSelectedFilters((prevSelected) =>
      prevSelected.includes(filter)
        ? prevSelected.filter((f) => f !== filter)
        : [...prevSelected, filter]
    );
  };

  // Filtered results based on search term and selected filters
  const filteredResults = locations.filter((item) => {
    const matchesSearchTerm = item.locationName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearchTerm && matchesFilters(item); // Include filter matching logic
  });

  const handleAddMarker = (location) => {
    if (!isEditing) {
      setNewMarker(location);
      setLocationName("");
      setAccessibilityFeatures("");
      setAccessibilityDescriptions("");
    }
  };

  const saveMarker = async () => {
    try {
      if (newMarker) {
        const markerWithDetails = {
          ...newMarker,
          locationName,
          accessibilityFeatures,
          accessibilityDescriptions,
        };
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/locations`,
          markerWithDetails
        );
        setLocations([...locations, response.data]);
        setNewMarker(null); // Clear the new marker
      }
    } catch (error) {
      console.error("Error saving marker:", error);
    }
  };

  const handleEditClick = (location) => {
    setEditingLocation(location);
    setLocationName(location.locationName);
    setAccessibilityFeatures(location.accessibilityFeatures);
    setAccessibilityDescriptions(location.accessibilityDescriptions);
    setIsEditing(true);  // Set to editing mode
  };

  const saveEdit = async () => {
    try {
      if (editingLocation) {
        const updatedLocation = {
          ...editingLocation,
          locationName,
          accessibilityFeatures,
          accessibilityDescriptions,
        };
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/locations/${editingLocation.locationID}`,
          updatedLocation
        );
        // Update the list of locations with the new data
        const updatedLocations = locations.map((location) =>
          location.locationID === editingLocation.locationID ? response.data : location
        );
        setLocations(updatedLocations);
        setEditingLocation(null);
        setIsEditing(false);  // Exit editing mode
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const deleteMarker = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/locations/${id}`);
      setLocations(locations.filter((location) => location.locationID !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search for accessible places..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filters}>
            {filterOptions.map((filter) => (
              <Button
                key={filter}
                className={`filter-button ${
                  selectedFilters.includes(filter) ? "selected" : ""
                }`}
                style={{
                  ...styles.filterButton,
                  backgroundColor: selectedFilters.includes(filter)
                    ? "#007bff"
                    : "#fff",
                  color: selectedFilters.includes(filter) ? "#fff" : "#000",
                  transition: "background-color 0.3s ease",
                }}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <MapContainer
        center={UCCoordinates}
        zoom={17.5}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredResults.map((location) => (
          <Marker
            key={location.locationID}
            position={[location.latitude, location.longitude]}
            icon={customMarkerIcon}
          >
            <Popup>
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
                      <input
                        type="text"
                        placeholder="Accessibility Features"
                        value={accessibilityFeatures}
                        onChange={(e) =>
                          setAccessibilityFeatures(e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Accessibility Description"
                        value={accessibilityDescriptions}
                        onChange={(e) =>
                          setAccessibilityDescriptions(e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="popup-button"
                        onClick={saveEdit}
                      >
                        Save Changes
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="popup-header">{location.locationName}</div>
                    <p>Features: {location.accessibilityFeatures}</p>
                    <p>Description: {location.accessibilityDescriptions}</p>
                    <StarRating />
                    <button
                      className="popup-button"
                      onClick={() => deleteMarker(location.locationID)}
                    >
                      Delete Location
                    </button>
                    <button
                      className="popup-button"
                      onClick={() => handleEditClick(location)}
                    >
                      Edit Location
                    </button>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {newMarker && !isEditing && (
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
                  <input
                    type="text"
                    placeholder="Accessibility Features"
                    value={accessibilityFeatures}
                    onChange={(e) => setAccessibilityFeatures(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Accessibility Description"
                    value={accessibilityDescriptions}
                    onChange={(e) =>
                      setAccessibilityDescriptions(e.target.value)
                    }
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
    </div>
  );
};

const styles = {
  container: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    zIndex: 1000,
  },
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    width: "1000px",
  },
  searchInput: {
    borderRadius: "30px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    fontSize: "15px",
    padding: "15px 25px",
    border: "none",
    outline: "none",
    width: "400px",
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginLeft: "20px",
  },
  filterButton: {
    borderRadius: "20px",
    border: "none",
    padding: "10px 15px",
    fontSize: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
};

export default MapView;
