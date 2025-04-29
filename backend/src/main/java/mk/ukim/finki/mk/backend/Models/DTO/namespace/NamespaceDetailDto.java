package mk.ukim.finki.mk.backend.Models.DTO.namespace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NamespaceDetailDto {
    private String nsPrefix;
    private String URL;
    private List<ShapeDto> shapes;
    private List<PredicateDto> predicates;
}