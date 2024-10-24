import Feature from "../models/Feature.ts";

export default class FeatureService {
    public async getFeaturesByLocationID(locationID: number): Promise<Feature[]> {
        try {
            const response = await fetch(process.env.REACT_APP_API_URL + `api/features/${locationID}`);
            const data = await response.json();
            let features: Feature[] = [];
            data.forEach((element: Feature) => {
                // Column names from the backend model, but they get sent with lowercase names for some reason
                features.push(new Feature(element.id, element.locationID, element.locationFeature, element.notes));
            });
            return features;
        } catch (error) {
            console.error('Error fetching features:', error);
            return [];
        }
    }
}