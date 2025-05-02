package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Service.impl.ShaclValidationServiceImpl;
import mk.ukim.finki.mk.backend.Service.impl.ShaclConversionServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/validate")
public class ValidationController
{

    private final ShaclValidationServiceImpl validationService;


    public ValidationController(ShaclValidationServiceImpl validationService)
    {

        this.validationService = validationService;
    }


    @GetMapping("/testValidate")
    public ResponseEntity<ShaclValidationDTO> validate()
    {
        ShaclValidationDTO result = this.validationService.validateRdfAgainstShacl("data.ttl", "shapes.ttl");
        return ResponseEntity.ok(result);
    }
}