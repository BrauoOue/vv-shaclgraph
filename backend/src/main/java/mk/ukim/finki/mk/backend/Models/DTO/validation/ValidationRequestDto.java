package mk.ukim.finki.mk.backend.Models.DTO.validation;

import lombok.Getter;
import lombok.Setter;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;


@Getter
@Setter
public class ValidationRequestDto
{
    private ShaclDto shacl;
    private RdfDataDto data;

    public ValidationRequestDto(ShaclDto shacl, RdfDataDto data)
    {
        this.shacl = shacl;
        this.data = data;
    }
}
