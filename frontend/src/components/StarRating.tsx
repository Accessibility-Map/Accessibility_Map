import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, DialogTitle, Grid2 } from "@mui/material";
import Typography from "@mui/material/Typography";
import RatingService from "./services/RatingService";
import PredictionService from "./services/PredictionService";
import GenericPromptDialog from "./GenericPromptDialog";
import "./styles/StarRating.css";

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
  shortScreen: boolean
}

const StarRating = ({ locationID, userID, shortScreen }: StarRatingProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hover, setHover] = useState(-1);
  const [unset, setUnset] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  
  // Fetch predicted rating
  useEffect(() => {
    if(userID) {
      PredictionService.predictRating(userID, locationID).then((rating) => {
        setPredictedRating(rating);
      });
    }
  }, [locationID, userID]);

  // Fetch the initial rating from the backend
  useEffect(() => {
    if(userID) {
      RatingService.getRating(userID, locationID).then((rating) => {
        if (rating && rating.getRating() !== 0) {
          setCurrentRating(rating.getRating());
        } else {
          setUnset(true);
        }
      });
    }
    else{
      setUnset(true);
    }
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
    <Box sx={{ width: "100%", height: "100%"}}>
      {!!userID ? 
        (
          <Box sx={{ height: "100%"}}>
            <Grid2 container sx={{ height: "100%"}}>
              <Grid2 size={6} sx={{ height: "100%", textAlign: "center"}}>
                <Typography variant="subtitle1" className={shortScreen ? "shortScreen" : ""}>
                  Rate This Location's Accessibility
                </Typography>
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
              </Grid2>
              <Grid2 size={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "end"}}>
                {currentRating !== null && (
                <Typography variant="body2" color="textSecondary" sx={{ margin: "0 !important"}}>
                  Your Rating: {hover !== -1 ? hover : currentRating} Stars
                </Typography>
                )}
                {(
                  <Typography variant="body2" color="textSecondary" className={shortScreen ? "shortScreen" : "normalScreen"}>
                    Predicted Rating: { 0} Stars
                  </Typography>
                )}
              </Grid2>
            </Grid2>
          </Box> 
        )
        : 
        (
          <>
          <Box sx={{ height: "100%"}}>
            <Grid2 container sx={{ height: "100%"}}>
              <Grid2 size={6} sx={{ height: "100%", textAlign: "center"}}>
                <Typography variant="subtitle1" className={shortScreen ? "shortScreen" : ""}>
                  Rate This Location's Accessibility
                </Typography>
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
              </Grid2>
            </Grid2>
          </Box> 
            <GenericPromptDialog promptingAction="You must be logged in to rate a location's accessibility." isOpen={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} title="Login Required"/>
          </>
        )
        }
    </Box>
  );
};

export default StarRating;
