import User from "./User";

enum UserVerificationEnum {
    VERIFIED = "Login Successful",
    NOT_FOUND = "Username Not Found",
    UNAUTHORIZED = "Incorrect Password",
    USERNAME_TAKEN = "Username Already Taken",
    GENERIC_ERROR = "An Error Occurred",
    INVALID_DATA = "Invalid Data"
}

class UserVerificationStatus {
    status: UserVerificationEnum;
    user: User;

    constructor(status: UserVerificationEnum, user: User) {
        this.status = status;
        this.user = user;
    }
}

export default UserVerificationStatus;
export {UserVerificationEnum};