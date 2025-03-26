import React, { useEffect, useState } from "react";
import FeatureImage from "./FeatureImage";
import Feature from "./models/Feature";

import { List, ListItem, ListItemText, Divider, Grid2, Box } from "@mui/material";

interface FeaturesListProps {
  featuresList: Feature[];
}

const FeaturesList = ({ featuresList }: FeaturesListProps) => {
  return (
    <>
      <List sx={{ width: "100%", overflowY: "auto" }}>
        {featuresList.length === 0 && 
        <ListItem disablePadding={true}>
          <ListItemText primary={"No features found for this location. Be the first to add one!"} sx={{ textAlign: "center"}}/>
        </ListItem>
        }
        {featuresList.map((feature, index) => (
          <Box key={index}>
            <Grid2 container sx={{ width: "100%" }}>
              <Grid2 size={8}>
                <ListItem disablePadding={true}>
                  <ListItemText primary={feature.locationFeature} secondary={feature.notes || "No notes provided."} sx={{ '& .MuiListItemText-secondary': { mt: 0, ml: 2 } }}
                    primaryTypographyProps={{ sx: { fontWeight: "bold", fontSize: "0.9rem" } }}/>
                </ListItem>
              </Grid2>
              <Grid2 size={4}>
                <Box sx={{ width: "60%", height: "75%"}}>
                  <FeatureImage src={feature.imagePath || ""} alt={feature.locationFeature} />
                </Box>
              </Grid2>
            </Grid2>
            {index < featuresList.length - 1 ? <Divider variant="middle"/> : null}
          </Box>
        ))}
      </List>
    </>
  );
};

export default FeaturesList;
