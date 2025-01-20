import { useRef, useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import StarRating from "./StarRating";
import ImageScroller from "./ImageScroller";
import AddFeatureButton from "./AddFeatureButton";
import EditLocationPopup from "./EditLocationPopup";
import "./styles/MarkerPopup.css";
import axios from "axios";

const customMarkerIcon = new Icon({
  iconUrl: "/Icons/Mapmarker.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -40],
});

const MarkerPopup = ({
  location,
  deleteMarker,
  userID,
  openPopupId,
  setOpenPopupId,
}) => {
  const markerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [featuresList, setFeaturesList] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch features
    axios
      .get(`${process.env.REACT_APP_API_URL}api/features/location/${location.locationID}`)
      .then((response) => {
        const updatedFeatures = response.data.map((feature) => ({
          ...feature,
          imagePath:
            feature.imagePath && typeof feature.imagePath === "string"
              ? feature.imagePath.startsWith("http")
                ? feature.imagePath
                : `${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}/${feature.imagePath.replace(/^\/+/, "")}`
              : null,
        }));
        setFeaturesList(updatedFeatures);
      })
      .catch((error) => console.error("Error fetching features:", error));

    // Fetch images
    axios
      .get(`${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/pictures`)
      .then((response) => {
        const imageUrls = response.data.map((picture) => picture.imageUrl);
        setImages(imageUrls);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  }, [location.locationID]);

  useEffect(() => {
    if (openPopupId === location.locationID && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [openPopupId, location.locationID]);

  const handleEditLocation = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdit = (updatedFeatures, updatedImages) => {
    setFeaturesList(updatedFeatures);
    setImages(updatedImages);
    setIsEditing(false);
  };

  const handleClosePopup = () => {
    setOpenPopupId(null);
  };

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{
        click: () => setOpenPopupId(location.locationID),
      }}
    >
      <Popup
        onClose={handleClosePopup}
        autoPan={false}
        closeOnClick={false}
        maxWidth={700}
        className={`leaflet-popup ${isEditing ? "edit-mode" : ""}`}
      >
        <div className="leaflet-popup-content" style={{ width: "500px" }}>
          {isEditing ? (
            <EditLocationPopup
              location={location}
              featuresList={featuresList}
              setFeaturesList={setFeaturesList}
              images={images}
              setImages={setImages}
              onSave={handleSaveEdit}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="popup-header">{location.locationName}</div>
              <p>{location.description}</p>
              <ImageScroller
                images={images}
                heightParam="250px"
                onDelete={(imageUrl) => {
                  const baseApiUrl = process.env.REACT_APP_API_URL.replace(/\/+$/, "");
                  const relativeImageUrl = imageUrl.replace(baseApiUrl, "").trim().replace(/\\/g, "/");

                  const updatedImages = images.filter((img) => img !== imageUrl);
                  setImages(updatedImages);

                  axios
                    .delete(`${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/delete-image`, {
                      data: { imageUrl: relativeImageUrl },
                      headers: { "Content-Type": "application/json" },
                    })
                    .then(() => {
                      return axios.get(`${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/pictures`);
                    })
                    .then((res) => {
                      const refreshedImages = res.data.map((picture) => picture.imageUrl);
                      setImages(refreshedImages);
                    })
                    .catch((err) => {
                      console.error("Error during deletion or re-fetch:", err.response?.data || err.message);
                      alert("Failed to delete the image or synchronize with the backend.");
                    });
                }}
                onReplace={(newImage, oldImageUrl) => {
                  if (!newImage) {
                    alert("Please select a new image to upload.");
                    return;
                  }

                  const sanitizedOldImageUrl = oldImageUrl.split("?")[0].trim();

                  const formData = new FormData();
                  formData.append("file", newImage);
                  formData.append("oldImageUrl", sanitizedOldImageUrl);

                  axios
                    .put(`${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/replace-image`, formData)
                    .then((response) => {
                      const newImageUrl = response.data.imageUrl;
                      setImages((prev) => prev.map((img) => (img === oldImageUrl ? newImageUrl : img)));
                    })
                    .catch((err) => {
                      console.error("Error replacing image:", err.response?.data || err.message);
                      alert("Failed to replace the image. Please try again.");
                    });
                }}
              />

              {featuresList.map((feature) => (
                <div key={feature.id} style={{ marginBottom: "20px" }}>
                  <h5>{feature.locationFeature}</h5>
                  {feature.imagePath ? (
                    <img
                      src={feature.imagePath}
                      alt={feature.locationFeature}
                      style={{ width: "100px", height: "auto", marginBottom: "10px" }}
                    />
                  ) : (
                    <p>No image uploaded</p>
                  )}
                  <p>{feature.notes}</p>
                </div>
              ))}

              <StarRating locationID={location.locationID} userID={userID} />
              <AddFeatureButton locationID={location.locationID} />
              <button
                className="popup-button"
                onClick={handleEditLocation}
              >
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
