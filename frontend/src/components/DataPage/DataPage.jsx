import React, {useState, useContext} from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import {Context} from '../../App.jsx';
import {updateGlobalNamespaces} from '../../utils/namespaceUtils.js';

import DataComponent from '../DataComponent/DataComponent';
import "./DataPage.css";
// import { Context } from 'C:/Users/Asus/Desktop/vp-shacl/vv-shaclgraph/frontend/src/App.jsx'; 

const DataPage = () =>
{
    // const { shaclJson } = useContext(Context);
    const [dataFile, setDataFile] = useState(null);
    const [dataJson, setDataJson] = useState(null);
    const [loading, setLoading] = useState(false);

    const {globalNamespaces, setGlobalNamespaces} = useContext(Context);
    // const [validationResult, setValidationResult] = useState(null);

    const handleFileChange = (e) =>
    {
        const file = e.target.files[0];
        if (!file || !file.name.endsWith('.ttl'))
        {
            alert('Please upload a valid .ttl file.');
            return;
        }
        setDataFile(file);
    };

    const uploadFile = async () =>
    {
        if (!dataFile) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', dataFile);

        try
        {
            const response = await fetch('http://localhost:9090/api/convert/dataTtlToJson', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok)
            {
                throw new Error('Upload failed');
            }

            const jsonData = await response.json();
            setDataJson(jsonData);
            await updateGlobalNamespaces(jsonData, globalNamespaces, setGlobalNamespaces);
        } catch (err)
        {
            alert('Error uploading file: ' + err.message);
        } finally
        {
            setLoading(false);
        }
    };

    const dataToDisplay = dataJson?.data || [];

    return (
        <div className="data-page">
            <h1>Data</h1>

            {!dataJson && (
                <div className="upload-section">
                    <input type="file" accept=".ttl" onChange={handleFileChange}/>
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
                    <DataComponent key={index} subjectData={subjectData}/>
                ))}
            </div>
            <button className='myButton'

            >Validate</button>
        </div>

    );
};

export default DataPage;
