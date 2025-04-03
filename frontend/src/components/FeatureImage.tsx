import React, { useState } from "react";

import { Box, Modal } from "@mui/material";

interface FeatureImageProps {
    src: string;
    alt: string;
    width?: string;
}

const FeatureImage = ({ src, alt, width }: FeatureImageProps) => {
    const [openPopup, setOpenPopup] = useState(false);


    const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        setOpenPopup(true);
    }


    return (
        <Box sx={{ marginTop: "7px", marginBottom: "7px", width: "100%", height: "100%"}}>
            <Box sx={{ width: "100px", height: "100px"}}>
                {src ? (
                    <img
                    src={src}
                    alt={alt}
                    style={{ cursor: "pointer", width: "100%", height: "100%", objectFit: "contain" }}
                    onClick={handleImageClick}
                    />
                ) : (
                    <img
                        src={"./imgs/no-images-uploaded.jpg"}
                        alt="No image uploaded"
                        style={{ width: "100%", height: "100%", objectFit: "contain"  }}
                    />
                )}
            </Box>
        <Modal
            open={openPopup}
            onClose={() => setOpenPopup(false)}
            sx={{
            display: "flex", justifyContent: "center", alignItems: "center"
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
                src={src}
                alt={alt}
                style={{ margin: "auto", position: "absolute", maxWidth: "75vw", maxHeight: "75vh" }}
                onClick={() => setOpenPopup(false)}
            />
            </Box>
        </Modal>
      </Box>
    );
};

export default FeatureImage;