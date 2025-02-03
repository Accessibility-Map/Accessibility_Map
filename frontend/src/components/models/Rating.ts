class Rating {
  public userID: number;
  public locationID: number;
  public userRating: number;

  constructor(userID: number, locationID: number, userRating: number) {
    this.userID = userID;
    this.locationID = locationID;
    this.userRating = userRating;
  }

  getRating(): number {
    return this.userRating;
  }
}

export default Rating;
