import React, { useState, useEffect } from 'react'
import { Grid2, Box, Modal, IconButton, Button, Tooltip } from '@mui/material';
import axios from "axios";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import "./styles/ImageScroller.css";

import './styles/MarkerPopup.css'

interface ImageScrollerProps {
  images: any;
  widthParam: string;
  heightParam: string;
  onDelete: (imageUrl: string) => void;
  onReplace: (newImage: File, oldImageUrl: string) => void;
  isEditing: boolean;
  onUpload?: (newImage: File) => void;
  refetchLocationDetails?: () => void;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ onReplace, images, widthParam = "100%", heightParam, onDelete, isEditing = false, onUpload, refetchLocationDetails }: ImageScrollerProps) => {
  const [imageIndex, setIndex] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    // Preload images
    images.forEach((picture: any) => {
      const img = new Image();
      img.src = picture;
    });
  }, [images]); 


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
    const normalizedImageUrl = normalizeUrl(images[imageIndex]);
    onDelete(normalizedImageUrl);
    setIndex((prevIndex) => (images.length > 1 ? Math.max(prevIndex - 1, 0) : 0));
  };

  const normalizeUrl = (url: string): string => {
    return url.trim().replace(/\\/g, "/").replace(process.env.REACT_APP_API_URL || "", "").replace(/^\/+/, "");
  };





  const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newFile = event.target.files[0];
      onReplace(newFile, images[imageIndex]);
      refetchLocationDetails?.();
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setOpenPopup(true);
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onUpload && onUpload(file);
      setIndex(0);
    }
  };
  
    return (
        <>
            {images.length > 0 ?
            (<Grid2 container rowSpacing={0} direction={"column"} sx={{justifyContent: "center", width: widthParam, height: heightParam, flexShrink: 0}}>
                <Grid2 sx={{width: "100%", height: "75%", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", position: "relative"}}>
                    <img
                        key={imageIndex}
                        src={images[imageIndex]}
                        alt="Uploaded location"
                        style={{ width: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }}
                        onClick={handleImageClick}
                    />
                  <div className="button-container" style={{display: isEditing ? "flex" : "none"}}>
                    <Tooltip title="Delete image">
                      <IconButton onClick={handleDelete} classes={{root: "delete-button"}} >
                        <DeleteForeverIcon/>
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Swap image">
                      <IconButton component="label" classes={{root: "image-input-button"}}>
                        <CameraswitchIcon/>
                        <input
                          id="fileInputButton"
                          type="file"
                          accept="image/*"
                          onChange={handleReplace}
                          style={{
                            display: "none",
                          }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Upload image">
                      <IconButton classes={{root: "image-input-button"}} component="label">
                        <AddPhotoAlternateIcon/>
                        <input
                          type="file"
                          accept="image/*"
                          onInput={handleUpload}
                          style={{
                            display: "none",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Grid2>
                <Grid2 sx={{display: "flex", justifyContent: "center", width: "100%", height: "5%"}}>
                    {imageIndex + 1 + "/" + images.length}
                </Grid2>
                <Grid2 container sx={{width: "100%", maxHeight: "20%"}}>
                    <Grid2 size="grow" sx={{display: "flex", justifyContent: "center"}}>
                        <Box width={.10} onClick={handlePrevious} 
                        sx={{
                            display: "flex", 
                            cursor: "pointer", 
                            flexBasis: "50%", 
                            justifyContent: "center", 
                            marginTop: "10px", 
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            flexGrow: 0.75,
                            borderRadius: "3px"
                            }}>
                            <ArrowBackIosIcon></ArrowBackIosIcon>
                        </Box>
                    </Grid2>
                    <Grid2 size="grow" sx={{display: "flex", justifyContent: "center"}}>
                        <Box width={.10} onClick={handleNext} 
                        sx={{
                            display: "flex",
                            cursor: "pointer", 
                            flexBasis: "50%", 
                            justifyContent: "center", 
                            marginTop: "10px", 
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            flexGrow: 0.75,
                            borderRadius: "3px"
                            }}>
                            <ArrowForwardIosIcon></ArrowForwardIosIcon>
                        </Box>
                    </Grid2>
                </Grid2>
            </Grid2>)
            : (
            <Grid2 container rowSpacing={0} direction={"column"} sx={{justifyContent: "center", width: widthParam, height: heightParam, marginBottom: "20px"}}>
                <Grid2 sx={{marginTop: "auto", marginBottom: "auto", width: "100%", height: "95%", position: "relative", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex"}}>
                    <img
                        src={"./imgs/no-images-uploaded.jpg"}
                        alt="Uploaded location"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                    <div className="button-container">
                      <Tooltip title="Upload an Image">
                      <IconButton classes={{root: "image-input-button"}} sx={{display: isEditing ? "flex" : "none", width: "100%"}} component="label">
                        <AddPhotoAlternateIcon/>
                        <input
                          type="file"
                          accept="image/*"
                          onInput={handleUpload}
                          style={{
                            display: "none",
                          }}
                        />
                      </IconButton>
                      </Tooltip>
                    </div>
                </Grid2>
                <Grid2 sx={{display: "flex", justifyContent: "center", width: "100%", height: "5%", position: "relative", bottom: "25px"}}>
                    <span>No images uploaded</span>
                </Grid2>
            </Grid2>
        )
      }

      <Modal
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        sx={{
          display: "flex", justifyContent: "center", alignItems: "center"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", maxWidth: "75vw", maxHeight: "75vh" }}>
          <img
            key={imageIndex}
            src={images[imageIndex]}
            alt="Uploaded location"
            style={{ margin: "auto", position: "absolute", maxWidth: "75vw", maxHeight: "75vh" }}
            onClick={() => setOpenPopup(false)}
          />
        </Box>
      </Modal>
    </>
  );
}

export default ImageScroller;