package mk.ukim.finki.mk.backend.Service.impl;

import mk.ukim.finki.mk.backend.Models.DTO.data.RdfDataDto;
import mk.ukim.finki.mk.backend.Models.DTO.shacl.ShaclDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationDto;
import mk.ukim.finki.mk.backend.Models.DTO.validation.ValidationError;
import mk.ukim.finki.mk.backend.Service.DataConversionService;
import mk.ukim.finki.mk.backend.Service.ShaclConversionService;
import mk.ukim.finki.mk.backend.Service.ValidationService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFParser;
import org.apache.jena.shacl.ShaclValidator;
import org.apache.jena.shacl.ValidationReport;
import org.apache.jena.shacl.Shapes;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ValidationServiceImpl implements ValidationService
{

    private final ShaclConversionService shaclConversionService;
    private final DataConversionService dataConversionService;

    public ValidationServiceImpl(ShaclConversionService shaclConversionService, DataConversionService dataConversionService)
    {
        this.shaclConversionService = shaclConversionService;
        this.dataConversionService = dataConversionService;
    }

    public ValidationDto generateShaclValidationDTO(ValidationReport report)
    {
        List<ValidationError> validationErrors = report
                .getEntries()
                .stream()
                .map(entry ->
                {
                    String[] nodeContentArray = entry.focusNode().toString().split("/");
                    String[] propertyContentArray = entry.resultPath().toString().split("/");
                    return new ValidationError(
                            nodeContentArray[nodeContentArray.length - 1],
                            entry.resultPath() != null ? propertyContentArray[propertyContentArray.length - 1].replace(">", "") : "Unknown",
                            entry.message());
                })
                .collect(Collectors.toList());

        return new ValidationDto(report.conforms(), validationErrors);
    }


    @Override
    public ValidationDto validateRdfAgainstShacl(ShaclDto shaclDto, RdfDataDto data)
    {
        String shaclContent = this.shaclConversionService.convertShaclDtoToTtl(shaclDto);
        String dataContent = this.dataConversionService.convertDataDtoToTtl(data);

        Model shapesModel = ModelFactory.createDefaultModel();
        RDFParser.fromString(shaclContent)
         .lang(Lang.TURTLE)
         .parse(shapesModel);

        Shapes shapes = Shapes.parse(shapesModel.getGraph());

        Model dataModel = ModelFactory.createDefaultModel();
        RDFParser.fromString(dataContent)
         .lang(Lang.TURTLE)
         .parse(dataModel);

        // Validate
        ValidationReport report = ShaclValidator
                .get()
                .validate(shapesModel.getGraph(), dataModel.getGraph());

        return this.generateShaclValidationDTO(report);
    }
}
