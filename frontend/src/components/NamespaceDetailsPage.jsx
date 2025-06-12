import React from 'react';
import ClazzComponent from "./Namespaces/ClassComponent/ClazzComponent.jsx";
import PropertyComponent from "./Namespaces/PropertyComponent/PropertyComponent.jsx";
import {useLocation} from 'react-router-dom';


const NamespaceDetailsPage = () => {
    const location = useLocation();
    const {ns} = location.state || {};

    return (
        <div>
            <h2>Classes</h2>
            {ns?.shapes?.map((shape, index) => (
                <ClazzComponent key={index} shape={shape}/>
            ))}
            <h2>Predicates</h2>
            {ns?.predicates?.map((predicate, index) => (
                <PropertyComponent key={index} predicate={predicate}/>
            ))}
        </div>
    );
};

export default NamespaceDetailsPage;