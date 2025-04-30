package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationError;

import java.util.List;

public record ShaclValidationDTO(
        boolean isValid,
        List<ValidationError> validationErrors
)
{
}
