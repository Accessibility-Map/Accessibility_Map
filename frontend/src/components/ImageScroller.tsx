import React, { useState } from 'react'
import Box from "@mui/material/Box";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ImageScrollerProps {
    images: any;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images }) => {
    const [imageIndex, setIndex] = useState(0);

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

    return (
        <>
            {images.length > 0 && <Box display="flex" flexDirection="row">
                <Box width={.10} display="flex" alignItems="center" onClick={handlePrevious} sx={{cursor: "pointer"}}>
                    <ArrowBackIosIcon></ArrowBackIosIcon>
                </Box>
                <img
                    key={imageIndex}
                    src={images[imageIndex]}
                    alt="Uploaded location"
                    style={{ width: "100%", marginRight: "0.5rem" }}
                />
                <Box width={.10} display="flex" alignItems="center" onClick={handleNext} sx={{cursor: "pointer"}}>
                    <ArrowForwardIosIcon></ArrowForwardIosIcon>
                </Box>
            </Box>}
        </>
    );
}

export default ImageScroller