package mk.ukim.finki.mk.backend.Service.impl;


import mk.ukim.finki.mk.backend.Models.DTO.shacl.BHelpers;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.RdfNamespace;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.RdfPair;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import mk.ukim.finki.mk.backend.Service.ShaclService;
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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.jena.shacl.engine.constraint.*;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ShaclServiceImpl implements ShaclService
{
    private static String SH = "http://www.w3.org/ns/shacl#";

    public ShaclDTO parseShaclToShaclDTO(MultipartFile shaclFile)
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
        ShaclDTO dto = new ShaclDTO();
        dto.setPrefixToNsMap(prefixToNsMap.entrySet().stream().map(entry->new RdfNamespace(entry.getValue(), entry.getKey())).collect(Collectors.toList()));
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

    public String parseShaclDTOShacl(ShaclDTO dto)
    {
        Model model = ModelFactory.createDefaultModel();

        // Register SHACL prefix
        model.setNsPrefix("sh", SH);

        // Register namespace prefixes from DTO
        Map<String, String> nsMap = new HashMap<>();
        nsMap.forEach(model::setNsPrefix);


        for (ShaclDTO.Shape shape : dto.getShapeConstrains())
        {
            // Create a SH NodeShape resource
            Resource shapeRes = model.createResource(getFullUri(shape.getName(), nsMap));
            shapeRes.addProperty(RDF.type, model.createResource(SH + "NodeShape"));

            // Attach targets
            addTarget(shapeRes, "targetClass", shape.getTargetClass(), model, nsMap);
            addTarget(shapeRes, "targetNode", shape.getTargetNode(), model, nsMap);
            addTarget(shapeRes, "targetSubjectsOf", shape.getTargetSubjectsOf(), model, nsMap);
            addTarget(shapeRes, "targetObjectsOf", shape.getTargetObjectsOf(), model, nsMap);
            // Message and severity
            if (shape.getMessage() != null)
            {
                shapeRes.addProperty(model.createProperty(SH, "message"), shape.getMessage());
            }
            if (shape.getSeverity() != null)
            {
                Resource sev = model.createResource(getFullUri(shape.getSeverity(), nsMap));
                shapeRes.addProperty(model.createProperty(SH, "severity"), sev);
            }

            // Add property constraints
            if (shape.getProperties() != null)
            {
                for (ShaclDTO.Property prop : shape.getProperties())
                {
                    Resource propShape = model.createResource(); // blank node
                    shapeRes.addProperty(model.createProperty(SH, "property"), propShape);
                    // Path
                    if (prop.getPath() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "path"),
                                model.createProperty(getFullUri(prop.getPath(), nsMap)));
                    }
                    // Datatype
                    if (prop.getDatatype() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "datatype"),
                                model.createResource(getFullUri(prop.getDatatype(), nsMap)));
                    }
                    // NodeKind
                    if (prop.getNodeKind() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "nodeKind"),
                                model.createResource(SH + prop.getNodeKind()));
                    }
                    // Counts
                    if (prop.getMinCount() != null)
                    {
                        propShape.addLiteral(model.createProperty(SH, "minCount"), prop.getMinCount());
                    }
                    if (prop.getMaxCount() != null)
                    {
                        propShape.addLiteral(model.createProperty(SH, "maxCount"), prop.getMaxCount());
                    }
                    // Class
                    if (prop.getClazz() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "class"),
                                model.createResource(getFullUri(prop.getClazz(), nsMap)));
                    }
                    // Pattern
                    if (prop.getPattern() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "pattern"), prop.getPattern());
                    }
                    // In values
                    if (prop.getInValues() != null && !prop.getInValues().isEmpty())
                    {
                        RDFList list = model.createList(prop.getInValues().stream()
                                .map(model::createLiteral).iterator());
                        propShape.addProperty(model.createProperty(SH, "in"), list);
                    }
                    // Min/Max inclusive
                    if (prop.getMinInclusive() != null)
                    {
                        propShape.addLiteral(model.createProperty(SH, "minInclusive"), prop.getMinInclusive());
                    }
                    if (prop.getMaxInclusive() != null)
                    {
                        propShape.addLiteral(model.createProperty(SH, "maxInclusive"), prop.getMaxInclusive());
                    }
                    // HasValue
                    if (prop.getHasValue() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "hasValue"), prop.getHasValue());
                    }
                    // LessThan
                    if (prop.getLessThan() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "lessThan"),
                                model.createProperty(getFullUri(prop.getLessThan(), nsMap)));
                    }
                    // Message and severity
                    if (prop.getMessage() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "message"), prop.getMessage());
                    }
                    if (prop.getSeverity() != null)
                    {
                        propShape.addProperty(model.createProperty(SH, "severity"),
                                model.createResource(getFullUri(prop.getSeverity(), nsMap)));
                    }
                }
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        model.write(out, "TURTLE");
        return out.toString(); // defaults to UTF-8
    }

    private static void addTarget(Resource shapeRes, String targetName, RdfPair pair, Model model, Map<String, String> nsMap)
    {
        if (pair != null)
        {

            Property p = model.createProperty(SH, targetName);
            if ("targetClass".equals(targetName))
            {
                shapeRes.addProperty(p, model.createResource(getFullUri(pair, nsMap)));
            }
            else
            {
                shapeRes.addProperty(p, model.createProperty(getFullUri(pair, nsMap)));
            }
        }
    }

    private static Map<String, String> collectNamespaces(ShaclDTO dto)
    {
        Map<String, String> map = new HashMap<>();
        dto.getShapeConstrains().forEach(shape ->
        {
            collect(shape.getTargetClass(), map);
            collect(shape.getTargetNode(), map);
            collect(shape.getTargetSubjectsOf(), map);
            collect(shape.getTargetObjectsOf(), map);
            if (shape.getProperties() != null)
            {
                shape.getProperties().forEach(prop ->
                {
                    collect(prop.getPath(), map);
                    collect(prop.getDatatype(), map);
                    collect(prop.getClazz(), map);
                    collect(prop.getLessThan(), map);
                    RdfPair sev = prop.getSeverity();
                    if (sev != null) collect(sev, map);
                });
            }
            RdfPair sev = shape.getSeverity() != null ? new RdfPair(shape.getSeverity(), shape.getSeverity(), null) : null;
            if (sev != null) collect(sev, map);
        });
        return map;
    }

    private static void collect(RdfPair rp, Map<String, String> map)
    {
        if (rp != null && rp.getNsPrefix() != null && rp.getNamespace() != null && !"None".equals(rp.getNamespace()))
        {
            map.put(rp.getNsPrefix(), rp.getNamespace());
        }
    }

    private static String getFullUri(String name, Map<String, String> nsMap)
    {
        // If name contains colon, prefix:name
        if (name.contains(":"))
        {
            String[] parts = name.split(":", 2);
            String prefix = parts[0];
            String local = parts[1];
            String ns = nsMap.get(prefix);
            if (ns != null) return ns + local;
        }
        return name;
    }

    private static String getFullUri(RdfPair pair, Map<String, String> nsMap)
    {
        if (pair.getNamespace() != null && !"None".equals(pair.getNamespace()))
        {
            return pair.getNamespace() + pair.getName();
        }
        else if (pair.getNsPrefix() != null && nsMap.containsKey(pair.getNsPrefix()))
        {
            return nsMap.get(pair.getNsPrefix()) + pair.getName();
        }
        else
        {
            return pair.getName();
        }
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
        public void visit(DatatypeConstraint constraint)
        {
            dtoProp.setDatatype(RdfPair.toPair(constraint.getDatatype().toString(), nsToPrefixMap));
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
