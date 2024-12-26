import axios from 'axios';

export default class PredictionService {
  public static async predictRating(userID: number, locationID: number): Promise<number | null> {
    try {
      const url = `${process.env.REACT_APP_API_URL}api/ratings/predict/${userID}/${locationID}`;
      const response = await axios.get(url);
      return response.data.predictedRating;
    } catch (error) {
      console.error("Error predicting rating:", error);
      return null;
    }
  }
}