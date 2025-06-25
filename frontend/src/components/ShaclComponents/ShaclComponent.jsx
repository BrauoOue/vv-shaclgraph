import React, {useContext, useEffect, useState} from "react";
import ShaclHeader from "./ShaclHeader";
import ShaclRow from "./ShaclRow";
import ShaclProperties from "./ShaclProperties";
import {getType, getNullablePredicates} from "../utils";
import "./ShaclComponent.css";
import {Context} from "../../App.jsx";
import DeleteConfirmationPopup from "../DeleteConfirmationPopup/DeleteConfirmationPopup.jsx";
import EditShapeNamePopup from "../EditShapeNamePopup/EditShapeNamePopup.jsx";

const getNewNamespace = (globalNamespaces, newNsPrefix) => {
    let newNamespace = globalNamespaces.find(ns => ns.nsPrefix === newNsPrefix);
    return newNamespace ? newNamespace.url : null;

}

const ShaclComponent = ({
                            shaclObj,
                            addPredicatePopupShow,
                            setAddPredicatePopupShow,
                            setEditingShacleObj,
                            shaclObjIndex,
                            setEditingShacleObjIndex
                        }) =>
{
    const {shaclJson, setShaclJson, globalNamespaces} = useContext(Context);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showEditShapeName, setShowEditShapeName] = useState(false);

    const handlePredicateUpdate = (predicate, newValue) =>
    {
        const updatedShaclJson = {...shaclJson};
        updatedShaclJson.shapeConstrains[shaclObjIndex][predicate] = newValue;
        setShaclJson(updatedShaclJson);
    };

    const handlePredicateDelete = (predicate) => {
        const updatedShaclJson = {...shaclJson};
        // Set the predicate to null instead of removing it
        updatedShaclJson.shapeConstrains[shaclObjIndex][predicate] = null;
        setShaclJson(updatedShaclJson);
    };

    const handlePropertyUpdate = (propertyIndex, propertyKey, newValue) =>
    {
        const updatedShaclJson = {...shaclJson};

        // Special case for deleting an entire property object (when path is deleted)
        if (propertyKey === '_deleteProperty' && newValue === true) {
            updatedShaclJson.shapeConstrains[shaclObjIndex].properties.splice(propertyIndex, 1);
        } else {
            // Regular property update or setting to null for deletion
            updatedShaclJson.shapeConstrains[shaclObjIndex].properties[propertyIndex][propertyKey] = newValue;
        }

        setShaclJson(updatedShaclJson);
    };

    const handleDeleteShape = () => {
        const updatedShaclJson = {...shaclJson};
        updatedShaclJson.shapeConstrains.splice(shaclObjIndex, 1);
        setShaclJson(updatedShaclJson);
        setShowDeleteConfirmation(false);
    };

    const handleShapeNameUpdate = (newShapeName) => {
        console.log("Global Namespaces:", globalNamespaces);
        const updatedShaclJson = {...shaclJson};
        let newNamespace = getNewNamespace(globalNamespaces, newShapeName.nsPrefix);
        console.log("New Namespace:", newNamespace);
        updatedShaclJson.shapeConstrains[shaclObjIndex].shapeName = {
            nsPrefix: newNamespace ? newShapeName.nsPrefix : shaclJson.shapeConstrains[shaclObjIndex].shapeName.nsPrefix ,
            resource: newShapeName.resource,
            namespace: newNamespace ? newNamespace : shaclJson.shapeConstrains[shaclObjIndex].shapeName.namespace
        };
        setShaclJson(updatedShaclJson);
    };

    useEffect(() =>
    {
        console.log("ShaclObj is NOW", shaclObj)
    }, []);

    return (
        <div className="shaclComponent">
            <ShaclHeader
                shapeName={shaclObj.shapeName}
                onClick={() => setShowEditShapeName(true)}
            />
            <div className="shaclBody">
                {Object.entries(shaclObj).map(([predicate, predicateValue]) =>
                {
                    if (predicate === "shapeName") return null;
                    if (predicateValue === null) return null;

                    if (predicate === "properties")
                    {
                        return <ShaclProperties
                            key="properties"
                            properties={predicateValue}
                            onPropertyUpdate={handlePropertyUpdate}
                        />;
                    }

                    const type = getType(predicateValue);
                    return (
                        <ShaclRow
                            key={predicate}
                            propertyNs="sh:"
                            property={predicate}
                            objectNs={type === "string" ? "" : `${predicateValue.nsPrefix}:`}
                            object={type === "string" ? `'${predicateValue}'` : predicateValue.resource}
                            darkerObjectNs={type === "string"}
                            tooltip={type === "string" ? predicateValue : undefined}
                            objectValue={predicateValue}
                            objectType={type}
                            onObjectUpdate={(newValue) => handlePredicateUpdate(predicate, newValue)}
                            onDelete={() => handlePredicateDelete(predicate)}
                        />
                    );
                })}
            </div>
            <div className="action-buttons">
                <button
                    onClick={() => {
                        setAddPredicatePopupShow(!addPredicatePopupShow)
                        setEditingShacleObj(shaclObj)
                        setEditingShacleObjIndex(shaclObjIndex)
                    }}
                    className="add-predicate-btn"
                >
                    Add Predicate
                </button>
                <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="delete-shape-btn"
                >
                    Delete SHACL Shape
                </button>
            </div>

            <DeleteConfirmationPopup
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={handleDeleteShape}
                itemName={shaclObj.shapeName.resource}
            />

            <EditShapeNamePopup
                isOpen={showEditShapeName}
                onClose={() => setShowEditShapeName(false)}
                currentShapeName={shaclObj.shapeName}
                onSave={handleShapeNameUpdate}
            />
        </div>
    );
};

export default ShaclComponent;
