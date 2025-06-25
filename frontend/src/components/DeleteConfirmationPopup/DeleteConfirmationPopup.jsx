import React from 'react';
import './DeleteConfirmationPopup.css';

const DeleteConfirmationPopup = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="delete-popup-overlay">
            <div className="delete-popup-content">
                <div className="delete-popup-header">
                    <h3>Confirm Deletion</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="delete-popup-body">
                    <p>Are you sure you want to delete the SHACL shape <strong>'{itemName}'</strong>?</p>
                    <p>This action cannot be undone.</p>
                </div>
                <div className="delete-popup-footer">
                    <button onClick={onClose}>Cancel</button>
                    <button className="confirm-delete-button" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationPopup;
