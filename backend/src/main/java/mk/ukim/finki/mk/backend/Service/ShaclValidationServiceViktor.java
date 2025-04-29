package mk.ukim.finki.mk.backend.Service;


import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.engine.ShaclPaths;
import org.apache.jena.shacl.engine.Target;
import org.apache.jena.shacl.engine.TargetType;
import org.apache.jena.shacl.parser.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.jena.shacl.engine.constraint.*;


@Service
public class ShaclValidationServiceViktor
{

    public ShaclDTO parseShaclToShaclDTO(String shaclContent)
    {
        Model model = ModelFactory.createDefaultModel();
        try (ByteArrayInputStream input = new ByteArrayInputStream(shaclContent.getBytes(StandardCharsets.UTF_8)))
        {
            model.read(input, null, "TTL");
        } catch (Exception e)
        {
            throw new RuntimeException("Error reading SHACL content: " + e.getMessage());
        }

        Shapes shapes = Shapes.parse(model);
        ShaclDTO dto = new ShaclDTO();
        List<ShaclDTO.Shape> shapeList = new ArrayList<>();

        shapes.forEach(shape ->
        {
            ShaclDTO.Shape dtoShape = new ShaclDTO.Shape();
            dtoShape.setName(shape.getShapeNode().toString());

            for (Target target : shape.getTargets())
            {
                TargetType type = target.getTargetType();
                Node node = target.getObject();

                if (node == null) continue;

                String uri = node.isURI() ? node.getURI() : node.toString();
                ShaclDTO.ShaclPair pair = toPair(uri);

                switch (type)
                {
                    case targetClass:
                        dtoShape.setTargetClass(pair);
                        break;
                    case targetNode:
                        dtoShape.setTargetNode(pair);
                        break;
                    case targetSubjectsOf:
                        dtoShape.setTargetSubjectsOf(pair);
                        break;
                    case targetObjectsOf:
                        dtoShape.setTargetObjectsOf(pair);
                        break;
                }


            }
            List<ShaclDTO.Property> props = new ArrayList<>();

            for (PropertyShape s : shape.getPropertyShapes())
            {
                if (s != null)
                {
                    ShaclDTO.Property dtoProp = new ShaclDTO.Property();

                    // Path (predicate)
                    if (s.getPath() != null)
                    {
                        String pathStr = ShaclPaths.pathToString(s.getPath());
                        dtoProp.setPath(toPair(pathStr));
                    }

                    // Severity (specific to the property)
                    if (s.getSeverity() != null)
                    {
                        dtoProp.setSeverity(s.getSeverity().toString());
                    }

                    // Messages (only first one taken if multiple)
                    if (!s.getMessages().isEmpty())
                    {
                        dtoProp.setMessage(s.getMessages().iterator().next().getLiteralLexicalForm());
                    }

                    // Constraints (handle manually)
                    for (Constraint constraint : s.getConstraints())
                    {
                        constraint.visit(new ConstraintVisitor(dtoProp));
                    }

                    props.add(dtoProp);
                }
                dtoShape.setProperties(props);
            }
            shapeList.add(dtoShape);

        });
        dto.setShapeConstrains(shapeList);


        return dto;


    }

    private ShaclDTO.ShaclPair toPair(String fullUri)
    {
        ShaclDTO.ShaclPair pair = new ShaclDTO.ShaclPair();
        int idx = Math.max(fullUri.lastIndexOf('#'), fullUri.lastIndexOf('/'));
        if (idx != -1)
        {
            pair.setNsPrefix(fullUri.substring(0, idx + 1));
            pair.setName(fullUri.substring(idx + 1));
        }
        else
        {
            pair.setNsPrefix("");
            pair.setName(fullUri);
        }
        return pair;
    }

    public class ConstraintVisitor extends ConstraintVisitorBase
    {
        private final ShaclDTO.Property dtoProp;

        public ConstraintVisitor(ShaclDTO.Property dtoProp)
        {
            this.dtoProp = dtoProp;
        }

        @Override
        public void visit(ClassConstraint constraint)
        {
            // sh:class → expected RDF class
            Node cls = constraint.getExpectedClass();                            // :contentReference[oaicite:0]{index=0}
            String uri = cls.isURI() ? cls.getURI() : cls.toString();
            dtoProp.setClazz(toPair(uri));
        }

        @Override
        public void visit(NodeKindConstraint constraint)
        {
            // sh:nodeKind → IRI | Literal | BlankNode
            dtoProp.setNodeKind(constraint.getKind().getLocalName());           // :contentReference[oaicite:1]{index=1}
        }

        @Override
        public void visit(MinCount constraint)
        {
            // sh:minCount → minimum cardinality
            dtoProp.setMinCount(constraint.getMinCount());                     // :contentReference[oaicite:2]{index=2}
        }

        @Override
        public void visit(MaxCount constraint)
        {
            // sh:maxCount → maximum cardinality
            dtoProp.setMaxCount(constraint.getMaxCount());                     // :contentReference[oaicite:3]{index=3}
        }

        @Override
        public void visit(PatternConstraint constraint)
        {
            // sh:pattern → regex string
            dtoProp.setPattern(constraint.getPattern());                       // :contentReference[oaicite:4]{index=4}
        }

        @Override
        public void visit(InConstraint constraint)
        {
            // sh:in → list of allowed RDF terms
            List<String> inValues = constraint.getValues().stream()            // :contentReference[oaicite:5]{index=5}
                    .map(n -> n.isURI() ? n.getURI() : n.toString())
                    .collect(Collectors.toList());
            dtoProp.setInValues(inValues);
        }

        @Override
        public void visit(HasValueConstraint constraint)
        {
            // sh:hasValue → specific required value
            Node v = constraint.getValue();
            String uri = v.isURI() ? v.getURI() : v.toString();
            dtoProp.setHasValue(uri);
        }

        @Override
        public void visit(ValueMinInclusiveConstraint constraint)
        {
            // sh:minInclusive → minimum allowed (numeric)
            //TODO: Check correctness of this
            String lex = constraint.getNodeValue().getString();
//            String lex = constraint.getValue().getLiteralLexicalForm();
            dtoProp.setMinInclusive(lex == null ? null : Double.parseDouble(lex));
        }

        @Override
        public void visit(ValueMaxInclusiveConstraint constraint)
        {
            // sh:maxInclusive → maximum allowed (numeric)
            //TODO: Check correctness of this
            String lex = constraint.getNodeValue().getString();
//            String lex = constraint.getValue().getLiteralLexicalForm();
            dtoProp.setMaxInclusive(lex == null ? null : Double.parseDouble(lex));
        }

        @Override
        public void visit(LessThanConstraint constraint)
        {
            //TODO:Implement this later
            dtoProp.setLessThan(new ShaclDTO.ShaclPair("NOT IMPLEMENTED", "NOT IMPLEMENTED"));
//            // sh:lessThan → another path whose value must be greater
//            Path other = constraint.getOtherPath();
//            String pathStr = ShaclPaths.str(other);
//            dtoProp.setLessThan(toPair(pathStr));
        }
    }

}
