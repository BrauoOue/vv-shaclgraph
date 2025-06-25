import React, {useEffect} from 'react';

const ShaclSelector = ({selectedNs,setSelectedNs ,selectedResource,setSelectedResource, namespaceMap}) =>
{
    return (
        <>
            <select
                value={selectedNs}
                onChange={e =>
                {
                    setSelectedNs(e.target.value);
                    console.log(selectedNs)
                }}
            >
                {Object.keys(namespaceMap).map(namespace => (
                    <option key={namespace} value={namespace}>{namespace}</option>
                ))}
            </select>

            <select
                value={selectedResource}
                onChange={e =>
                {
                    setSelectedResource(e.target.value);
                }}
            >
                <option value="">-- Select Resource --</option>
                {selectedNs && namespaceMap[selectedNs] && namespaceMap[selectedNs].map(resource => (
                    <option key={resource} value={resource}>{resource}</option>
                ))}

            </select>
        </>
    );
};

export default ShaclSelector;