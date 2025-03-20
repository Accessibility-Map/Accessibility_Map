
import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}api/favorites/`;


const getFavoritesByLocation = async (locationID: number) => {
  if (!locationID) {
    console.error("Error: locationID is undefined in FavoriteService");
    return [];
  }

  try {
    console.log(`Fetching favorites for locationID: ${locationID}`);
    const response = await axios.get(`${API_URL}location/${locationID}`);
    console.log("API Response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};


const addFavorite = async (locationID: number) => {
  if (!locationID) {
    console.error("Error: locationID is missing in addFavorite");
    return;
  }
  try {
    await axios.post(`${API_URL}location/${locationID}`);
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
};

const removeFavorite = async (locationID: number) => {
  if (!locationID) {
    console.error("Error: locationID is missing in removeFavorite");
    return;
  }
  try {
    await axios.delete(`${API_URL}location/${locationID}`);
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
};

export default { getFavoritesByLocation, addFavorite, removeFavorite };
