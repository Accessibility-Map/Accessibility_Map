export default class Feature {
    public id?: number;
    public locationID: number;
    public LocationFeature: string;
    public Notes: string;

    constructor(LocationID: number, Feature: string, Notes: string, id?: number) {
        this.id = id;
        this.locationID = LocationID;
        this.LocationFeature = Feature;
        this.Notes = Notes;
    }
}