import { useState } from "react";
import axios from "axios";

import { Button } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FeatureImageUploader = ({ feature, onUpdateImage }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}api/features/${feature.id}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      const newImageUrl = response.data.imageUrl.startsWith("http")
        ? response.data.imageUrl
        : `${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}/${response.data.imageUrl.replace(/^\/+/, "")}`;
      onUpdateImage(feature.id, newImageUrl);
    } catch (error) {
      console.error("Error uploading feature image:", error);
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <Button
      variant="contained"
      component="label"
      startIcon={<CloudUploadIcon />}
    >
      Upload Image
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
    </Button>
  );
};

export default FeatureImageUploader;
