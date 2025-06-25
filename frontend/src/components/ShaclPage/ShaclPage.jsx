import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import "./ShaclPage.css"
import ShaclComponent from "../ShaclComponents/ShaclComponent.jsx";
import {Context} from "../../App.jsx";
import AddPredicatePopup from "../AddPredicatePopup/AddPredicatePopup.jsx";
import AddShapePopup from "../AddShapePopup/AddShapePopup.jsx";
import {updateGlobalNamespaces} from "../../utils/namespaceUtils.js";
import {fetchNamespaceByUrl} from "../../repository/namespaceRepository.js";

const ShaclPage = () =>
{
    const [loading, setLoading] = useState(false);
    const [showAddPredicatePopup, setShowAddPredicatePopup] = useState(false);
    const [showAddShaclShapePopup, setShowAddShaclShapePopup] = useState(false)
    const {
        shaclJson,
        setShaclJson,
        globalNamespaces,
        setGlobalNamespaces,
        setNamespaceToShapes,
        setNamespaceToPredicates,
        namespaceToShapes,
        namespaceToPredicates,
    } = useContext(Context)
    const [editingShacleObj, setEditingShacleObj] = useState(null)
    const [editingShacleObjIndex, setEditingShacleObjIndex] = useState(null)

    useEffect(() =>
    {
        console.log(shaclJson)
    }, [shaclJson]);

    useEffect(() =>
    {
        console.log("Global namespaces:", globalNamespaces)
        console.log("Namespace to Shape", namespaceToShapes)
        console.log("Namespace to Predicates", namespaceToPredicates)
    }, [globalNamespaces]);

    const handleFileUpload = async (event) =>
    {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".ttl"))
        {
            alert("Please upload a valid .ttl file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) =>
        {
            const formData = new FormData();
            formData.append("file", file);

            setLoading(true);

            try
            {
                const response = await axios.post(
                    "http://localhost:9090/api/convert/shaclTtlToJson",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setShaclJson(response.data);
                // Fetch and append each namespace to globalNamespaces and populate maps
                await updateGlobalNamespaces(
                    response.data,
                    globalNamespaces,
                    setGlobalNamespaces,
                    setNamespaceToShapes,
                    setNamespaceToPredicates
                );
            } catch (error)
            {
                console.error("Upload error:", error);
                alert("Failed to process the SHACL file.");
            } finally
            {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    const handleDownloadShaclTtl = async () =>
    {
        try
        {
            const response = await axios.post('http://localhost:9090/api/convert/shaclJsonToTtl', shaclJson, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Get filename from Content-Disposition header if available, otherwise use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'shacl-export.ttl';
            if (contentDisposition)
            {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch.length > 1)
                {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error)
        {
            console.error('Error downloading SHACL TTL:', error);
            alert('Failed to download SHACL TTL file.');
        }
    };

    return (
        <div className='shaclLoadedPage'>


            {!shaclJson && !loading && (
                <>

                    <div className="page-header">
                        <h2 className="page-title">SHACL Shape Editor</h2>
                        <button
                            className="add-shape-btn"
                            onClick={() => setShowAddShaclShapePopup(!showAddShaclShapePopup)}
                        >
                            Add SHACL Shape
                        </button>
                    </div>

                    <div className="file-upload-container">
                        <h2>Upload a SHACL file to get started</h2>
                        <div className="file-upload-form">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    accept=".ttl"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                />
                            </div>
                            <button className="upload-btn">Upload</button>
                        </div>
                    </div>
                </>


            )}

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Processing SHACL file...</p>
                </div>
            )}

            {shaclJson && (
                <>
                    <div className="page-header">
                        <h2 className="page-title">SHACL Shape Editor</h2>
                        <div className={"action-container-wrapper"}>
                            <div className={"buttons-container"}>
                                <button
                                    className="add-shape-btn"
                                    onClick={() => setShowAddShaclShapePopup(!showAddShaclShapePopup)}
                                >
                                    Add SHACL Shape
                                </button>
                                <button
                                    className="download-btn"
                                    onClick={handleDownloadShaclTtl}
                                >
                                    Download TTL
                                </button>
                            </div>
                            <div className="action-container">
                                <div className="upload-module">
                                    <h3>Upload a new TTL file</h3>
                                    <div className="file-upload-form">
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                accept=".ttl"
                                                onChange={handleFileUpload}
                                                className="file-input"
                                            />
                                        </div>
                                        <button className="upload-btn">Upload</button>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>


                    <div className="shapes-container">
                        {shaclJson.shapeConstrains.map((shaclObj, shacleObjIndex) => (
                            <ShaclComponent
                                key={shaclObj.shapeName.resource}
                                shaclObj={shaclObj}
                                shaclObjIndex={shacleObjIndex}
                                addPredicatePopupShow={showAddPredicatePopup}
                                setAddPredicatePopupShow={setShowAddPredicatePopup}
                                setEditingShacleObj={setEditingShacleObj}
                                setEditingShacleObjIndex={setEditingShacleObjIndex}
                            >
                            </ShaclComponent>
                        ))}
                    </div>
                </>
            )}

            {showAddPredicatePopup && (
                <AddPredicatePopup
                    setAddPredicatePopupShow={setShowAddPredicatePopup}
                    editingShacleObj={editingShacleObj}
                    editingShacleObjIndex={editingShacleObjIndex}
                    shaclJson={shaclJson}
                    setShaclJson={setShaclJson}
                    globalNamespaces={globalNamespaces}
                    namespaceToShapes={namespaceToShapes}
                    namespaceToPredicates={namespaceToPredicates}
                />
            )}

            {showAddShaclShapePopup && (
                <AddShapePopup
                    shaclJson={shaclJson}
                    setShaclJson={setShaclJson}
                    setShowAddShaclShapePopup={setShowAddShaclShapePopup}
                    namespaceToShapes={namespaceToShapes}
                />
            )}
        </div>
    );
};

export default ShaclPage;
