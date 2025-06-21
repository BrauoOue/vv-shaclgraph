import React, { useContext, useEffect } from 'react';
import ClazzComponent from "../ClassComponent/ClazzComponent.jsx";
import PropertyComponent from "../PropertyComponent/PropertyComponent.jsx";
import {useLocation} from 'react-router-dom';
import {Box} from '@mui/material';
import "./NamespaceDetailsPage.css";
import { Context } from "../../../App.jsx";

const NamespaceDetailsPage = () => {
    const location = useLocation();
    const {ns} = location.state || {};
    const hasShapes = ns?.shapes && ns.shapes.length > 0;
    const hasPredicates = ns?.predicates && ns.predicates.length > 0;
    const { setActiveNamespacePrefix } = useContext(Context);

    useEffect(() => {
        if (ns && ns.nsPrefix) {
            setActiveNamespacePrefix(ns.nsPrefix);
        }
    }, [ns, setActiveNamespacePrefix]);

    if (!ns) {
        return (
            <div className="namespace-details-container">
                <h2>Namespace Details</h2>
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <div className="empty-message">No namespace data available</div>
                </Box>
            </div>
        );
    }

    return (
        <div className="namespace-details-container">
            {hasShapes && (
                <>
                    <h2>Classes</h2>
                    <div className="section-container">
                        {ns.shapes.map((shape, index) => (
                            <ClazzComponent key={index} shape={shape}/>
                        ))}
                    </div>
                </>
            )}

            {hasPredicates && (
                <>
                    <h2>Predicates</h2>
                    <div className="section-container">
                        {ns.predicates.map((predicate, index) => (
                            <PropertyComponent key={index} predicate={predicate}/>
                        ))}
                    </div>
                </>
            )}

            {!hasShapes && !hasPredicates && (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <div className="empty-message">No classes or predicates available for this namespace</div>
                </Box>
            )}
        </div>
    );
};

export default NamespaceDetailsPage;
