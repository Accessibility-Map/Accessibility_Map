class User {
    public password: string;
    public username: string;
    public settings?: string;
    public userID?: number;
  
    constructor(password: string, username: string, settings?: string, userID?: number) {
      this.password = password;  
      this.username = username;
      this.settings = settings;
      this.userID = userID;
    }
  
  }
  
  export default User;
  