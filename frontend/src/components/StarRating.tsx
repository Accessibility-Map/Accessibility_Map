import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import RatingService from "./services/RatingService";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import PredictionService from "./services/PredictionService";
import Typography from "@mui/material/Typography";

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
  const [predictedRating, setPredictedRating] = useState<number | null>(null);

  
  useEffect(() => {
    PredictionService.predictRating(userID, locationID).then((rating) => {
      setPredictedRating(rating);
    });
  }, [locationID, userID]);

    useEffect(() => {
      RatingService.getRating(userID, locationID).then((rating) => {

        if (rating && rating.getRating() !== 0) {
          setCurrentRating(rating.getRating());
        } else {
          setUnset(true);
        }
      });
    }, [locationID]);
  
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
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
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
            {hover !== -1 ? hover : currentRating} Stars
          </Typography>
        )}
            {predictedRating !== null && (
        <Typography variant="body2" color="textSecondary">
          Predicted Rating: {predictedRating.toFixed(2)} Stars
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;
