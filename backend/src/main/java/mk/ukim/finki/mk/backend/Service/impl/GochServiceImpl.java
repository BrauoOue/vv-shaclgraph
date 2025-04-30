package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.data.DataEntryDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.NamespaceDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.TripletDto;
import mk.ukim.finki.mk.backend.Service.GochService;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
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

    @Override
    public byte[] convertDtoToTurtleFile(RdfDataDto rdfData, String filename) {
        Model model = ModelFactory.createDefaultModel();

        // 1. Add namespace prefixes
        if (rdfData.getNamespaces() != null) {
            for (NamespaceDto ns : rdfData.getNamespaces()) {
                model.setNsPrefix(ns.getPrefix(), ns.getUrl());
            }
        }

        // 2. Build RDF triples from DTO
        if (rdfData.getData() != null) {
            for (DataEntryDto entry : rdfData.getData()) {
                String subjectUri = buildPrefixedUri(entry.getSubjectNsPrefix(), entry.getSubject(), model);
                Resource subject = model.createResource(subjectUri);

                if (entry.getTriplets() != null) {
                    for (TripletDto triplet : entry.getTriplets()) {
                        String predicateUri = buildPrefixedUri(triplet.getPredicateNsPrefix(), triplet.getPredicate(), model);
                        Property predicate = model.createProperty(predicateUri);

                        RDFNode object;
                        if (triplet.getObjectNsPrefix() != null && !triplet.getObjectNsPrefix().isEmpty()) {
                            // Resource object (prefixed)
                            String objectUri = buildPrefixedUri(triplet.getObjectNsPrefix(), triplet.getObject(), model);
                            object = model.createResource(objectUri);
                        } else {
                            // Literal object
                            object = parseLiteral(triplet.getObject());
                        }

                        model.add(subject, predicate, object);
                    }
                }
            }
        }

        // 3. Serialize model as Turtle
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        RDFDataMgr.write(outputStream, model, RDFFormat.TURTLE_PRETTY);
        return outputStream.toByteArray();
    }


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
        if (uri == null) {
            return "";
        }
        String qn = model.qnameFor(uri);
        if (qn != null && qn.contains(":")) {
            return qn.substring(0, qn.indexOf(':'));
        }
        return "";
    }

    private String buildPrefixedUri(String prefix, String localName, Model model) {
        String nsUri = model.getNsPrefixURI(prefix);
        if (nsUri == null) {
            throw new IllegalArgumentException("Unknown namespace prefix: " + prefix);
        }
        return nsUri + localName;
    }

    private RDFNode parseLiteral(String value) {
        // Basic type guessing (extend as needed)
        if (value.matches("-?\\d+")) {
            return ResourceFactory.createTypedLiteral(Integer.parseInt(value));
        }
        if (value.matches("-?\\d+\\.\\d+")) {
            return ResourceFactory.createTypedLiteral(Double.parseDouble(value));
        }
        if (value.startsWith("mailto:")) {
            return ResourceFactory.createResource(value); // IRI, not literal
        }
        return ResourceFactory.createPlainLiteral(value);
    }

}