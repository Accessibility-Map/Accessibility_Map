// models/Feature.ts

class Feature {
    public id?: number;
    public locationID: number;
    public locationFeature: string;
    public notes: string;

    constructor(locationID: number, locationFeature: string, notes: string, id?: number) {
        this.id = id;
        this.locationID = locationID;
        this.locationFeature = locationFeature;
        this.notes = notes;
    }
}

export default Feature;
