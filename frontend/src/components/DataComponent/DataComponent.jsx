import React, { useState, useEffect } from "react";
import "./DataComponent.css";

const DataComponent = ({ subjectData, subjectIndex, onInputChange }) => {
  const [localData, setLocalData] = useState(subjectData || { triplets: [] });

  useEffect(() => {
    setLocalData(subjectData || { triplets: [] });
  }, [subjectData]);

  const handleChange = (e, idx, field) => {
    onInputChange(subjectIndex, idx, field, e.target.value);
  };

  // Return early if no data is available
  if (!localData || !localData.triplets) {
    return <div className="dataComponent">No data available</div>;
  }

  return (
    <div className="dataComponent">
      <div className="dataHeader">
        <div className="subjectNs">{localData.subjectNsPrefix}:</div>
        <div className="subject">{localData.subject}</div>
      </div>
      <div className="dataBody">
        {localData.triplets.map((triplet, idx) => (
          <div
            key={idx}
            className={`dataRow ${triplet.error ? "error-row" : ""}`}
          >
            <div className="propertyNs">
              <input
                value={triplet.predicateNsPrefix || ""}
                onChange={(e) => handleChange(e, idx, "predicateNsPrefix")}
              />
            </div>
            <div className="property">
              <input
                value={triplet.predicate || ""}
                onChange={(e) => handleChange(e, idx, "predicate")}
              />
            </div>
            <div className="objectNs">
              <input
                value={triplet.objectNsPrefix || ""}
                onChange={(e) => handleChange(e, idx, "objectNsPrefix")}
              />
            </div>
            <div className="object">
              <input
                value={triplet.object || ""}
                onChange={(e) => handleChange(e, idx, "object")}
              />
            </div>

            {triplet.error && <div className="tooltip">{triplet.errorMsg}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataComponent;
