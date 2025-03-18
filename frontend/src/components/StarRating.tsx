import React, { useEffect, useState } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Grid2 } from "@mui/material";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import FavoriteService from "./services/FavoriteService"; // New service to handle favorites
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
  locationID: number;
  userID: number;
  onFavoriteAdded?: (locationID: number) => void;
}

const StarRating = ({ locationID, userID, onFavoriteAdded }: StarRatingProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number>(-1);
  const [favorites, setFavorites] = useLocalStorage<number[]>("favorites", []); // Store favorites in localStorage
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    FavoriteService.getFavorites(userID).then((favList) => {
      if (favList.includes(locationID)) {
        setCurrentRating(5); // Keep it highlighted if it's a favorite
      }
    });
  }, [locationID, userID]);

  const updateRating = (newValue: number | null) => {
    setCurrentRating(newValue);

    if (newValue === 5) {
      if (!favorites.includes(locationID)) {
        setFavorites([...favorites, locationID]); // Add to favorites
        FavoriteService.addFavorite(userID, locationID);
        if (onFavoriteAdded) onFavoriteAdded(locationID);
      }
    } else {
      setFavorites(favorites.filter((id) => id !== locationID)); // Remove from favorites if deselected
      FavoriteService.removeFavorite(userID, locationID);
    }
  };

  const promptLogin = () => {
    setLoginPromptOpen(true);
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {!!userID ? (
        <Box sx={{ height: "100%" }}>
          <Grid2 container sx={{ height: "100%" }}>
            <Grid2 size={6} sx={{ height: "100%", textAlign: "center" }}>
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
            </Grid2>
            <Grid2 size={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "end" }}>
              {currentRating !== null && (
                <Typography variant="body2" color="textSecondary" sx={{ margin: "0 !important" }}>
                  Your Rating: {hover !== -1 ? hover : currentRating} Stars
                </Typography>
              )}
            </Grid2>
          </Grid2>
        </Box>
      ) : (
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
          <Dialog open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)}>
            <DialogTitle>Login Required</DialogTitle>
            <DialogContent>
              <DialogContentText>You must be logged in to rate a location's accessibility.</DialogContentText>
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
