package mk.ukim.finki.mk.backend.Web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Service.GochService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

}
