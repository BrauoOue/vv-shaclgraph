package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RdfUri
{
    private String namespace;
    private String nsPrefix;
    private String resource;

    public RdfUri()
    {
    }

    public RdfUri(String nsPrefix, String resource)
    {
        this.nsPrefix = nsPrefix;
        this.resource = resource;
        this.namespace = "None";
    }

    public RdfUri(String nsPrefix, String resource, String namespace)
    {
        this.nsPrefix = nsPrefix;
        this.resource = resource;
        this.namespace = namespace;
    }

    public static String cleanArrows(String string)
    {
        if (string.charAt(0) == '<')
        {
            string = string.substring(1);
        }

        if (string.charAt(string.length() - 1) == '>')
        {
            string = string.substring(0, string.length() - 1);
        }
        return string;
    }

    public static String putArrows(String string)
    {
        if (string.charAt(0) != '<')
        {
            string = "<" + string;
        }

        if (string.charAt(string.length() - 1) != '>')
        {
            string = string + '>';
        }
        return string;
    }


    public static RdfUri toRdfUri(String fullUri, Map<String, String> prefixMap)
    {
        RdfUri pair = new RdfUri();
        int idx = Math.max(fullUri.lastIndexOf('#'), fullUri.lastIndexOf('/'));
        if (idx != -1)
        {
            String namespace = cleanArrows(fullUri.substring(0, idx + 1));
            String nsPrefix = null;
            String resource = fullUri.substring(idx + 1);

            if (prefixMap != null)
            {
                nsPrefix = prefixMap.get(cleanArrows(namespace));
            }

            if (BHelpers.isNullOrEmpty(nsPrefix))
            {
                nsPrefix = "Not found";
            }

            pair.setNamespace(namespace);
            pair.setNsPrefix(nsPrefix);
            pair.setResource(cleanArrows(resource));
        }
        else
        {
            pair.setNamespace(cleanArrows(fullUri));
            pair.setNsPrefix("Not found");
            pair.setResource("Not found");
        }
        return pair;
    }

    @JsonIgnore
    public String getFullUri()
    {
        return this.namespace + this.resource;
    }
}
