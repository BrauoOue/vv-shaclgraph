import "./ShaclComponent.css";

const ShaclRow = ({
                      propertyNs,
                      property,
                      objectNs,
                      object,
                      darkerObjectNs = false,
                      darkerObject = false,
                      tooltip = "",
                      className = ""
                  }) => (
    <div className={`shaclRow ${className}`}>
        <div className="propertyNs">{propertyNs}</div>
        <div className="property">{property}</div>
        <div className={`objectNs ${darkerObjectNs ? "darkerBg" : ""}`}>
            {objectNs}
        </div>
        <div className={`object ${darkerObject ? "darkerBg" : ""}`} title={tooltip}>
            {object}
        </div>
    </div>
);

export default ShaclRow;
