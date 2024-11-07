import featureService from './services/FeatureService';
import React from 'react';
import './styles/MapView.css';
import './styles/AddFeatureModal.css';

interface AddFeatureButtonProps {
    locationID: number;
}

const AddFeatureButton: React.FC<AddFeatureButtonProps> = ({ locationID }) => {
    console.log("Rendering AddFeatureButton with locationID:", locationID);

    const handleClick = () => {
        console.log("Opening modal for adding feature...");
        let modal = document.getElementById("add-feature-modal") as HTMLDialogElement;
        modal?.showModal();
    }    

    const handleClose = () => {
        console.log("Closing modal for adding feature...");
        let modal = document.getElementById("add-feature-modal") as HTMLDialogElement;
        modal?.close();
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        // event.preventDefault();
        console.log("Form submitted with locationID:", locationID);

        if (isNaN(locationID)) {
            console.error("Error: locationID is NaN");
            alert("Invalid LocationID. Please refresh and try again.");
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const feature = formData.get('locationFeature') as string;
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
    }

    return (
        <>
            <button onClick={handleClick} className='popup-button'>Add Feature</button>
            <dialog className="modal" id="add-feature-modal"> 
                <form onSubmit={handleSubmit}>
                    <header>
                        <h1 className="modal-title">Add a new feature</h1>
                        <button onClick={handleClose} className="close-modal">X</button>
                    </header>

                    <label htmlFor="locationFeature" className="input-label">What is the feature?</label>
                    <br/>
                    <select required name="locationFeature" id="locationFeature" defaultValue="">
                        <option value="" disabled>Select a feature</option>
                        <option value="Accessible Parking">Accessible Parking</option>
                        <option value="Ramp">Ramp</option>
                        <option value="Elevator">Elevator</option>
                        <option value="Accessible Bathroom">Accessible Bathroom</option>
                    </select>
                    <br/><br/>
                    
                    <label htmlFor="notes" className="input-label">Add notes others may find helpful</label>
                    <br/>
                    <input type="text" name="notes" id="notes" placeholder="Notes (optional)" />
                    <br/><br/>

                    <button type="submit">Submit</button>
                </form>
            </dialog>
        </>
    );
}

export default AddFeatureButton;
