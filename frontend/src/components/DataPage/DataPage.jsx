import React, { useState, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Context } from '../../App.jsx';
import { updateGlobalNamespaces } from '../../utils/namespaceUtils.js';
import DataComponent from '../DataComponent/DataComponent';

const DataPage = () => {
  const [dataFile, setDataFile] = useState(null);
  const [dataJson, setDataJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const { globalNamespaces, setGlobalNamespaces } = useContext(Context);

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
      await updateGlobalNamespaces(jsonData,globalNamespaces,setGlobalNamespaces);
    } catch (err) {
      alert('Error uploading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const dataToDisplay = dataJson?.data || [];

  return (
    <Box mt={4} display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" gutterBottom>Data</Typography>

      {!dataJson && (
        <>
          <input type="file" accept=".ttl" onChange={handleFileChange} />
          <button onClick={uploadFile} disabled={!dataFile || loading}>
            {loading ? 'Uploading...' : 'Upload & Convert'}
          </button>
        </>
      )}

      {dataJson && dataToDisplay.length === 0 && (
        <Typography>No data found in the uploaded file.</Typography>
      )}

      {dataToDisplay.map((subjectData, index) => (
        <Paper key={index} sx={{ width: '80%', mb: 4 }} elevation={4}>
          <Table>
            <TableBody>
              <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                <TableCell>{subjectData.subjectNsPrefix}</TableCell>
                <TableCell colSpan={3}>{subjectData.subject}</TableCell>
              </TableRow>

              {subjectData.triplets.map((triplet, idx) => (
                <DataComponent key={idx} triplet={triplet} />
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
    </Box>
  );
};

export default DataPage;
