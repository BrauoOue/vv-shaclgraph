package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ShaclService
{
    public ShaclDTO parseShaclToShaclDTO(MultipartFile shaclFile);
    public String parseShaclDTOShacl(ShaclDTO shaclDTO);
}
