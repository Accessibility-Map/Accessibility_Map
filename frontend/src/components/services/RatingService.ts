import Rating from "../models/Rating";
import axios from 'axios';

export default class RatingService {
  public static async getRating(userID: number, locationID: number): Promise<Rating | null> {
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
  
  public static async getAverageRating(locationID: number): Promise<number | null> {
    try {
      const url = `${process.env.REACT_APP_API_URL}api/ratings/average/${locationID}`;
      const response = await axios.get(url);
      return response.data.averageRating; 
    } catch (error) {
      console.error("Error fetching average rating:", error);
      return null;
    }
  }
  
  public static async setRating(userID: number, locationID: number, rating: number) {
    try {
      const url = `${process.env.REACT_APP_API_URL}api/ratings/${userID}/${locationID}/${rating}`;
      await axios.put(url);
    } catch (error) {
      console.error("Error setting rating:", error);
    }
  }
  
  public static async createRating(
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
}