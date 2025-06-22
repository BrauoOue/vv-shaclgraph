import React, {useContext} from "react";
import ShaclHeader from "./ShaclHeader";
import ShaclRow from "./ShaclRow";
import ShaclProperties from "./ShaclProperties";
import {getType, getNullablePredicates} from "../utils";
import "./ShaclComponent.css";
import {Context} from "../../App.jsx";

const ShaclComponent = ({
                            shaclObj,
                            addPredicatePopupShow,
                            setAddPredicatePopupShow,
                            setEditingShacleObj,
                            shaclObjIndex,
                            setEditingShacleObjIndex
                        }) =>
{
    const {shaclJson, setShaclJson} = useContext(Context);

    const handlePredicateUpdate = (predicate, newValue) =>
    {
        const updatedShaclJson = {...shaclJson};
        updatedShaclJson.shapeConstrains[shaclObjIndex][predicate] = newValue;
        setShaclJson(updatedShaclJson);
    };

    const handlePropertyUpdate = (propertyIndex, propertyKey, newValue) =>
    {
        const updatedShaclJson = {...shaclJson};
        updatedShaclJson.shapeConstrains[shaclObjIndex].properties[propertyIndex][propertyKey] = newValue;
        setShaclJson(updatedShaclJson);
    };

    return (
        <div className="shaclComponent">
            <ShaclHeader shapeName={shaclObj.shapeName}/>
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
                        />
                    );
                })}
            </div>
            <div className="action-buttons">
                <button onClick={() =>
                {
                    setAddPredicatePopupShow(!addPredicatePopupShow)
                    setEditingShacleObj(shaclObj)
                    setEditingShacleObjIndex(shaclObjIndex)
                }}>Add Predicate
                </button>
            </div>
        </div>
    );
};

export default ShaclComponent;
