package mk.ukim.finki.mk.backend.Models.DTO.namespace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomainRangeDto {
    private String nsPrefix;
    private String domainType;
}