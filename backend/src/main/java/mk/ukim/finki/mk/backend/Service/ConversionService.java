package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import org.springframework.web.multipart.MultipartFile;

public interface ConversionService {
    RdfDataDto processRdf(MultipartFile rdfFile);
    byte[] convertDtoToTurtleFile(RdfDataDto rdfData);

}
