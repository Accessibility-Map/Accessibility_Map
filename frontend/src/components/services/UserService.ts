import User from "../models/User";
import UserVerificationStatus from "../models/UserVerificationStatus";
import { UserVerificationEnum } from "../models/UserVerificationStatus";
import axios from "axios";

export default class UserService {
    static async verifyUser(user: User): Promise<UserVerificationStatus> {
        // Endpoint: HttpPost("verify")
        try {
            const url = process.env.REACT_APP_API_URL + "api/users/verify";
            const response = await axios.post(url, user);

            if (response.status === 200) {
                return new UserVerificationStatus(UserVerificationEnum.VERIFIED, response.data);
            }
        }
        catch(error: any) {
            switch(error.response.status) {
                case 404:
                    return new UserVerificationStatus(UserVerificationEnum.NOT_FOUND, new User("", ""));
                case 401:
                    return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
            }
        }

        return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
    }

    static async createUser(user: User): Promise<UserVerificationStatus> {
        // Endpoint: HttpPost()
        try{
            const url = process.env.REACT_APP_API_URL + "api/users";
            const response = await axios.post(url, user);

            if (response.status === 200) {
                return new UserVerificationStatus(UserVerificationEnum.VERIFIED, response.data);
            }
        }
        catch(error: any) {
            switch(error.response.status) {
                case 400:
                    return new UserVerificationStatus(UserVerificationEnum.INVALID_DATA, new User("", ""));
                case 409:
                    return new UserVerificationStatus(UserVerificationEnum.USERNAME_TAKEN, new User("", ""));
            }
        }

        return new UserVerificationStatus(UserVerificationEnum.GENERIC_ERROR, new User("", ""));
    }

    static async verifySession(user: User): Promise<UserVerificationStatus> {
        // Endpoint: HttpPost("verify-session")
        try {
            const url = process.env.REACT_APP_API_URL + "api/users/verify-session";
            const response = await axios.post(url, user);
            if (response.status === 200) {
                return new UserVerificationStatus(UserVerificationEnum.VERIFIED, response.data);
            }
        }
        catch(error: any) {
            switch(error.response.status) {
                case 404:
                    return new UserVerificationStatus(UserVerificationEnum.NOT_FOUND, new User("", ""));
                case 401:
                    return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
            }
        }
        return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
    }

    static async verifyJwt(token: string): Promise<UserVerificationStatus> {
        // Endpoint: HttpPost("verify-jwt")
        try {
            const url = process.env.REACT_APP_API_URL + "api/users/verify-jwt";
            const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.status === 200) {
                return new UserVerificationStatus(UserVerificationEnum.VERIFIED, response.data);
            }
        }
        catch(error: any) {
            switch(error.response.status) {
                case 404:
                    return new UserVerificationStatus(UserVerificationEnum.NOT_FOUND, new User("", ""));
                default:
                    return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
            }
        }
        return new UserVerificationStatus(UserVerificationEnum.UNAUTHORIZED, new User("", ""));
    }
}