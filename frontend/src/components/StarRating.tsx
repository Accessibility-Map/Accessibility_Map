import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import axios from "axios";

type CustomIconType = {
  [index: number]: {
    icon: React.ReactElement;
    label: string;
  };
};

const customIcons: CustomIconType = {
  1: { icon: <SentimentVeryDissatisfiedIcon color="error" />, label: "Very Dissatisfied" },
  2: { icon: <SentimentDissatisfiedIcon color="error" />, label: "Dissatisfied" },
  3: { icon: <SentimentSatisfiedIcon color="warning" />, label: "Neutral" },
  4: { icon: <SentimentSatisfiedAltIcon color="success" />, label: "Satisfied" },
  5: { icon: <SentimentVerySatisfiedIcon color="success" />, label: "Very Satisfied" },
};

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconEmpty .MuiSvgIcon-root": {
    color: theme.palette.action.disabled,
  },
}));

interface IconContainerProps {
  value: number;
}

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value]?.icon}</span>;
}

interface StarRatingProps {
  locationID: number;
  userID: number;
}

const StarRating = ({ locationID, userID }: StarRatingProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hover, setHover] = useState(-1);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [csvData, setCsvData] = useState({
    userID: 0,
    locationID: 0,
    hasRamp: 0,
    hasElevator: 0,
    hasAccessibleBathroom: 0,
    hasAccessibleParking: 0,
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value);

    if (["hasRamp", "hasElevator", "hasAccessibleBathroom", "hasAccessibleParking"].includes(name)) {
      if (numericValue === 0 || numericValue === 1 || value === "") {
        setCsvData({ ...csvData, [name]: numericValue });
        setError(null);
      } else {
        setError("Please enter only 0 or 1 for accessibility features.");
      }
    } else {
      if (!isNaN(numericValue) || value === "") {
        setCsvData({ ...csvData, [name]: numericValue });
        setError(null);
      } else {
        setError("Please enter a valid number.");
      }
    }
  };

  const handleSubmit = async () => {
    const validInputs = [csvData.hasRamp, csvData.hasElevator, csvData.hasAccessibleBathroom, csvData.hasAccessibleParking].every(
      (val) => val === 0 || val === 1
    );

    if (!validInputs) {
      setError("Please enter only 0 or 1 for accessibility features.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5232/api/ratings/predict", {
        UserID: csvData.userID,
        LocationID: csvData.locationID,
        HasRamp: csvData.hasRamp,
        HasElevator: csvData.hasElevator,
        HasAccessibleBathroom: csvData.hasAccessibleBathroom,
        HasAccessibleParking: csvData.hasAccessibleParking,
      });

      console.log("Full Response:", response.data);
      setPredictedRating(response.data.score);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Prediction request failed. Please try again.");
    }
  };

  const promptLogin = () => {
    setLoginPromptOpen(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <StyledRating
        name="customized-icons"
        value={currentRating}
        IconContainerComponent={IconContainer}
        getLabelText={(value: number) => customIcons[value].label}
        highlightSelectedOnly
        precision={1}
        onChange={(event, newValue) => setCurrentRating(newValue)}
        onChangeActive={(event, newHover) => setHover(newHover)}
        emptyIcon={<span style={{ opacity: 0.55 }}>{customIcons[1].icon}</span>}
      />

      <Typography variant="h6">Enter Accessibility Features (0 or 1):</Typography>

      {["userID", "locationID", "hasRamp", "hasElevator", "hasAccessibleBathroom", "hasAccessibleParking"].map((field) => (
        <TextField
          key={field}
          label={field.replace(/([A-Z])/g, " $1")}
          name={field}
          type="number"
          inputProps={{ min: 0 }}
          value={csvData[field as keyof typeof csvData]}
          onChange={handleInputChange}
          fullWidth
        />
      ))}


      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit to Get Prediction
      </Button>

      {predictedRating !== null && !isNaN(Number(predictedRating)) && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Predicted Rating: {Number(predictedRating).toFixed(2)} Stars
        </Typography>
      )}


      <Dialog open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>You must be logged in to rate a location's accessibility.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setLoginPromptOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StarRating;
