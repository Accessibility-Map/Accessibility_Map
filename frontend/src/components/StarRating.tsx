import '../styles/StarRating.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Rating from '../models/Rating.ts'


let currentRating : number = 0; // Selected rating

 const StarRating = () => {
    
    const [hover, setHover] = useState(0); // Hovered star
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
      const fetchRating = async () => {
        const fetchedRating = await getRating(1, 7); // Replace with actual user ID and location ID
        if (fetchedRating) {
          currentRating = fetchedRating.getRating();
        }else {
          currentRating = 0;
        }
        setLoading(false);
      };
      fetchRating();
    }, []);
  

    if (!loading) {
      return (
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={`fa fa-star ${value <= (hover || currentRating) ? 'filled' : ''}`}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => updateRating(value)}
              style={{ cursor: 'pointer' }}
            >
            </span>
          ))}
        </div>
      );
    }
  };

  async function getRating (userID: number, locationID: number): Promise<Rating | null> {
    try {
      const url = `http://localhost:5232/api/ratings/${userID}/${locationID}`;
      const response = await axios.get<Rating>(url);
      const ratingData = response.data;
      console.log(ratingData);
      let fetchedRating = new Rating(ratingData.userID, ratingData.locationID, ratingData.userRating);
      console.log(fetchedRating);
      return fetchedRating
    } catch (error) {
      console.error('Error retrieving rating:', error);
      return null;
    }
  };

  async function setRating(userID: number, locationID: number, rating: number) {
    try {
      const url = `http://localhost:5232/api/ratings/${userID}/${locationID}/${rating}`;
      await axios.put(url);
    } catch (error) {
      console.error('Error setting rating:', error);
    }
  }

  async function createRating(userID: number, locationID: number, rating: number) {
    try {
      const url = `http://localhost:5232/api/ratings/${userID}/${locationID}/${rating}`;
      await axios.post(url);
    } catch (error) {
      console.error('Error creating rating:', error);
    }
  }

  function updateRating(rating: number) {
    if(rating > 5 || rating < 1) {
      return;
    }

    if(rating === 0) {
      currentRating = rating;
      createRating(1, 7, rating);
    }else{
      currentRating = rating;
      setRating(1, 7, rating);
    }
  }
  
  export default StarRating;
