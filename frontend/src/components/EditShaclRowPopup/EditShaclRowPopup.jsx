import React, {useState, useEffect, useContext} from "react";
import {Context} from "../../App.jsx";
import ShaclSelector from "../AddPredicatePopup/ShaclSelector.jsx";
import "./EditShaclRowPopup.css"

const EditShaclRowPopup = ({
                               isOpen,
                               onClose,
                               propertyNs,
                               property,
                               objectValue,
                               objectType,
                               onSave,
                               onDelete
                           }) =>
{

    const [value, setValue] = useState("");
    const [nsPrefix, setNsPrefix] = useState("");
    const [resource, setResource] = useState("");
    const {namespaceToPredicates, namespaceToShapes} = useContext(Context);

    useEffect(() =>
    {
        if (objectType === "string" || objectType === "number")
        {
            setValue(objectValue);
        }
        else if (objectType === "json")
        {
            setNsPrefix(objectValue.nsPrefix || "");
            setResource(objectValue.resource || "");
        }
    }, [objectValue, objectType]);

    const handleSave = () =>
    {
        if (objectType === "string" || objectType === "number")
        {
            onSave(objectType === "number" ? Number(value) : value);
        }
        else if (objectType === "json")
        {
            onSave({nsPrefix, resource});
        }
        onClose();
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(property);
            onClose();
        }
    };

    if (!isOpen) return null;

    if (property==="properties") return null;


    return (
        <div className="popupOverlay">
            <div className="popupContent">
                <div className="popupHeader">
                    <h3>Edit {propertyNs}{property}</h3>
                    <button className="closeButton" onClick={onClose}>×</button>
                </div>
                <div className="popupBody">
                    {(objectType === "string" || objectType === "number") && (
                        <div className="formGroup">
                            <label>Value:</label>
                            <input
                                type={objectType === "number" ? "number" : "text"}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>
                    )}

                    {objectType === "json" && (
                        <>
                            <div className="formGroup">

                                {namespaceToShapes[nsPrefix] ?
                                    <>
                                        <label>Object:</label>
                                        <ShaclSelector selectedNs={nsPrefix}
                                                       setSelectedNs={(newValue) =>
                                                       {
                                                           setNsPrefix(newValue)
                                                       }}
                                                       selectedResource={resource}
                                                       setSelectedResource={(newValue) =>
                                                       {
                                                           setResource(newValue)
                                                       }}
                                                       namespaceMap={property !== "path" ? namespaceToShapes : namespaceToPredicates}
                                        />
                                    </> :
                                    <>
                                        <label>Namespace Prefix:</label>
                                        <input
                                            type="text"
                                            value={nsPrefix}
                                            onChange={(e) => setNsPrefix(e.target.value)}
                                        />
                                        <div className="formGroup">
                                            <label>Resource:</label>
                                            <input
                                                type="text"
                                                value={resource}
                                                onChange={(e) => setResource(e.target.value)}
                                            />
                                        </div>
                                    </>
                                }
                            </div>
                        </>
                    )}
                </div>
                <div className="popupFooter">
                    <button className="deleteButton" onClick={handleDelete}>Delete</button>
                    <button className={"cancelButton"} onClick={onClose}>Cancel</button>
                    <button className="saveButton" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditShaclRowPopup;
