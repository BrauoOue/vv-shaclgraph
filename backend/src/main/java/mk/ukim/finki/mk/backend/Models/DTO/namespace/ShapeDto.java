package mk.ukim.finki.mk.backend.Models.DTO.namespace;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShapeDto {
    private String name;
    private String label;
    private String comment;
    private String isDefinedBy;
}
