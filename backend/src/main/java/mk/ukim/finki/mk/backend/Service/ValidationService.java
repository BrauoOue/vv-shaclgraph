package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationDto;

public interface ValidationService
{
    ValidationDto validateRdfAgainstShacl(ShaclDto shacl, RdfDataDto data);
}
