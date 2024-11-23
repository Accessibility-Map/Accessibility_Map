import React, { useState, useEffect } from "react";
import "./styles/AvatarButton.css"

import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

const AvatarButton = (setNewUserID: any) => {
    let [isActive, setIsActive] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsActive(!isActive);
    };

    const handleChangeProfile = () => {
        setOpen(true);
    }

    const handleSubmitNewUserID = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);

        let newUserID: number = parseInt(formData.get("UserID") as string);

        if (isNaN(newUserID)) {
            console.error("Error: newUserID is NaN");
            return;
        }
        setNewUserID.setNewUserID(newUserID);
    }

    return (
        <div className="avatar-container">
            <Avatar classes={{ root: "avatar-button" }} onClick={handleClick}></Avatar>
            {isActive ? (
                <Box className="avatar-menu">
                    <List sx={{ width: "100%" }}>
                        <ListItem>
                            <ListItemText secondary="Change Profile" onClick={handleChangeProfile}/>
                        </ListItem>
                    </List>
                </Box>
            ) : (
                null
            )}

            <Modal
                keepMounted
                open={open}
                onClose={handleClose}
                aria-labelledby="add-feature-modal-title"
                aria-describedby="add-feature-modal-description"
            >
                <Box
                sx={{
                    width: 400,
                    bgcolor: "background.paper",
                    p: 4,
                    m: "auto",
                    mt: "10%",
                    borderRadius: 1,
                }}
                >
                <Typography id="add-feature-modal-title" variant="h6" component="h2">
                    Change Your UserID (Soon to be a Login)
                </Typography>
                <br/>
                <form onSubmit={handleSubmitNewUserID}>
                    <label htmlFor="UserID" className="input-label">
                    What is the new UserID?
                    </label>
                    <br/>
                    <TextField
                        name="UserID"
                        id="UserID"
                        type="number"
                    ></TextField>
                    <br />
                    <br />

                    <Button type="submit" variant="contained" color="primary">
                    Submit
                    </Button>
                    <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="secondary"
                    sx={{ ml: 2 }}
                    >
                    Cancel
                    </Button>
                </form>
                </Box>
            </Modal>
        </div>
    )
};

export default AvatarButton;