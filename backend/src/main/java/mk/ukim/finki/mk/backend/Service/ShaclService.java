package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;

public interface ShaclService
{
    public ShaclDTO parseShaclToShaclDTO(String shaclContent);
}
