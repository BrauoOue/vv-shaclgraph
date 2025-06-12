import React from 'react';

const ShaclComponent = () =>
{
    return (
        <div>
            <div className={"shaclHeader"}>
                <div className={"subjectNs"}>
                    ex
                </div>
                <div className={"subject"}>
                    PersonShape
                </div>
            </div>
            <div className={"shaclBody"}>
                <div className={"shacleRow"}>
                    <div className={"propertyNs"}>
                        ex
                    </div>
                    <div className={"property"}>
                        targetClass
                    </div>
                    <div className={"objectNs"}>
                        ex
                    </div>
                    <div className={"object"}>
                        Person
                    </div>
                </div>
                <div className={"shacleRow indented"}>
                    <div className={"propertyNs"}>
                        ex
                    </div>
                    <div className={"property"}>
                        targetClass
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

export default ShaclComponent;