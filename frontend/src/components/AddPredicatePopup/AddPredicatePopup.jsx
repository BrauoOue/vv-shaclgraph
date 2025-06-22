import React, {useState} from 'react';
import "./AddPredicatePopup.css"
import ShaclSelector from "./ShaclSelector.jsx";
import {getNamespaceMap, getNullablePredicates} from '../utils.js'

const AddPredicatePopup = ({
                               setAddPredicatePopupShow,
                               editingShacleObj,
                               shaclJson,
                               setShaclJson,
                               editingShacleObjIndex,
                               namespaceToShapes,
                               namespaceToPredicates
                           }) =>
{
    const nullablePredicates = getNullablePredicates(editingShacleObj)
    const applicableDatatype = ["string", "integer", "double"]
    const applicableNodeKind = ["IRI", "Literal", "BlankNode"]

    const [selectedNodeKind, setSelectedNode] = useState("IRI")
    const [selectedDataType, setSelectedDataType] = useState("string")
    const [insertedInValues, setInsertedInValues] = useState("")
    const [insertedPattern, setInsertedPattern] = useState("")
    const [insertedMinCount, setInsertedMinCount] = useState("");
    const [insertedMaxCount, setInsertedMaxCount] = useState("")
    const [insertedMinInclusive, setInsertedMinInclusive] = useState("")
    const [insertedMaxInclusive, setInsertedMaxInclusive] = useState("")
    const [insertedHasValue, setInsertedHasValue] = useState("")
    const [insertedLessThen, setInsertedLessThen] = useState("")
    const [insertedMessage, setInsertedMessage] = useState("")
    const [includeSeverity, setIncludeSeverity] = useState(false)

    const [insertedGlobalMessage, setInsertedGlobalMessage] = useState("")


    const [selectedPredicate, setSelectedPredicate] = useState("");

    const [selectedObject, setSelectedObject] = useState({nsPrefix: Object.keys(namespaceToShapes)[0], resource: ""});
    const [selectedPath, setSelectedPath] = useState({nsPrefix: Object.keys(namespaceToPredicates)[0], resource: ""});
    const [selectedClazz, setSelectedClazz] = useState({nsPrefix: Object.keys(namespaceToShapes)[0], resource: ""});


    const handleAdd = () =>
    {
        const updatedObj = {...editingShacleObj};
        const nameSpaceMap = getNamespaceMap(shaclJson.namespaces)


        if (selectedPredicate === "message")
        {
            updatedObj.message = insertedGlobalMessage;
        }
        else if (selectedPredicate === "properties")
        {
            const newProperty = {
                path: {
                    ...selectedPath,
                    namespace: nameSpaceMap[selectedPath.nsPrefix]
                },
                nodeKind: selectedNodeKind,
                datatype: selectedNodeKind === "Literal" ? {
                    nsPrefix: "xsd",
                    namespace: "http://www.w3.org/2001/XMLSchema#",
                    resource: selectedDataType
                } : null,
                clazz: selectedNodeKind === "IRI" && selectedClazz.resource ? selectedClazz : null,
                pattern: selectedDataType === "string" && insertedPattern ? insertedPattern : null,
                inValues: insertedInValues.trim() !== "" ? insertedInValues.split(",").map(v => v.trim()) : null,
                minInclusive: insertedMinInclusive !== "" ? Number(insertedMinInclusive) : null,
                maxInclusive: insertedMaxInclusive !== "" ? Number(insertedMaxInclusive) : null,
                hasValue: insertedHasValue !== "" ? (selectedDataType === "string" ? insertedHasValue : Number(insertedHasValue)) : null,
                lessThan: insertedLessThen !== "" ? Number(insertedLessThen) : null,
                minCount: insertedMinCount !== "" ? Number(insertedMinCount) : null,
                maxCount: insertedMaxCount !== "" ? Number(insertedMaxCount) : null,
                message: insertedMessage !== "" ? insertedMessage : null,
                severity: includeSeverity ? {
                    nsPrefix: "sh",
                    namespace: "http://www.w3.org/ns/shacl#",
                    resource: "Violation"
                } : null
            };

            updatedObj.properties = [...(updatedObj.properties || []), newProperty];

        }
        else
        {
            let fullSelectedObject = {
                ...selectedObject,
                namespace: nameSpaceMap[selectedObject.nsPrefix]
            };
            updatedObj[selectedPredicate] = fullSelectedObject;
        }

        let updatedShapeConstrains = [...shaclJson.shapeConstrains];
        updatedShapeConstrains[editingShacleObjIndex] = updatedObj
        setShaclJson({
            ...shaclJson,
            shapeConstrains: updatedShapeConstrains
        })
        setAddPredicatePopupShow(false);
    };

    return (
        <div className="addPredicatePopup">
            <div className="popup-content">
                <div className="popup-header">
                    <h2>Add Predicate</h2>
                    <button className="close-button" onClick={() => setAddPredicatePopupShow(false)}>×</button>
                </div>

                <div className="popup-body">
                    <div className="form-group">
                        <label>Select Predicate:</label>
                        <select
                            value={selectedPredicate}
                            onChange={e =>
                            {
                                setSelectedPredicate(e.target.value);
                            }}
                        >
                            <option value="">-- Select Predicate --</option>
                            <option value="properties">properties</option>
                            {nullablePredicates.map(predicate => (
                                <option key={predicate} value={predicate}>{predicate}</option>
                            ))}
                        </select>
                    </div>

                    {selectedPredicate && selectedPredicate !== "message" && selectedPredicate !== "properties" && (
                        <div className="form-group">
                            <label>Select Object:</label>
                            <ShaclSelector selectedNs={selectedObject.nsPrefix}
                                           setSelectedNs={(newValue) =>
                                           {
                                               setSelectedObject(((oldObject) => ({
                                                   ...oldObject,
                                                   nsPrefix: newValue,
                                                   resource: ""
                                               })))
                                           }}
                                           selectedResource={selectedObject.resource}
                                           setSelectedResource={(newValue) =>
                                           {
                                               setSelectedObject(((oldObject) => ({
                                                   ...oldObject,
                                                   resource: newValue
                                               })))
                                           }}
                                           namespaceMap={namespaceToShapes}
                            />
                        </div>
                    )}

                    {selectedPredicate === "properties" && (
                        <div className="property-form">
                            <div className="form-group">
                                <label>Path:</label>
                                <ShaclSelector selectedNs={selectedPath.nsPrefix}
                                               setSelectedNs={(newValue) =>
                                               {
                                                   setSelectedPath(((oldObject) => ({
                                                       ...oldObject,
                                                       nsPrefix: newValue,
                                                       resource: ""
                                                   })))
                                               }}
                                               selectedResource={selectedPath.resource}
                                               setSelectedResource={(newValue) =>
                                               {
                                                   setSelectedPath(((oldObject) => ({
                                                       ...oldObject,
                                                       resource: newValue
                                                   })))
                                               }}
                                               namespaceMap={namespaceToPredicates}
                                />
                            </div>

                            <div className="form-group">
                                <label>NodeKind:</label>
                                <select
                                    onChange={(e) =>
                                    {
                                        setSelectedNode(e.target.value)
                                    }}
                                    value={selectedNodeKind}
                                >
                                    {applicableNodeKind.map(item => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedNodeKind === "IRI" && (
                                <div className="form-group">
                                    <label>Class:</label>
                                    <ShaclSelector selectedNs={selectedClazz.nsPrefix}
                                                   setSelectedNs={(newValue) =>
                                                   {
                                                       setSelectedClazz(((oldObject) => ({
                                                           ...oldObject,
                                                           nsPrefix: newValue,
                                                           resource: ""
                                                       })))
                                                   }}
                                                   selectedResource={selectedClazz.resource}
                                                   setSelectedResource={(newValue) =>
                                                   {
                                                       setSelectedClazz(((oldObject) => ({
                                                           ...oldObject,
                                                           resource: newValue
                                                       })))
                                                   }}
                                                   namespaceMap={namespaceToShapes}
                                    />
                                </div>
                            )}

                            {selectedNodeKind === "Literal" && (
                                <>
                                    <div className="form-group">
                                        <label>Datatype:</label>
                                        <select
                                            onChange={(e) =>
                                            {
                                                setSelectedDataType(e.target.value)
                                            }}
                                            value={selectedDataType}
                                        >
                                            {applicableDatatype.map(item => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedDataType === "string" && (
                                        <div className="form-group">
                                            <label>Pattern:</label>
                                            <input
                                                type="text"
                                                value={insertedPattern}
                                                onChange={(e) => setInsertedPattern(e.target.value)}
                                                placeholder="Regular expression pattern"
                                            />
                                        </div>
                                    )}

                                    {(selectedDataType === "integer" || selectedDataType === "double") && (
                                        <>
                                            <div className="form-group">
                                                <label>Min Inclusive:</label>
                                                <input
                                                    type="number"
                                                    value={insertedMinInclusive}
                                                    onChange={(e) => setInsertedMinInclusive(e.target.value)}
                                                    placeholder="Minimum value (inclusive)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Max Inclusive:</label>
                                                <input
                                                    type="number"
                                                    value={insertedMaxInclusive}
                                                    onChange={(e) => setInsertedMaxInclusive(e.target.value)}
                                                    placeholder="Maximum value (inclusive)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Less Than:</label>
                                                <input
                                                    type="number"
                                                    value={insertedLessThen}
                                                    onChange={(e) => setInsertedLessThen(e.target.value)}
                                                    placeholder="Must be less than this value"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <label title="Write the values separated by ','">In Values:</label>
                                        <input
                                            type="text"
                                            value={insertedInValues}
                                            onChange={(e) => setInsertedInValues(e.target.value)}
                                            placeholder="Value1, Value2, Value3"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Has Value:</label>
                                        <input
                                            type={selectedDataType === "string" ? "text" : "number"}
                                            value={insertedHasValue}
                                            onChange={(e) => setInsertedHasValue(e.target.value)}
                                            placeholder="Required value"
                                        />
                                    </div>
                                </>
                            )}

                            {selectedNodeKind !== "Blank" && (
                                <>
                                    <div className="form-group">
                                        <label>Min Count:</label>
                                        <input
                                            type="number"
                                            value={insertedMinCount}
                                            onChange={(e) => setInsertedMinCount(e.target.value)}
                                            placeholder="Minimum occurrence"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Max Count:</label>
                                        <input
                                            type="number"
                                            value={insertedMaxCount}
                                            onChange={(e) => setInsertedMaxCount(e.target.value)}
                                            placeholder="Maximum occurrence"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Message:</label>
                                <input
                                    type="text"
                                    value={insertedMessage}
                                    onChange={(e) => setInsertedMessage(e.target.value)}
                                    placeholder="Validation message"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="includeSeverity"
                                    checked={includeSeverity}
                                    onChange={(e) => setIncludeSeverity(e.target.checked)}
                                />
                                <label htmlFor="includeSeverity">Include Severity</label>
                            </div>
                        </div>
                    )}

                    {selectedPredicate === "message" && (
                        <div className="form-group">
                            <label>Message:</label>
                            <input
                                type="text"
                                value={insertedGlobalMessage}
                                onChange={(e) => setInsertedGlobalMessage(e.target.value)}
                                placeholder="Enter message text"
                            />
                        </div>
                    )}
                </div>

                <div className="popup-footer">
                    <button className="cancel-btn" onClick={() => setAddPredicatePopupShow(false)}>Cancel</button>
                    <button className="add-btn" onClick={handleAdd}>Add</button>
                </div>
            </div>
        </div>
    );
};

export default AddPredicatePopup;