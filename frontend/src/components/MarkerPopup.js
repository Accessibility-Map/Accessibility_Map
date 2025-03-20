import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import StarRating from "./StarRating.tsx";
import ImageScroller from "./ImageScroller.tsx";
import AddFeatureButton from "./AddFeatureButton.tsx";
import EditLocationPopup from "./EditLocationPopup.js";
import "./styles/MarkerPopup.css";
import axios from "axios";
import FeatureService from "./services/FeatureService.ts";
import CommentList from "./CommentList.tsx";
import FeaturesList from "./FeaturesList.tsx";
import RatingService from "./services/RatingService.ts";
import { Heart } from "lucide-react"; // Import Heart Icon

import { Divider, Tab, Tabs, Box, Button, Typography } from "@mui/material";

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
  const [tab, setTab] = useState("1");
  const [triggerSave, setTriggerSave] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (openPopupId === location.locationID && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [openPopupId, location.locationID]);

  useEffect(() => {
    if (clicked) {
      RatingService.getAverageRating(location.locationID).then((average) => {
        setAverageRating(average);
      });
    }
  }, [location.locationID, clicked]);

  useEffect(() => {
    if (clicked) {
      const fetchFeaturesAndImages = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}api/features/location/${location.locationID}`);
          const updatedFeatures = response.data.map((feature) => {
            let fixedImagePath = feature.imagePath;
            if (fixedImagePath && typeof fixedImagePath === "string" && fixedImagePath !== "null") {
              fixedImagePath = fixedImagePath.replace(/^http:\/\/localhost:5232/, "");
              fixedImagePath = `http://localhost:5232${fixedImagePath}`;
            } else {
              fixedImagePath = null;
            }
            return { ...feature, imagePath: fixedImagePath };
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

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some(fav => fav.locationID === location.locationID));
  }, [location.locationID]);
  

  const toggleFavorite = () => {
    if (!location || !location.locationID) {
      console.error("Error: locationID is undefined or location is missing", location);
      return;
    }
  
    const storedFavorites = localStorage.getItem("favorites");
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
  
    if (!Array.isArray(favorites)) {
      console.error("Error: favorites is not an array");
      favorites = [];
    }
  
    let updatedFavorites;
    if (!isFavorite) {
      updatedFavorites = [...favorites, location]; // ✅ Store full location object, not just ID
    } else {
      updatedFavorites = favorites.filter(fav => fav.locationID !== location.locationID);
    }
  
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite); // ✅ Ensure heart updates correctly
  };
  



  const handleMarkerClick = (locationID) => {
    const bounds = map.getBounds();
    const bottom = bounds.getNorth();
    const center = bounds.getCenter();
    const difference = bottom - center.lat;
    map.setView([(location.latitude + (difference * .9)), location.longitude], 17);
    setClicked(true);
    setOpenPopupId(locationID);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
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
        onClose={() => setOpenPopupId(null)}
        autoPan={false}
        closeOnClick={false}
        maxWidth={700}
        className={`leaflet-popup ${isEditing ? "edit-mode" : ""}`}
      >
        <div className="leaflet-popup-content" style={{ width: "500px", height: "650px" }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }}>
            <Typography variant="h6">{location.locationName}</Typography>
            <Heart
  size={24}
  onClick={toggleFavorite}
  style={{
    cursor: "pointer",
    color: isFavorite ? "red" : "gray",
    fill: isFavorite ? "red" : "none",
    transition: "color 0.2s ease-in-out",
  }}
/>




          </Box>

          <Box sx={{ height: "48px" }}>
            <Tabs onChange={handleTabChange} value={tab} variant="fullWidth">
              <Tab label="Description" value="1" />
              <Tab label="Features" value="2" />
              <Tab label="Comments" value="3" />
            </Tabs>
          </Box>

          <Divider sx={{ marginBottom: "20px" }} />

          <Box hidden={tab != 1} sx={{ height: "450px" }}>
            <Typography variant="subtitle2" sx={{ textAlign: "center" }}>{averageRating}/5.00 - Average User Rating</Typography>
            <ImageScroller images={images} heightParam="250px" />
            <Box sx={{ maxHeight: "37%", overflowY: "auto", overflowX: "hidden", marginTop: "30px" }}>
              <p>{location.description}</p>
            </Box>
          </Box>

          <Box hidden={tab != 2} id="features-list" sx={{ height: "450px" }}>
            <FeaturesList featuresList={featuresList} />
          </Box>

          <Box hidden={tab != 3} sx={{ height: "500px" }}>
            <CommentList locationID={location.locationID} userID={userID} user={user} />
          </Box>

          <Box sx={{ height: "48px", marginTop: "30px" }} hidden={tab != 1}>
            <Button variant="contained" onClick={() => setIsEditing(true)} fullWidth>
              Edit Location
            </Button>
          </Box>

          <Box sx={{ height: "48px", marginTop: "30px" }} hidden={tab != 2}>
            <AddFeatureButton locationID={location.locationID} />
          </Box>

          <Box sx={{ position: "absolute", bottom: "0", width: "100%", height: "48px" }}>
            <StarRating locationID={location.locationID} userID={userID} />
          </Box>
        </div>
      </Popup>
    </Marker>
  );
};

export default MarkerPopup;
