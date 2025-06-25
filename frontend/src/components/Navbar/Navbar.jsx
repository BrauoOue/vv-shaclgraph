import React, { useContext, useEffect } from 'react';
import "./Navbar.css"
import { Link, useLocation } from "react-router-dom";
import { Context } from "../../App.jsx";

const Navbar = () => {
    const location = useLocation();
    const { pathname } = location;
    const { activeNamespacePrefix, setActiveNamespacePrefix } = useContext(Context);

    // Clear the active namespace prefix when navigating away from namespace details
    useEffect(() => {
        if (pathname !== '/namespace' && activeNamespacePrefix) {
            setActiveNamespacePrefix(null);
        }
    }, [pathname, activeNamespacePrefix, setActiveNamespacePrefix]);

    return (
        <header className="navbar">
            <Link 
                to="/" 
                className={pathname === '/' ? 'active' : ''}
            >
                SHACL Constraints
            </Link>
            <Link 
                to="/namespaces" 
                className={pathname === '/namespaces' || pathname === '/namespace' ? 'active' : ''}
            >
                Namespaces
                {activeNamespacePrefix && (
                    <span className="namespace-prefix">{`/${activeNamespacePrefix}`}</span>
                )}
            </Link>
        </header>
    );
};

export default Navbar;

