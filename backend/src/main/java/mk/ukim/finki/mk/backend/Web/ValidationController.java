package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Models.DTO.ValidationError;
import mk.ukim.finki.mk.backend.Service.ShaclValidationService;
import org.apache.jena.shacl.ValidationReport;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/validate")
public class ValidationController
{

    private final ShaclValidationService validationService;

    public ValidationController(ShaclValidationService validationService)
    {
        this.validationService = validationService;
    }


    @GetMapping()
    public ResponseEntity<ShaclValidationDTO> validate()
    {
        ShaclValidationDTO result = this.validationService.validateRdfAgainstShacl("data.ttl", "shapes.ttl");
        return ResponseEntity.ok(result);
    }
}