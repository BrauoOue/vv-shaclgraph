package mk.ukim.finki.mk.backend.Models.DTO.validation;


import lombok.Data;

import java.util.List;

@Data
public class ValidationDto
{
    private final boolean isValid;
    private final List<ValidationError> validationErrors;

    public ValidationDto(boolean isValid, List<ValidationError> validationErrors)
    {
        this.isValid = isValid;
        this.validationErrors = validationErrors;
    }
}