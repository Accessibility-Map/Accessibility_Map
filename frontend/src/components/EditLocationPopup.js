import { useState, useEffect } from "react";
import FeatureImageUploader from "./FeatureImageUploader.js";
import AddFeatureButton from "./AddFeatureButton.tsx";
import axios from "axios";
import "./styles/MarkerPopup.css";
import ImageScroller from "./ImageScroller.tsx";

import { Box, TextField, Button, Typography, Grid2, Divider, Tabs, Tab } from "@mui/material";

const EditLocationPopup = ({ location, featuresList, setFeaturesList, images, setImages, onSave, onClose, saveEdit, triggerSave }) => {
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
      };
      saveEdit(updatedLocation);

      onSave(updatedFeatures, images); 
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

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
    <div style={{ overflowY: "auto", overflowX: "hidden", height: "100%" }}>
      <Box>
        <Tabs onChange={handleTabChange} value={tab} variant="fullWidth" sx={{ height: "30px"}}>
          <Tab label="Edit Location" value="1"/>
          <Tab label="Edit Features" value="2"/>
        </Tabs>
        <Divider sx={{ marginBottom: "20px"}}/>
      </Box>
      <form>
      <Box hidden={tab != 1}>
        <div className="popup-header" style={{marginBottom: "20px"}}>Edit Location</div>
          <TextField fullWidth label="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} sx={{ marginBottom: "20px" }} />
          <ImageScroller
            images={images}
            heightParam="250px"
            onDelete={handleDeleteImage}
            onReplace={handleReplaceImage}
            onUpload={handleUpload}
            isEditing
          />
          <TextField fullWidth multiline label="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxRows={10} minRows={4} />
          {/* <div>
          <h4>Main Image</h4>
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt="Main"
              style={{ width: "150px", height: "auto", marginBottom: "10px" }}
            />
          ) : (
            <p>No main image uploaded</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setMainImage(e.target.files ? e.target.files[0] : null)
            }
          />
          
        </div> */}
      </Box>
      <Box hidden={tab != 2}>
        <div className="popup-header" style={{marginBottom: "20px"}}>Edit Features</div>
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
      </form>
    </div>
  );
};

export default EditLocationPopup;