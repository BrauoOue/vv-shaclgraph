package mk.ukim.finki.mk.backend.Web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Service.DataConversionService;
import mk.ukim.finki.mk.backend.Service.ShaclConversionService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/convert")
public class ConversionController
{

    private final DataConversionService dataConversionService;
    private final ShaclConversionService shaclConversionService;

    public ConversionController(DataConversionService dataConversionService, ShaclConversionService shaclConversionService)
    {
        this.dataConversionService = dataConversionService;
        this.shaclConversionService = shaclConversionService;
    }


    @Operation(summary = "Convert RDF data from Turtle to JSON")
    @PostMapping(
            value = "/dataTtlToJson",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RdfDataDto> convertDataTtlToJson(
            @Parameter(
                    description = "RDF file to convert",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestParam("file") MultipartFile dataFile)
    {
        if (dataFile.isEmpty())
        {
            return ResponseEntity.notFound().build();
        }

        RdfDataDto dto = dataConversionService.convertDataTtlToDto(dataFile);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Convert RDF data from JSON to Turtle file for download")
    @PostMapping(
            value = "/dataJsonToTtl",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = "text/turtle")
    public ResponseEntity<Resource> convertDataJsonToTtlFile(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "RDF data in JSON format",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = RdfDataDto.class)
                    )
            )
            @RequestBody RdfDataDto rdfData,

            @Parameter(
                    description = "Desired filename for the output Turtle file",
                    example = "data.ttl"
            )
            @RequestParam(value = "filename", defaultValue = "data.ttl") String filename)
    {

        String dataContent = dataConversionService.convertDataDtoToTtl(rdfData);
        byte[] contentBytes = dataContent.getBytes(StandardCharsets.UTF_8);
        ByteArrayResource resource = new ByteArrayResource(contentBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/turtle"))
                .contentLength(contentBytes.length)
                .body(resource);
    }

    @Operation(summary = "Convert Shacl from Turtle to JSON")
    @PostMapping(
            path = "/shaclTtlToJson",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<ShaclDto> convertShaclTtlToJson(
            @Parameter(
                    description = "SHACL file to convert",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestParam("file") MultipartFile shaclFile)
    {

        if (shaclFile.isEmpty())
        {
            return ResponseEntity.notFound().build();
        }

        ShaclDto dto = shaclConversionService.convertShaclTtlToDto(shaclFile);
        return ResponseEntity.ok(dto);
    }


    @Operation(summary = "Convert Shacl from JSON to Turtle file for download")
    @PostMapping(
            path = "/shaclJsonToTtl",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = "text/turtle"
    )
    public ResponseEntity<Resource> convertShaclJsonToTtlFile(
            @Parameter(
                    description = "SHACL in JSON format",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ShaclDto.class)
                    )
            )
            @RequestBody ShaclDto dto,
            @Parameter(
                    description = "Desired filename for the output Turtle file",
                    example = "data.ttl"
            )
            @RequestParam(value = "filename", defaultValue = "shacl.ttl") String filename)
    {

        String shaclContent = shaclConversionService.convertShaclDtoToTtl(dto);
        byte[] contentBytes = shaclContent.getBytes(StandardCharsets.UTF_8);
        ByteArrayResource resource = new ByteArrayResource(contentBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/turtle"))
                .contentLength(contentBytes.length)
                .body(resource);
    }


}
