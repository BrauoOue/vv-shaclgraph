package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.validation.ShaclValidationDTO;

public interface ShaclValidationService {
    ShaclValidationDTO validateRdfAgainstShacl(String dataFilePath, String shapesFilePath);
}
