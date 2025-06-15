import React from 'react';
import "./NamespaceUrlComponent.css"
import {useNavigate} from 'react-router-dom';


const NamespaceUrlComponent = ({ns}) => {
    const navigate = useNavigate();

    const handleClick = () => {
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