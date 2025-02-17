import axios from "axios";
import CommentDTO from "../models/Comment";

export default class CommentService {
    static async uploadComment(comment: CommentDTO, jwtToken: string) {
        const url = `${process.env.REACT_APP_API_URL}api/comments`;
        
        const response = await axios.post(url, comment, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        if(response.status == 401) {
            return null;
        }
        return response.data;
    }

    static async updateComment(comment: CommentDTO) {
        const url = `${process.env.REACT_APP_API_URL}api/comments`;
        const jwtToken = localStorage.getItem("user");
        const response = await axios.put(url, comment, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        })
        return response.data;
    }

    static async deleteComment(comment: CommentDTO) {
        const url = `${process.env.REACT_APP_API_URL}api/comments`;
        const jwtToken = localStorage.getItem("user");
        const response = await axios.delete(url, { data: comment, headers: { Authorization: `Bearer ${jwtToken}` } });
        return response.data;
    }

    static async getCommentsByLocationWithReplies(locationID: number) {
        const url = `${process.env.REACT_APP_API_URL}api/comments/location/${locationID}/with-replies`;
        const response = await axios.get(url);
        return response.data;
    }

    static async getCommentsByUserAndLocationWithReplies(userID: number, locationID: number) {
        const url = `${process.env.REACT_APP_API_URL}api/comments/location/${locationID}/user/${userID}/with-replies`;
        const response = await axios.get(url);
        return response.data;
    }
}