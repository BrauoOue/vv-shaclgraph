import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import "./ShaclPage.css"
import ShaclComponent from "../ShaclComponents/ShaclComponent.jsx";
import {Context} from "../../App.jsx";
import { updateGlobalNamespaces } from "../../utils/namespaceUtils.js";
import { fetchNamespaceByUrl } from "../../repository/namespaceRepository.js";
import AddPredicatePopup from "../ShaclComponents/AddPredicatePopup.jsx";

const ShaclPage = () =>
{
    const [loading, setLoading] = useState(false);
    const {
        shaclJson, 
        setShaclJson, 
        globalNamespaces, 
        setGlobalNamespaces, 
        setNamespaceToShapes, 
        setNamespaceToPredicates
    } = useContext(Context)
    const [addPredicatePopupShow, setAddPredicatePopupShow] = useState(false);
    const [nullablePredicates, setNullablePredicates] = useState([])
    const [editingShacleObj, setEditingShacleObj] = useState(null)


    useEffect(() =>
    {
        console.log(shaclJson)
    }, [shaclJson]);

    const handleFileUpload = async (event) =>
    {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".ttl"))
        {
            alert("Please upload a valid .ttl file.");
            return;
        }


        const reader = new FileReader();
        reader.onload = async (e) =>
        {
            const formData = new FormData();
            formData.append("file", file);

            setLoading(true);

            try
            {
                const response = await axios.post(
                    "http://localhost:9090/api/convert/shaclTtlToJson",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setShaclJson(response.data);
                // Fetch and append each namespace to globalNamespaces and populate maps
                await updateGlobalNamespaces(
                    response.data,
                    globalNamespaces,
                    setGlobalNamespaces,
                    setNamespaceToShapes,
                    setNamespaceToPredicates
                );
            } catch (error)
            {
                console.error("Upload error:", error);
                alert("Failed to process the SHACL file.");
            } finally
            {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className={shaclJson ? 'shaclLoadedPage' : 'shaclImportPage'}>

            {!shaclJson && !loading && (
                <div>
                    <h1>Please upload a Shacl (.ttl) file</h1>
                    <input
                        type="file"
                        accept=".ttl"
                        onChange={handleFileUpload}/>
                </div>
            )}

            {loading && (
                <h1>Processing SHACL file...</h1>
            )}

            {shaclJson && (

                shaclJson.shapeConstrains.map(shaclObj => (
                    <ShaclComponent
                        key={shaclObj.shapeName.resource}
                        shaclObj={shaclObj}
                        addPredicatePopupShow={addPredicatePopupShow}
                        setAddPredicatePopupShow={setAddPredicatePopupShow}
                        nullablePredicates={nullablePredicates}
                        setNullablePredicates={setNullablePredicates}
                        setEditingShacleObj={setEditingShacleObj}
                    >
                    </ShaclComponent>
                ))

            )}
            {addPredicatePopupShow && (
                <AddPredicatePopup
                    setAddPredicatePopupShow={setAddPredicatePopupShow}
                    nullablePredicates={nullablePredicates}
                    se
                />
            )}
        </div>
    );
};

export default ShaclPage;
