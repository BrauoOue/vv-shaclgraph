package mk.ukim.finki.mk.backend.Service.impl;


import mk.ukim.finki.mk.backend.Models.DTO.shacl.BHelpers;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.RdfPair;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import mk.ukim.finki.mk.backend.Service.ShaclService;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.engine.ShaclPaths;
import org.apache.jena.shacl.engine.Target;
import org.apache.jena.shacl.engine.TargetType;
import org.apache.jena.shacl.parser.*;
import org.apache.jena.sparql.expr.NodeValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.jena.shacl.engine.constraint.*;


@Service
public class ShaclServiceImpl implements ShaclService
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
        Map<String, String> nsToPrefixMap = BHelpers.invertMap(model.getNsPrefixMap());

        Shapes shapes = Shapes.parse(model);
        ShaclDTO dto = new ShaclDTO();
        List<ShaclDTO.Shape> shapeList = new ArrayList<>();

        shapes.forEach(shape ->
        {
            ShaclDTO.Shape dtoShape = new ShaclDTO.Shape();
            dtoShape.setName(RdfPair.toPair(shape.getShapeNode().toString(), null).getName());

            for (Target target : shape.getTargets())
            {
                TargetType type = target.getTargetType();
                Node node = target.getObject();

                if (node == null) continue;

                String uri = node.isURI() ? node.getURI() : node.toString();
                RdfPair pair = RdfPair.toPair(uri, nsToPrefixMap);

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

                    if (s.getPath() != null)
                    {
                        String pathStr = ShaclPaths.pathToString(s.getPath());
                        dtoProp.setPath(RdfPair.toPair(pathStr, nsToPrefixMap));
                    }

                    if (s.getSeverity() != null)
                    {
                        dtoProp.setSeverity(RdfPair.toPair(s.getSeverity().level().toString(), nsToPrefixMap));
                    }

                    if (!s.getMessages().isEmpty())
                    {
                        dtoProp.setMessage(s.getMessages().iterator().next().getLiteralLexicalForm());
                    }

                    for (Constraint constraint : s.getConstraints())
                    {
                        constraint.visit(new ConstraintVisitor(dtoProp, nsToPrefixMap));
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

    public static class ConstraintVisitor extends ConstraintVisitorBase
    {
        private final ShaclDTO.Property dtoProp;
        private final Map<String, String> nsToPrefixMap;

        public ConstraintVisitor(ShaclDTO.Property dtoProp, Map<String, String> nsToPrefixMap)
        {
            this.dtoProp = dtoProp;
            this.nsToPrefixMap = nsToPrefixMap;
        }

        @Override
        public void visit(ClassConstraint constraint)
        {
            Node cls = constraint.getExpectedClass();
            String uri = cls.isURI() ? cls.getURI() : cls.toString();
            dtoProp.setClazz(RdfPair.toPair(uri, nsToPrefixMap));
        }

        @Override
        public void visit(NodeKindConstraint constraint)
        {
            dtoProp.setNodeKind(constraint.getKind().getLocalName());
        }

        @Override
        public void visit(MinCount constraint)
        {
            dtoProp.setMinCount(constraint.getMinCount());
        }

        @Override
        public void visit(MaxCount constraint)
        {
            dtoProp.setMaxCount(constraint.getMaxCount());
        }

        @Override
        public void visit(PatternConstraint constraint)
        {
            dtoProp.setPattern(constraint.getPattern());
        }

        @Override
        public void visit(InConstraint constraint)
        {
            List<String> inValues = constraint.getValues().stream()
                    .map(
                            n -> n.isURI() ? n.getURI() : n.toString().replace("\"", "")
                    )
                    .collect(Collectors.toList());
            dtoProp.setInValues(inValues);
        }

        @Override
        public void visit(HasValueConstraint constraint)
        {
            Node v = constraint.getValue();
            String uri = v.isURI() ? v.getURI() : v.toString();
            dtoProp.setHasValue(uri);
        }

        @Override
        public void visit(ValueMinInclusiveConstraint constraint)
        {
            NodeValue nodeValue = constraint.getNodeValue();
            String lex = nodeValue.toString();
            dtoProp.setMinInclusive(lex == null ? null : Double.parseDouble(lex));
        }

        @Override
        public void visit(ValueMaxInclusiveConstraint constraint)
        {
            String lex = constraint.getNodeValue().toString();
            dtoProp.setMaxInclusive(lex == null ? null : Double.parseDouble(lex));
        }

        @Override
        public void visit(LessThanConstraint constraint)
        {
            dtoProp.setLessThan(RdfPair.toPair(constraint.getValue().toString(), nsToPrefixMap));

        }
    }

}
