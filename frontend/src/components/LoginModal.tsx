import React from "react";
import UserVerificationStatus from "./models/UserVerificationStatus";
import { UserVerificationEnum } from "./models/UserVerificationStatus";
import UserService from "./services/UserService";
import User from "./models/User";
import { set, useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

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
                console.log("Logged in user:", status.user);
                onUpdateUser(status.user);
                console.log("Logged in");
                handleClose();
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