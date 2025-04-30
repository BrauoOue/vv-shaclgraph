package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.namespace.DomainRangeDto;
import mk.ukim.finki.mk.backend.Models.DTO.namespace.NamespaceDetailDto;
import mk.ukim.finki.mk.backend.Models.DTO.namespace.PredicateDto;
import mk.ukim.finki.mk.backend.Models.DTO.namespace.ShapeDto;
import mk.ukim.finki.mk.backend.Service.NamespaceService;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NamespaceServiceImpl implements NamespaceService {

    private static final List<String> VOCAB_URIS = List.of(
            "http://xmlns.com/foaf/0.1/",
            "http://purl.org/dc/elements/1.1/",
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "http://www.w3.org/2000/01/rdf-schema#",
            "http://www.w3.org/2002/07/owl#"
    );

    private String resolveRedirects(String uri) throws IOException {
        HttpURLConnection conn = (HttpURLConnection) new URL(uri).openConnection();
        conn.setInstanceFollowRedirects(false);
        conn.setRequestProperty("Accept",
                "application/rdf+xml, text/turtle;q=0.9, application/n-triples;q=0.8");
        int code = conn.getResponseCode();
        switch (code) {
            case HttpURLConnection.HTTP_MOVED_PERM:    // 301
            case HttpURLConnection.HTTP_MOVED_TEMP:    // 302
            case HttpURLConnection.HTTP_SEE_OTHER:     // 303
            case 307: // 307
            case 308:                                  // HTTP_PERM_REDIRECT (not in HttpURLConnection)
                String loc = conn.getHeaderField("Location");
                if (loc == null) throw new IOException("Redirect with no Location header from " + uri);
                return resolveRedirects(loc);
            default:
                return uri;  // either 200 or some other non-redirect code
        }
    }

    @Override
    public List<NamespaceDetailDto> fetchAllNamespaces() {
        // Simply fetch each one by URL
        return VOCAB_URIS.stream()
                .map(this::fetchNamespace)
                .collect(Collectors.toList());
    }

    @Override
    public NamespaceDetailDto fetchNamespace(String url) {
        try {
            String finalUri = resolveRedirects(url);
            Model model = ModelFactory.createDefaultModel();
            RDFDataMgr.read(model, finalUri);

            String prefix = model.getNsPrefixMap().entrySet().stream()
                    .filter(e -> e.getValue().equals(url))
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElse("");

            return mapOneNamespace(prefix, url, model);

        } catch (IOException e) {
            throw new RuntimeException("Failed to fetch namespace at " + url, e);
        }
    }

    private NamespaceDetailDto mapOneNamespace(String prefix, String baseUri, Model model) {
        List<ShapeDto> shapes = model.listResourcesWithProperty(RDF.type, RDFS.Class)
                .filterKeep(r -> r.getURI().startsWith(baseUri))
                .mapWith(r -> {
                    // get the raw URI, then turn it into its prefix
                    String definedByUri = getUri(r, RDFS.isDefinedBy);
                    String definedByPrefix = uriToPrefix(definedByUri, model);
                    return new ShapeDto(
                            r.getLocalName(),
                            getLiteral(r, RDFS.label),
                            getLiteral(r, RDFS.comment),
                            definedByPrefix
                    );
                })
                .toList();

        List<PredicateDto> preds = model.listResourcesWithProperty(RDF.type, RDF.Property)
                .filterKeep(r -> r.getURI().startsWith(baseUri))
                .mapWith(r -> {
                    Resource domRes = firstResource(r, RDFS.domain);
                    Resource rngRes = firstResource(r, RDFS.range);

                    DomainRangeDto domDto = domRes != null
                            ? new DomainRangeDto(qnamePrefix(domRes.getURI(), model), domRes.getLocalName())
                            : null;
                    DomainRangeDto rngDto = rngRes != null
                            ? new DomainRangeDto(qnamePrefix(rngRes.getURI(), model), rngRes.getLocalName())
                            : null;

                    String definedByUri = getUri(r, RDFS.isDefinedBy);
                    String definedByPrefix = uriToPrefix(definedByUri, model);

                    return new PredicateDto(
                            r.getLocalName(),
                            getLiteral(r, RDFS.comment),
                            domDto,
                            rngDto,
                            definedByPrefix
                    );
                })
                .toList();

        return new NamespaceDetailDto(prefix, baseUri, shapes, preds);
    }


    private String getLiteral(Resource r, Property p) {
        Statement st = r.getProperty(p);
        return st != null && st.getObject().isLiteral()
                ? st.getString()
                : "";
    }

    private String getUri(Resource r, Property p) {
        Statement st = r.getProperty(p);
        return st != null && st.getObject().isResource()
                ? st.getResource().getURI()
                : "";
    }

    private Resource firstResource(Resource r, Property p) {
        Statement st = r.getProperty(p);
        return (st != null && st.getObject().isResource())
                ? st.getResource()
                : null;
    }

    private String qnamePrefix(String uri, Model model) {
        String qn = model.qnameFor(uri);
        return qn != null && qn.contains(":")
                ? qn.substring(0, qn.indexOf(':'))
                : "";
    }

    private String uriToPrefix(String uri, Model model) {
        if (uri == null || uri.isEmpty()) return "";
        return model.getNsPrefixMap().entrySet().stream()
                .filter(e -> e.getValue().equals(uri))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("");
    }


}