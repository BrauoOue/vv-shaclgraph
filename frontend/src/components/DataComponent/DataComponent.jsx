import React, { useState, useEffect } from 'react';
import "./DataComponent.css";

const DataComponent = ({ subjectData }) => {
  const [localData, setLocalData] = useState(subjectData);

  useEffect(() => {
    setLocalData(subjectData);
  }, [subjectData]);

  const handleChange = (e, idx, field) => {
    const newTriplets = [...localData.triplets];
    newTriplets[idx] = { ...newTriplets[idx], [field]: e.target.value };
    setLocalData({ ...localData, triplets: newTriplets });
  };

  return (
    <div className="data-container">
      <div className="dataHeader">
        <div className="subjectNs">{localData.subjectNsPrefix}</div>
        <div className="subject">{localData.subject}</div>
      </div>
      <div className="dataBody">
        {localData.triplets.map((triplet, idx) => (
          <div
            key={idx}
            className={`dataRow ${triplet.error ? 'error-row' : ''}`}
          >
            <input
              className="propertyNs"
              value={triplet.predicateNsPrefix}
              onChange={(e) => handleChange(e, idx, 'predicateNsPrefix')}
              data-error={triplet.errorMsg || ''}
            />
            <input
              className="property"
              value={triplet.predicate}
              onChange={(e) => handleChange(e, idx, 'predicate')}
              data-error={triplet.errorMsg || ''}
            />
            <input
              className="objectNs"
              value={triplet.objectNsPrefix || ''}
              onChange={(e) => handleChange(e, idx, 'objectNsPrefix')}
              data-error={triplet.errorMsg || ''}
            />
            <input
              className="object"
              value={triplet.object}
              onChange={(e) => handleChange(e, idx, 'object')}
              data-error={triplet.errorMsg || ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataComponent;
