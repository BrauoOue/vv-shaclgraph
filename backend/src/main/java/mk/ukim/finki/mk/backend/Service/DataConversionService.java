package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import org.springframework.web.multipart.MultipartFile;

public interface DataConversionService
{
    RdfDataDto convertDataTtlToDto(MultipartFile rdfFile);
    String convertDataDtoToTtl(RdfDataDto rdfData);

}
