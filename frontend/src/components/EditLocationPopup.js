import { useState } from "react";
import FeatureImageUploader from "./FeatureImageUploader";
import axios from "axios";

const EditLocationPopup = ({ location, featuresList, setFeaturesList, images, setImages, onSave, onClose, saveEdit }) => {
  const [locationName, setLocationName] = useState(location.locationName || "");
  const [description, setDescription] = useState(location.description || "");
  const [updatedFeatures, setUpdatedFeatures] = useState(featuresList);
  const [mainImage, setMainImage] = useState(location.mainImageUrl || null);

  const handleUpdateImage = (featureId, newImageUrl) => {
    console.log(`Updating image for feature ID: ${featureId}, URL: ${newImageUrl}`);
    setUpdatedFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === featureId ? { ...feature, imagePath: newImageUrl } : feature
      )
    );
  };


  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      console.log("Saving main image...");
      console.log("Current main image:", mainImage);

      let updatedImages = [...images];

      if (mainImage) {
        const formData = new FormData();
        formData.append("file", mainImage);

        console.log("Uploading main image to backend...");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}api/locations/${location.locationID}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Backend response for main image upload:", response.data);

        const newMainImageUrl = response.data.imageUrl.startsWith("http")
          ? response.data.imageUrl
          : `${process.env.REACT_APP_API_URL.replace(/\/+$/, "")}/${response.data.imageUrl.replace(/^\/+/, "")}`;

        console.log("Processed main image URL:", newMainImageUrl);

        updatedImages = [newMainImageUrl, ...images.filter((img) => img !== newMainImageUrl)];
        setImages(updatedImages);

        console.log("Updated images array after saving:", updatedImages);
      }

      const updatedLocation = {
        ...location,
        locationName,
        description,
      };
      saveEdit(updatedLocation);

      onSave(updatedFeatures, updatedImages); 
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };




  return (
    <div>
      <h3>Edit Location</h3>
      <form>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Location Name"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <h4>Features</h4>
        {updatedFeatures.map((feature) => (
          <div key={feature.id} style={{ marginBottom: "20px" }}>
            <h5>{feature.locationFeature}</h5>
            <p>Current Image:</p>
            {feature.imagePath ? (
              <img
                src={feature.imagePath}
                alt="Feature"
                style={{ width: "100px", marginBottom: "10px" }}
              />
            ) : (
              <p>No image uploaded</p>
            )}
            <FeatureImageUploader
              feature={feature}
              onUpdateImage={(featureId, newImageUrl) => handleUpdateImage(featureId, newImageUrl)}
            />
            <textarea
              value={feature.notes || ""}
              onChange={(e) =>
                setUpdatedFeatures((prevFeatures) =>
                  prevFeatures.map((f) =>
                    f.id === feature.id ? { ...f, notes: e.target.value } : f
                  )
                )
              }
              placeholder="Notes"
              style={{ width: "100%", marginTop: "10px" }}
            />
          </div>
        ))}
        <div>
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
        </div>
        <button type="button" onClick={handleSave}>
          Save Changes
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditLocationPopup;