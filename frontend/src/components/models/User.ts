class User {
    public password: string;
    public username: string;
    public sessionID?: string;
    public userID?: number;
  
    constructor(password: string, username: string, sessionID?: string, userID?: number) {
      this.password = password;  
      this.username = username;
      this.sessionID = sessionID;
      this.userID = userID;
    }
  
  }
  
  export default User;
  