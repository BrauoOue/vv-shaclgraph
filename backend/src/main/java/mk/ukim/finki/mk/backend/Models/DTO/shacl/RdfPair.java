package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RdfPair
{
    private String namespace;
    private String nsPrefix;
    private String name;

    public RdfPair()
    {
    }

    public RdfPair(String nsPrefix, String name)
    {
        this.nsPrefix = nsPrefix;
        this.name = name;
        this.namespace = "None";
    }

    public RdfPair(String nsPrefix, String name, String namespace)
    {
        this.nsPrefix = nsPrefix;
        this.name = name;
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


    public static RdfPair toPair(String fullUri, Map<String, String> prefixMap)
    {
        RdfPair pair = new RdfPair();
        int idx = Math.max(fullUri.lastIndexOf('#'), fullUri.lastIndexOf('/'));
        if (idx != -1)
        {
            String namespace = cleanArrows(fullUri.substring(0, idx + 1));
            String nsPrefix = null;
            String name = fullUri.substring(idx + 1);

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
            pair.setName(cleanArrows(name));
        }
        else
        {
            pair.setNamespace(cleanArrows(fullUri));
            pair.setNsPrefix("Not found");
            pair.setName("Not found");
        }
        return pair;
    }
}
