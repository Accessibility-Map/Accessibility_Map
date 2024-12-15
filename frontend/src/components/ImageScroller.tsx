import React, { useState } from 'react'
import Grid2 from '@mui/material/Grid2';
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "./styles/ImageScroller.css";

import './styles/MarkerPopup.css'

interface ImageScrollerProps {
    images: any;
    widthParam: string;
    heightParam: string;
    // Callback function for deletion
    onDelete: (imageUrl: string) => void;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images, widthParam = "100%", heightParam, onDelete }: ImageScrollerProps) => {
    const [imageIndex, setIndex] = useState(0);
    const [openPopup, setOpenPopup] = useState(false);

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

    const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        // Open a popup with a full size version of the image
        setOpenPopup(true);
    }

    return (
        <>
            {images.length > 0 ?
            (<Grid2 container rowSpacing={0} direction={"column"} sx={{justifyContent: "center", width: widthParam, height: heightParam}}>
                <Grid2 sx={{width: "100%", height: "75%", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", position: "relative"}}>
                    <img
                        key={imageIndex}
                        src={images[imageIndex]}
                        alt="Uploaded location"
                        style={{ width: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }}
                        onClick={handleImageClick}
                    />
                    <button className="bin-button" onClick={handleDelete} aria-label="delete image">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 39 7"
                        className="bin-top"
                      >
                        <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line>
                        <line
                          strokeWidth="3"
                          stroke="white"
                          y2="1.5"
                          x2="26.0357"
                          y1="1.5"
                          x1="12"
                        ></line>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 33 39"
                        className="bin-bottom"
                      >
                        <mask fill="white" id="path-1-inside-1_8_19">
                          <path
                            d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
                          ></path>
                        </mask>
                        <path
                          mask="url(#path-1-inside-1_8_19)"
                          fill="white"
                          d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                        ></path>
                        <path strokeWidth="4" stroke="white" d="M12 6L12 29"></path>
                        <path strokeWidth="4" stroke="white" d="M21 6V29"></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 89 80"
                        className="garbage"
                      >
                        <path
                          fill="white"
                          d="M20.5 10.5L37.5 15.5L42.5 11.5L51.5 12.5L68.75 0L72 11.5L79.5 12.5H88.5L87 22L68.75 31.5L75.5066 25L86 26L87 35.5L77.5 48L70.5 49.5L80 50L77.5 71.5L63.5 58.5L53.5 68.5L65.5 70.5L45.5 73L35.5 79.5L28 67L16 63L12 51.5L0 48L16 25L22.5 17L20.5 10.5Z"
                        ></path>
                      </svg>
                    </button>
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
            <Grid2 container rowSpacing={0} direction={"column"} sx={{justifyContent: "center", width: "100%", height: "100%"}}>
                <Grid2 sx={{marginTop: "auto", marginBottom: "auto", width: "100%", height: "95%"}}>
                    <img
                        src={"./imgs/no-images-uploaded.jpg"}
                        alt="Uploaded location"
                        style={{ width: "100%" }}
                    />
                </Grid2>
                <Grid2 sx={{display: "flex", justifyContent: "center", width: "100%", height: "5%"}}>
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
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <img
                        key={imageIndex}
                        src={images[imageIndex]}
                        alt="Uploaded location"
                        style={{ margin: "auto", position: "absolute", maxWidth: "75vw", maxHeight: "75vh" }}
                    />
                </Box>
            </Modal>
        </>
    );
}

export default ImageScroller;