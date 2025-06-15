import React, { useState } from 'react';
import DataComponent from '../DataComponent/DataComponent';
import "./DataPage.css";

const DataPage = () => {
  const [dataFile, setDataFile] = useState(null);
  const [dataJson, setDataJson] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.ttl')) {
      alert('Please upload a valid .ttl file.');
      return;
    }
    setDataFile(file);
  };

  const uploadFile = async () => {
    if (!dataFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', dataFile);

    try {
      const response = await fetch('http://localhost:9090/api/convert/dataTtlToJson', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const jsonData = await response.json();
      setDataJson(jsonData);
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const dataToDisplay = dataJson?.data || [];

  return (
    <div className="data-page">
      <h1>Data</h1>

      {!dataJson && (
        <div className="upload-section">
          <input type="file" accept=".ttl" onChange={handleFileChange} />
          <button onClick={uploadFile} disabled={!dataFile || loading}>
            {loading ? 'Uploading...' : 'Upload & Convert'}
          </button>
        </div>
      )}

      {dataJson && dataToDisplay.length === 0 && (
        <p>No data found in the uploaded file.</p>
      )}

      <div className="data-list">
        {dataToDisplay.map((subjectData, index) => (
          <DataComponent key={index} subjectData={subjectData} />
        ))}
      </div>
    </div>
  );
};

export default DataPage;
