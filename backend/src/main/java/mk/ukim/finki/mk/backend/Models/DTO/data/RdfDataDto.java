package mk.ukim.finki.mk.backend.Models.DTO.data;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RdfDataDto {
    private boolean valid;
    private List<NamespaceDto> namespaces;
    private List<DataEntryDto> data;
}