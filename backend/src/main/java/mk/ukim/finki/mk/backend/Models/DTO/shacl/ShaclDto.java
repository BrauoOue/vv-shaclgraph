package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;


@Getter
@Setter
public class ShaclDto
{
    @JsonProperty("namespaces")
    private List<RdfNamespacePair> prefixToNsMap;
    // List of SHACL shape definitions (each defines constraints for a target)
    private List<Shape> shapeConstrains;

    @Getter
    @Setter
    public static class Shape
    {
        // Name of the shape (typically used as an identifier or label)
        private RdfUri shapeName;

        // The target RDF class that this shape applies to (sh:targetClass)
        private RdfUri targetClass;

        // A specific RDF node that this shape applies to (sh:targetNode)
        private RdfUri targetNode;

        // All subjects of a given predicate that this shape applies to (sh:targetSubjectsOf)
        private RdfUri targetSubjectsOf;

        // All objects of a given predicate that this shape applies to (sh:targetObjectsOf)
        private RdfUri targetObjectsOf;

        // Validation message to show when the shape is violated (sh:message)
        private String message;

//        // Validation messages to show when the shape is violated (sh:message)
//        private List<String> messages;


        // Severity level of the validation result: Violation, Warning, or Info (sh:severity)
        private RdfUri severity;

        // List of property constraints defined within this shape (sh:property)
        private List<Property> properties;
    }

    @Getter
    @Setter
    public static class Property
    {
        // Path (predicate) that the property constraint applies to (sh:path)
        private RdfUri path;

        // Expected datatype for the value of the path (sh:datatype)
        private RdfUri datatype;

        // Expected type of node: IRI, Literal, or BlankNode (sh:nodeKind)
        private String nodeKind;

        // Minimum number of times the property must appear (sh:minCount)
        private Integer minCount;

        // Maximum number of times the property may appear (sh:maxCount)
        private Integer maxCount;

        // Expected RDF class for the object at this path (sh:class)
        private RdfUri clazz;

        // Regular expression that the value must match (sh:pattern)
        private String pattern;

        // List of allowed values for the property (sh:in)
        private List<String> inValues;

        // Minimum allowed value (inclusive) for numeric or date/time values (sh:minInclusive)
        private Double minInclusive;

        // Maximum allowed value (inclusive) for numeric or date/time values (sh:maxInclusive)
        private Double maxInclusive;

        // Expected specific value or IRI for the property (sh:hasValue)
        private String hasValue;

        // Another property that this property's value must be less than (sh:lessThan)
        private RdfUri lessThan;

        // Validation message to show when this property constraint is violated (sh:message)
        private String message;

        // Severity level of this specific property constraint: Violation, Warning, or Info (sh:severity)
        private RdfUri severity;
    }


}
