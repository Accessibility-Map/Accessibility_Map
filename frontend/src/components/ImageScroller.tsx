import React, { useState } from 'react'
import Grid2 from '@mui/material/Grid2';
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import './styles/MarkerPopup.css'
import './styles/ImageScroller.css'

interface ImageScrollerProps {
    images: any;
    widthParam: string;
    heightParam: string;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images, widthParam = "100%", heightParam }: ImageScrollerProps) => {
    const [imageIndex, setIndex] = useState(0);
    const [openPopup, setOpenPopup] = useState(false);

    const handleNext = () => {
        if (imageIndex < images.length - 1) {
            setIndex(imageIndex + 1);
        }
    }    

    const handlePrevious = () => {
        if (imageIndex > 0) {
            setIndex(imageIndex - 1);
        }
    }

    const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        // Open a popup with a full size version of the image
        setOpenPopup(true);
    }

    return (
        <>
            {images.length > 0 ?
            (<Grid2 container rowSpacing={0} direction={"column"} sx={{justifyContent: "center", width: widthParam, height: heightParam}}>
                <Grid2 sx={{width: "100%", height: "75%", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex"}}>
                    <img
                        key={imageIndex}
                        src={images[imageIndex]}
                        alt="Uploaded location"
                        style={{ width: "100%", maxHeight: "100%", cursor: "pointer", objectFit: "contain" }}
                        onClick={handleImageClick}
                    />
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

export default ImageScroller