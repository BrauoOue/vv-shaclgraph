import axiosInstance from '../api/axiosInstance.js';

export const fetchPredefinedNamespaces = async () => {
    const response = await axiosInstance.get('/namespaces/predefined');
    return response.data;
};

export const fetchNamespaceByUrl = async (url) => {
    const response = await axiosInstance.get('/namespaces/predefined/by', {
        params: {url}
    });
    return response.data;
};