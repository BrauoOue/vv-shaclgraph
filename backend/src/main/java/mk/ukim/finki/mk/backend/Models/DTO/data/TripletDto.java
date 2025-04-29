package mk.ukim.finki.mk.backend.Models.DTO.data;
// TripletDto.java
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripletDto {
    private String predicate;
    private String predicateNsPrefix;
    private String object;
    private String objectNsPrefix;
    private boolean error;
    private String errorMsg;
}