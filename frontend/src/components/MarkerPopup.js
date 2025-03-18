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

import {Divider, Chip, Tab, tableList, Tabs, Box, Button, Typography} from "@mui/material";
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
  const [featuresList, setFeaturesList] = useState([]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [tab, setTab] = useState("1");
  const [triggerSave, setTriggerSave] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
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

          const updatedFeatures = response.data.map((feature) => {
            let fixedImagePath = feature.imagePath;

            if (fixedImagePath && typeof fixedImagePath === "string" && fixedImagePath !== "null") {
              fixedImagePath = fixedImagePath.replace(/^http:\/\/localhost:5232/, "");
              fixedImagePath = `http://localhost:5232${fixedImagePath}`;
            } else {
              fixedImagePath = null;
            }

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

  useEffect(() => {
    if (clicked) {
      RatingService.getAverageRating(location.locationID).then((average) => {
        setAverageRating(average);
      })
    }
  }, [location.locationID, clicked]);

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

  const closeEditor = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setTriggerSave(false);
  }

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
        <div className="leaflet-popup-content" style={{ width: "500px", height: "650px" }}>

            <Box sx={{ height: "48px"}}>
              <Tabs onChange={handleTabChange} value={tab} variant="fullWidth">
                <Tab label="Description" value="1" />
                <Tab label="Features" value="2" />
                <Tab label="Comments" value="3" />
              </Tabs>
            </Box>

            <Divider sx={{ marginBottom: "20px" }} />

            <Box hidden={tab != 1} sx={{ height: "450px" }}>
              {isEditing ? (<EditLocationPopup
                location={location}
                featuresList={featuresList}
                setFeaturesList={setFeaturesList}
                images={images}
                setImages={setImages}
                onSave={handleSaveEdit}
                onClose={() => { setIsEditing(false); setTriggerSave(false); }}
                saveEdit={saveEdit}
                triggerSave={triggerSave}
              /> ) : ( 
                <>
                <Box sx={{ height: "60%", marginBottom: "10px" }}>
                  <div className="popup-header">{location.locationName}</div>
                  <Typography variant="subtitle2" sx={{ margin: "0 !important", textAlign: "center"}}>{averageRating}/5.00 - Average User Rating</Typography>
                  <ImageScroller
                    images={images}
                    heightParam="250px"
                  />
                </Box>
                <Box sx={{ maxHeight: "37%", overflowY: "auto", overflowX: "hidden", marginTop: "30px" }}>
                  <p>{location.description}</p>
                </Box>
                </>
              )}
            </Box>

            <Box hidden={tab != 2} id="features-list" sx={{ height: "450px" }}>
              <Box sx={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                <FeaturesList featuresList={featuresList}/>
              </Box>
              {/* {featuresList.map((feature) => (
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
              ))} */}
            </Box>
              
            <Box hidden={tab != 3} sx={{ height: "500px" }}>
              <CommentList locationID={location.locationID} userID={userID} user={user}></CommentList>
            </Box>

            <Box sx={{ height: "48px", marginTop: "30px"}} hidden={tab != 1}>
              { isEditing ? (
                <Box sx={{ width: "100%" }}>
                  <Button
                  variant="contained"
                  onClick={closeEditor}
                  color="error"
                  sx={{ marginRight: "2%", width: "48%" }}
                  >
                    Cancel
                  </Button>
                  <Button 
                  variant="contained" 
                  onClick={() => {setTriggerSave(true);}}
                  sx={{ marginLeft: "2%", width: "48%" }}
                  >
                    Save Changes
                  </Button>
                </Box>
              ) : (
                <Button 
                variant="contained" 
                onClick={handleEditLocation}
                fullWidth
                >
                  Edit Location
                </Button>
              )}
              
              {/* <button className="popup-button" onClick={handleEditLocation}>
                Edit Location
              </button> */}
              {/* <button
                className="popup-button-delete"
                onClick={() => deleteMarker(location.locationID)}
              >
                Delete Location
              </button> */}
            </Box>

            <Box sx={{ height: "48px", marginTop: "30px"}} hidden={tab != 2}>
              <AddFeatureButton locationID={location.locationID}/>
            </Box>
            
            <Box sx={{position: "absolute", bottom: "0", width: "100%", height: "48px"}}>
              <StarRating locationID={location.locationID} userID={userID} />
            </Box>
        </div>
      </Popup>
    </Marker>
  );
};

export default MarkerPopup;
