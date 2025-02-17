import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import StarRating from "./StarRating";
import ImageScroller from "./ImageScroller";
import AddFeatureButton from "./AddFeatureButton";
import EditLocationPopup from "./EditLocationPopup";
import "./styles/MarkerPopup.css";
import axios from "axios";
import FeatureService from "./services/FeatureService";
import CommentList from "./CommentList";

import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";


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
  saveEdit,
  user
}) => {
  const markerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [featuresList, setFeaturesList] = useState([]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const map = useMap();

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

  useEffect(() => {
    if (clicked) {
      const fetchFeaturesAndImages = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}api/features/location/${location.locationID}`);
          console.log("Before processing:", response.data);

          const updatedFeatures = response.data.map((feature) => {
            let fixedImagePath = feature.imagePath;

            if (fixedImagePath && typeof fixedImagePath === "string" && fixedImagePath !== "null") {
              fixedImagePath = fixedImagePath.replace(/^http:\/\/localhost:5232/, "");
              fixedImagePath = `http://localhost:5232${fixedImagePath}`;
            } else {
              fixedImagePath = null;
            }

            console.log("Final fixed image path:", fixedImagePath);

            return {
              ...feature,
              imagePath: fixedImagePath,
            };
          });



          setFeaturesList(updatedFeatures);

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

        } catch (error) {
          console.error("Error fetching features:", error);
        }
      };

      fetchFeaturesAndImages();
    }
  }, [location.locationID, clicked]);


  const handleMarkerClick = (locationID) => {
    const bounds = map.getBounds();
    const bottom = bounds.getNorth();
    const center = bounds.getCenter();
    const difference = bottom - center.lat;
    console.log("Difference:", difference);
    map.setView([(location.latitude + (difference * .9)), location.longitude], 17);
    setClicked(true);
    setOpenPopupId(locationID);
  };
  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{
        click: () => handleMarkerClick(location.locationID),
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
              saveEdit={saveEdit}
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
                  {feature.imagePath && feature.imagePath !== "null" ? (
                    <img
                      src={feature.imagePath}
                      alt={feature.locationFeature}
                      style={{ width: "100px", height: "auto", marginBottom: "10px" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <p>No image uploaded</p>
                  )}

                  <p>{feature.notes}</p>
                </div>
              ))}


              <StarRating locationID={location.locationID} userID={userID} />
              <AddFeatureButton locationID={location.locationID} />


              <CommentList locationID={location.locationID} userID={userID} user={user}></CommentList>

              <button className="popup-button" onClick={handleEditLocation}>
                Edit Location
              </button>
              <button
                className="popup-button-delete"
                onClick={() => deleteMarker(location.locationID)}
              >
                Delete Location
              </button>
              <AddFeatureButton locationID={location.locationID}/>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default MarkerPopup;
