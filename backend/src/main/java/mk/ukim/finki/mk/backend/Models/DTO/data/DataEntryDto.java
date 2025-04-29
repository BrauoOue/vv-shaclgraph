package mk.ukim.finki.mk.backend.Models.DTO.data;
// DataEntryDto.java
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataEntryDto {
    private String subject;
    private String subjectNsPrefix;
    private boolean error;
    private String errorMsg;
    private List<TripletDto> triplets;
}