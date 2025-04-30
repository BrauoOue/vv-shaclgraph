package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.data.DataEntryDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.NamespaceDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.TripletDto;
import mk.ukim.finki.mk.backend.Service.GochService;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.vocabulary.RDF;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GochServiceImpl implements GochService {

    @Override
    public RdfDataDto processRdf(MultipartFile rdfFile) {
        try (InputStream in = rdfFile.getInputStream()) {
            Model model = ModelFactory.createDefaultModel();
            RDFDataMgr.read(model, in, /* baseURI  */ null, /* lang= */ Lang.TURTLE);
            return convertModelToDto(model);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse & map RDF", e);
        }
    }

    public String convertDtoToTurtleFile(RdfDataDto rdfData) {
        Model model = ModelFactory.createDefaultModel();

        System.out.printf(rdfData.toString());

//        if(rdfData.getNamespaces()==null){
//            System.out.printf("NULLLLLL");
//        }

        // Add namespaces to model
        if (rdfData.getNamespaces() != null) {
            for (NamespaceDto ns : rdfData.getNamespaces()) {
                model.setNsPrefix(ns.getPrefix(), ns.getUrl());
                System.out.printf(ns.toString());
            }
        }

        // Process data entries
        if (rdfData.getData() != null) {
            for (DataEntryDto entry : rdfData.getData()) {
                // Resolve subject URI - FIXED: proper URI construction
                String subjectUri = resolveUri(entry.getSubject(), entry.getSubjectNsPrefix(), rdfData.getNamespaces());
                Resource subject = model.createResource(subjectUri);

                // Process triplets
                if (entry.getTriplets() != null) {
                    for (TripletDto triplet : entry.getTriplets()) {
                        // Resolve predicate URI - FIXED: proper URI construction
                        String predicateUri = resolveUri(triplet.getPredicate(), triplet.getPredicateNsPrefix(), rdfData.getNamespaces());
                        Property predicate = model.createProperty(predicateUri);

                        // Handle object
                        RDFNode object;
                        if (triplet.getObjectNsPrefix() != null && !triplet.getObjectNsPrefix().isEmpty()) {
                            // It's a resource
                            String objectUri = resolveUri(triplet.getObject(), triplet.getObjectNsPrefix(), rdfData.getNamespaces());
                            object = model.createResource(objectUri);
                        } else {
                            // It's a literal or an IRI that doesn't use namespaces
                            object = createRdfNode(model, triplet.getObject());
                        }

                        // Special handling for rdf:type
                        if (predicateUri.equals(RDF.type.getURI())) {
                            model.add(subject, RDF.type, object);
                        } else {
                            model.add(subject, predicate, object);
                        }
                    }
                }
            }
        }

        // Serialize to Turtle as String
        StringWriter writer = new StringWriter();
        model.write(writer, "TURTLE");
        return writer.toString();
    }

    /**
     * Resolves a URI using namespace and local name
     */
    private String resolveUri(String localName, String prefix, List<NamespaceDto> namespaces) {
        if (prefix == null || prefix.isEmpty()) {
            return localName;  // No prefix means it's a full URI already
        }

        // Find the namespace URL for the given prefix
        Optional<NamespaceDto> namespace = namespaces.stream()
                .filter(ns -> ns.getPrefix().equals(prefix))
                .findFirst();

        if (namespace.isPresent()) {
            return namespace.get().getUrl() + localName;
        } else {
            throw new IllegalArgumentException("Undefined namespace prefix: " + prefix);
        }
    }

    /**
     * Creates appropriate RDF node based on value content
     */
    private RDFNode createRdfNode(Model model, String value) {
        // Handle special IRIs like mailto:
        if (value.startsWith("mailto:") || value.startsWith("http://") || value.startsWith("https://")) {
            return model.createResource(value);
        }

        // Handle numeric literals
        if (value.matches("^-?\\d+$")) {
            return model.createTypedLiteral(Integer.parseInt(value), XSDDatatype.XSDinteger);
        }

        if (value.matches("^-?\\d+\\.\\d+$")) {
            return model.createTypedLiteral(Double.parseDouble(value), XSDDatatype.XSDdecimal);
        }

        // Handle boolean literals
        if (value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false")) {
            return model.createTypedLiteral(Boolean.parseBoolean(value), XSDDatatype.XSDboolean);
        }

        // Default to string literal
        return model.createLiteral(value);
    }



//    public byte[] convertDtoToTurtleFile(RdfDataDto rdfData, String filename) {
//        Model model = ModelFactory.createDefaultModel();
//
//        // Add namespaces to model
//        if (rdfData.getNamespaces() != null) {
//            for (NamespaceDto ns : rdfData.getNamespaces()) {
//                model.setNsPrefix(ns.getPrefix(), ns.getUrl());
//            }
//        }
//
//        // Process data entries
//        if (rdfData.getData() != null) {
//            for (DataEntryDto entry : rdfData.getData()) {
//                // Resolve subject URI
//                String subjectUri = resolvePrefixedName(
//                        entry.getSubject(),
//                        entry.getSubjectNsPrefix(),
//                        rdfData.getNamespaces()
//                );
//                Resource subject = model.createResource(subjectUri);
//
//                // Process triplets
//                if (entry.getTriplets() != null) {
//                    for (TripletDto triplet : entry.getTriplets()) {
//
//                        // Resolve predicate URI
//                        String predicateUri = resolvePrefixedName(
//                                triplet.getPredicate(),
//                                triplet.getPredicateNsPrefix(),
//                                rdfData.getNamespaces()
//                        );
//                        Property predicate = model.createProperty(predicateUri);
//
//                        // Handle object
//                        RDFNode object;
//                        if (!triplet.getObjectNsPrefix().isEmpty()) {
//                            String objectUri = resolvePrefixedName(
//                                    triplet.getObject(),
//                                    triplet.getObjectNsPrefix(),
//                                    rdfData.getNamespaces()
//                            );
//                            object = model.createResource(objectUri);
//                        } else {
//                            // Handle special case for typed literals
//
//                                object = model.createLiteral(triplet.getObject());
//
//                        }
//
//                        // Add triple to model (special handling for rdf:type)
//                        if (predicateUri.equals(RDF.type.getURI())) {
//                            model.add(subject, RDF.type, object);
//                        } else {
//                            model.add(subject, predicate, object);
//                        }
//                    }
//                }
//            }
//        }
//
//        // Serialize to Turtle
//        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
//        System.out.println("Writing model to turtle...");
//        System.out.println("Model size: " + model.size());
//        RDFDataMgr.write(outputStream, model, RDFFormat.TURTLE);
//
//        return outputStream.toByteArray();
//    }


    private RdfDataDto convertModelToDto(Model model) {
        RdfDataDto dto = new RdfDataDto();
        dto.setValid(true);                     // always true for now
        dto.setNamespaces(mapPrefixes(model));
        dto.setData(mapEntries(model));
        return dto;
    }

    private List<NamespaceDto> mapPrefixes(Model model) {
        return model.getNsPrefixMap().entrySet().stream()
                .map(e -> new NamespaceDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private List<DataEntryDto> mapEntries(Model model) {
        Map<Resource, List<Statement>> bySubject = model.listStatements()
                .toList()
                .stream()
                .collect(Collectors.groupingBy(Statement::getSubject));

        List<DataEntryDto> entries = new ArrayList<>();
        for (var entry : bySubject.entrySet()) {
            Resource subj = entry.getKey();
            String subjUri    = subj.getURI();
            String subjPrefix = qnamePrefix(subjUri, model);

            DataEntryDto de = new DataEntryDto();
            de.setSubject(subjUri);
            de.setSubjectNsPrefix(subjPrefix);
            de.setError(false);
            de.setErrorMsg("");
            de.setTriplets(mapTriplets(entry.getValue(), model));
            entries.add(de);
        }
        return entries;
    }

    private List<TripletDto> mapTriplets(List<Statement> stmts, Model model) {
        return stmts.stream().map(stmt -> {
            String predUri   = stmt.getPredicate().getURI();
            RDFNode objNode  = stmt.getObject();
            String objVal;
            String objPrefix = "";

            if (objNode.isResource()) {
                objVal     = objNode.asResource().getURI();
                objPrefix  = qnamePrefix(objVal, model);
            } else {
                objVal     = objNode.asLiteral().getString();
            }

            TripletDto t = new TripletDto();
            t.setPredicate(predUri);
            t.setPredicateNsPrefix(qnamePrefix(predUri, model));
            t.setObject(objVal);
            t.setObjectNsPrefix(objPrefix);
            t.setError(false);
            t.setErrorMsg("");
            return t;
        }).collect(Collectors.toList());
    }

    /**
     * Helper: ask Jena for a QName and split off the prefix.
     * Returns "" if none.
     */
    private String qnamePrefix(String uri, Model model) {
        String qn = model.qnameFor(uri);
        if (qn != null && qn.contains(":")) {
            return qn.substring(0, qn.indexOf(':'));
        }
        return "";
    }


}