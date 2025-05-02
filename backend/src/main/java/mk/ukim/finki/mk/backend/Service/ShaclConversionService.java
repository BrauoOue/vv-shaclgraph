package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import org.springframework.web.multipart.MultipartFile;

public interface ShaclConversionService
{
    ShaclDto convertShaclTtlToDto(MultipartFile shaclFile);
    String convertShaclDtoToTtl(ShaclDto shaclDTO);
}
