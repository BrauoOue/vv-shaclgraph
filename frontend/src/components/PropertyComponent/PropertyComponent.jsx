import React from 'react';

const ShapeComponent = () =>
{
    return (
        <div>
            <div className={"classHeader"}>
                <div className={"subjectNs"}>
                    foaf
                </div>
                <div className={"subject"}>
                    Person
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
            </div>
        </div>
    );
};

export default ShapeComponent;