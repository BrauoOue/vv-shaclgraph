import {useState} from "react";
import EditShaclRowPopup from "../EditShaclRowPopup/EditShaclRowPopup.jsx";
import "./ShaclComponent.css";

const ShaclRow = ({
                      propertyNs,
                      property,
                      objectNs,
                      object,
                      darkerObjectNs = false,
                      darkerObject = false,
                      tooltip = "",
                      className = "",
                      onObjectUpdate = null,
                      objectValue = object,
                      objectType = "string"
                  }) =>
{
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleRowClick = () =>
    {
        setIsPopupOpen(true);

        console.log("Clicked")
        if (onObjectUpdate)
        {
            setIsPopupOpen(true);
        }
    };

    const handleSave = (newValue) =>
    {
        if (onObjectUpdate)
        {
            onObjectUpdate(newValue);
        }
    };

    return (
        <>
            <div className={`shaclRow ${className} ${onObjectUpdate ? "editable" : ""}`} onClick={handleRowClick}>
                <div className="propertyNs">{propertyNs}</div>
                <div className="property">{property}</div>
                <div className={`objectNs ${darkerObjectNs ? "darkerBg" : ""}`}>
                    {objectNs}
                </div>
                <div className={`object ${darkerObject ? "darkerBg" : ""}`} title={tooltip}>
                    {object}
                </div>
            </div>
            {isPopupOpen && (
                <EditShaclRowPopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    propertyNs={propertyNs}
                    property={property}
                    objectValue={objectValue}
                    objectType={objectType}
                    onSave={handleSave}
                />
            )}

        </>
    );
};

export default ShaclRow;
