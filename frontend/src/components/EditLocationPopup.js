import { useState, useEffect } from "react";
import FeatureImageUploader from "./FeatureImageUploader.js";
import AddFeatureButton from "./AddFeatureButton.tsx";
import axios from "axios";
import "./styles/MarkerPopup.css";
import ImageScroller from "./ImageScroller.tsx";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FeatureService from "./services/FeatureService.ts";


import { Box, TextField, Button, Typography, Grid2, Divider, Tabs, Tab, IconButton, Tooltip } from "@mui/material";

const EditLocationPopup = ({ location, featuresList, setFeaturesList, images, setImages, onSave, onClose, triggerSave, refetchLocationDetails, isMobile, deleteMarker, closeEditor }) => {
  const [locationName, setLocationName] = useState(location.locationName || "");
  const [description, setDescription] = useState(location.description || "");
  const [updatedFeatures, setUpdatedFeatures] = useState(featuresList);
  const [tab, setTab] = useState("1");

  const handleUpdateImage = (featureId, newImageUrl) => {
    setUpdatedFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === featureId ? { ...feature, imagePath: newImageUrl } : feature
      )
    );
  };

  useEffect(() => {
    if(triggerSave) {
      handleSave();
    }
  }, [triggerSave]);

  const handleUpload = async (newImage) => {
    const formData = new FormData();
    formData.append("file", newImage);

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const newImageUrl = response.data.imageUrl.startsWith("http")
      ? response.data.imageUrl
      : `${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}/${response.data.imageUrl.replace(/^\/+/, "")}`;

    let updatedImages = [...images];
    updatedImages = [newImageUrl, ...images.filter((img) => img !== newImageUrl)];
    setImages(updatedImages);
  }

  const handleSave = async () => {
    try {
      let updatedImages = [...images];

      const updatedLocation = {
        ...location,
        locationName,
        description,
        features: updatedFeatures
      };

      // Update the location in the database
      saveLocation(updatedLocation);

      // call onSave() to save locally
      onSave(updatedLocation, images); 
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const saveLocation = async (updatedLocation) => {
    // Remove the process.env.REACT_APP_API_URL prefix from the image paths
    updatedLocation.features.forEach((feature) => {
      if (feature.imagePath && typeof feature.imagePath === "string" && feature.imagePath !== "null") {
        feature.imagePath = feature.imagePath.replace(process.env.REACT_APP_API_URL, "");
      }
    });

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}api/locations/${updatedLocation.locationID}`,
        updatedLocation
      )
    } catch (error) {
      console.error('Error saving location:', error)
    }

    // Put the process.env.REACT_APP_API_URL prefix back on the image paths
    updatedLocation.features.forEach((feature) => {
      if (feature.imagePath && typeof feature.imagePath === "string" && feature.imagePath !== "null") {
        feature.imagePath = `${process.env.REACT_APP_API_URL}${feature.imagePath}`;
      }
    });
  }

  const handleSaveButton = (e) => {
    e.stopPropagation();
    handleSave();
  }

  const updateNotes = (featureId, newNotes) => {
    setUpdatedFeatures((prevFeatures) =>
      prevFeatures.map((f) =>
        f.id === featureId ? { ...f, notes: newNotes } : f
      )
    )
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleDeleteImage = (imageUrl) => {
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
  };

  const handleReplaceImage = (newImage, oldImageUrl) => {
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
  }


  return (
    <div style={{height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ height: "48px"}}>
        <Tabs onChange={handleTabChange} value={tab} variant="fullWidth" sx={{ height: "30px"}}>
          <Tab label="Edit Location" value="1"/>
          <Tab label="Edit Accomodations" value="2"/>
        </Tabs>
        <Divider sx={{ marginBottom: "10px"}}/>
      </Box>

      <form style={{height: (tab == 1 ? "81%" : "73%"), width: "100%", overflowY: "auto", overflowX: "hidden" }}>
        <Box hidden={tab != 1}>
          <div className="popup-header" style={{marginBottom: "10px", marginTop: "20px"}}>Edit Location</div>

          <Box sx={{ position: "relative", left: "85%", bottom: "42px" }}>
            <Tooltip title="Delete Location">
              <IconButton onClick={() => deleteMarker(location.locationID)} classes={{root: "delete-button"}} sx={{ position: "absolute"}} >
                <DeleteForeverIcon/>
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{  height: (isMobile ? "85%" : "470px"), width: "100%" }}>
            <TextField fullWidth label="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} sx={{ marginBottom: "0px" }} />
            <ImageScroller
              images={images}
              heightParam="250px"
              onDelete={handleDeleteImage}
              onReplace={handleReplaceImage}
              onUpload={handleUpload}
              refetchLocationDetails={refetchLocationDetails}
              isEditing
            />
            <TextField fullWidth multiline label="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxRows={5} minRows={3} />
          </Box>
        </Box>
        <Box hidden={tab != 2}>
          <div className="popup-header" style={{marginBottom: "10px", marginTop: "20px"}}>Edit Accomodations</div>
          <Box sx={{ overflowY: "hidden", overflowX: "hidden", height: (isMobile ? "85%" : "unset"), width: "100%" }}>
            {updatedFeatures.map((feature, index) => (
              <Box key={feature.id}>
                <Grid2 container style={{ marginBottom: "20px" }}>
                  <Grid2 size={7} sx={{ marginTop: "10px" }}>
                    <Typography variant="subtitle1" sx={{marginBottom: "15px", fontWeight: "bold"}}>{feature.locationFeature}</Typography>
                    <TextField fullWidth multiline label="Notes" value={feature.notes} onChange={(e) => updateNotes(feature.id, e.target.value)} placeholder="Add some notes about the accomodation." maxRows={3}/>
                  </Grid2>

                  <Grid2 size={5} sx={{ marginTop: "10px" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Box sx={{width: "100px", height: "100px", marginBottom: "10px"}}>
                        {feature.imagePath ? (
                          
                            <img
                              src={feature.imagePath}
                              alt="Feature"
                              style={{ marginBottom: "10px", objectFit: "contain", height: "100%", width: "100%" }}
                            />

                        ) : (
                          <img
                            src={"./imgs/no-images-uploaded.jpg"}
                            alt="Stock image with a slash through it"
                            style={{ width: "100px", marginBottom: "10px",  objectFit: "contain" }}
                          />
                        )}
                      </Box>
                      <FeatureImageUploader
                        feature={feature}
                        onUpdateImage={(featureId, newImageUrl) => handleUpdateImage(featureId, newImageUrl)}
                      />
                    </Box>
                  </Grid2>
                </Grid2>
                <Divider />
              </Box>
            ))}
          </Box>
        </Box>
      </form>

      <Box sx={{ height: (tab == 2 ? "106px" : "38px"), marginTop: "10px", width: "100%"}}>
          <Box hidden={tab != 2}>
            <Box sx={{ height: "48px", marginTop: "20px"}}>
              <AddFeatureButton locationID={location.locationID} setFeaturesList={setUpdatedFeatures} featuresList={updatedFeatures}/>
            </Box>
          </Box>
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
              onClick={handleSaveButton}
              sx={{ marginLeft: "2%", width: "48%" }}
              >
                  Save Changes
              </Button>
          </Box>
      </Box>
    </div>
  );
};

export default EditLocationPopup;