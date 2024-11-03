import { create } from "domain";
import Feature from "../models/Feature.ts";
import axios from 'axios';

export default class FeatureService {
    public static async getFeaturesByLocationID(locationID: number): Promise<Feature[]> {
        try {
            const url = process.env.REACT_APP_API_URL + `api/features/location/${locationID}`;
            const response = await axios.get<Feature[]>(url);
            const data = await response.data;
            let features: Feature[] = [];
            data.forEach((element: Feature) => {
                // Column names from the backend model, but they get sent with lowercase names for some reason
                features.push(new Feature(element.locationID, element.locationFeature, element.notes, element?.id));
            });
            return features;
        } catch (error) {
            console.error('Error fetching features:', error);
            return [];
        }
    }

    public static async createFeature(locationID: number, locationFeature: string, notes: string) {
        
        try {
            const url = process.env.REACT_APP_API_URL + 'api/features';
            await axios.post(url, {locationID, locationFeature, notes});
        } catch (error) {
            console.error('Error creating feature:', error);
        }
    }
}