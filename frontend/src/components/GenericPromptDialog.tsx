import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface GenericPromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    promptingAction: string;
    title: string;
}

const GenericPromptDialog = ({isOpen, onClose, promptingAction, title}: GenericPromptDialogProps) => {
    
  return (
    <Dialog
        open={isOpen}
        onClose={onClose}
        >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {promptingAction}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button color="error" variant="contained" onClick={onClose} sx={{ marginRight: "10px", marginBottom: "10px" }}>Close</Button>
        </DialogActions>
    </Dialog>
  );
}

export default GenericPromptDialog