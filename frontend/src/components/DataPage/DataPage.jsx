import React, { useState, useContext } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Context } from "../../App.jsx";
import { updateGlobalNamespaces } from "../../utils/namespaceUtils.js";

import DataComponent from "../DataComponent/DataComponent";
import "./DataPage.css";
// import { Context } from 'C:/Users/Asus/Desktop/vp-shacl/vv-shaclgraph/frontend/src/App.jsx';

const DataPage = () => {
  // const { shaclJson } = useContext(Context);
  const [dataFile, setDataFile] = useState(null);
  // const [dataJson, setDataJson] = useState(null);
  const {
    dataJson,
    setDataJson,
    shaclJson,
    globalNamespaces,
    setGlobalNamespaces,
  } = useContext(Context);
  const [loading, setLoading] = useState(false);
  // const [validationResult, setValidationResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".ttl")) {
      alert("Please upload a valid .ttl file.");
      return;
    }
    setDataFile(file);
  };

  const uploadFile = async () => {
    if (!dataFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", dataFile);

    try {
      const response = await fetch(
          "http://localhost:9090/api/convert/dataTtlToJson",
          {
            method: "POST",
            body: formData,
          }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const jsonData = await response.json();
      setDataJson(jsonData);
      await updateGlobalNamespaces(
          jsonData,
          globalNamespaces,
          setGlobalNamespaces
      );
    } catch (err) {
      alert("Error uploading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (subjectIndex, tripletIndex, field, value) => {
    const newData = { ...dataJson };
    const updatedSubjects = [...newData.data];

    const updatedTriplets = [...updatedSubjects[subjectIndex].triplets];
    updatedTriplets[tripletIndex] = {
      ...updatedTriplets[tripletIndex],
      [field]: value,
      error: false,       // Reset error flag
      errorMsg: null      // Reset error message
    };

    updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], triplets: updatedTriplets };

    newData.data = updatedSubjects;

    setDataJson(newData);
  };

  const dataToDisplay = dataJson?.data || [];

  function getLocalName(iri) {
    if (!iri) return iri;
    const hashIndex = iri.lastIndexOf("#");
    const slashIndex = iri.lastIndexOf("/");
    const pos = Math.max(hashIndex, slashIndex);
    return pos === -1 ? iri : iri.substring(pos + 1);
  }

  function mergeValidationErrors(dataJson, validationErrors) {
    if (!validationErrors || validationErrors.length === 0)
      return {
        ...dataJson,
        valid: true,
      };

    let hasErrors = false;

    const updatedData = dataJson.data.map((subject) => {
      const subjectLocal = subject.subject;
      const subjectErrors = validationErrors.filter(
          (e) => getLocalName(e.subject) === subjectLocal
      );
      const hasSubjectError = subjectErrors.length > 0;

      if (hasSubjectError) hasErrors = true;

      const updatedTriplets = subject.triplets.map((triplet) => {
        const tripletLocal = triplet.predicate;
        const errorObj = subjectErrors.find(
            (e) => getLocalName(e.property) === tripletLocal
        );
        if (errorObj) {
          return {
            ...triplet,
            error: true,
            errorMsg: errorObj.errorMessage,
          };
        }
        return {
          ...triplet,
          error: false,
          errorMsg: null,
        };
      });

      return {
        ...subject,
        error: hasSubjectError,
        errorMsg: hasSubjectError ? "Has validation errors" : null,
        triplets: updatedTriplets,
      };
    });

    return {
      ...dataJson,
      valid: !hasErrors,
      data: updatedData,
    };
  }

  const handleValidate = async () => {
    if (!shaclJson || !dataJson) {
      alert("Both SHACL and RDF data must be loaded.");
      return;
    }

    const requestBody = {
      shacl: shaclJson,
      data: dataJson,
    };

    try {
      const response = await fetch("http://localhost:9090/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const validationResult = await response.json();

      const enrichedDataJson = mergeValidationErrors(
          dataJson,
          validationResult.validationErrors
      );
      console.log(enrichedDataJson);
      setDataJson(enrichedDataJson);
    } catch (error) {
      console.error("Validation error:", error);
      alert("Validation failed. Check the console.");
    }
  };

  const handleDownload = async () => {
    if (!dataJson) {
      alert("No data to download.");
      return;
    }

    try {
      const response = await fetch("http://localhost:9090/api/convert/dataJsonToTtl?filename=updatedData.ttl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataJson)
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'updatedData.ttl');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the file.");
    }
  };


  return (
      <div className="data-page">
        <div className="page-header">
          <h2 className="page-title">Data Editor</h2>
          {dataJson && (
            <div className="header-actions">
              <button className="myButton action-btn" onClick={handleValidate}>
                Validate
              </button>
              <button className="myButton action-btn download-btn" onClick={handleDownload}>
                Download TTL
              </button>
            </div>
          )}
        </div>

        {!dataJson && (
            <div className="upload-section">
              <h2>Upload a data file to get started</h2>
              <div className="file-upload-form">
                <div className="file-input-wrapper">
                  <input type="file" accept=".ttl" onChange={handleFileChange} className="file-input" />
                </div>
                <button className="upload-btn" onClick={uploadFile} disabled={!dataFile || loading}>
                  {loading ? "Uploading..." : "Upload & Convert"}
                </button>
              </div>
            </div>
        )}

        {dataJson && dataToDisplay.length === 0 && (
            <p>No data found in the uploaded file.</p>
        )}

        <div className="data-list">
          {dataToDisplay.map((subjectData, index) => (
              <DataComponent
                  key={index}
                  subjectData={subjectData}
                  subjectIndex={index}
                  onInputChange={handleInputChange}
              />
          ))}
        </div>
      </div>
  );
};

export default DataPage;

