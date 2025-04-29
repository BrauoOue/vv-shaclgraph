package mk.ukim.finki.mk.backend.Models.DTO.data;

// NamespaceDto.java
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NamespaceDto {
    private String prefix;
    private String url;
}