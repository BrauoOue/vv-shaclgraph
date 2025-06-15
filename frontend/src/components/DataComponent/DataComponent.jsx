import React from 'react';
import "./DataComponent.css";

const DataComponent = ({ subjectData }) => {
  return (
    <div className="data-container">
      <div className="dataHeader">
        <div className="subjectNs">{subjectData.subjectNsPrefix}</div>
        <div className="subject">{subjectData.subject}</div>
      </div>
      <div className="dataBody">
        {subjectData.triplets.map((triplet, idx) => (
          <div
            key={idx}
            className={`dataRow ${triplet.error ? 'error-row' : ''}`}
          >
            <div className="propertyNs">{triplet.predicateNsPrefix}</div>
            <div className="property">{triplet.predicate}</div>
            <div className="objectNs">{triplet.objectNsPrefix || ''}</div>
            <div className="object">{triplet.object}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataComponent;
