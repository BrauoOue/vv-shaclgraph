package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Service.ConversionService;
import mk.ukim.finki.mk.backend.Service.impl.ShaclValidationServiceImpl;
import mk.ukim.finki.mk.backend.Service.impl.ShaclServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/validate")
public class ValidationController
{

    private final ShaclValidationServiceImpl validationService;
    private final ConversionService conversionService;
    private final ShaclServiceImpl shaclService;



    @GetMapping()
    public ResponseEntity<ShaclValidationDTO> validate() {
        ShaclValidationDTO result = this.validationService.validateRdfAgainstShacl("ttlExamples/data-incorrect.ttl", "ttlExamples/shapes.ttl");

        return ResponseEntity.ok(result);
    }

    @PostMapping(
            path = "/shaclToJson",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ShaclDTO> parseShacl(@RequestParam("file") MultipartFile shaclFile)
    {

        if (shaclFile.isEmpty())
        {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (!shaclFile.getOriginalFilename().endsWith(".ttl"))
        {
            return ResponseEntity
                    .badRequest()
                    .build();
        }


        ShaclDTO dto = shaclService.parseShaclToShaclDTO(shaclFile);
        return ResponseEntity.ok(dto);
    }


    @ResponseBody
    @PostMapping(
            path = "/jsonToShacl",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.TEXT_PLAIN_VALUE
    )
    public String parseShacl(@RequestBody ShaclDTO dto)
    {
        return shaclService.parseShaclDTOShacl(dto);
    }
}