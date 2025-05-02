package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.validation.ShaclValidationDTO;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationError;
import mk.ukim.finki.mk.backend.Service.ShaclValidationService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
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

    public ShaclValidationDTO validateRdfAgainstShacl(String dataFilePath, String shapesFilePath)
    {
        try
        {
            // Load SHACL Shapes
            Model shapesModel = ModelFactory.createDefaultModel();
            InputStream shapesStream = getClass().getClassLoader().getResourceAsStream(shapesFilePath);
            RDFDataMgr.read(shapesModel, shapesStream, null, org.apache.jena.riot.Lang.TURTLE);
            Shapes shapes = Shapes.parse(shapesModel.getGraph());

            // Load RDF Data
            Model dataModel = ModelFactory.createDefaultModel();
            InputStream dataStream = getClass().getClassLoader().getResourceAsStream(dataFilePath);
            RDFDataMgr.read(dataModel, dataStream, null, org.apache.jena.riot.Lang.TURTLE);

            // Validate
            ValidationReport report = ShaclValidator.get().validate(shapes, dataModel.getGraph());

            // Return report as text
            return this.generateShaclValidationDTO(report);
        } catch (Exception e)
        {
            e.printStackTrace();
            return null;
//            return "Validation failed: " + e.getMessage();
        }
    }
}
