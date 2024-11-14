import { useMapEvents } from "react-leaflet";

const AddMarkerOnClick = ({ onAddMarker }) => {
  useMapEvents({
    click: (e) => {
      // When the map is clicked, call onAddMarker with the new location
      const location = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        locationID: Date.now(), // Temporary ID for the new marker
        locationName: "New Location", // Default name (can be updated)
      };
      onAddMarker(location);
    },
  });

  return null;
};

export default AddMarkerOnClick;
