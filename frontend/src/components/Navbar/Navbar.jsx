import React from 'react';
import "./Navbar.css"
import {Link} from "react-router-dom";

const Navbar = () =>
{
    return (
        <header className="navbar">
            <Link to="/">SHACL Constraints</Link>
            <Link to="/namespaces">Namespaces</Link>
        </header>
    );
};

export default Navbar;