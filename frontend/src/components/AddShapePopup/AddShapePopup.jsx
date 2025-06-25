import React, {useEffect, useState} from 'react';
import {createEmptyShaclShape, createEmptyRdfObj, getNamespaceMap} from "../utils.js"
import ShaclSelector from "../AddPredicatePopup/ShaclSelector.jsx";
import "./AddShapePopup.css"

const AddShapePopup = ({shaclJson, setShaclJson, setShowAddShaclShapePopup, namespaceToShapes}) => {
    const [shapeNsPrefix, setShapeNsPrefix] = useState("")
    const [shapeName, setShapeName] = useState("")
    const [targetClass, setTargetClass] = useState(createEmptyRdfObj({nsPrefix: Object.keys(namespaceToShapes)[0]}));
    const [isShapeInNewNs, setIsShapeInNewNs] = useState(false);
    const [newNamespace, setNewNamespace] = useState({
        url: "",
        prefix: ""
    });

    const handleAdd = () => {
        if (shaclJson === null) {
            shaclJson = {
                namespaces: [],
                shapeConstrains: []
            }
        }

        let allNamespaces = shaclJson.namespaces;
        if (isShapeInNewNs) {
            allNamespaces = [...shaclJson.namespaces, newNamespace]
            setShaclJson({
                ...shaclJson,
                namespaces: allNamespaces
            })
        }

        const namespaceMap = getNamespaceMap(allNamespaces)
        const newShaclObj = createEmptyShaclShape(
            createEmptyRdfObj({
                namespace: namespaceMap[shapeNsPrefix],
                nsPrefix: shapeNsPrefix,
                resource: shapeName
            }),
            {
                ...targetClass,
                namespaces: namespaceMap[targetClass.nsPrefix]
            }
        )

        setShaclJson({
            ...shaclJson,
            shapeConstrains: [...(shaclJson.shapeConstrains || []), newShaclObj],
        })

        setShowAddShaclShapePopup(false)
    }

    return (
        <div className="addShapePopup">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>Add Shape</h2>
                    <button className="close-button" onClick={() => setShowAddShaclShapePopup(false)}>×</button>
                </div>

                <div className="popup-body">
                    <div className="form-group">
                        <label>Shape Namespace:</label>
                        <select
                            value={shapeNsPrefix}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'new') {
                                    setIsShapeInNewNs(true)
                                    setTargetClass({
                                        ...targetClass,
                                        nsPrefix: ""
                                    })
                                    return
                                }
                                setShapeNsPrefix(value)
                            }}
                        >
                            <option value="">-- Select Namespace --</option>
                            {Object.keys(namespaceToShapes).map(nsPrefix => (
                                <option key={nsPrefix} value={nsPrefix}>{nsPrefix}</option>
                            ))}
                            {/* <option value="new">New Namespace</option> */}
                        </select>
                    </div>

                    {isShapeInNewNs && (
                        <>
                            <div className="form-group">
                                <label>Prefix:</label>
                                <input
                                    type="text"
                                    value={newNamespace.prefix}
                                    onChange={(e) => {
                                        setNewNamespace((old) => ({
                                            ...old,
                                            prefix: e.target.value
                                        }))
                                        setTargetClass({
                                            ...targetClass,
                                            nsPrefix: e.target.value
                                        })
                                        setShapeNsPrefix(e.target.value)
                                    }}
                                    placeholder="Enter namespace prefix"
                                />
                            </div>
                            <div className="form-group">
                                <label>Namespace URL:</label>
                                <input
                                    type="text"
                                    value={newNamespace.url}
                                    onChange={(e) => setNewNamespace((old) => ({
                                        ...old,
                                        url: e.target.value
                                    }))}
                                    placeholder="Enter namespace URL"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Shape Name:</label>
                        <input
                            type="text"
                            value={shapeName}
                            onChange={(e) => setShapeName(e.target.value)}
                            placeholder="Enter shape name"
                        />
                    </div>

                    {!isShapeInNewNs && (
                        <div className="form-group">
                            <label>Target Class:</label>
                            <ShaclSelector
                                selectedNs={targetClass.nsPrefix}
                                setSelectedNs={(newValue) => {
                                    setTargetClass(((oldObject) => ({
                                        ...oldObject,
                                        nsPrefix: newValue,
                                        resource: ""
                                    })))
                                }}
                                selectedResource={targetClass.resource}
                                setSelectedResource={(newValue) => {
                                    setTargetClass(((oldObject) => ({
                                        ...oldObject,
                                        resource: newValue
                                    })))
                                }}
                                namespaceMap={namespaceToShapes}
                            />
                        </div>
                    )}

                    {isShapeInNewNs && (
                        <div className="form-group">
                            <label>Target Class Resource:</label>
                            <div className="input-with-prefix">
                                <span>{targetClass.nsPrefix}:</span>
                                <input
                                    type="text"
                                    value={targetClass.resource}
                                    onChange={(e) => setTargetClass({
                                        ...targetClass,
                                        resource: e.target.value
                                    })}
                                    placeholder="Enter target class resource"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="popup-footer">
                    <button className="cancel-btn" onClick={() => setShowAddShaclShapePopup(false)}>
                        Cancel
                    </button>
                    <button className="add-btn" onClick={handleAdd}>
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddShapePopup;