import ShaclRow from "./ShaclRow";
import { getType } from "../utils";
import "./ShaclComponent.css"

const ShaclPropertyDetail = ({ propertyKey, value, onUpdate = null, onDelete = null }) => {
    if (value === null) return null;

    const type = getType(value);

    const handleUpdate = (newValue) => {
        if (onUpdate) {
            onUpdate(propertyKey, newValue);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(propertyKey);
        }
    };

    if (type === "json") {
        return (
            <ShaclRow
                className="indented"
                propertyNs="sh:"
                property={propertyKey}
                objectNs={`${value.nsPrefix}:`}
                object={value.resource}
                objectValue={value}
                objectType={type}
                onObjectUpdate={onUpdate ? handleUpdate : null}
                onDelete={onDelete ? handleDelete : null}
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
                objectValue={value}
                objectType={type}
                darkerObjectNs={true}
                onObjectUpdate={onUpdate ? handleUpdate : null}
                onDelete={onDelete ? handleDelete : null}
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
                objectValue={value}
                objectType={type}
                tooltip={type === "string" ? value : undefined}
                darkerObjectNs={true}
                onObjectUpdate={onUpdate ? handleUpdate : null}
                onDelete={onDelete ? handleDelete : null}
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
