import ShaclRow from "./ShaclRow";
import ShaclPropertyDetail from "./ShaclPropertyDetail";
import "./ShaclComponent.css"

const ShaclProperties = ({ properties, onPropertyUpdate = null }) => {
    const handlePropertyDelete = (propertyIndex, propertyKey) => {
        if (onPropertyUpdate) {
            // Special case: if path is deleted, it will be handled differently in ShaclComponent
            if (propertyKey === 'path') {
                onPropertyUpdate(propertyIndex, '_deleteProperty', true);
            } else {
                // For other properties, just set the value to null
                onPropertyUpdate(propertyIndex, propertyKey, null);
            }
        }
    };

    return (
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
                            onDelete={onPropertyUpdate ?
                                () => handlePropertyDelete(index, key) :
                                null}
                        />
                    ))}
                </div>
            ))}
        </>
    );
};

export default ShaclProperties;
