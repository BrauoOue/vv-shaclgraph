package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RdfNamespacePair
{
    @JsonProperty("url")
    private String namespace;
    private String prefix;
}