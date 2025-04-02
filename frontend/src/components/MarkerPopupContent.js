import React, { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import StarRating from "./StarRating.tsx";
import ImageScroller from "./ImageScroller.tsx";
import AddFeatureButton from "./AddFeatureButton.tsx";
import EditLocationPopup from "./EditLocationPopup.js";
import "./styles/MarkerPopup.css";
import CommentList from "./CommentList.tsx";
import FeaturesList from "./FeaturesList.tsx";
import { Divider, Tab, Tabs, Box, Button, Typography } from "@mui/material";
import RatingService from "./services/RatingService.ts";
import axios from "axios";
import { Heart } from "lucide-react"; // Import Heart Icon
import { Tooltip } from "@mui/material";
import { set } from "react-hook-form";

const MarkerPopupContent = ({
  location,
  deleteMarker,
  userID,
  openPopupId,
  setOpenPopupId,
  saveEditLocally,
  user,
  isEditing,
  setIsEditing,
  clicked,
  setClicked,
  markerRef,
  isMobile
}) => {
  const [featuresList, setFeaturesList] = useState([]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("1");
  const [triggerSave, setTriggerSave] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [screenHeight, setScreenHeight] = React.useState(window.innerHeight);
  const [shortScreen, setShortScreen] = useState(window.innerHeight <= 700 ? true : false);

    useEffect(() => {
      const handleResizeWindow = () => {setScreenHeight(window.innerHeight); window.innerHeight <= 700 ? setShortScreen(true) : setShortScreen(false);}
      // subscribe to window resize event "onComponentDidMount"
      window.addEventListener('resize', handleResizeWindow)
      return () => {
        // unsubscribe "onComponentDestroy"
        window.removeEventListener('resize', handleResizeWindow)
      }
    }, [])

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const closeEditor = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setTriggerSave(false);
  }
  
  const fetchFeaturesAndImages = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}api/features/location/${location.locationID}`);

      const updatedFeatures = response.data.map((feature) => {
        let fixedImagePath = feature.imagePath;

        if (fixedImagePath && typeof fixedImagePath === "string" && fixedImagePath !== "null") {
          fixedImagePath = fixedImagePath.replace(/^http:\/\/localhost:5232/, "");
          fixedImagePath = `${process.env.REACT_APP_API_URL}${fixedImagePath}`;
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

  useEffect(() => {
    fetchFeaturesAndImages();
  }, [location.locationID, clicked]);

    useEffect(() => {
      if (clicked) {
        RatingService.getAverageRating(location.locationID).then((average) => {
          setAverageRating(average);
        })
      }
    }, [location.locationID, clicked]);
    
    useEffect(() => {
      console.log("markerRef in MarkerPopupContent:", markerRef);
        if (openPopupId === location.locationID && markerRef.current) {
        markerRef.current.openPopup();
        }
    }, [openPopupId, location.locationID]);
    
    const handleEditLocation = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };
    
    const handleSaveEdit = (updatedLocation, updatedImages) => {
        saveEditLocally(updatedLocation);
        setFeaturesList(updatedLocation.features);
        setImages(updatedImages);
        setIsEditing(false);
    };

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
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      try {
        const favorites = JSON.parse(storedFavorites);
        const alreadyFavorite = favorites.some(fav => fav.locationID === location.locationID);
        setIsFavorite(alreadyFavorite); // ✅ Sync the heart on open
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
      }
    }
  }, [location.locationID]);

    return (
        <>
        {isEditing ? 
          (
            <div className="leaflet-popup-content" style={{ width: (isMobile ? "auto" : "500px"), height: (isMobile ? "100%" : "75vh"), display: "flex", flexDirection: "column", maxHeight: "650px", minHeight: "500px", overflowY: "auto" }}>
              <EditLocationPopup
                location={location}
                featuresList={featuresList}
                setFeaturesList={setFeaturesList}
                images={images}
                setImages={setImages}
                onSave={handleSaveEdit}
                onClose={() => { setIsEditing(false); setTriggerSave(false); setTab("1"); }}
                triggerSave={triggerSave}
                refetchLocationDetails={fetchFeaturesAndImages}
                deleteMarker={deleteMarker}
                isMobile={isMobile}
                closeEditor={closeEditor}
              /> 
            </div>
          ) 
            :
          (
            <div className="leaflet-popup-content" style={{ width: (isMobile ? "auto" : "500px"), height: (isMobile ? "100%" : "75vh"), display: "flex", flexDirection: "column", maxHeight: "650px", minHeight: "500px" }}>
              <Box sx={{ height: "48px", flexGrow: 0, flexShrink: 0 }}>
                <Tabs onChange={handleTabChange} value={tab} variant="fullWidth">
                    <Tab label="Description" value="1" />
                    <Tab label="Accomodations" value="2" />
                    <Tab label="Comments" value="3" />
                </Tabs>
              </Box>

              <Divider sx={{ marginBottom: "10px", flexGrow: 0, flexShrink: 0 }} />

              <Box sx={{ flexGrow: 1, flexShrink: 1, maxHeight: "70%" }}>
                <Box hidden={tab != 1} sx={{ height: ("100%"), display: (tab == 1 ? "flex" : "none"), flexDirection: "column" }}>
                    <div className="popup-header">{location.locationName}</div>
                      <Box sx={{ position: "relative", left: "85%", bottom: "20px" }}>
                        <Tooltip title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                          <Heart
                            size={24}
                            onClick={toggleFavorite}
                            style={{
                              cursor: "pointer",
                              color: isFavorite ? "red" : "gray",
                              fill: isFavorite ? "red" : "none",
                              transition: "color 0.2s ease-in-out",
                              position: "absolute",
                            }}
                          />
                        </Tooltip>
                      </Box>
                    
                    <Typography variant="subtitle2" sx={{ margin: "0 !important", textAlign: "center"}}>{averageRating}/5.00 - Average User Rating</Typography>
                    <ImageScroller
                        images={images}
                        heightParam="250px"
                    />
                    <Box sx={{ overflowY: "auto", overflowX: "hidden", marginTop: "15px", flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ margin: "0 !important"}}>{location.description}</Typography>
                    </Box>
                </Box>

                <Box hidden={tab != 2} id="features-list" sx={{ height: ("100%") }}>
                <Box sx={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                    <FeaturesList featuresList={featuresList}/>
                </Box>

                </Box>
                
                <Box hidden={tab != 3} sx={{ height: ("108%") }}>
                <CommentList locationID={location.locationID} userID={userID} user={user}></CommentList>
                </Box>
              </Box>

              <Box sx={{ height: "fit-content", flexGrow: 0, flexShrink: 0, marginTop: "auto"}}>
                <Box sx={{ height: "40px", marginBottom: "auto", marginTop: "10px"}} hidden={tab != 1 && tab != 2}>
                    <Button 
                      variant="contained" 
                      onClick={handleEditLocation}
                      fullWidth
                    >
                    Edit Location
                    </Button>
                </Box>


                <Box sx={{ width: "100%", height: "fit-content"}}>
                  <StarRating locationID={location.locationID} userID={userID} shortScreen={shortScreen} />
                </Box>
              </Box>
            </div>
          ) 
          }
          
        </>
    )
}

export default MarkerPopupContent;