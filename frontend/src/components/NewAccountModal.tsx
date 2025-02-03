import React from "react";
import UserService from "./services/UserService";
import User from "./models/User";
import UserVerificationStatus from "./models/UserVerificationStatus";
import { UserVerificationEnum } from "./models/UserVerificationStatus";
import { useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface NewAccountModalProps {
    open: boolean;
    handleClose: () => void;
    onUpdateUser: (newUser: User) => void;
}

const NewAccountModal = ({open, handleClose, onUpdateUser}: NewAccountModalProps) => {
    const { register, handleSubmit, setError, formState: { errors } } = useForm();

    const handleNewAccount = (data: any) => {
        const user = new User(data.Password, data.Username);
        
        // Check if the re-entered password equals the password
        if (data.Password !== data.ConfirmPassword){
            // Add an error to the form
            setError("ConfirmPassword", { message: "Passwords do not match" });
            return;
        }
    
        UserService.createUser(user).then((status: UserVerificationStatus) => {
            if (status.status === UserVerificationEnum.VERIFIED){
                onUpdateUser(status.user);
                localStorage.setItem("user", status.user.sessionID as string);

                // Clear the form
                let form: any = document.getElementById("new-user-form");
                form.reset();
                handleClose();
            }
            else if (status.status === UserVerificationEnum.USERNAME_TAKEN){
                setError("Username", { message: "Username already taken" });
            }
            else{
                alert("There was an error creating the user. Please try again.");
            }

            
        });


    }

    const logErrors = () => {
        console.log(errors);
    }

    return (
            <Modal
                keepMounted
                open={open}
                onClose={handleClose}
                aria-labelledby="new-user-modal-title"
                aria-describedby="new-user-modal-description"
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
                <Typography id="new-user-modal-title" variant="h6" component="h2">
                    Create a New Account
                </Typography>
                <br/>
                <form id="new-user-form" onSubmit={handleSubmit(handleNewAccount)}>
                    <label htmlFor="UserID" className="input-label">
                        Username:
                    </label>
                    <br/>
                    <TextField
                        id="Username"
                        type="text"
                        error={!!errors.Username}
                        helperText={errors.Username?.message?.toString()}
                        {...register("Username", { required: true })}
                    ></TextField>
                    <br />
                    <br />

                    <label htmlFor="Password" className="input-label">
                        Password:
                    </label>
                    <br/>
                    <TextField
                        id="Password"
                        type="password"
                        error={!!errors.Password}
                        helperText={errors.Password?.message?.toString()}
                        {...register("Password", { required: {
                            value: true,
                            message: "Password is required"
                        }, 
                        minLength: {
                            value: 12,
                            message: "Password must be at least 12 characters long"
                        },
                        pattern: {
                            value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])(?:.{12,64})$/,
                            message: "Password missing required characters."
                        },
                        maxLength: {
                            value: 64,
                            message: "Password must be at most 64 characters long"
                        }
                        })}
                    ></TextField>
                    <br />
                    <Box>
                        <Typography variant="body1" sx={{ fontSize: "0.8rem"}}>
                            Password must be:
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontSize: "0.8rem" }}>
                            12-64 characters long<br/>
                            and contain at least one:
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 4, fontSize: "0.8rem", lineHeight: 1.2 }}>
                            - lowercase letter<br/>
                            - uppercase letter<br/>
                            - number<br/>
                            - special character
                        </Typography>
                    </Box>
                    <br />
                    <label htmlFor="ConfirmPassword" className="input-label">
                        Re-enter Password:
                    </label>
                    <br/>
                    <TextField
                        id="ConfirmPassword"
                        type="password"
                        error={!!errors.ConfirmPassword}
                        helperText={errors.ConfirmPassword?.message?.toString()}
                        {...register("ConfirmPassword", { required: true})}
                    ></TextField>
                    <br />
                    <br/>

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
};

export default NewAccountModal;