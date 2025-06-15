package mk.ukim.finki.mk.backend.Web;

import mk.ukim.finki.mk.backend.Models.DTO.namespace.NamespaceDetailDto;
import mk.ukim.finki.mk.backend.Service.NamespaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/namespaces")
public class NamespaceController {

    private final NamespaceService namespaceService;

    public NamespaceController(NamespaceService namespaceService) {
        this.namespaceService = namespaceService;
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<NamespaceDetailDto>> getPredefinedNamespaces() {
        return ResponseEntity.ok(namespaceService.fetchAllNamespaces());
    }

    @GetMapping(value = "/predefined/by", params = "url")
    public ResponseEntity<NamespaceDetailDto> getPredefinedNamespace(
            @RequestParam("url") String url
    ) {
        return ResponseEntity.ok(namespaceService.fetchNamespace(url));
    }
}
