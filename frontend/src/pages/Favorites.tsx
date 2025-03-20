import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
type Location = {
  locationID: number;
  locationName?: string;
};

const Favorites: React.FC = () => {
  const [favorites] = useLocalStorage<any[]>("favorites", []);
  const navigate = useNavigate();

  const handleLocationClick = (location: Location) => {
    if (!location || !location.locationID) {
      console.error("Invalid location object:", location);
      return;
    }
  
    console.log("Navigating to MapView with location:", location);
  
    // ✅ Navigate to the map with the location ID
    navigate(`/map?locationID=${location.locationID}`);
  
    // ✅ Store the FULL location object in sessionStorage
    sessionStorage.setItem("selectedLocation", JSON.stringify(location));
  };
  

  
  const handleFavoriteAdd = (location: { locationID: number; locationName: string; features?: any[] }) => {
    const existingFavorites: any[] = JSON.parse(localStorage.getItem("favorites") || "[]");
  
    // ✅ Ensure the location has all required fields
    const updatedLocation = {
      ...location,
      features: Array.isArray(location.features) ? location.features : [],
    };
  
    // ✅ Check if the location is already in favorites
    if (!existingFavorites.some((fav) => fav.locationID === location.locationID)) {
      const newFavorites = [...existingFavorites, updatedLocation];
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } else {
      console.warn("Location is already in favorites:", location);
    }
  };
  
  
  
  
  // Ensure only valid location objects are displayed
  const validFavorites = favorites.filter((fav: Location) => typeof fav === "object" && fav.locationID);

  return (
    <Paper sx={{ maxWidth: 500, margin: "auto", padding: 2, mt: 4 }}>
      <Typography variant="h6">Favorite Locations</Typography>
      <List>
        {validFavorites.length > 0 ? (
          validFavorites.map((location, index) => (
            <ListItem
              key={location.locationID || index} 
              component="div"
              onClick={() => handleLocationClick(location)}
              sx={{ cursor: "pointer", textAlign: "left" }}
            >
              <ListItemText primary={`Location ID: ${location.locationID}`} />
            </ListItem>
          ))
        ) : (
          <Typography>No favorite locations yet.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default Favorites;


