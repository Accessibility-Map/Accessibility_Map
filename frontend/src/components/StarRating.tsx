import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, DialogTitle } from "@mui/material";
import Typography from "@mui/material/Typography";
import RatingService from "./services/RatingService";
import PredictionService from "./services/PredictionService";

type CustomIconType = {
  [index: number]: {
    icon: React.ReactElement;
    label: string;
  };
};

const customIcons: CustomIconType = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: "Very Dissatisfied",
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" />,
    label: "Dissatisfied",
  },
  3: { icon: <SentimentSatisfiedIcon color="warning" />, label: "Neutral" },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: "Satisfied",
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: "Very Satisfied",
  },
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
  const [unset, setUnset] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  
  // Fetch predicted rating
  useEffect(() => {
    PredictionService.predictRating(userID, locationID).then((rating) => {
      console.log("Predicted Rating from API:", rating); 
      setPredictedRating(rating);
    });
  }, [locationID, userID]);

  // Fetch the initial rating from the backend
  useEffect(() => {
    RatingService.getRating(userID, locationID).then((rating) => {
      if (rating && rating.getRating() !== 0) {
        setCurrentRating(rating.getRating());
      } else {
        setUnset(true);
      }
    });
  }, [locationID, userID]);

  // Function to update rating in the state and backend
  const updateRating = (newRating: number | null) => {
    if (!newRating || newRating < 1 || newRating > 5) return;

    if (unset) {
      RatingService.createRating(userID, locationID, newRating);
      setUnset(false);
    } else {
      RatingService.setRating(userID, locationID, newRating);
    }
    setCurrentRating(newRating);
  };

  const promptLogin = () => {
    setLoginPromptOpen(true);
  }

  return (
    <>
    {!!userID ? 
      (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <StyledRating
            name="customized-icons"
            value={currentRating}
            IconContainerComponent={IconContainer}
            getLabelText={(value: number) => customIcons[value].label}
            highlightSelectedOnly
            precision={1}
            onChange={(event, newValue) => updateRating(newValue)}
            onChangeActive={(event, newHover) => setHover(newHover)}
            emptyIcon={<span style={{ opacity: 0.55 }}>{customIcons[1].icon}</span>}
          />
          {currentRating !== null && (
			<Typography variant="body2" color="textSecondary">
			  Current Rating: {hover !== -1 ? hover : currentRating} Stars
			</Typography>
			)}
		  {predictedRating !== null && (
			<Typography variant="body2" color="textSecondary">
			  Predicted: {predictedRating.toFixed(2)} Stars
			</Typography>
			)}
        </Box> 
      )
      : 
      (
        <>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <StyledRating
              name="customized-icons"
              value={0}
              IconContainerComponent={IconContainer}
              getLabelText={(value: number) => customIcons[value].label}
              highlightSelectedOnly
              precision={1}
              onChange={(event, newValue) => promptLogin()}
              onChangeActive={(event, newHover) => setHover(newHover)}
              emptyIcon={<span style={{ opacity: 0.55 }}>{customIcons[1].icon}</span>}
            />
          </Box>
          <Dialog
            open={loginPromptOpen}
            onClose={() => setLoginPromptOpen(false)}
            >
              <DialogTitle>Login Required</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  You must be logged in to rate a location's accessibility.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button color="error" variant="contained" onClick={() => setLoginPromptOpen(false)}>Close</Button>
              </DialogActions>
          </Dialog>
        </>
      )
      }
    </>
  );
};

export default StarRating;
