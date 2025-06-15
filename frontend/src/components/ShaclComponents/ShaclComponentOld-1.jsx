import React, {useEffect} from 'react';
import "./ShaclComponent.css"

function getType(thing)
{
    if (Array.isArray(thing))
    {
        return "array";
    }

    if (Object.prototype.toString.call(thing) === '[object Object]')
    {
        return "json";
    }

    return typeof thing;
}


const ShaclComponent = ({shaclObj}) =>
{
    return (
        <div className={"shaclComponent"}>
            <div className={"shaclHeader"}>
                <div className={"subjectNs"}>
                    {shaclObj.shapeName.nsPrefix}:
                </div>
                <div className={"subject"}>
                    {shaclObj.shapeName.resource}
                </div>
            </div>
            <div className={"shaclBody"}>
                {Object.keys(shaclObj).map(key =>
                {
                    if (key !== "shapeName" && key !== "properties")
                    {
                        if (shaclObj[key] !== null)
                        {
                            if(getType(shaclObj[key]) === "string")
                            {
                                return (
                                    <div className={"shaclRow"}>
                                        <div className={"propertyNs"}>
                                            sh:
                                        </div>
                                        <div className={"property"}>
                                            {key}
                                        </div>
                                        <div className={"objectNs darkerBg"}>
                                            &nbsp;
                                        </div>
                                        <div className={"object"} title={shaclObj[key]}>
                                            '{shaclObj[key]}'
                                        </div>
                                    </div>
                                )
                            }
                            else
                            {
                                return (
                                    <div className={"shaclRow"}>
                                        <div className={"propertyNs"}>
                                            sh:
                                        </div>
                                        <div className={"property"}>
                                            {key}
                                        </div>
                                        <div className={"objectNs"}>
                                            {shaclObj[key].nsPrefix}:
                                        </div>
                                        <div className={"object"}>
                                            {shaclObj[key].resource}
                                        </div>
                                    </div>
                                )
                            }

                        }
                    }
                    else if (key === "properties")
                    {
                        return shaclObj[key]
                            .map(propertyObj => (
                                <>
                                    <div className={"shaclRow"}>
                                        <div className={"propertyNs"}>
                                            sh:
                                        </div>
                                        <div className={"property"}>
                                            {key}
                                        </div>
                                        <div className={"objectNs darkerBg"}>
                                            &nbsp;
                                        </div>
                                        <div className={"object darkerBg"}>
                                            &nbsp;
                                        </div>
                                    </div>

                                    {Object.keys(propertyObj)
                                        .map((propertyKey, number) =>
                                        {
                                            if (propertyObj[propertyKey] === null)
                                            {
                                                return
                                            }
                                            if (getType(propertyObj[propertyKey]) === "json")
                                            {
                                                return (
                                                    <div
                                                        key={propertyObj[propertyKey].resource}
                                                        className={"shaclRow indented"}>
                                                        <div className={"propertyNs"}>
                                                            sh:
                                                        </div>
                                                        <div className={"property"}>
                                                            {propertyKey}
                                                        </div>
                                                        <div className={"objectNs"}>
                                                            {propertyObj[propertyKey].nsPrefix}:
                                                        </div>
                                                        <div className={"object"}>
                                                            {propertyObj[propertyKey].resource}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            else if(getType(propertyObj[propertyKey]) === "array")
                                            {
                                                console.log("String in here: ",propertyKey)
                                                return (
                                                    <div
                                                        key={`${propertyKey}-${number}`}
                                                        className={"shaclRow indented"}>
                                                        <div className={"propertyNs"}>
                                                            sh:
                                                        </div>
                                                        <div className={"property"}>
                                                            {propertyKey}
                                                        </div>
                                                        <div className={"objectNs darkerBg"}>
                                                            &nbsp;
                                                        </div>
                                                        <div className={"object"}>
                                                            ({propertyObj[propertyKey].join(", ")})
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            else if(getType(propertyObj[propertyKey]) === "string" || getType(propertyObj[propertyKey]) === "number")
                                            {
                                                console.log("String in here: ",propertyKey)
                                                return (
                                                    <div
                                                        key={`${propertyKey}-${number}`}
                                                        className={"shaclRow indented"}>
                                                        <div className={"propertyNs"}>
                                                            sh:
                                                        </div>
                                                        <div className={"property"}>
                                                            {propertyKey}
                                                        </div>
                                                        <div className={"objectNs darkerBg"}>
                                                            &nbsp;
                                                        </div>
                                                        <div className={"object"} title={propertyObj[propertyKey]}>
                                                            {getType(propertyObj[propertyKey]) === "string" ? `'${propertyObj[propertyKey]}'` : propertyObj[propertyKey]}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            else
                                            {
                                                return (
                                                    <div
                                                        key={`${propertyKey}-${number}`}
                                                        className={"shaclRow indented"}>
                                                        <div className={"propertyNs"}>
                                                            sh:
                                                        </div>
                                                        <div className={"property"}>
                                                            {propertyKey}
                                                        </div>
                                                    </div>
                                                )
                                            }

                                        })}

                                </>

                            ))
                    }
                })}


            </div>


        </div>
    );
};

export default ShaclComponent;