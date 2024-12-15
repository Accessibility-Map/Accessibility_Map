import React from "react";
import DeleteImageButton from "./DeleteImageButton";

const UploadedImages = ({ images, handleDeleteImage }) => {
  return (
    <div>
      <h4>Uploaded Images</h4>
      <div className="image-gallery">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              display: "inline-block",
              margin: "10px",
            }}
          >
            <img
              src={imageUrl}
              alt={`Uploaded Image ${index}`}
              style={{
                width: "100px",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            />
            <DeleteImageButton imageUrl={imageUrl} onDelete={handleDeleteImage} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedImages;
