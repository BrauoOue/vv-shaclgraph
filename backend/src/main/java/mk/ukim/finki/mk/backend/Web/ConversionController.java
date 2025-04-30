package mk.ukim.finki.mk.backend.Web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Service.GochService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/convert")
public class ConversionController {
    private final GochService gochService;


    public ConversionController(GochService gochService) {
        this.gochService = gochService;
    }
    @Operation(summary = "Upload an RDF file")
    @PostMapping(value = "/turtleToJson", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RdfDataDto> upload(
            @Parameter(
                    description = "RDF file to upload",
                    required    = true,
                    content     = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema    = @Schema(type = "string", format = "binary")
                    )
            )
            @RequestParam("file") MultipartFile file) {
        RdfDataDto dto = gochService.processRdf(file);
        return ResponseEntity.ok(dto);
    }
//    @Operation(summary = "Convert RDF data from JSON to Turtle file for download")
//    @PostMapping(value = "/jsonToTurtle", consumes = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<Resource> convertJsonToTurtle(
//            @RequestBody RdfDataDto rdfData,
//            @RequestParam(value = "filename", defaultValue = "data.ttl") String filename) {
//
//        byte[] turtleData = gochService.convertDtoToTurtleFile(rdfData, filename);
//        ByteArrayResource resource = new ByteArrayResource(turtleData);
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
//                .contentType(MediaType.parseMediaType("text/turtle"))
//                .contentLength(turtleData.length)
//                .body(resource);
//    }
@Operation(summary = "Convert RDF data from JSON to Turtle file for download")
@PostMapping(value = "/jsonToTurtle", consumes = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<Resource> convertJsonToTurtle(
        @RequestBody RdfDataDto rdfData,
        @RequestParam(value = "filename", defaultValue = "data.ttl") String filename) {

    byte[] turtleData = gochService.convertDtoToTurtleFile(rdfData);
    ByteArrayResource resource = new ByteArrayResource(turtleData);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/turtle"))
            .contentLength(turtleData.length)
            .body(resource);
}



}
