import React from 'react';
import "./ClazzComponent.css"


const ClazzComponent = ({shape}) => {
    return (
        <div className={"clazzComponent"}>
            <div className={"classHeader"}>
                <div className={"subjectNs"}>
                    {shape.isDefinedBy}
                </div>
                <div className={"subject"}>
                    {shape.name}
                </div>
            </div>
            <div className={"classBody"}>
                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        type
                    </div>
                    <div className={"objectNs"}>
                        owl
                    </div>
                    <div className={"object"}>
                        Class
                    </div>
                </div>
                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        label
                    </div>
                    <div className={"objectNs"}>

                    </div>
                    <div className={"object"}>
                        "{shape.label}"
                    </div>
                </div>
                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        comment
                    </div>
                    <div className={"objectNs"}>

                    </div>
                    <div className={"object"}>
                        "{shape.comment}"
                    </div>
                </div>
                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        isDefinedBy
                    </div>
                    <div className={"objectNs"}>
                        {shape.isDefinedBy}
                    </div>
                    <div className={"object"}>

                    </div>
                </div>
            </div>


            {/*rdfs:isDefinedBy ex: .*/}

        </div>
    );
};

export default ClazzComponent;