import React, { useContext } from 'react';
import "./NamespaceUrlComponent.css"
import { useNavigate } from 'react-router-dom';
import { Context } from "../../../App.jsx";

const NamespaceUrlComponent = ({ns}) => {
    const navigate = useNavigate();
    const { setActiveNamespacePrefix } = useContext(Context);

    const handleClick = () => {
        setActiveNamespacePrefix(ns.nsPrefix);
        navigate('/namespace', {state: {ns}});
    };

    return (
        <div className={"namespaceUrlComponent"}>
            <div className={"prefix"}>{ns.nsPrefix}</div>
            <div className={"url"} onClick={handleClick} >{ns.url}</div>
        </div>
    );
};

export default NamespaceUrlComponent;