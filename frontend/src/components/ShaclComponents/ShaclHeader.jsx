import "./ShaclComponent.css"

const ShaclHeader = ({shapeName, onClick}) => (
    <div className={`shaclHeader ${onClick ? 'editable' : ''}`} onClick={onClick}>
        <div className="subjectNs">{shapeName.nsPrefix}:</div>
        <div className="subject">{shapeName.resource}</div>
        {/*{onClick && <div className="edit-indicator">✏️</div>}*/}
    </div>
);

export default ShaclHeader;
