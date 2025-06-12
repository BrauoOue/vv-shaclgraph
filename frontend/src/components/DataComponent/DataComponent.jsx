import React from 'react';

const DataComponent = () =>
{
    return (
        <div>
            <div className={"dataHeader"}>
                <div className={"subjectNs"}>
                    ex
                </div>
                <div className={"subject"}>
                    targetClass
                </div>
            </div>
            <div className={"dataBody"}>
                <div className={"dataRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        type
                    </div>
                    <div className={"objectNs"}>
                        ex
                    </div>
                    <div className={"object"}>
                        Person
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataComponent;