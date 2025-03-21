import React, { useRef, useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import axios from "axios";
import MarkerPopupContent from "./MarkerPopupContent.js";
import { AppBar, IconButton, Dialog, DialogContent, Toolbar, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  user,
}) => {
  const markerRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [locationName, setLocationName] = useState(location.locationName);
  const [description, setDescription] = useState(location.description);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const map = useMap();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResizeWindow = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResizeWindow);
    return () => window.removeEventListener("resize", handleResizeWindow);
  }, []);

  useEffect(() => {
    if (openPopupId === location.locationID && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [openPopupId, location.locationID]);

  const handleClosePopup = () => {
    setOpenPopupId(null);
    setMobileDialogOpen(false);
  };

  const handleMarkerClick = (locationID) => {
    if (screenWidth > 768) {
      const bounds = map.getBounds();
      const bottom = bounds.getNorth();
      const center = bounds.getCenter();
      const difference = bottom - center.lat;
      map.setView([location.latitude + difference * 0.9, location.longitude], 17);
    }

    setClicked(true);
    setOpenPopupId(locationID);
    setMobileDialogOpen(true);
  };

  // ✅ Handle Editing
  const handleEditClick = () => {
    setIsEditing(true);
    setLocationName(location.locationName || "");
    setDescription(location.description || "");
  };

  // ✅ Handle Save
  const handleSave = async () => {
    try {
      const updatedLocation = {
        locationID: location.locationID,
        locationName,
        description,
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}`,
        updatedLocation
      );

      setIsEditing(false);
      console.log("✅ Location updated:", updatedLocation);
    } catch (error) {
      console.error("❌ Error updating location:", error);
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={customMarkerIcon}
      eventHandlers={{ click: () => handleMarkerClick(location.locationID) }}
    >
      <Popup onClose={handleClosePopup} autoPan={false} closeOnClick={false} maxWidth={700}>
        {screenWidth <= 768 ? (
          <Dialog open={mobileDialogOpen} fullScreen>
            <AppBar sx={{ position: "relative" }}>
              <Toolbar>
                <IconButton onClick={handleClosePopup}>
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
                locationName={locationName}
                setLocationName={setLocationName}
                description={description}
                setDescription={setDescription}
              />
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
            locationName={locationName}
            setLocationName={setLocationName}
            description={description}
            setDescription={setDescription}
          />
        )}

        {isEditing && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
            sx={{ marginTop: "10px" }}
          >
            Save Changes
          </Button>
        )}
        {!isEditing && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEditClick}
            fullWidth
            sx={{ marginTop: "10px" }}
          >
            Edit Location
          </Button>
        )}
      </Popup>
    </Marker>
  );
};

export default MarkerPopup;
