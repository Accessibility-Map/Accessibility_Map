import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import FavoriteService from "./services/FavoriteService";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
  locationID?: number; // Handle optional locationID
  userID: number;
  onFavoriteAdded?: (locationID: number) => void;
}

const StarRating = ({ locationID, userID, onFavoriteAdded }: StarRatingProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number>(-1);
  const [favorites, setFavorites] = useLocalStorage<number[]>("favorites", []);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    if (!locationID) {
      console.error("Error: locationID is undefined in StarRating.tsx");
      return;
    }

    const fetchFavorites = async () => {
      try {
        const favList = await FavoriteService.getFavoritesByLocation(locationID);
        if (favList.length > 0) setCurrentRating(5);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [locationID]);

  const updateRating = (newValue: number | null) => {
    if (!locationID) {
      console.error("Error: Cannot update rating, locationID is undefined.");
      return;
    }

    setCurrentRating(newValue);

    if (newValue === 5) {
      if (!favorites.includes(locationID)) {
        setFavorites([...favorites, locationID]);
        FavoriteService.addFavorite(userID, locationID);
        if (onFavoriteAdded) onFavoriteAdded(locationID);
      }
    } else {
      setFavorites(favorites.filter((id) => id !== locationID));
      FavoriteService.removeFavorite(userID, locationID);
    }
  };

  return (
    <Box 
      sx={{
        width: "100%",
        height: "60px", // ✅ Fix overflow issue
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "10px", // ✅ Ensure spacing
      }}
    >
      {!!userID ? (
        <>
          <Typography variant="subtitle1">Rate This Location's Accessibility</Typography>
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
              Your Rating: {hover !== -1 ? hover : currentRating} Stars
            </Typography>
          )}
        </>
      ) : (
        <>
          <StyledRating
            name="customized-icons"
            value={0}
            IconContainerComponent={IconContainer}
            getLabelText={(value: number) => customIcons[value].label}
            highlightSelectedOnly
            precision={1}
            onChange={(event, newValue) => setLoginPromptOpen(true)}
            onChangeActive={(event, newHover) => setHover(newHover)}
            emptyIcon={<span style={{ opacity: 0.55 }}>{customIcons[1].icon}</span>}
          />
          <Dialog open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)}>
            <DialogTitle>Login Required</DialogTitle>
            <DialogContent>
              <DialogContentText>You must be logged in to rate this location.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="error" variant="contained" onClick={() => setLoginPromptOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default StarRating;
