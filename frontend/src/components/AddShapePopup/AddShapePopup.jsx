import React, {useState} from 'react';
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

    const [targetClass, setTargetClass] = useState(createEmptyRdfObj({nsPrefix: Object.keys(nameSpaceShapeMap)[0]}))

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
        console.log(shaclJson.namespaces)
        const namespaceMap = getNamespaceMap(shaclJson.namespaces)
        console.log(namespaceMap)
        return;
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

    }

    //TODO: implement this later
    const [useNewNamespace, setUseNewNamespace] = useState(false)

    return (
        <div className={"addShapePopup"}>
            <h1>Add Shape</h1>
            <div>
                <select onChange={(e) =>
                {
                    setShapeNsPrefix(e.target.value)
                }}
                >
                    <option value={""}>--Select Namespace</option>
                    {namespaces.map(item => (
                        <option key={item} value={item}
                        >{item}</option>
                    ))}
                </select>
                <input
                    value={shapeName}
                    onChange={(e) => setShapeName(e.target.value)}
                />
            </div>
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