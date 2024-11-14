import Feature from "../models/Feature";
import axios from 'axios';

export default class FeatureService {
    public static async getFeaturesByLocationID(locationID: number): Promise<Feature[]> {
        try {
            const url = `${process.env.REACT_APP_API_URL}api/features/location/${locationID}`;
            const response = await axios.get<Feature[]>(url.replace(/([^:]\/)\/+/g, "$1"));
            const data = response.data;

            const features: Feature[] = data.map(element => 
                new Feature(element.locationID ?? element.locationID, element.locationFeature ?? element.locationFeature, element.notes, element?.id)
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
            
            
            

            console.log("Sending payload to server:", payload);

            const response = await axios.post(url.replace(/([^:]\/)\/+/g, "$1"), payload);
            console.log('Feature created successfully:', response.data);
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
    
}
