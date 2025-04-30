package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclValidationDTO;

public interface ShaclValidationService {
    ShaclValidationDTO validateRdfAgainstShacl(String dataFilePath, String shapesFilePath);
}
