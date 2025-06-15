import ClazzComponent from "./Namespaces/ClassComponent/ClazzComponent.jsx";
import NamespaceUrlComponent from "./Namespaces/NamespaceUrlComponent/NamespaceUrlComponent.jsx";
import {CircularProgress} from '@mui/material';
import {useState, useEffect, useContext} from 'react';
import { fetchPredefinedNamespaces} from "../repository/namespaceRepository.js";
import {Context} from "../App.jsx";

const NamespacesPage = () =>
{
    const [namespaces, setNamespaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const { globalNamespaces, setGlobalNamespaces } = useContext(Context);

    useEffect(() => {
        const fetchNamespaces = async () => {
            try {
                // If namespaces are already in context, use them
                if (globalNamespaces) {
                    setNamespaces(globalNamespaces);
                    setLoading(false);
                    return;
                }

                // Otherwise fetch from API
                const response = await fetchPredefinedNamespaces();
                setNamespaces(response);
                // Store in global context for future use
                setGlobalNamespaces(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching namespaces:', error);
                setNamespaces([]);
                setLoading(false);
            }
        };
        fetchNamespaces();
    }, [globalNamespaces, setGlobalNamespaces]);

    return (
        <div>
            {loading ? (
                <CircularProgress/>
            )  : Array.isArray(namespaces) ? (
                namespaces.map((namespace, index) => (
                    <NamespaceUrlComponent
                        key={index}
                        ns={namespace}
                    />
                ))
            ) : (
                <div>No namespaces available</div>
            )}
        </div>
    );
};

export default NamespacesPage;