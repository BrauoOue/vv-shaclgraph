import "./ShaclComponent.css"

const ShaclHeader = ({shapeName}) => (
    <div className="shaclHeader">
        <div className="subjectNs">{shapeName.nsPrefix}:</div>
        <div className="subject">{shapeName.resource}</div>
    </div>
);

export default ShaclHeader;
