class Rating {
  public UserID: number;
  public LocationID: number;
  public UserRating: number;

  constructor(userID: number, locationID: number, userRating: number) {
    this.UserID = userID;
    this.LocationID = locationID;
    this.UserRating = userRating;
  }

  getRating(): number {
    return this.UserRating;
  }
}

export default Rating;
