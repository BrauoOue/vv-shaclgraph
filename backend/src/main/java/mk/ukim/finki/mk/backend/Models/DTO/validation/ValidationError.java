package mk.ukim.finki.mk.backend.Models.DTO.validation;

import lombok.Data;

@Data
public class ValidationError{
    private final String node;
    private final String property;
    private final String errorMessage;

    public ValidationError(String node, String property, String errorMessage) {
        this.node = node;
        this.property = property;
        this.errorMessage = errorMessage;
    }
}