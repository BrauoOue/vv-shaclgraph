package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.ShaclDTO;
import mk.ukim.finki.mk.backend.Models.DTO.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Models.DTO.ValidationError;
import mk.ukim.finki.mk.backend.Service.ShaclValidationService;
import mk.ukim.finki.mk.backend.Service.ShaclValidationServiceViktor;
import org.apache.jena.shacl.ValidationReport;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/validate")
public class ValidationController
{

    private final ShaclValidationService validationService;

    private final ShaclValidationServiceViktor shaclValidationServiceViktor;

    public ValidationController(ShaclValidationService validationService, ShaclValidationServiceViktor shaclValidationServiceViktor)
    {
        this.validationService = validationService;
        this.shaclValidationServiceViktor = shaclValidationServiceViktor;
    }


    @GetMapping()
    public ResponseEntity<ShaclValidationDTO> validate()
    {
        ShaclValidationDTO result = this.validationService.validateRdfAgainstShacl("data.ttl", "shapes.ttl");
        return ResponseEntity.ok(result);
    }

   /**
     * Parses the incoming SHACL TTL (sent as plain text) into a ShaclDTO.
     *
     * @param shaclContent the raw TTL content in the request body
     * @return the populated ShaclDTO as JSON
     */
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