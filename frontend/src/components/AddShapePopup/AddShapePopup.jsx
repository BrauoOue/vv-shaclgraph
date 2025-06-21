import React, {useEffect, useState} from 'react';
import {createEmptyShaclShape, createEmptyRdfObj, getNamespaceMap} from "../utils.js"
import ShaclSelector from "../AddPredicatePopup/ShaclSelector.jsx";
import "./AddShapePopup.css"

const AddShapePopup = ({shaclJson, setShaclJson, setShowAddShaclShapePopup}) =>
{
    const namespaces = ["foaf", "ex"]
    const nameSpaceShapeMap = {
        "ex": ["Person", "Book", "Chair"],
        "re": ["Picture", "Mice", "Pensss"]
    }

    const [shapeNsPrefix, setShapeNsPrefix] = useState("")
    const [shapeName, setShapeName] = useState("")

    const [targetClass, setTargetClass] = useState(createEmptyRdfObj({nsPrefix: Object.keys(nameSpaceShapeMap)[0]}));

    useEffect(() =>
    {

    }, []);
    const [isShapeInNewNs, setIsShapeInNewNs] = useState(false);
    const [newNamespace, setNewNamespace] = useState({
        url: "",
        prefix: ""
    })

    const [newShacleObj, setNewShacleObj] = useState({
        shapeName: {
            namespace: "",
            nsPrefix: "",
            resource: ""
        },
        targetClass: {
            namespace: "",
            nsPrefix: "ex",
            resource: "Person"
        }
    })

    const handleAdd = () =>
    {
        if (shaclJson === null)
        {
            shaclJson = {
                namespaces: [],
                shapeConstrains: []
            }
        }
        let allNamespaces = shaclJson.namespaces;
        if(isShapeInNewNs)
        {
            allNamespaces = [...shaclJson.namespaces, newNamespace]
            setShaclJson({
                ...shaclJson,
                namespaces: allNamespaces
            })
        }

        const namespaceMap = getNamespaceMap(allNamespaces)
        const newShaclObj = createEmptyShaclShape(createEmptyRdfObj({
                namespace: namespaceMap[shapeNsPrefix],
                nsPrefix: shapeNsPrefix,
                resource: shapeName
            }),
            {
                ...targetClass,
                namespaces: namespaceMap[targetClass.nsPrefix]
            })

        setShaclJson(
            {
                ...shaclJson,
                shapeConstrains: [...(shaclJson.shapeConstrains || []), newShaclObj],
            }
        )
        setShowAddShaclShapePopup(false)

    }

    return (
        <div className={"addShapePopup"}>
            <h1>Add Shape</h1>
            <div>
                <select onChange={(e) =>
                {
                    const value = e.target.value;

                    if (value === 'new')
                    {
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
                    <option value={""}>--Select Namespace</option>
                    {namespaces.map(item => (
                        <option key={item} value={item}
                        >{item}</option>
                    ))}
                    <option value={"new"}>New Namespace</option>
                </select>
                {isShapeInNewNs && (
                    <>
                        <div>
                            <label>Prefix:</label>
                            <input
                                value={newNamespace.prefix}
                                onChange={(e) =>
                                {
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
                            />
                        </div>
                        <div>
                            <label>Namespace URL:</label>
                            <input
                                value={newNamespace.url}
                                onChange={(e) => setNewNamespace((old) => ({
                                    ...old,
                                    url: e.target.value
                                }))}
                            />
                        </div>

                    </>

                )}
                <input
                    value={shapeName}
                    onChange={(e) => setShapeName(e.target.value)}
                />
            </div>
            {isShapeInNewNs && (
                <div>
                    <label>targetClass</label>
                    <span> {targetClass.nsPrefix}:</span>
                    <input
                        value={targetClass.resource}
                        onChange={(e) =>setTargetClass({
                            ...targetClass,
                            resource: e.target.value
                        })}
                    />
                </div>
            )}
            {!isShapeInNewNs && (
                <div>
                    <label>targetClass</label>
                    <ShaclSelector selectedNs={targetClass.nsPrefix}
                                   setSelectedNs={(newValue) =>
                                   {
                                       setTargetClass(((oldObject) => ({
                                           ...oldObject,
                                           nsPrefix: newValue,
                                           resource: ""
                                       })))
                                   }}
                                   selectedResource={targetClass.resource}
                                   setSelectedResource={(newValue) =>
                                   {
                                       setTargetClass(((oldObject) => ({
                                           ...oldObject,
                                           resource: newValue
                                       })))
                                   }}
                                   namespaceMap={nameSpaceShapeMap}

                    />
                </div>
            )}

            <button onClick={handleAdd}>
                Add
            </button>
            <button onClick={() => setShowAddShaclShapePopup(false)}
            >Close
            </button>
        </div>
    );
};

export default AddShapePopup;