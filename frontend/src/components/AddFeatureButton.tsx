import featureService from '../services/FeatureService.ts';
import React from 'react';
import '../styles/MapView.css';
import '../styles/AddFeatureModal.css';


const AddFeatureButton = (locationID: number) => {

    const handleClick = () => {
        let modal = document.getElementById("add-feature-modal") as HTMLDialogElement;
        modal?.showModal();
    }    

    const handleClose = () => {
        let modal = document.getElementById("add-feature-modal") as HTMLDialogElement;
        modal?.close();
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const feature: string = formData.get('locationFeature') as string;
        const notes: string = formData.get('notes') as string;
        console.log("Form submitted with values:", feature, notes);
        console.log("Location ID:", locationID.locationID);
        featureService.createFeature(locationID.locationID, feature, notes);
        handleClose();
    }

    return (
        <>
            <button onClick={handleClick} className='popup-button'>Add Feature</button>
            <dialog  className="modal" id="add-feature-modal"> 
                <form onSubmit={handleSubmit}>
                    <header>
                        <h1 className="modal-title">Add a new feature</h1>
                        <button onClick={handleClose} className="close-modal">X</button>
                    </header>

                    <label htmlFor="locationFeature" className="input-label">What is the feature?</label>
                    <br/>
                    <select required name="locationFeature" id="locationFeature" defaultValue={""}>
                        <option value="Accessible Parking">Accessible Parking</option>
                        <option value="Ramp">Ramp</option>
                        <option value="Elevator">Elevator</option>
                        <option value="Accessible Bathroom">Accessible Bathroom</option>
                    </select>
                    <br/>
                    <br/>
                    <label htmlFor="notes" className="input-label">Add notes others may find helpful</label>
                    <br/>
                    <input type="text" name="notes" id="notes" placeholder="Notes (optional)" />
                    <br/>
                    <br/>
                    <button type="submit">Submit</button>
                </form>
            </dialog>
        </>
    )
}

export default AddFeatureButton