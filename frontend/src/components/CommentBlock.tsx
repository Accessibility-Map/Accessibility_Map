import React from "react";
import { useState } from "react";
import { Box, Grid2, Avatar, List, ListItem, ListItemText, Collapse, Button, Typography, TextField, Divider } from "@mui/material";
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Grid } from "semantic-ui-react";
import CommentDTO from "./models/Comment";
import "./styles/Comments.css"
import CommentService from "./services/CommentService";

interface CommentProps {
    comment: CommentDTO,
    userID: number,
    locationID: number,
    fetchComments: () => void
}

const CommentBlock = ({comment, userID, locationID, fetchComments}: CommentProps) => {
    const [open, setOpen] = useState(false);
    const [replying, setReplying] = useState(false);
    const [reply, setReply] = useState("");
    const [loginAlert, setLoginAlert] = useState<boolean>(false);

    const handleOpen = (event: React.MouseEvent) => {
        event.stopPropagation();
        setOpen(!open);
    };

    const getUserInitials = (name: string) => {
        // Get user's initials
        if (!name) return "";
        let names = name.split(" ");
        if (names.length > 1) {
            return names[0].charAt(0) + names[1].charAt(0);
        } else {
            return names[0].charAt(0);
        }
    }

    const handlePostReply = () => {
        const userToken = localStorage.getItem("user");
        if(!userToken) {
            setLoginAlert(true);
        }else{
            setLoginAlert(false);
            const replyDTO = new CommentDTO(0, userID, locationID, reply, comment?.commentID);
            CommentService.uploadComment(replyDTO, userToken).then(replyRes => {
                if(!!replyRes) {
                    setReply("");
                    setReplying(false);
                    fetchComments();
                }else{
                    setLoginAlert(true);
                }
            })
        }
    }

    const handleCancelReply = () => {
        setReply("");
        setReplying(false);
    }

    return (
        <>
        {!!comment ? (
            <Box>
                <List>
                    <ListItem sx={{paddingRight: "0px"}}>
                        <Grid2 container spacing={1} sx={{ width: "100%"}}>
                            <Grid2 size={1} sx={{display: "flex", justifyContent: "center"}}>
                                <Avatar>{getUserInitials(comment?.username ?? "")}</Avatar>
                            </Grid2>

                            <Grid2 size={11} sx={{display: "flex", height: "42px"}}>
                                <Typography sx={{alignContent: "center"}} className="username" variant="body2">{comment?.username}</Typography>
                            </Grid2>

                            <Grid2 size={1}>

                            </Grid2>

                            <Grid2 size={11} sx={{display: "flex"}}>
                                <Typography sx={{alignContent: "center", overflowWrap: "anywhere", marginLeft: "10px"}} className="comment">{comment?.userComment}</Typography>
                            </Grid2>

                            <Grid2 size={6}>
                                { comment?.replies && <Button variant="text" sx={{float: "left"}} onClick={handleOpen}>View {comment?.replies?.length} Replies {open ? <ExpandLess /> : <ExpandMore />}</Button>}
                            </Grid2>
                            <Grid2 size={6}>
                                <Button variant="text" sx={{float: "right", display: replying ? "none" : "flex"}} onClick={() => setReplying(true)}>Reply</Button>
                            </Grid2>

                            <TextField label="Add a reply" variant="outlined" multiline size="small" id="reply" fullWidth onChange={(e) => setReply(e.target.value)} value={reply} sx={{display: replying ? "inline-flex" : "none"}}/>
                            
                            <Button variant="outlined" color="error" size="small" sx={{ marginRight: "10px", display: replying ? "inline-flex" : "none"}} onClick={handleCancelReply}>Cancel</Button>
                            <Button variant="outlined" size="small" sx={{ marginLeft: "auto", display: replying ? "inline-flex" : "none"}} onClick={handlePostReply}>Post</Button>

                            <Grid2 size={12}>
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    <Divider variant="middle" sx={{ marginTop: "10px", marginBottom: "10px"}}></Divider>
                                    <List component="div" disablePadding>
                                        {comment?.replies?.map((reply, index) => (<>
                                            <CommentBlock userID={userID} locationID={locationID} fetchComments={fetchComments} key={index} comment={reply} />
                                            {Array.isArray(comment.replies) && index < comment.replies.length - 1 && <Divider variant="middle" sx={{ marginTop: "10px", marginBottom: "10px"}}></Divider>}
                                            </>))}
                                    </List>
                                </Collapse>
                            </Grid2>
                        </Grid2>
                    </ListItem>
                </List>
            </Box>
            )
            : 
            (
            <Box>
                <Typography sx={{textAlign: "center"}}>No Comments Have Been Left For This Location.</Typography>
            </Box>
            )}
        </>
    )
}

export default CommentBlock