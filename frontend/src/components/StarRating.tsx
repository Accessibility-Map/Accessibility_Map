import React, { useEffect, useState } from 'react';
import RatingService from './services/RatingService'
import './styles/StarRating.css';

interface StarRatingProps{
  locationID: number
}

const StarRating = ({ locationID }: StarRatingProps) => {
  const [hover, setHover] = useState(0); // Hovered star
  const [currentRating, setCurrentRating] = useState(0); // Set default rating to 0
  const [unset, setUnset] = useState(false); // never been set in db flag

  useEffect(() => {
    let currentRating = RatingService.getRating(1, locationID).then((rating) => {
      if (rating && rating.getRating() !== 0) {
        setCurrentRating(rating.getRating());
      }else{
        setUnset(true);
      }
    });
  });

  // Function to update rating in the state
  const updateRating = (rating: number) => {
    if (rating > 5 || rating < 1) {
      return;
    }

        // Update the current rating and backend API
      if (unset) {
        setCurrentRating(0);  // Properly update state with useState's function
        RatingService.createRating(1, locationID, rating);  // Backend call to create a rating
        setUnset(false);
      } else {
        setCurrentRating(rating);  // Properly update state with useState's function
        RatingService.setRating(1, locationID, rating);   // Backend call to set a rating
      }

    // Update the current rating state
    setCurrentRating(rating);
    setUnset(false);
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`fa fa-star ${value <= (hover || currentRating) ? "filled" : ""}`}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
          onClick={() => updateRating(value)}
          style={{ cursor: "pointer" }}
        ></span>
      ))}
    </div>
  );
};

export default StarRating;