import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import ShaclPage from "./components/ShaclPage/ShaclPage.jsx";
import {createContext, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import NamespacesPage from "./components/NamespacesPage.jsx";
import DataPage from "./components/DataPage/DataPage.jsx";
import NamespaceDetailsPage from "./components/NamespaceDetailsPage.jsx";


export const Context = createContext({});


function App()
{
    const [shaclJson, setShaclJson] = useState(null);
    const [globalNamespaces, setGlobalNamespaces] = useState(null);

    return (
        <Context.Provider value={{shaclJson, setShaclJson, globalNamespaces, setGlobalNamespaces}}>
            <BrowserRouter>
                <div className="app">
                    <div className="main-content">
                        <Navbar></Navbar>
                        <div>
                            <Routes>
                                <Route path="/" element={<ShaclPage/>}/>
                                <Route path="/namespaces" element={<NamespacesPage/>}/>
                                <Route path="/namespace" element={<NamespaceDetailsPage/>}/>
                            </Routes>
                        </div>
                    </div>
                    <div className="data-content">
                        <DataPage></DataPage>
                    </div>
                </div>
            </BrowserRouter>
        </Context.Provider>
    );
}

export default App
