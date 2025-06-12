package mk.ukim.finki.mk.backend.Models.DTO.validation;

import lombok.Data;

@Data
public class ValidationError
{
    private final String subject;
    private final String property;
    private final String errorMessage;

    public ValidationError(String subject, String property, String errorMessage)
    {
        this.subject = subject;
        this.property = property;
        this.errorMessage = errorMessage;
    }
}