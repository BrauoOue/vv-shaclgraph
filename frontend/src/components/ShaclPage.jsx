import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ShaclPage = () => {
    const [shaclFile, setShaclFile] = useState(null);
    const [fileContent, setFileContent] = useState("");

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".ttl")) {
            alert("Please upload a valid .ttl file.");
            return;
        }

        setShaclFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setFileContent(e.target.result);
        };
        reader.readAsText(file);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
        >
            {!shaclFile ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        Please upload a SHACL (.ttl) file
                    </Typography>
                    <input
                        type="file"
                        accept=".ttl"
                        onChange={handleFileUpload}
                        style={{ marginTop: 10 }}
                    />
                </>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>
                        File uploaded: {shaclFile.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        style={{
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left',
                            width: '80%',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}
                    >
                        {fileContent}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default ShaclPage;
