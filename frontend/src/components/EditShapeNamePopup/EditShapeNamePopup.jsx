import React, {useState, useEffect, useContext} from "react";
import {Context} from "../../App.jsx";
import "./EditShapeNamePopup.css";

const EditShapeNamePopup = ({
                                isOpen,
                                onClose,
                                currentShapeName,
                                onSave
                            }) =>
{
    const [nsPrefix, setNsPrefix] = useState("");
    const [resource, setResource] = useState("");
    const {namespaceToShapes} = useContext(Context);

    useEffect(() =>
    {
        if (currentShapeName)
        {
            setNsPrefix(currentShapeName.nsPrefix || "");
            setResource(currentShapeName.resource || "");
        }
    }, [currentShapeName]);

    const handleSave = () =>
    {
        if (nsPrefix && resource)
        {
            onSave({nsPrefix, resource});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="shape-name-popup-overlay">
            <div className="shape-name-popup-content">
                <div className="shape-name-popup-header">
                    <h3>Edit Shape Name</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="shape-name-popup-body">
                    <div className="form-group">
                        <label>Namespace Prefix:</label>
                        <input
                            type="text"
                            value={nsPrefix}
                            onChange={(e) => setNsPrefix(e.target.value)}
                            placeholder="ex"
                        />
                    </div>
                    <div className="form-group">
                        <label>Resource Name:</label>
                        <input
                            type="text"
                            value={resource}
                            onChange={(e) => setResource(e.target.value)}
                            placeholder="PersonShape"
                        />
                    </div>
                </div>
                <div className="shape-name-popup-footer">
                    <button onClick={onClose}>Cancel</button>
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={!nsPrefix || !resource}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditShapeNamePopup;
