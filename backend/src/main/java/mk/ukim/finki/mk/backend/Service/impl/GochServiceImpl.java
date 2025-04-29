package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.data.DataEntryDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.NamespaceDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.TripletDto;
import mk.ukim.finki.mk.backend.Service.GochService;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
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