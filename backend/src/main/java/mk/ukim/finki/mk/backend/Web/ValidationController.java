package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Service.ShaclValidationService;
import mk.ukim.finki.mk.backend.Service.impl.ShaclServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/validate")
public class ValidationController {

    private final ShaclValidationService validationService;

    private final ShaclServiceImpl shaclValidationServiceViktor;

    public ValidationController(ShaclValidationService validationService, ShaclServiceImpl shaclValidationServiceViktor)
    {

        this.validationService = validationService;
        this.shaclValidationServiceViktor = shaclValidationServiceViktor;
    }


    @GetMapping()
    public ResponseEntity<ShaclValidationDTO> validate() {
        ShaclValidationDTO result = this.validationService.validateRdfAgainstShacl("data.ttl", "shapes.ttl");
        return ResponseEntity.ok(result);
    }

    @PostMapping(
            path = "/shaclToJson",
            consumes = MediaType.TEXT_PLAIN_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ShaclDTO> parseShacl(@RequestBody String shaclContent) {
        ShaclDTO dto = shaclValidationServiceViktor.parseShaclToShaclDTO(shaclContent);
        return ResponseEntity.ok(dto);
    }
}