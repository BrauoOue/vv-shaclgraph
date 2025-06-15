import ShaclRow from "./ShaclRow";
import ShaclPropertyDetail from "./ShaclPropertyDetail";
import "./ShaclComponent.css"

const ShaclProperties = ({ properties }) => (
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
                        value={val} />
                ))}
            </div>
        ))}
    </>
);

export default ShaclProperties;
