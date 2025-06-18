import ClazzComponent from "../ClassComponent/ClazzComponent.jsx";
import NamespaceUrlComponent from "../NamespaceUrlComponent/NamespaceUrlComponent.jsx";
import {CircularProgress, Button, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useState, useEffect, useContext} from 'react';
import { fetchPredefinedNamespaces} from "../../../repository/namespaceRepository.js";
import { populateNamespaceMaps } from "../../../utils/namespaceUtils.js";
import {Context} from "../../../App.jsx";
import AddNamespaceDialog from "../AddNamespaceDialog.jsx";
import "./NamespacesPage.css";

const NamespacesPage = () =>
{
    const [namespaces, setNamespaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const { 
        globalNamespaces, 
        setGlobalNamespaces,
        setNamespaceToShapes,
        setNamespaceToPredicates 
    } = useContext(Context);

    // Helper function to populate namespace maps

    useEffect(() => {
        const fetchNamespaces = async () => {
            try {
                // If namespaces are already in context, use them
                if (globalNamespaces) {
                    setNamespaces(globalNamespaces);
                    // Populate the maps if not already populated
                    populateNamespaceMaps(globalNamespaces, setNamespaceToShapes, setNamespaceToPredicates);
                    setLoading(false);
                    return;
                }

                // Otherwise fetch from API
                const response = await fetchPredefinedNamespaces();
                setNamespaces(response);
                // Store in global context for future use
                setGlobalNamespaces(response);
                // Populate the namespace maps
                populateNamespaceMaps(response, setNamespaceToShapes, setNamespaceToPredicates);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching namespaces:', error);
                setNamespaces([]);
                setLoading(false);
            }
        };
        fetchNamespaces();
    }, [globalNamespaces, setGlobalNamespaces, setNamespaceToShapes, setNamespaceToPredicates]);

    return (
        <div className="namespaces-container">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress/>
                </Box>
            ) : Array.isArray(namespaces) && namespaces.length > 0 ? (
                <div className="namespaces-list">
                    {namespaces.map((namespace, index) => (
                        <NamespaceUrlComponent
                            key={index}
                            ns={namespace}
                        />
                    ))}
                </div>
            ) : (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <div>No namespaces available</div>
                </Box>
            )}

            <Button className={"add-namespace-button"}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
            >
                Add Namespace
            </Button>

            <AddNamespaceDialog 
                open={openAddDialog} 
                onClose={() => setOpenAddDialog(false)} 
            />
        </div>
    );
};

export default NamespacesPage;