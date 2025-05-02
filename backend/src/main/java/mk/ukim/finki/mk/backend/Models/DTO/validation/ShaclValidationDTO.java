package mk.ukim.finki.mk.backend.Models.DTO.validation;

import java.util.List;

public record ShaclValidationDTO(
        boolean isValid,
        List<ValidationError> validationErrors
)
{
}
