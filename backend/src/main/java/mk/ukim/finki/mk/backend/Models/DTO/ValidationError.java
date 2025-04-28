package mk.ukim.finki.mk.backend.Models.DTO;

public record ValidationError(
        String node,
        String property,
        String errorMessage)
{
}
