import Feature from "../models/Feature";
import axios from 'axios';

export default class FeatureService {
    public static async getFeaturesByLocationID(locationID: number): Promise<Feature[]> {
        try {
            const url = `${process.env.REACT_APP_API_URL}api/features/location/${locationID}`;
            const response = await axios.get<Feature[]>(url.replace(/([^:]\/)\/+/g, "$1"));
            const data = response.data;

            const features: Feature[] = data.map(element =>
                new Feature(element.locationID, element.locationFeature, element.notes, element.id)
            );
            
            
            return features;
        } catch (error) {
            console.error('Error fetching features:', error);
            return [];
        }
    }

    public static async createFeature(locationID: number, locationFeature: string, notes: string) {
        try {
            const url = `${process.env.REACT_APP_API_URL}api/features`;
            
            const payload = {
                LocationID: Number(locationID),
                LocationFeature: locationFeature,
                Notes: notes.trim() === '' ? '' : notes  // Send an empty string if Notes is empty
            };
            
            const response = await axios.post(url.replace(/([^:]\/)\/+/g, "$1"), payload);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Error response from server:', error.response.data); // Log server error response
            } else {
                console.error('Error creating feature:', error);
            }
            throw error;
        }


    }
             // Add the getFeatureCount method
    public static async getFeatureCount(locationID: number): Promise<number> {
        try {
        const url = `${process.env.REACT_APP_API_URL}api/features/count/${locationID}`;
        const response = await axios.get<{ featureCount: number }>(url.replace(/([^:]\/)\/+/g, "$1"));
        return response.data.featureCount; // Assuming the API response includes a field "featureCount"
        } catch (error) {
        console.error(`Error fetching feature count for locationID ${locationID}:`, error);
        return 0; 
        }
    }

    public static async uploadFeatureImage(featureID: number, imageFile: File) {
        try {
            const formData = new FormData();
            formData.append('featureID', featureID.toString());
            formData.append('image', imageFile);
    
            const url = `${process.env.REACT_APP_API_URL}api/features/${featureID}/upload-image`;
            const response = await axios.put(url.replace(/([^:]\/)\/+/g, "$1"), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            return response.data;
        } catch (error) {
            console.error('Error uploading feature image:', error);
            throw error;
        }
    }
}