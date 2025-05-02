package mk.ukim.finki.mk.backend.Service.impl;


import mk.ukim.finki.mk.backend.Models.DTO.shacl.BHelpers;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.RdfNamespacePair;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.RdfUri;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Service.ShaclConversionService;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.*;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.engine.ShaclPaths;
import org.apache.jena.shacl.engine.Target;
import org.apache.jena.shacl.engine.TargetType;
import org.apache.jena.shacl.parser.*;
import org.apache.jena.sparql.expr.NodeValue;
import org.apache.jena.vocabulary.RDF;
import org.springframework.stereotype.Service;
import org.apache.jena.datatypes.xsd.XSDDatatype;


import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.jena.shacl.engine.constraint.*;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ShaclConversionServiceImpl implements ShaclConversionService
{
    private static String SH_NAMESPACE = "http://www.w3.org/ns/shacl#";

    public ShaclDto convertShaclTtlToDto(MultipartFile shaclFile)
    {
        Model model = ModelFactory.createDefaultModel();

        try
        {
            model.read(shaclFile.getInputStream(), null, "TTL");
        } catch (Exception e)
        {
            throw new RuntimeException("Error reading SHACL content: " + e.getMessage());
        }
        Map<String, String> prefixToNsMap = model.getNsPrefixMap();
        Map<String, String> nsToPrefixMap = BHelpers.invertMap(prefixToNsMap);

        Shapes shapes = Shapes.parse(model);
        ShaclDto dto = new ShaclDto();
        dto.setPrefixToNsMap(prefixToNsMap
                .entrySet()
                .stream()
                .map(entry -> new RdfNamespacePair(entry.getValue(), entry.getKey()))
                .collect(Collectors.toList()));

        List<ShaclDto.Shape> shapeList = new ArrayList<>();

        shapes.forEach(shape ->
        {
            ShaclDto.Shape dtoShape = new ShaclDto.Shape();
            dtoShape.setShapeName(RdfUri.toRdfUri(shape.getShapeNode().toString(), nsToPrefixMap));

            for (Target target : shape.getTargets())
            {
                TargetType type = target.getTargetType();
                Node node = target.getObject();

                if (node == null) continue;

                String uri = node.isURI() ? node.getURI() : node.toString();
                RdfUri pair = RdfUri.toRdfUri(uri, nsToPrefixMap);

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

            //Set the shape's messages and constrains

            dtoShape.setSeverity(RdfUri.toRdfUri(shape.getSeverity().level().toString(), nsToPrefixMap));
            dtoShape.setMessage(shape
                    .getMessages()
                    .iterator()
                    .next()
                    .getLiteralLexicalForm());


            List<ShaclDto.Property> props = new ArrayList<>();

            for (PropertyShape s : shape.getPropertyShapes())
            {
                if (s != null)
                {
                    ShaclDto.Property dtoProp = new ShaclDto.Property();

                    if (s.getPath() != null)
                    {
                        String pathStr = ShaclPaths.pathToString(s.getPath());
                        dtoProp.setPath(RdfUri.toRdfUri(pathStr, nsToPrefixMap));
                    }

                    if (s.getSeverity() != null)
                    {
                        dtoProp.setSeverity(RdfUri.toRdfUri(s.getSeverity().level().toString(), nsToPrefixMap));
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

    public String convertShaclDtoToTtl(ShaclDto dto)
    {
        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("sh", SH_NAMESPACE);

        Map<String, String> nsMap = new HashMap<>();

        dto.getPrefixToNsMap()
                .forEach(ns -> nsMap
                        .put(ns.getPrefix(), ns.getNamespace()));

        nsMap.forEach(model::setNsPrefix);


        for (ShaclDto.Shape shape : dto.getShapeConstrains())
        {
            Resource shapeRes = model.createResource(shape.getShapeName().getFullUri());
            shapeRes.addProperty(RDF.type, model.createResource(SH_NAMESPACE + "NodeShape"));

            // Attach targets
            addTarget(shapeRes, "targetClass", shape.getTargetClass(), model);
            addTarget(shapeRes, "targetNode", shape.getTargetNode(), model);
            addTarget(shapeRes, "targetSubjectsOf", shape.getTargetSubjectsOf(), model);
            addTarget(shapeRes, "targetObjectsOf", shape.getTargetObjectsOf(), model);

            // Message and severity
            if (shape.getMessage() != null)
            {
                shapeRes.addProperty(model.createProperty(SH_NAMESPACE, "message"), shape.getMessage());
            }
            if (shape.getSeverity() != null)
            {
                shapeRes.addProperty(model.createProperty(SH_NAMESPACE, "severity"), model.createResource(shape.getSeverity().getFullUri()));
            }

            // Add property constraints
            if (shape.getProperties() != null)
            {
                for (ShaclDto.Property prop : shape.getProperties())
                {
                    Resource propShape = model.createResource(); // blank node
                    shapeRes.addProperty(model.createProperty(SH_NAMESPACE, "property"), propShape);
                    // Path
                    if (prop.getPath() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "path"),
                                model.createProperty(prop.getPath().getFullUri()));
                    }
                    // Datatype
                    if (prop.getDatatype() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "datatype"),
                                model.createResource(prop.getDatatype().getFullUri()));
                    }
                    // NodeKind
                    if (prop.getNodeKind() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "nodeKind"),
                                model.createResource(SH_NAMESPACE + prop.getNodeKind()));
                    }
                    // Counts
                    if (prop.getMinCount() != null)
                    {
                        Literal literal = model.createTypedLiteral(prop.getMinCount().toString(), XSDDatatype.XSDinteger);
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "minCount"), literal);
                    }
                    if (prop.getMaxCount() != null)
                    {
                        Literal literal = model.createTypedLiteral(prop.getMaxCount().toString(), XSDDatatype.XSDinteger);
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "maxCount"), literal);
                    }
                    // Class
                    if (prop.getClazz() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "class"),
                                model.createResource(prop.getClazz().getFullUri()));
                    }
                    // Pattern
                    if (prop.getPattern() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "pattern"), prop.getPattern());
                    }
                    // In values
                    if (prop.getInValues() != null && !prop.getInValues().isEmpty())
                    {
                        RDFList list = model.createList(prop
                                .getInValues()
                                .stream()
                                .map(model::createLiteral)
                                .iterator());
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "in"), list);
                    }
                    // Min/Max inclusive
                    if (prop.getMinInclusive() != null)
                    {

                        Literal literal = model.createTypedLiteral(prop.getMinInclusive().toString(), XSDDatatype.XSDdecimal);
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "minInclusive"), literal);
                    }
                    if (prop.getMaxInclusive() != null)
                    {
                        Literal literal = model.createTypedLiteral(prop.getMaxInclusive().toString(), XSDDatatype.XSDdecimal);
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "maxInclusive"), literal);
                    }
                    // HasValue
                    if (prop.getHasValue() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "hasValue"), prop.getHasValue());
                    }
                    // LessThan
                    if (prop.getLessThan() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "lessThan"),
                                model.createProperty(prop.getLessThan().getFullUri()));
                    }
                    // Message and severity
                    if (prop.getMessage() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "message"), prop.getMessage());
                    }
                    if (prop.getSeverity() != null)
                    {
                        propShape.addProperty(model.createProperty(SH_NAMESPACE, "severity"),
                                model.createResource(prop.getSeverity().getFullUri()));
                    }
                }
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        model.write(out, "TURTLE");
        return out.toString();
    }

    private static void addTarget(Resource shapeRes, String targetName, RdfUri targetRdfUri, Model model)
    {
        if (targetRdfUri != null)
        {
            Property p = model.createProperty(SH_NAMESPACE, targetName);
            shapeRes.addProperty(p, model.createResource(targetRdfUri.getFullUri()));
        }
    }

    public static class ConstraintVisitor extends ConstraintVisitorBase
    {
        private final ShaclDto.Property dtoProp;
        private final Map<String, String> nsToPrefixMap;

        public ConstraintVisitor(ShaclDto.Property dtoProp, Map<String, String> nsToPrefixMap)
        {
            this.dtoProp = dtoProp;
            this.nsToPrefixMap = nsToPrefixMap;
        }

        @Override
        public void visit(ClassConstraint constraint)
        {
            Node cls = constraint.getExpectedClass();
            String uri = cls.isURI() ? cls.getURI() : cls.toString();
            dtoProp.setClazz(RdfUri.toRdfUri(uri, nsToPrefixMap));
        }


        @Override
        public void visit(DatatypeConstraint constraint)
        {
            dtoProp.setDatatype(RdfUri.toRdfUri(constraint.getDatatype().toString(), nsToPrefixMap));
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
            dtoProp.setLessThan(RdfUri.toRdfUri(constraint.getValue().toString(), nsToPrefixMap));

        }
    }

}
