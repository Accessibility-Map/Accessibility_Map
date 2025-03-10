// models/Feature.ts

class Feature {
    public id?: number;
    public locationID: number;
    public locationFeature: string;
    public notes: string;
    public imagePath?: string;

    constructor(locationID: number, locationFeature: string, notes: string, id?: number, imagePath?: string) {
        this.id = id;
        this.locationID = locationID;
        this.locationFeature = locationFeature;
        this.notes = notes;
        this.imagePath = imagePath;
    }
}

export default Feature;
