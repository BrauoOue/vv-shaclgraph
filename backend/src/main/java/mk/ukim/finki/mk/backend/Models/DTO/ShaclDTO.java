package mk.ukim.finki.mk.backend.Models.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ShaclDTO {
    // List of SHACL shape definitions (each defines constraints for a target)
    private List<Shape> shapeConstrains;

    @Getter
    @Setter
    public static class Shape {
        // Name of the shape (typically used as an identifier or label)
        private String name;

        // The target RDF class that this shape applies to (sh:targetClass)
        private ShaclPair targetClass;

        // A specific RDF node that this shape applies to (sh:targetNode)
        private ShaclPair targetNode;

        // All subjects of a given predicate that this shape applies to (sh:targetSubjectsOf)
        private ShaclPair targetSubjectsOf;

        // All objects of a given predicate that this shape applies to (sh:targetObjectsOf)
        private ShaclPair targetObjectsOf;

        // Validation message to show when the shape is violated (sh:message)
        private String message;

        // Severity level of the validation result: Violation, Warning, or Info (sh:severity)
        private String severity;

        // List of property constraints defined within this shape (sh:property)
        private List<Property> properties;
    }

    @Getter
    @Setter
    public static class Property {
        // Path (predicate) that the property constraint applies to (sh:path)
        private ShaclPair path;

        // Expected datatype for the value of the path (sh:datatype)
        private ShaclPair datatype;

        // Expected type of node: IRI, Literal, or BlankNode (sh:nodeKind)
        private String nodeKind;

        // Minimum number of times the property must appear (sh:minCount)
        private Integer minCount;

        // Maximum number of times the property may appear (sh:maxCount)
        private Integer maxCount;

        // Expected RDF class for the object at this path (sh:class)
        private ShaclPair clazz;

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
        private ShaclPair lessThan;

        // Validation message to show when this property constraint is violated (sh:message)
        private String message;

        // Severity level of this specific property constraint: Violation, Warning, or Info (sh:severity)
        private String severity;
    }

    @Getter
    @Setter
    public static class ShaclPair {
        // Namespace prefix associated with the RDF resource (e.g., "ex" for "http://example.org/")

        public ShaclPair()
        {

        }

        public ShaclPair(String nsPrefix, String name)
        {

            this.nsPrefix = nsPrefix;
            this.name = name;
        }

        private String nsPrefix;

        // Local name within the namespace (e.g., "Person" if full IRI is "http://example.org/Person")
        private String name;
    }
}
