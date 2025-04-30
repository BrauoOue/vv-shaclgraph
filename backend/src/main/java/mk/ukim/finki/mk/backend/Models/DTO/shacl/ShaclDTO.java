package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ShaclDTO
{
    // List of SHACL shape definitions (each defines constraints for a target)
    private List<Shape> shapeConstrains;

    @Getter
    @Setter
    public static class Shape
    {
        // Name of the shape (typically used as an identifier or label)
        private String name;

        // The target RDF class that this shape applies to (sh:targetClass)
        private RdfPair targetClass;

        // A specific RDF node that this shape applies to (sh:targetNode)
        private RdfPair targetNode;

        // All subjects of a given predicate that this shape applies to (sh:targetSubjectsOf)
        private RdfPair targetSubjectsOf;

        // All objects of a given predicate that this shape applies to (sh:targetObjectsOf)
        private RdfPair targetObjectsOf;

        // Validation message to show when the shape is violated (sh:message)
        private String message;

        // Severity level of the validation result: Violation, Warning, or Info (sh:severity)
        private String severity;

        // List of property constraints defined within this shape (sh:property)
        private List<Property> properties;
    }

    @Getter
    @Setter
    public static class Property
    {
        // Path (predicate) that the property constraint applies to (sh:path)
        private RdfPair path;

        // Expected datatype for the value of the path (sh:datatype)
        private RdfPair datatype;

        // Expected type of node: IRI, Literal, or BlankNode (sh:nodeKind)
        private String nodeKind;

        // Minimum number of times the property must appear (sh:minCount)
        private Integer minCount;

        // Maximum number of times the property may appear (sh:maxCount)
        private Integer maxCount;

        // Expected RDF class for the object at this path (sh:class)
        private RdfPair clazz;

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
        private RdfPair lessThan;

        // Validation message to show when this property constraint is violated (sh:message)
        private String message;

        // Severity level of this specific property constraint: Violation, Warning, or Info (sh:severity)
        private RdfPair severity;
    }


}
