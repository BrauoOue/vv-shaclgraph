import './App.css'
import Navbar from "./components/Navbar/Navbar.jsx";
import ShaclPage from "./components/ShaclPage.jsx";
import {useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import NamespacesPage from "./components/NamespacesPage.jsx";
import DataPage from "./components/DataPage/DataPage.jsx";

function App()
{


    const [isLoadedShacl, setIsLoadedShacl] = useState(false)

    return (
        <BrowserRouter>

            <div className="app">
                <div className="main-content">
                    <Navbar></Navbar>
                    <div>
                        <Routes>
                            <Route path="/" element={<ShaclPage/>}/>
                            <Route path="/namespaces" element={<NamespacesPage/>}/>
                        </Routes>
                    </div>
                </div>
                <div className="data-content">
                    <DataPage></DataPage>
                </div>
            </div>
        </BrowserRouter>


    );
}

export default App
