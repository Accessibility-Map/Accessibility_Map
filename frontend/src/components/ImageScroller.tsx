import React, { useState } from 'react'
import Grid2 from '@mui/material/Grid2';
import Box from "@mui/material/Box";
import axios from "axios";
import Modal from "@mui/material/Modal";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "./styles/ImageScroller.css";

import './styles/MarkerPopup.css'

interface ImageScrollerProps {

  images: any;
  widthParam: string;
  heightParam: string;
  onDelete: (imageUrl: string) => void;
  onReplace: (newImage: File, oldImageUrl: string) => void;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ onReplace, images, widthParam = "100%", heightParam, onDelete }: ImageScrollerProps) => {
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
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setOpenPopup(true);
  }

  return (
    <>
      {images.length > 0 ?
        (<Grid2 container rowSpacing={0} direction={"column"} sx={{ justifyContent: "center", width: widthParam, height: heightParam }}>
          <Grid2 sx={{ width: "100%", height: "75%", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", position: "relative" }}>
            <img
              key={imageIndex}
              src={images[imageIndex]}
              alt="Uploaded location"
              style={{ width: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }}
              onClick={handleImageClick}
            />
            <div className="button-container">
              <label
                className="replace-button"
                style={{
                  backgroundColor: "blue",
                  border: "2px solid blue",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "0",
                  right: "50px",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReplace}
                  style={{
                    display: "none",
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 95.396 122.88"
                  width="20"
                  height="20"
                  fill="white"
                >
                  <g>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0,93.349l30.717,29.531l0.002-19.008H85.11v-21.05h-0.002V68.516l0.002-0.413 
        l-0.004-18.861L64.06,69.475l0.002,13.348h-33.34l-0.004-19.008L0,93.349L0,93.349z 
        M95.396,29.533L64.68,0l-0.002,19.011 l-28.031,0l-0.533-0.002l-25.827,0l-0.002,1.025v25.833l0.002,23.394h3.293l17.754-17.069
        v-5.794l0.002-0.535V40.06h33.34 l0.004,19.006L95.396,29.533L95.396,29.533L95.396,29.533z"
                    />
                  </g>
                </svg>
              </label>

              <button
                className="bin-button"
                onClick={handleDelete}
                aria-label="delete image"
                style={{
                  background: "red",
                  border: "2px solid red",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 108.294 122.88"
                  width="20"
                  height="20"
                  fill="white"
                >
                  <path d="M4.873,9.058h33.35V6.2V6.187c0-0.095,0.002-0.186,0.014-0.279c0.075-1.592,0.762-3.037,1.816-4.086l-0.007-0.007 c1.104-1.104,2.637-1.79,4.325-1.806l0.023,0.002V0h0.031h19.884h0.016c0.106,0,0.207,0.009,0.309,0.022 c1.583,0.084,3.019,0.76,4.064,1.81c1.102,1.104,1.786,2.635,1.803,4.315l-0.003,0.021h0.014V6.2v2.857h32.909h0.017 c0.138,0,0.268,0.014,0.401,0.034c1.182,0.106,2.254,0.625,3.034,1.41l0.004,0.007l0.005-0.007 c0.851,0.857,1.386,2.048,1.401,3.368l-0.002,0.032h0.014v0.032v10.829c0,1.472-1.195,2.665-2.667,2.665h-0.07H2.667 C1.195,27.426,0,26.233,0,24.762v-0.063V13.933v-0.014c0-0.106,0.004-0.211,0.018-0.315v-0.021 c0.089-1.207,0.624-2.304,1.422-3.098l-0.007-0.002C2.295,9.622,3.49,9.087,4.81,9.069l0.032,0.002V9.058H4.873L4.873,9.058z M77.79,49.097h-5.945v56.093h5.945V49.097L77.79,49.097z M58.46,49.097h-5.948v56.093h5.948V49.097L58.46,49.097z M39.13,49.097 h-5.946v56.093h5.946V49.097L39.13,49.097z M10.837,31.569h87.385l0.279,0.018l0.127,0.007l0.134,0.011h0.009l0.163,0.023 c1.363,0.163,2.638,0.789,3.572,1.708c1.04,1.025,1.705,2.415,1.705,3.964c0,0.098-0.009,0.193-0.019,0.286l-0.002,0.068 l-0.014,0.154l-7.393,79.335l-0.007,0.043h0.007l-0.016,0.139l-0.051,0.283l-0.002,0.005l-0.002,0.018 c-0.055,0.331-0.12,0.646-0.209,0.928l-0.007,0.022l-0.002,0.005l-0.009,0.018l-0.023,0.062l-0.004,0.021 c-0.118,0.354-0.264,0.698-0.432,1.009c-1.009,1.88-2.879,3.187-5.204,3.187H18.13l-0.247-0.014v0.003l-0.011-0.003l-0.032-0.004 c-0.46-0.023-0.889-0.091-1.288-0.202c-0.415-0.116-0.818-0.286-1.197-0.495l-0.009-0.002l-0.002,0.002 c-1.785-0.977-2.975-2.882-3.17-5.022L4.88,37.79l-0.011-0.125l-0.011-0.247l-0.004-0.116H4.849c0-1.553,0.664-2.946,1.707-3.971 c0.976-0.955,2.32-1.599,3.756-1.726l0.122-0.004v-0.007l0.3-0.013l0.104,0.002V31.569L10.837,31.569z" />
                </svg>
              </button>
            </div>
          </Grid2>
          <Grid2 sx={{ display: "flex", justifyContent: "center", width: "100%", height: "5%" }}>
            {imageIndex + 1 + "/" + images.length}
          </Grid2>
          <Grid2 container sx={{ width: "100%", maxHeight: "20%" }}>
            <Grid2 size="grow" sx={{ display: "flex", justifyContent: "center" }}>
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
            <Grid2 size="grow" sx={{ display: "flex", justifyContent: "center" }}>
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
          <Grid2 container rowSpacing={0} direction={"column"} sx={{ justifyContent: "center", width: "100%", height: "100%" }}>
            <Grid2 sx={{ marginTop: "auto", marginBottom: "auto", width: "100%", height: "95%" }}>
              <img
                src={"./imgs/no-images-uploaded.jpg"}
                alt="Uploaded location"
                style={{ width: "100%" }}
              />
            </Grid2>
            <Grid2 sx={{ display: "flex", justifyContent: "center", width: "100%", height: "5%" }}>
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
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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