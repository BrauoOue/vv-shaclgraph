import ClazzComponent from "./Namespaces/ClassComponent/ClazzComponent.jsx";
import NamespaceUrlComponent from "./Namespaces/NamespaceUrlComponent/NamespaceUrlComponent.jsx";
import {CircularProgress} from '@mui/material';
import {useState, useEffect} from 'react';
import { fetchPredefinedNamespaces} from "../repository/namespaceRepository.js";

const NamespacesPage = () =>
{
    const [namespaces, setNamespaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNamespaces = async () => {
            try {
                const response = await fetchPredefinedNamespaces();
                setNamespaces(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching namespaces:', error);
                setNamespaces([]);
                setLoading(false);
            }
        };
        fetchNamespaces();
    }, []);

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