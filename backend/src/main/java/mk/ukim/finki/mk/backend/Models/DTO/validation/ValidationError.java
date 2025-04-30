package mk.ukim.finki.mk.backend.Models.DTO.validation;

public record ValidationError(
        String node,
        String property,
        String errorMessage)
{
}
