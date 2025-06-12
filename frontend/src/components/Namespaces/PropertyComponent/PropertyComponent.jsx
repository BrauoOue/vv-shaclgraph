import React from 'react';
import "./PropertyComponent.css"


const PropertyComponent = ({predicate}) => {
    return (
        <div className={"propertyComponent"}>
            <div className={"propertyHeader"}>
                <div className={"subjectNs"}>
                    {predicate?.isDefinedBy}
                </div>
                <div className={"subject"}>
                    {predicate?.name}
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
                        rdf
                    </div>
                    <div className={"object"}>
                        Property
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
                        {predicate?.label}
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
                        {predicate?.comment}
                    </div>
                </div>

                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        domain
                    </div>
                    <div className={"objectNs"}>
                        {predicate?.domain?.nsPrefix}
                    </div>
                    <div className={"object"}>
                        {predicate?.domain?.domainType}
                    </div>
                </div>

                <div className={"classRow"}>
                    <div className={"propertyNs"}>
                        rdfs
                    </div>
                    <div className={"property"}>
                        range
                    </div>
                    <div className={"objectNs"}>
                        {predicate?.range?.nsPrefix}
                    </div>
                    <div className={"object"}>
                        {predicate?.range?.domainType}
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
                        {predicate?.isDefinedBy}
                    </div>
                    <div className={"object"}>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyComponent;