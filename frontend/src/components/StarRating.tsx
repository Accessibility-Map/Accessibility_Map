import React, { useEffect, useState } from 'react';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import RatingService from './services/RatingService';

interface StarRatingProps {
  locationID: number;
}

const StarRating = ({ locationID }: StarRatingProps) => {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [hover, setHover] = useState(-1); // Hovered star
  const [unset, setUnset] = useState(false); // Flag to check if the rating has never been set in the database

  // Fetch the initial rating from the backend
  useEffect(() => {
    RatingService.getRating(1, locationID).then((rating) => {
      if (rating && rating.getRating() !== 0) {
        setCurrentRating(rating.getRating());
      } else {
        setUnset(true); // Set flag if no rating is found
      }
    });
  }, [locationID]);

  // Function to update rating in the state and backend
  const updateRating = (newRating: number | null) => {
    if (!newRating || newRating < 1 || newRating > 5) return;

    if (unset) {
      RatingService.createRating(1, locationID, newRating); // Backend call to create a rating
      setUnset(false);
    } else {
      RatingService.setRating(1, locationID, newRating); // Backend call to update the rating
    }
    setCurrentRating(newRating); // Update the current rating state
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Rating
        name="hover-feedback"
        value={currentRating}
        precision={1}
        onChange={(event, newValue) => updateRating(newValue)}
        onChangeActive={(event, newHover) => setHover(newHover)}
        emptyIcon={<span style={{ opacity: 0.55 }} className="fa fa-star" />}
      />
      {currentRating !== null && (
        <Box sx={{ ml: 2 }}>{hover !== -1 ? hover : currentRating} Stars</Box>
      )}
    </Box>
  );
};

export default StarRating;
