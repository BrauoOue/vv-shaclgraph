import ShaclRow from "./ShaclRow";
import { getType } from "../utils";
import "./ShaclComponent.css"

const ShaclPropertyDetail = ({ propertyKey, value }) => {
    if (value === null) return null;

    const type = getType(value);

    if (type === "json") {
        return (
            <ShaclRow
                className="indented"
                propertyNs="sh:"
                property={propertyKey}
                objectNs={`${value.nsPrefix}:`}
                object={value.resource}
            />
        );
    }

    if (type === "array") {
        return (
            <ShaclRow
                className="indented"
                propertyNs="sh:"
                property={propertyKey}
                objectNs="&nbsp;"
                object={`(${value.join(", ")})`}
                darkerObjectNs={true}
            />
        );
    }

    if (type === "string" || type === "number") {
        return (
            <ShaclRow
                className="indented"
                propertyNs="sh:"
                property={propertyKey}
                objectNs="&nbsp;"
                object={type === "string" ? `'${value}'` : value}
                tooltip={type === "string" ? value : undefined}
                darkerObjectNs={true}
            />
        );
    }

    return (
        <div className="shaclRow indented">
            <div className="propertyNs">sh:</div>
            <div className="property">{propertyKey}</div>
        </div>
    );
};

export default ShaclPropertyDetail;
