import ShaclHeader from "./ShaclHeader";
import ShaclRow from "./ShaclRow";
import ShaclProperties from "./ShaclProperties";
import {getType, getNullablePredicates} from "../utils";
import "./ShaclComponent.css"

const ShaclComponent = ({shaclObj, addPredicatePopupShow, setAddPredicatePopupShow, setEditingShacleObj, shaclObjIndex, setEditingShacleObjIndex}) =>
{

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
                            objectNs={type === "string" ? "" : `${predicateValue.nsPrefix}:`}
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
                    setAddPredicatePopupShow(!addPredicatePopupShow)
                    setEditingShacleObj(shaclObj)
                    setEditingShacleObjIndex(shaclObjIndex)
                }}>Add</button>
            </div>
        </div>
    );
};

export default ShaclComponent;
