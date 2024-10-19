export default class Rating {
    public UserID: number;
    public LocationID: number;
    public Rating: number;

    constructor(UserID: number, LocationID: number, Rating: number) {
        this.UserID = UserID;
        this.LocationID = LocationID;
        this.Rating = Rating;
    }

    public getRating(): number {
        return this.Rating;
    }
}