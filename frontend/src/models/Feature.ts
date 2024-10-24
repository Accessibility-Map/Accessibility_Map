export default class Feature {
    public id?: number;
    public locationID: number;
    public locationFeature: string;
    public notes: string;

    constructor(LocationID: number, Feature: string, Notes: string, id?: number) {
        this.id = id;
        this.locationID = LocationID;
        this.locationFeature = Feature;
        this.notes = Notes;
    }
}