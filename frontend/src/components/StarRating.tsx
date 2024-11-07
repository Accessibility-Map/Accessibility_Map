import React, { useState } from 'react';

const StarRating = ({ locationID }: { locationID: number }) => {
  const [hover, setHover] = useState(0); // Hovered star
  const [currentRating, setCurrentRating] = useState(0); // Set default rating to 0
  const [unset, setUnset] = useState(false); // never been set in db flag

  // Function to update rating in the state
  const updateRating = (rating: number) => {
    if (rating > 5 || rating < 1) {
      return;
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
