import ShaclRow from "./ShaclRow";
import ShaclPropertyDetail from "./ShaclPropertyDetail";
import "./ShaclComponent.css"

const ShaclProperties = ({ properties, onPropertyUpdate = null }) => (
    <>
        {properties.map((propertyObj, index) => (
            <div key={index}>
                <ShaclRow
                    propertyNs="sh:"
                    property="properties"
                    objectNs="&nbsp;"
                    object="&nbsp;"
                    darkerObjectNs={true}
                    darkerObject={true}
                />
                {Object.entries(propertyObj).map(([key, val], i) => (
                    <ShaclPropertyDetail
                        key={`${key}-${i}`}
                        propertyKey={key}
                        value={val}
                        onUpdate={onPropertyUpdate ?
                            (propKey, newValue) => onPropertyUpdate(index, propKey, newValue) :
                            null}
                    />
                ))}
            </div>
        ))}
    </>
);

export default ShaclProperties;
