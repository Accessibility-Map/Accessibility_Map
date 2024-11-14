import React, { useState } from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface Feature {
  locationID: number;
  locationFeature: string;
  notes: string;
}

interface FeaturesListWithToggleProps {
  featuresList: Feature[];
}

const FeaturesListWithToggle: React.FC<FeaturesListWithToggleProps> = ({ featuresList }) => {
  const [showMore, setShowMore] = useState(false);
  const maxFeaturesToShow = 2; 

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const featuresToDisplay = showMore ? featuresList : featuresList.slice(0, maxFeaturesToShow);

  return (
    <>
      <List>
        {featuresToDisplay.map((feature, index) => (
          <>
          <ListItem key={index}  disablePadding={true}>
            <ListItemText primary={feature.locationFeature} secondary={feature.notes} sx={{ '& .MuiListItemText-secondary': { mt: 0, ml: 2 } }}
              primaryTypographyProps={{ sx: { fontWeight: "bold", fontSize: "0.9rem" } }}/>
          </ListItem>
          {index < featuresToDisplay.length - 1 ? <Divider variant="middle"/> : null}
          </>
        ))}
        {featuresList.length > maxFeaturesToShow && (
          <>
          
          <Button onClick={toggleShowMore}>
            <ExpandMore></ExpandMore>
          </Button>
          </>
        )}
      </List>
    </>
  );
};

export default FeaturesListWithToggle;
