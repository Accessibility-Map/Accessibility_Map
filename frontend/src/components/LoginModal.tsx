import React from "react";
import UserVerificationStatus from "./models/UserVerificationStatus.ts";
import { UserVerificationEnum } from "./models/UserVerificationStatus.ts";
import UserService from "./services/UserService.ts";
import User from "./models/User.ts";
import { set, useForm } from "react-hook-form";

import {Box, Modal, TextField, Button, Typography } from "@mui/material";

interface LoginModalProps {
    open: boolean;
    handleClose: any;
    onUpdateUser: (newUser: User) => void;
}

const LoginModal = ({open, handleClose, onUpdateUser}: LoginModalProps) => {
    const { register, handleSubmit, setError, formState: { errors } } = useForm();

    const handleSubmitNewUserID = (data: any) => {
        const user = new User(data.Password, data.Username);

        UserService.verifyUser(user).then((status: UserVerificationStatus) => {
            if (status.status === UserVerificationEnum.VERIFIED) {
                onUpdateUser(status.user);
                
                localStorage.setItem("user", status.user.sessionID as string);

                handleClose();

                // Refresh the page
                window.location.reload();
            }
            else if (status.status === UserVerificationEnum.NOT_FOUND) {
                setError("Username", { message: "Username not found" });
            }
            else if (status.status === UserVerificationEnum.UNAUTHORIZED) {
                setError("Password", { message: "Incorrect password" });
            }
        });
    }

    return (
    <Modal
        keepMounted
        open={open}
        onClose={handleClose}
        aria-labelledby="change-user-modal-title"
        aria-describedby="change-user-modal-description"
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
        <Typography id="change-user-modal-title" variant="h6" component="h2">
            Login
        </Typography>
        <br/>
        <form onSubmit={handleSubmit(handleSubmitNewUserID)}>
            <label htmlFor="Username" className="input-label">
                What is your Username?
            </label>
            <br/>
            <TextField
                id="Username"
                type="text"
                error={!!errors.Username}
                helperText={errors.Username?.message?.toString()}
                {...register("Username", {
                    required: true,
                })}
            ></TextField>
            <br/>
            <label htmlFor="Password" className="input-label">
            What is your Password?
            </label>
            <br/>
            <TextField
                id="Password"
                type="password"
                error={!!errors.Password}
                helperText={errors.Password?.message?.toString()}
                {...register("Password", {
                required: true,
                })}
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
    );
}

export default LoginModal;