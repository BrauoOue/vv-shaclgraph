import React, {useState} from 'react';
import "./AddPredicatePopup.css"
import ShaclSelector from "./ShaclSelector.jsx";
import {getNamespaceMap, getNullablePredicates} from '../utils.js'

const AddPredicatePopup = ({
                               setAddPredicatePopupShow,
                               editingShacleObj,
                               shaclJson,
                               setShaclJson,
                               editingShacleObjIndex
                           }) =>
{
    const nullablePredicates = getNullablePredicates(editingShacleObj)

    const nameSpaceShapeMap = {
        "ex": ["Person", "Book", "Chair"],
        "re": ["Picture", "Mice", "Pensss"]
    }

    const nameSpacePropertiesMap = {
        "ex": ["run", "study", "work"],
        "foaf": ["eat", "sleep", "dress"]
    }
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

    const [selectedObject, setSelectedObject] = useState({nsPrefix: Object.keys(nameSpaceShapeMap)[0], resource: ""});
    const [selectedPath, setSelectedPath] = useState({nsPrefix: Object.keys(nameSpaceShapeMap)[0], resource: ""});
    const [selectedClazz, setSelectedClazz] = useState({nsPrefix: Object.keys(nameSpaceShapeMap)[0], resource: ""});


    const handleAdd = () =>
    {
        const updatedObj = {...editingShacleObj};
        const nameSpaceMap = getNamespaceMap(shaclJson.namespaces)


        if (selectedPredicate === "message")
        {
            console.log(insertedGlobalMessage)
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

            console.log(newProperty)
        }
        else
        {
            console.log(nameSpaceMap)
            let fullSelectedObject = {
                ...selectedObject,
                namespace: nameSpaceMap[selectedObject.nsPrefix]
            };
            updatedObj[selectedPredicate] = fullSelectedObject;
            console.log(fullSelectedObject)
        }

        // setEditingShacleObj(updatedObj);
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
            <h2>Add Predicate</h2>
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

            {selectedPredicate && selectedPredicate !== "message" && selectedPredicate !== "properties" && (
                <div>
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
                                   namespaceMap={nameSpaceShapeMap}

                    />
                </div>)

            }

            {selectedPredicate === "properties" && (
                <div className="property-form">
                    <div>
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
                                       namespaceMap={nameSpacePropertiesMap}

                        />

                    </div>
                    <div>
                        <label>NodeKind:</label>
                        <select onChange={(e) =>
                        {
                            setSelectedNode(e.target.value)
                        }}
                        >
                            {applicableNodeKind.map(item => (
                                <option key={item} value={item}
                                >{item}</option>
                            ))}
                        </select>
                    </div>
                    {selectedNodeKind === "IRI" && (
                        <div>
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
                                           namespaceMap={nameSpaceShapeMap}
                            />

                        </div>
                    )}
                    {selectedNodeKind === "Literal" && (
                        <>
                            <div>
                                <label>Datatype:</label>
                                <select onChange={(e) =>
                                {
                                    setSelectedDataType(e.target.value)
                                }}
                                >
                                    {applicableDatatype.map(item => (
                                        <option key={item} value={item}
                                        >{item}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedDataType === "string" && (
                                <>
                                    <div>
                                        <label>Pattern:</label>
                                        <input
                                            type={"text"}
                                            value={insertedPattern}
                                            onChange={(e) => setInsertedPattern(e.target.value)}
                                        />
                                    </div>
                                </>


                            )}

                            {(selectedDataType === "integer" || selectedDataType === "double") && (

                                <>
                                    <div>
                                        <label>Min Inclusive:</label>
                                        <input
                                            type={"number"}
                                            value={insertedMinInclusive}
                                            onChange={(e) => setInsertedMinInclusive(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Max Inclusive:</label>
                                        <input
                                            type={"number"}
                                            value={insertedMaxInclusive}
                                            onChange={(e) => setInsertedMaxInclusive(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Less Than:</label>
                                        <input
                                            type={"number"}
                                            value={insertedLessThen}
                                            onChange={(e) => setInsertedLessThen(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label title={"Write the values seperated by ','"}>In Values:</label>
                                <input
                                    type={"text"}
                                    value={insertedInValues}
                                    onChange={(e) => setInsertedInValues(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Has Value:</label>
                                <input
                                    type={selectedDataType === "string" ? "text" : "number"}
                                    value={insertedHasValue}
                                    onChange={(e) => setInsertedHasValue(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    {selectedNodeKind !== "Blank" && (

                        <>
                            <div>
                                <label>Min Count:</label>
                                <input
                                    type={"number"}
                                    value={insertedMinCount}
                                    onChange={(e) => setInsertedMinCount(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Max Count:</label>
                                <input
                                    type={"number"}
                                    value={insertedMaxCount}
                                    onChange={(e) => setInsertedMaxCount(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label>Message:</label>
                        <input
                            type={"text"}
                            value={insertedMessage}
                            onChange={(e) => setInsertedMessage(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Include Severity:</label>
                        <input
                            type={"checkbox"}
                            checked={includeSeverity}
                            onChange={(e) => setIncludeSeverity(e.target.checked)}
                        />
                    </div>
                </div>)
            }

            {selectedPredicate === "message" && (
                <div>
                    <input
                        type={"text"}
                        value={insertedGlobalMessage}
                        onChange={(e) => setInsertedGlobalMessage(e.target.value)}
                    />
                </div>
            )}
            <div className="btns">
                <button onClick={handleAdd}>Add</button>
                <button onClick={() => setAddPredicatePopupShow(false)}>Cancel</button>
            </div>
        </div>
    );
};

export default AddPredicatePopup;