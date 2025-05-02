package mk.ukim.finki.mk.backend.Models.DTO.validation;


import lombok.Data;

import java.util.List;

@Data
public class ShaclValidationDTO{
    private final boolean isValid;
    private final List<ValidationError> validationErrors;

    public ShaclValidationDTO(boolean isValid, List<ValidationError> validationErrors) {
        this.isValid = isValid;
        this.validationErrors = validationErrors;
    }
}