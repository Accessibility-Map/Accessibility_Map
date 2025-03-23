import React, { useState, useEffect } from "react";
import LoginModal from "./LoginModal.tsx";
import NewAccountModal from "./NewAccountModal.tsx";
import User from "./models/User.ts";
import "./styles/AvatarButton.css"
import { UserVerificationEnum } from "./models/UserVerificationStatus.ts";
import UserService from "./services/UserService.ts";

import { Avatar, Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material"
import { stat } from "fs";
import { Heart } from "lucide-react"; // ✅ Import Heart icon
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
interface AvatarButtonProps {
    UpdateUser: (newUser: User) => void
}

const AvatarButton = ({ UpdateUser }: AvatarButtonProps) => {
    let [isActive, setIsActive] = useState(false);
    const [UserInitials, setUserInitials] = useState("");
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const handleChangeUserClose = () => setChangeModalOpen(false);
    const handleChangeUserOpen = () => setChangeModalOpen(true);
    const navigate = useNavigate();

    const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
    const handleCreateAccountModalClose = () => setCreateAccountModalOpen(false);
    const handleCreateAccountModalOpen = () => setCreateAccountModalOpen(true);

    useEffect(() => {
        const userToken = localStorage.getItem("user");

        if (userToken) {
            UserService.verifyJwt(userToken).then((status: any) => {
                if (status.status === UserVerificationEnum.VERIFIED) {
                    updateUserAndSetUserInitials(status.user);
                }
            })
        }
    }, []);

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
        UpdateUser(newUser);
    }

    const handleLogout = () => {
        localStorage.removeItem("user");
        updateUserAndSetUserInitials(new User("", "", "", 0));
        window.location.reload();
    }
    return (
        <div className="avatar-container">
            <Avatar classes={{ root: "avatar-button" }} onClick={handleClick}>{UserInitials}</Avatar>
            {isActive ? (
                <Box className="avatar-menu">
                    <List sx={{ width: "100%" }}>
                        <ListItem className="avatar-menu-item">
                            <ListItemText secondary="Change Profile" onClick={handleChangeUserOpen} />
                        </ListItem>
                        <ListItem className="avatar-menu-item">
                            <ListItemText secondary="Create Account" onClick={handleCreateAccountModalOpen} />
                        </ListItem>
                        <ListItem className="avatar-menu-item">
                            <ListItemText secondary="Logout" onClick={handleLogout} />
                        </ListItem>
                        <ListItem
                            className="fav-item"
                            onClick={() => { navigate("/favorites"); setIsActive(false); }}
                            style={{ cursor: "pointer" }}
                        >
                            <ListItemIcon sx={{ minWidth: '30px' }}>
                                <Heart size={18} color="red" fill="red" />
                            </ListItemIcon>
                            <ListItemText secondary="Favorites" />
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