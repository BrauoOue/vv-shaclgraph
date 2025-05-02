package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.validation.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationError;
import mk.ukim.finki.mk.backend.Service.ShaclValidationService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.shacl.ShaclValidator;
import org.apache.jena.shacl.ValidationReport;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShaclValidationServiceImpl implements ShaclValidationService
{

    public ShaclValidationDTO generateShaclValidationDTO(ValidationReport report)
    {
        List<ValidationError> validationErrors = report
                .getEntries()
                .stream()
                .map(entry ->
                        new ValidationError(
                                entry.focusNode().toString(),
                                entry.resultPath() != null ? entry.resultPath().toString() : "Unknown",
                                entry.message()))
                .collect(Collectors.toList());

        return new ShaclValidationDTO(report.conforms(), validationErrors);
    }

    @Override
    public ShaclValidationDTO validateRdfAgainstShacl(String dataFilePath, String shapesFilePath) {
        try {
            // Load SHACL shapes from filesystem
            Model shapesModel = ModelFactory.createDefaultModel();
            // this will happily read a local .ttl file on disk
            RDFDataMgr.read(shapesModel, shapesFilePath, Lang.TURTLE);
            Shapes shapes = Shapes.parse(shapesModel.getGraph());

            // Load RDF data from filesystem
            Model dataModel = ModelFactory.createDefaultModel();
            RDFDataMgr.read(dataModel, dataFilePath, Lang.TURTLE);

            // Validate
            ValidationReport report = ShaclValidator.get()
                    .validate(shapes, dataModel.getGraph());
            return this.generateShaclValidationDTO(report);

        } catch (Exception e) {
            throw new RuntimeException("SHACL validation failed", e);
        }
    }
}
