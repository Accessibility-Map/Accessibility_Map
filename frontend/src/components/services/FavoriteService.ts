import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "api/favorites/";

const FavoriteService = {
  getFavorites: async (userID: number) => {
    try {
      const response = await axios.get(`${API_URL}${userID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  },
  addFavorite: async (userID: number, locationID: number) => {
    try {
      await axios.post(`${API_URL}${userID}/${locationID}`);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  },
  removeFavorite: async (userID: number, locationID: number) => {
    try {
      await axios.delete(`${API_URL}${userID}/${locationID}`);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  },
};

export default FavoriteService;
