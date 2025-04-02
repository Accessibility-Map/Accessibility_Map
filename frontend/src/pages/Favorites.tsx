import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { List, ListItem, ListItemText, Paper, Typography, Button, AppBar, Toolbar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

type Location = {
  locationID: number;
  locationName?: string;
  description?: string;
};

const Favorites: React.FC = () => {
  const [favorites] = useLocalStorage<Location[]>("favorites", []);
  const navigate = useNavigate();

  const handleLocationClick = (location: Location) => {
    if (!location || !location.locationID) {
      console.error("Invalid location object:", location);
      return;
    }

    console.log("Navigating to MapView with location:", location);
    sessionStorage.setItem("selectedLocation", JSON.stringify(location));
    navigate(`/map?locationID=${location.locationID}`);
  };

  const validFavorites = favorites.filter((fav: Location) => typeof fav === "object" && fav.locationID);

  return (
    <>
      {/* Top Nav Bar */}
      <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Favorite Locations
          </Typography>
          <Button color="inherit" onClick={() => navigate("/")}>
            Back to Map
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ maxWidth: 500, margin: "auto", padding: 2, mt: 4 }}>
        <Paper sx={{ padding: 2 }}>
          <List>
            {validFavorites.length > 0 ? (
              validFavorites.map((location, index) => (
                <ListItem
                  key={location.locationID || index}
                  component="div"
                  onClick={() => handleLocationClick(location)}
                  sx={{
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "6px",
                    "&:hover": {
                      backgroundColor: "#f5f5f5"
                    }
                  }}
                >
                  <ListItemText
                    primary={location.locationName ? location.locationName : `Location ID: ${location.locationID}`}
                    secondary={location?.description?.substring(0, 40) + "..."}
                    sx={{ '& .MuiListItemText-secondary': { mt: 0, ml: 2 } }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography>No favorite locations yet.</Typography>
            )}
          </List>
        </Paper>
      </Box>
    </>
  );
};

export default Favorites;
