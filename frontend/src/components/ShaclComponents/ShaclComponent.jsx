import ShaclHeader from "./ShaclHeader";
import ShaclRow from "./ShaclRow";
import ShaclProperties from "./ShaclProperties";
import {getType, getNullablePredicates} from "../utils";
import "./ShaclComponent.css"
import {useEffect, useState} from "react";
import AddPredicatePopup from "./AddPredicatePopup.jsx";

const ShaclComponent = ({shaclObj, addPredicatePopupShow, setAddPredicatePopupShow, nullablePredicates, setNullablePredicates}) =>
{

    useEffect(() =>
    {
        console.log(nullablePredicates)
    }, [nullablePredicates]);

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
                            properties={predicateValue}/>;
                    }

                    const type = getType(predicateValue);
                    return (
                        <ShaclRow
                            key={predicate}
                            propertyNs="sh:"
                            property={predicate}
                            objectNs={type === "string" ? "&nbsp;" : `${predicateValue.nsPrefix}:`}
                            object={type === "string" ? `'${predicateValue}'` : predicateValue.resource}
                            darkerObjectNs={type === "string"}
                            tooltip={type === "string" ? predicateValue : undefined}
                        />
                    );
                })}
            </div>
            <div>
                <button onClick={()=>
                {
                    console.log("Clicked")
                    setNullablePredicates(getNullablePredicates(shaclObj))
                    setAddPredicatePopupShow(!addPredicatePopupShow)}
                }>Add</button>
            </div>
        </div>
    );
};

export default ShaclComponent;
