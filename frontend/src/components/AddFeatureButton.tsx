import featureService from "./services/FeatureService";
import React from "react";
import "./styles/MapView.css";
import "./styles/AddFeatureModal.css";

import {Box, Modal, Button, Typography, Select, SelectChangeEvent, MenuItem, TextField} from "@mui/material";
import { set } from "react-hook-form";

interface AddFeatureButtonProps {
  locationID: number;
  setFeaturesList: ([]) => void;
  featuresList: [];
}

const AddFeatureButton = ({ locationID, setFeaturesList, featuresList }: AddFeatureButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [feature, setFeature] = React.useState("");

  const handleFeatureChange = (event: SelectChangeEvent<string>) => {
    setFeature(event.target.value as string);
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNaN(locationID)) {
      console.error("Error: locationID is NaN");
      alert("Invalid LocationID. Please refresh and try again.");
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);
    const notes = formData.get("notes") as string;

    try {
      const response = await featureService.createFeature(
        locationID,
        feature,
        notes
      );

      setFeaturesList([...featuresList, response]);

      handleClose();
    } catch (error) {
      console.error("Error creating feature:", error);
      alert("There was an error creating the feature. Please try again.");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        fullWidth
      >
        Add Feature
      </Button>{" "}
      <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="add-feature-modal-title"
        aria-describedby="add-feature-modal-description"
      >
        <Box
          sx={{
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            m: "auto",
            mt: "10%",
            borderRadius: 1,
          }}
        >
          <Typography id="add-feature-modal-title" variant="h6" component="h2">
            Add a New Feature
          </Typography>
          <form onSubmit={handleSubmit}>
            <label htmlFor="location-feature-select" className="input-label">
              What is the feature?
            </label>
            <Select
              labelId="location-feature-select-label"
              id="location-feature-select"
              value={feature}
              onChange={handleFeatureChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select a feature
              </MenuItem>
              <MenuItem value="Accessible Parking">Accessible Parking</MenuItem>
              <MenuItem value="Ramp">Ramp</MenuItem>
              <MenuItem value="Elevator">Elevator</MenuItem>
              <MenuItem value="Accessible Bathroom">
                Accessible Bathroom
              </MenuItem>
            </Select>
            <br />
            <br />

            <TextField
              name="notes"
              id="notes"
              label="Add notes others may find helpful"
              placeholder="Notes (optional)"
              fullWidth
              margin="normal"
            />
            <br />
            <br />

            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="secondary"
              sx={{ ml: 2 }}
            >
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default AddFeatureButton;
