import React, { useState, useEffect } from "react";
import LoginModal from "./LoginModal";
import NewAccountModal from "./NewAccountModal";
import User from "./models/User";
import "./styles/AvatarButton.css"

import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"

interface AvatarButtonProps {
    UpdateUser: (newUser: User) => void
}

const AvatarButton = ({UpdateUser}: AvatarButtonProps) => {
    let [isActive, setIsActive] = useState(false);
    const[UserInitials, setUserInitials] = useState("");
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const handleChangeUserClose = () => setChangeModalOpen(false);
    const handleChangeUserOpen = () => setChangeModalOpen(true);

    const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
    const handleCreateAccountModalClose = () => setCreateAccountModalOpen(false);
    const handleCreateAccountModalOpen = () => setCreateAccountModalOpen(true);

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        setIsActive(!isActive);
    };

    const updateUserAndSetUserInitials = (newUser: User) => {
        // Get user's initials
        let initials = "";
        if (newUser.username) {
            let names = newUser.username.split(" ");
            if (names.length > 1) {
                initials = names[0].charAt(0) + names[1].charAt(0);
            } else {
                initials = names[0].charAt(0);
            }
        }
        setUserInitials(initials);
        console.log("newUser:", newUser);
        console.log("UserInitials:", initials);
        console.log("SetNewUser in AvatarButton:", UpdateUser);
        UpdateUser(newUser);
    }

    return (
        <div className="avatar-container">
            <Avatar classes={{ root: "avatar-button" }} onClick={handleClick}>{UserInitials}</Avatar>
            {isActive ? (
                <Box className="avatar-menu">
                    <List sx={{ width: "100%" }}>
                        <ListItem className="avatar-menu-item">
                            <ListItemText secondary="Change Profile" onClick={handleChangeUserOpen}/>
                        </ListItem>
                        <ListItem className="avatar-menu-item">
                            <ListItemText secondary="Create Account" onClick={handleCreateAccountModalOpen}/>
                        </ListItem>
                    </List>
                </Box>
            ) : (
                null
            )}

            <LoginModal open={changeModalOpen} handleClose={handleChangeUserClose} onUpdateUser={updateUserAndSetUserInitials}></LoginModal>

            <NewAccountModal open={createAccountModalOpen} handleClose={handleCreateAccountModalClose} onUpdateUser={updateUserAndSetUserInitials}></NewAccountModal>
        </div>
    )
};

export default AvatarButton;