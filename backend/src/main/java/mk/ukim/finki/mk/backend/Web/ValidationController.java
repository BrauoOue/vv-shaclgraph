package mk.ukim.finki.mk.backend.Web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationRequestDto;
import mk.ukim.finki.mk.backend.Service.impl.ValidationServiceImpl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validate")
@CrossOrigin(origins = "http://localhost:5173")
public class ValidationController
{

    private final ValidationServiceImpl validationService;

    public ValidationController(ValidationServiceImpl validationService)
    {
        this.validationService = validationService;
    }

    @Operation(summary = "Validate RDF against SHACL")
    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ValidationDto> validate(
            @Parameter(
                    description = "SHACL and RDF Data in JSON format",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ValidationRequestDto.class)
                    )
            )
            @RequestBody ValidationRequestDto validationRequestDto
    )
    {
        ShaclDto shacl = validationRequestDto.getShacl();
        RdfDataDto data = validationRequestDto.getData();

        if (shacl == null || data == null)
        {
            return ResponseEntity
                    .badRequest()
                    .build();
        }

        ValidationDto validationDTO = this.validationService
                .validateRdfAgainstShacl(shacl, data);

        return ResponseEntity
                .ok(validationDTO);
    }

}