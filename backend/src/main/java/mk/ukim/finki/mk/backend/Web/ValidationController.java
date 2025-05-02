package mk.ukim.finki.mk.backend.Web;

import com.sun.jdi.request.StepRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import mk.ukim.finki.mk.backend.Models.DTO.data.DataEntryDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.data.TripletDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDTO;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationError;
import mk.ukim.finki.mk.backend.Service.ConversionService;
import mk.ukim.finki.mk.backend.Service.ShaclService;
import mk.ukim.finki.mk.backend.Service.impl.ShaclValidationServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/validate")
public class ValidationController {

    private final ShaclValidationServiceImpl validationService;
    private final ConversionService conversionService;
    private final ShaclService shaclService;

    public ValidationController(ShaclValidationServiceImpl validationService, ConversionService conversionService, ShaclService shaclService) {
        this.validationService = validationService;
        this.conversionService = conversionService;
        this.shaclService = shaclService;
    }


    @Operation(summary = "Validate RDF data against SHACL shapes")
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<RdfDataDto> validate(
            @Parameter(
                    name = "file-shacl",
                    description = "Your SHACL Shapes (.ttl)",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestPart("file-shacl") MultipartFile shaclFile,

            @Parameter(
                    name = "file-data",
                    description = "RDF Data to validate (.ttl)",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestPart("file-data") MultipartFile dataFile
    ) {
        try {
            // 1) Convert the uploaded data file to your DTO immediately
            RdfDataDto rdfDataDto = conversionService.convertTurtleToRdfDataDto(dataFile);

            // 2) Persist both uploads to temp files for SHACL validation
            File shapesTemp = File.createTempFile("shapes", ".ttl");
            shaclFile.transferTo(shapesTemp);
            File dataTemp   = File.createTempFile("data",   ".ttl");
            dataFile.transferTo(dataTemp);

            // 3) Run SHACL validation against those temp‐files
            ShaclValidationDTO validationResult =
                    validationService.validateRdfAgainstShacl(
                            dataTemp.getAbsolutePath(),
                            shapesTemp.getAbsolutePath()
                    );

            // 4) Annotate the DTO with overall validity & per‐triplet errors
            rdfDataDto.setValid(validationResult.isValid());
            for (ValidationError ve : validationResult.getValidationErrors()) {
                String focusLocal = getLocalName(ve.getNode());
                String propPath   = ve.getProperty();
                String message    = ve.getErrorMessage();

                for (DataEntryDto entry : rdfDataDto.getData()) {
                    String subject = entry.getSubject();
                    if (focusLocal.equals(subject)) {
                        // mark subject‐level
                        if ("Unknown".equals(propPath)) {
                            entry.setError(true);
                            entry.setErrorMsg(message);
                            continue;
                        }
                        // mark specific triplet
                        String predLocal = getLocalName(propPath);
                        for (TripletDto t : entry.getTriplets()) {
                            if (predLocal.equals(t.getPredicate())) {
                                t.setError(true);
                                t.setErrorMsg(message);
                                entry.setError(true);
                            }
                        }
                    }
                }
            }

            return ResponseEntity.ok(rdfDataDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper to extract local name from a URI
    private String getLocalName(String uri) {
        if (uri == null) return null;
        int idx = Math.max(uri.lastIndexOf('#'), uri.lastIndexOf('/'));
        return (idx != -1 && idx + 1 < uri.length()) ? uri.substring(idx + 1) : uri;
    }

    @PostMapping(
            path = "/shaclToJson",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ShaclDTO> parseShacl(@RequestParam("file") MultipartFile shaclFile) {
        if (shaclFile.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }
        if (!shaclFile.getOriginalFilename().endsWith(".ttl")) {
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
    public String parseShacl(@RequestBody ShaclDTO dto) {
        return shaclService.parseShaclDTOShacl(dto);
    }
}