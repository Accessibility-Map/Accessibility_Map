import '../styles/StarRating.css';
import React, { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import Rating from '../models/Rating.ts';

const StarRating = (locationID: number) => {
  const [hover, setHover] = useState(0); // Hovered star
  const [currentRating, setCurrentRating] = useState(0); // Set default rating to 4
  const [loading, setLoading] = useState(true); // Loading state
  const [unset, setUnset] = useState(false); // never been set in db flag

  // Fetch rating from backend and update currentRating and stop loading
  useEffect(() => {
    const fetchRating = async () => {
      const fetchedRating = await getRating(1, locationID.locationID); // Replace with actual user ID and location ID
      if (fetchedRating && fetchedRating.getRating() !== 0) {
        setCurrentRating(fetchedRating.getRating()); // Update state with fetched rating
      } else {
        setCurrentRating(0); // If no rating is found or rating is undefined, default to 4
        setUnset(true);
      }
      setLoading(false);
    };
    fetchRating();
  }, []);
  



  // Function to update rating both in the state and the backend
  const updateRating = (rating: number) => {
    if (rating > 5 || rating < 1) {
      return;
    }

    // Update the current rating and backend API
    if (unset) {
      setCurrentRating(0);  // Properly update state with useState's function
      createRating(1, locationID.locationID, rating);  // Backend call to create a rating
      setUnset(false);
    } else {
      setCurrentRating(rating);  // Properly update state with useState's function
      setRating(1, locationID.locationID, rating);   // Backend call to set a rating
    }

    setCurrentRating(rating);
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

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

async function getRating(
  userID: number,
  locationID: number
): Promise<Rating | null> {
  try {
    const url =
      process.env.REACT_APP_API_URL + `api/ratings/${userID}/${locationID}`;
    const response = await axios.get(url);
    const ratingData = response.data;

    // Map backend response to frontend Rating class
    let fetchedRating = new Rating(
      ratingData.userID,
      ratingData.locationID,
      ratingData.userRating
    );

    return fetchedRating;
  } catch (error) {
    console.error("Error retrieving rating:", error);
    return null;
  }
}

async function setRating(userID: number, locationID: number, rating: number) {
  try {
    const url =
      process.env.REACT_APP_API_URL +
      `api/ratings/${userID}/${locationID}/${rating}`;
    await axios.put(url);
  } catch (error) {
    console.error("Error setting rating:", error);
  }
}

async function createRating(
  userID: number,
  locationID: number,
  rating: number
) {
  try {
    const url =
      process.env.REACT_APP_API_URL +
      `api/ratings/${userID}/${locationID}/${rating}`;
    await axios.post(url);
  } catch (error) {
    console.error("Error creating rating:", error);
  }
}

export default StarRating;
