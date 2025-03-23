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
import {Divider, Tab, Tabs, Box, Button, Typography} from "@mui/material";
import RatingService from "./services/RatingService.ts";
import axios from "axios";
import { Heart } from "lucide-react"; // Import Heart Icon

const MarkerPopupContent = ({ 
    location,
    deleteMarker,
    userID,
    openPopupId,
    setOpenPopupId,
    saveEdit,
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

    return (
        <>
        {isEditing ? 
          (
            <div className="leaflet-popup-content" style={{ width: (isMobile ? "auto" : "500px"), height: (isMobile ? "auto" : "650px"), display: "flex", flexDirection: "column" }}>
              <EditLocationPopup
                location={location}
                featuresList={featuresList}
                setFeaturesList={setFeaturesList}
                images={images}
                setImages={setImages}
                onSave={handleSaveEdit}
                onClose={() => { setIsEditing(false); setTriggerSave(false); }}
                saveEdit={saveEdit}
                triggerSave={triggerSave}
                refetchLocationDetails={fetchFeaturesAndImages}
                deleteMarker={deleteMarker}
                isMobile={isMobile}
              /> 
              <Box sx={{ height: "48px", marginTop: "5px", position: "relative", bottom: "0"}}>
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
              </Box>
            </div>
          ) 
            :
          (
            <div className="leaflet-popup-content" style={{ width: (isMobile ? "auto" : "500px"), height: (isMobile ? "auto" : "650px"), display: "flex", flexDirection: "column" }}>
              <Box sx={{ height: "48px"}}>
              <Tabs onChange={handleTabChange} value={tab} variant="fullWidth">
                  <Tab label="Description" value="1" />
                  <Tab label="Features" value="2" />
                  <Tab label="Comments" value="3" />
              </Tabs>
              </Box>

              <Divider sx={{ marginBottom: "20px" }} />

              <Box hidden={tab != 1} sx={{ height: (isMobile ? "85%" : "450px") }}>
                  <>
                  <Box sx={{ height: "60%", marginBottom: "10px" }}>
                  <div className="popup-header">{location.locationName}</div>

                  <Heart
                    size={24}
                    onClick={toggleFavorite}
                    style={{
                    cursor: "pointer",
                    color: isFavorite ? "red" : "gray",
                    fill: isFavorite ? "red" : "none",
                    transition: "color 0.2s ease-in-out",
                    position: "absolute",
                    top: "75px",
                    right: "30px",
                    }}
                  />
                  
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
              </Box>

              <Box hidden={tab != 2} id="features-list" sx={{ height: (isMobile ? "85%" : "450px") }}>
              <Box sx={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}>
                  <FeaturesList featuresList={featuresList}/>
              </Box>

              </Box>
              
              <Box hidden={tab != 3} sx={{ height: (isMobile ? "85%" : "500px") }}>
              <CommentList locationID={location.locationID} userID={userID} user={user}></CommentList>
              </Box>

              <Box sx={{ height: "48px", marginTop: "30px"}} hidden={tab != 1 && tab != 2}>
                  <Button 
                    variant="contained" 
                    onClick={handleEditLocation}
                    fullWidth
                  >
                  Edit Location
                  </Button>
              </Box>


              <Box sx={{ width: "100%", height: "48px"}}>
              <StarRating locationID={location.locationID} userID={userID} />
              </Box>
            </div>
          ) 
          }
          
        </>
    )
}

export default MarkerPopupContent;