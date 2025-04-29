package mk.ukim.finki.mk.backend.Models.DTO.namespace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredicateDto {
    private String name;
    private String comment;
    private DomainRangeDto domain;
    private DomainRangeDto range;
    private String isDefinedBy;
}