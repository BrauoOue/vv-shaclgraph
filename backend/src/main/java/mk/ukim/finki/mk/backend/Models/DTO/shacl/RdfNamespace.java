package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RdfNamespace
{
    private String namespace;
    private String prefix;
}