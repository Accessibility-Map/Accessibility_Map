import { useEffect, useState } from "react";
import CommentService from "./services/CommentService";
import { TextField, Box, Grid2, Avatar, Button, Alert, Divider } from "@mui/material";
import CommentDTO from "./models/Comment";
import { set } from "react-hook-form";
import User from "./models/User";
import CommentBlock from "./CommentBlock";

interface CommentListProps {
    locationID: number;
    userID: number;
    user: User;
}

const CommentList = ({ locationID, userID, user }: CommentListProps) => {
    const [userComments, setUserComments] = useState<CommentDTO[]>([]);
    const [comments, setComments] = useState<CommentDTO[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loginAlert, setLoginAlert] = useState<boolean>(false);

    const pushToComment = (comment: CommentDTO) => {
        comments.push(comment);
    }

    useEffect(() => {
        fetchComments();
    }, [locationID, userID]);

    const fetchComments = () => {
        CommentService.getCommentsByLocationWithReplies(locationID).then(comments => {
            if(comments == null) return;

            let userComments: CommentDTO[] = comments.filter((comment: CommentDTO) => comment.userID == userID);
            let nonUserComments = comments.filter((comment: CommentDTO) => comment.userID != userID);

            setUserComments(userComments);
            setComments(nonUserComments);
        })
    }

    const handlePostComment = () => {
        const userToken = localStorage.getItem("user");
        if(!userToken) {
            setLoginAlert(true);
        }else{
            setLoginAlert(false);
            const comment = new CommentDTO(0, userID, locationID, newComment);
            CommentService.uploadComment(comment, userToken).then(comment => {
                if(!!comment) {
                    pushToComment(comment);
                    setNewComment("");
                    fetchComments();
                }else{
                    setLoginAlert(true);
                }
            })
        }
    }

    const handleClearComment = () => {
        setNewComment("");
    }

    return <Box sx={{ width: '100%', marginTop: '18px', overflowY: 'auto', maxHeight: '400px', minHeight: '150px' }}>
        <Alert severity="error" sx={{ display: loginAlert ? "flex" : "none"}} onClose={() => setLoginAlert(false)}>You must be logged in to post a comment.</Alert>
        <TextField label="Add a comment" variant="outlined" multiline id="comment" fullWidth onChange={(e) => setNewComment(e.target.value)} value={newComment} sx={{ marginTop: "10px"}}/>
        
        <Button variant="outlined" size="small" sx={{ float: "right", marginTop: "10px"}} onClick={handlePostComment}>Post</Button>
        <Button variant="outlined" color="error" size="small" sx={{marginTop: "10px", marginRight: "10px"}} onClick={handleClearComment}>Clear</Button>

        <Divider variant="middle" sx={{ marginTop: "10px", marginBottom: "10px"}}></Divider>
        
        {userComments.map((comment, index) => <><CommentBlock comment={comment} userID={userID} locationID={locationID} fetchComments={fetchComments} key={index}/> <Divider variant="middle" sx={{ marginTop: "10px", marginBottom: "10px"}}></Divider></>)}

        

        {comments.map((comment, index) => <><CommentBlock comment={comment} userID={userID} locationID={locationID} fetchComments={fetchComments} key={index}/> {index < comments.length - 1 && <Divider variant="middle" sx={{ marginTop: "10px", marginBottom: "10px"}}></Divider>}</>)}
    </Box>;
}

export default CommentList