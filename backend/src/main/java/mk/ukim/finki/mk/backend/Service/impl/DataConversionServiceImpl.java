package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.data.DataEntryDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.NamespaceDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.TripletDto;
import mk.ukim.finki.mk.backend.Service.DataConversionService;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataConversionServiceImpl implements DataConversionService
{

    @Override
    public RdfDataDto convertDataTtlToDto(MultipartFile rdfFile) {
        try (InputStream in = rdfFile.getInputStream()) {
            Model model = ModelFactory.createDefaultModel();
            RDFDataMgr.read(model, in, /* baseURI  */ null, /* lang= */ Lang.TURTLE);
            return convertModelToDto(model);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse & map RDF", e);
        }
    }

    private RdfDataDto convertModelToDto(Model model) {
        model.setNsPrefix("rdfs", RDF.getURI());
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
            Resource subj        = entry.getKey();
            String fullUri       = subj.getURI();
            String localSubject  = getLocalName(fullUri);
            String subjPrefix    = qnamePrefix(fullUri, model);
            if (subjPrefix.isEmpty()) subjPrefix = null;

            DataEntryDto de = new DataEntryDto();
            de.setSubject(localSubject);
            de.setSubjectNsPrefix(subjPrefix);
            de.setError(false);
            de.setErrorMsg(null);              // was ""
            de.setTriplets(mapTriplets(entry.getValue(), model));
            entries.add(de);
        }
        return entries;
    }

    private List<TripletDto> mapTriplets(List<Statement> stmts, Model model) {
        return stmts.stream().map(stmt -> {
            // predicate
            String fullPredUri  = stmt.getPredicate().getURI();
            String predLocal    = getLocalName(fullPredUri);
            String predPrefix   = qnamePrefix(fullPredUri, model);
            if (predPrefix.isEmpty()) predPrefix = null;

            // object
            RDFNode objNode = stmt.getObject();
            String objVal;
            String objPrefix = null;

            if (objNode.isResource()) {
                String fullObjUri = objNode.asResource().getURI();
                objVal    = getLocalName(fullObjUri);
                objPrefix = qnamePrefix(fullObjUri, model);
                if (objPrefix.isEmpty()) objPrefix = null;
            } else {
                objVal = objNode.asLiteral().getString();
            }

            TripletDto t = new TripletDto();
            t.setPredicate(predLocal);
            t.setPredicateNsPrefix(predPrefix);
            t.setObject(objVal);
            t.setObjectNsPrefix(objPrefix);
            t.setError(false);
            t.setErrorMsg(null);               // was ""
            return t;
        }).collect(Collectors.toList());
    }

    private String qnamePrefix(String uri, Model model) {
        if (uri == null) {
            return "";
        }
        String qn = model.qnameFor(uri);
        if (qn != null && qn.contains(":")) {
            return qn.substring(0, qn.indexOf(':'));
        }
        return "";
    }

    private String getLocalName(String uri) {
        if (uri == null) return "";
        int idx = Math.max(uri.lastIndexOf('#'), uri.lastIndexOf('/'));
        return (idx != -1 && idx + 1 < uri.length())
                ? uri.substring(idx + 1)
                : uri;
    }


    @Override
    public String convertDataDtoToTtl(RdfDataDto rdfData) {
        Model model = ModelFactory.createDefaultModel();

        if (rdfData.getNamespaces() != null) {
            for (NamespaceDto ns : rdfData.getNamespaces()) {
                model.setNsPrefix(ns.getPrefix(), ns.getUrl());
            }
        }

        if (rdfData.getData() != null) {
            for (DataEntryDto entry : rdfData.getData()) {
                String subjectUri = resolveUri(entry.getSubject(), entry.getSubjectNsPrefix(), rdfData.getNamespaces());
                Resource subject = model.createResource(subjectUri);

                if (entry.getTriplets() != null) {
                    for (TripletDto triplet : entry.getTriplets()) {
                        String predicateUri = resolveUri(triplet.getPredicate(), triplet.getPredicateNsPrefix(), rdfData.getNamespaces());
                        Property predicate = model.createProperty(predicateUri);

                        RDFNode object;
                        if (triplet.getObjectNsPrefix() != null && !triplet.getObjectNsPrefix().isEmpty()) {
                            String objectUri = resolveUri(triplet.getObject(), triplet.getObjectNsPrefix(), rdfData.getNamespaces());
                            object = model.createResource(objectUri);
                        } else {
                            object = createRdfNode(model, triplet.getObject());
                        }

                        if (predicateUri.equals(RDF.type.getURI())) {
                            model.add(subject, RDF.type, object);
                        } else {
                            model.add(subject, predicate, object);
                        }
                    }
                }
            }
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        model.write(out, "TURTLE");
        String result = out.toString();
        return result.replace("rdfs:type", "a");
    }


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
}