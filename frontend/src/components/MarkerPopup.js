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
  setOpenPopupId
}) => {
  const markerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [featuresList, setFeaturesList] = useState([]);
  const [images, setImages] = useState([]);


  useEffect(() => {
    // Fetch features
    console.log("Fetching images for location:", location.locationID);


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
        console.log("API response for images:", response.data);

        const imageUrls = response.data.map((picture) => picture.imageUrl);
        console.log("Processed image URLs:", imageUrls);

        setImages(imageUrls);

        setTimeout(() => {
          console.log("Updated images state:", images);
        }, 0);
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

  const handleCloseEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSaveEdit = (updatedFeatures, updatedImages) => {
    console.log("Received updated features:", updatedFeatures);
    console.log("Received updated images:", updatedImages);

    setFeaturesList(updatedFeatures);
    setImages(updatedImages);

    // Log the updated state after the state setter functions are called
    setTimeout(() => {
      console.log("Updated state in MarkerPopup after save:");
      console.log("Features list:", featuresList);
      console.log("Images:", images);
    }, 0);

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
                  console.log("Deleting image:", imageUrl);
                  setImages((prev) => prev.filter((img) => img !== imageUrl));
                  axios
                    .delete(
                      `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/pictures`,
                      { data: { imageUrl } }
                    )
                    .catch((err) => console.error("Error deleting image:", err));
                }}
                onReplace={(newImage, oldImageUrl) => {
                  const formData = new FormData();
                  formData.append("file", newImage);

                  axios
                    .put(`${process.env.REACT_APP_API_URL}api/features/upload-image`, formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                    })
                    .then((response) => {
                      const newImageUrl = response.data.imageUrl;
                      setImages((prev) =>
                        prev.map((img) => (img === oldImageUrl ? newImageUrl : img))
                      );
                    })
                    .catch((err) => console.error("Error replacing image:", err));
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
