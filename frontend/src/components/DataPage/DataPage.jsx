// import React, { useState } from 'react';
// import Button from '@mui/material/Button';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';

// const DataPage = () => {
//     const [dataFile, setDataFile] = useState(null);
//     const [fileContent, setFileContent] = useState("");

//     const handleFileUpload = (event) => {
//         const file = event.target.files[0];
//         if (!file || !file.name.endsWith(".ttl")) {
//             alert("Please upload a valid .ttl file.");
//             return;
//         }

//         setDataFile(file);

//         const reader = new FileReader();
//         reader.onload = (e) => {
//             setFileContent(e.target.result);
//         };
//         reader.readAsText(file);
//     };

//     return (
//         <div>
            
//         <Box
//             display="flex"
//             flexDirection="column"
//             alignItems="center"
//             justifyContent="center"
//             height="100vh"
//             textAlign="center"
//         >
            
//             {!dataFile ? (
//                 <>
//                     <Typography variant="h5" gutterBottom>
//                         Please upload a Data (.ttl) file
//                     </Typography>
//                     <input
//                         type="file"
//                         accept=".ttl"
//                         onChange={handleFileUpload}
//                         style={{ marginTop: 10 }}
//                     />
//                 </>
//             ) : (
//                 <>
//                     <Typography variant="h6" gutterBottom>
//                         File uploaded: {dataFile.name}
//                     </Typography>
//                     <Typography
//                         variant="body2"
//                         style={{
//                             whiteSpace: 'pre-wrap',
//                             textAlign: 'left',
//                             width: '80%',
//                             maxHeight: '300px',
//                             overflowY: 'auto',
//                             backgroundColor: '#f5f5f5',
//                             padding: '10px',
//                             borderRadius: '4px',
//                             marginTop: '10px'
//                         }}
//                     >
//                         {fileContent}
//                     </Typography>
//                 </>
//             )}
//         </Box>
//         </div>
//     );
// };

// export default DataPage;

import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import DataComponent from '../DataComponent/DataComponent';

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
