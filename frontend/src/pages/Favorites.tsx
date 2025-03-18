import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Favorites: React.FC = () => {
  const [favorites] = useLocalStorage<number[]>("favorites", []);
  const navigate = useNavigate();

  const handleLocationClick = (locationID: number) => {
    console.log("Navigating to MapView with location ID:", locationID); // ✅ Debugging
    navigate(`/map?locationID=${locationID}`); 
  };

  return (
    <Paper sx={{ maxWidth: 500, margin: "auto", padding: 2, mt: 4 }}>
      <Typography variant="h6">Favorite Locations</Typography>
      <List>
        {favorites.length > 0 ? (
          favorites.map((locationID) => (
            <ListItem
              key={locationID}
              component="div"
              onClick={() => handleLocationClick(locationID)}
              sx={{ cursor: "pointer", textAlign: "left" }}
            >
              <ListItemText primary={`Location ID: ${locationID}`} />
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


