package mk.ukim.finki.mk.backend.Service;

import mk.ukim.finki.mk.backend.Models.DTO.namespace.NamespaceDetailDto;

import java.util.List;

public interface NamespaceService {
    List<NamespaceDetailDto> fetchAllNamespaces();
    NamespaceDetailDto fetchNamespace(String url);
}
