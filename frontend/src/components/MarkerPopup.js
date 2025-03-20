import React, { useRef, useEffect, useState, createRef } from "react";
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
import { Divider, Tab, Tabs, Box, Button, Typography, AppBar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Toolbar } from "@mui/material";
import MarkerPopupContent from "./MarkerPopupContent.js";
import CloseIcon from '@mui/icons-material/Close';
import { set } from "react-hook-form";

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
  const [clicked, setClicked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const map = useMap();

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

  useEffect(() => {
    const handleResizeWindow = () => setScreenWidth(window.innerWidth);
     // subscribe to window resize event "onComponentDidMount"
     window.addEventListener("resize", handleResizeWindow);
     return () => {
       // unsubscribe "onComponentDestroy"
       window.removeEventListener("resize", handleResizeWindow);
     };
   }, []);

  const handleClosePopup = () => {
    setOpenPopupId(null);
    setMobileDialogOpen(false);
    document.querySelector(".leaflet-popup-close-button").click();
  };

  const handleMarkerClick = (locationID) => {
    // If not using mobile view set the map view
    if(screenWidth > 768) {
      const bounds = map.getBounds();
      const bottom = bounds.getNorth();
      const center = bounds.getCenter();
      const difference = bottom - center.lat;
      map.setView([(location.latitude + (difference * .9)), location.longitude], 17);
    }

    setClicked(true);
    setOpenPopupId(locationID);
    setMobileDialogOpen(true);
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

        {screenWidth <= 768 ? (
          <Dialog open={mobileDialogOpen} fullScreen >
            <AppBar sx={{ position: 'relative' }}>
              <Toolbar>
                <IconButton onClick={handleClosePopup} >
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <DialogContent>
            <MarkerPopupContent
              location={location}
              deleteMarker={deleteMarker}
              userID={userID}
              openPopupId={openPopupId}
              setOpenPopupId={setOpenPopupId}
              saveEdit={saveEdit}
              user={user}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              clicked={clicked}
              setClicked={setClicked}
              markerRef={markerRef}
              isMobile={true}
            ></MarkerPopupContent>
            </DialogContent>
          
          </Dialog>
        ) : (
          <MarkerPopupContent
            location={location}
            deleteMarker={deleteMarker}
            userID={userID}
            openPopupId={openPopupId}
            setOpenPopupId={setOpenPopupId}
            saveEdit={saveEdit}
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            clicked={clicked}
            setClicked={setClicked}
            markerRef={markerRef}
            isMobile={false}
          ></MarkerPopupContent>
        )}
      </Popup>
    </Marker>
  );
};

export default MarkerPopup;
