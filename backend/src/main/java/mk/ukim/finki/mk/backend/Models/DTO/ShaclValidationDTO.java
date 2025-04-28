package mk.ukim.finki.mk.backend.Models.DTO;

import java.util.List;

public record ShaclValidationDTO(
        boolean isValid,
        List<ValidationError> validationErrors
)
{
}
