import React, { useState } from "react";
import Box from "@mui/material/Box";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import "./styles/ImageScroller.css";

interface ImageScrollerProps {
  images: string[];
  onDelete: (imageUrl: string) => void;
  onReplace: (newImage: File, oldImageUrl: string) => void;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({
  images,
  onDelete,
  onReplace,
}) => {
  const [imageIndex, setIndex] = useState(0);

  const handleNext = () => {
    if (imageIndex < images.length - 1) {
      setIndex(imageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (imageIndex > 0) {
      setIndex(imageIndex - 1);
    }
  };

  const handleDelete = () => {
    onDelete(images[imageIndex]);
  };

  const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newFile = event.target.files[0];
      onReplace(newFile, images[imageIndex]);
    }
  };

  return (
    <>
      {images && images.length > 0 ? (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box
            width={0.1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={handlePrevious}
            sx={{ cursor: "pointer" }}
          >
            <ArrowBackIosIcon />
          </Box>
          <Box position="relative" width="80%" textAlign="center">
            <img
              key={imageIndex}
              src={images[imageIndex]}
              alt="Uploaded location"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "contain",
              }}
            />
            <div className="button-container">
              <label className="replace-button">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleReplace}
                />
              </label>
              <button
                className="bin-button"
                onClick={handleDelete}
                aria-label="delete image"
              >
                Delete
              </button>
            </div>
          </Box>
          <Box
            width={0.1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={handleNext}
            sx={{ cursor: "pointer" }}
          >
            <ArrowForwardIosIcon />
          </Box>
        </Box>
      ) : (
        <p>No images available</p>
      )}
    </>
  );
};

export default ImageScroller;
