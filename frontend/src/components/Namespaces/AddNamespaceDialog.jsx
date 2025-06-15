import React, { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { fetchNamespaceByUrl } from '../../repository/namespaceRepository.js';
import { Context } from '../../App.jsx';
import { populateNamespaceMaps } from '../../utils/namespaceUtils.js';

const AddNamespaceDialog = ({ open, onClose }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { 
        globalNamespaces, 
        setGlobalNamespaces,
        setNamespaceToShapes,
        setNamespaceToPredicates 
    } = useContext(Context);

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        setError(null);
        setSuccess(false);
    };

    const handleAddNamespace = async () => {
        if (!url.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const namespace = await fetchNamespaceByUrl(url);

            // Check if namespace already exists
            const exists = globalNamespaces?.some(ns => ns.url === namespace.url);
            if (exists) {
                setError('This namespace already exists');
                setLoading(false);
                return;
            }

            // Update global namespaces
            const updatedNamespaces = [...(globalNamespaces || []), namespace];
            setGlobalNamespaces(updatedNamespaces);

            // Update namespace maps
            populateNamespaceMaps(updatedNamespaces, setNamespaceToShapes, setNamespaceToPredicates);

            setSuccess(true);
            setUrl('');
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error fetching namespace:', error);
            setError('Failed to fetch namespace. Please check the URL and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Namespace by URL</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Namespace URL"
                        variant="outlined"
                        fullWidth
                        value={url}
                        onChange={handleUrlChange}
                        disabled={loading}
                        placeholder="Enter namespace URL"
                    />
                    {error && (
                        <Alert severity="error">{error}</Alert>
                    )}
                    {success && (
                        <Alert severity="success">Namespace successfully added!</Alert>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        <Button 
                            onClick={onClose} 
                            disabled={loading}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddNamespace} 
                            variant="contained" 
                            disabled={loading || !url.trim()}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AddNamespaceDialog;
