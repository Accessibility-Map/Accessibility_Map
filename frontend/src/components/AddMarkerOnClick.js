import { useMapEvents } from "react-leaflet";

const AddMarkerOnClick = ({ onAddMarker }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      console.log("Clicked on:", lat, lng);
      onAddMarker({ latitude: lat, longitude: lng });
    },
  });
  return null;
};

export default AddMarkerOnClick;
