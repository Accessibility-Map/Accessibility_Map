import featureService from './services/FeatureService';
import React from 'react';
import './styles/MapView.css';
import './styles/AddFeatureModal.css';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

interface AddFeatureButtonProps {
    locationID: number;
}

const AddFeatureButton: React.FC<AddFeatureButtonProps> = ({ locationID }) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [feature, setFeature] = React.useState('');

    const handleFeatureChange = (event: SelectChangeEvent<string>) => {
        setFeature(event.target.value as string);
    };

    console.log("Rendering AddFeatureButton with locationID:", locationID);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Form submitted with locationID:", locationID);

        if (isNaN(locationID)) {
            console.error("Error: locationID is NaN");
            alert("Invalid LocationID. Please refresh and try again.");
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const notes = formData.get('notes') as string;

        console.log("Form data - Feature:", feature, "Notes:", notes);

        try {
            const response = await featureService.createFeature(locationID, feature, notes);
            console.log("Feature created successfully:", response);
            handleClose();
        } catch (error) {
            console.error("Error creating feature:", error);
            alert("There was an error creating the feature. Please try again.");
        }
    };

    return (
        <>
<Button
  onClick={handleOpen}
  sx={{
    backgroundColor: '#3d85c6',
    color: 'white',
    padding: '4px 12px', // Smaller padding for a compact look
    fontSize: '0.80rem', // Slightly smaller font size
    borderRadius: '8px', // Softened corners
    textTransform: 'none', // Keep text as-is without uppercase transformation
    '&:hover': {
      backgroundColor: '#2c6da4', // Darker shade on hover for effect
    },
  }}
>
  Add Feature
</Button>            <Modal
                keepMounted
                open={open}
                onClose={handleClose}
                aria-labelledby="add-feature-modal-title"
                aria-describedby="add-feature-modal-description"
            >
                <Box sx={{ width: 400, bgcolor: 'background.paper', p: 4, m: 'auto', mt: '10%', borderRadius: 1 }}>
                    <Typography id="add-feature-modal-title" variant="h6" component="h2">
                        Add a New Feature
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="locationFeature" className="input-label">What is the feature?</label>
                        <Select
                            labelId="location-feature-select-label"
                            id="location-feature-select"
                            value={feature}
                            onChange={handleFeatureChange}
                            fullWidth
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Select a feature
                            </MenuItem>
                            <MenuItem value="Accessible Parking">Accessible Parking</MenuItem>
                            <MenuItem value="Ramp">Ramp</MenuItem>
                            <MenuItem value="Elevator">Elevator</MenuItem>
                            <MenuItem value="Accessible Bathroom">Accessible Bathroom</MenuItem>
                        </Select>
                        <br /><br />

                        <TextField
                            name="notes"
                            id="notes"
                            label="Add notes others may find helpful"
                            placeholder="Notes (optional)"
                            fullWidth
                            margin="normal"
                        />
                        <br /><br />

                        <Button type="submit" variant="contained" color="primary">Submit</Button>
                        <Button onClick={handleClose} variant="outlined" color="secondary" sx={{ ml: 2 }}>Cancel</Button>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

export default AddFeatureButton;
