using ReportService.DTOs;
using System.Reflection.Metadata;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ReportService.Services
{
    public class PdfGenerator
    {
        public byte[] GenerateEquipmentPdf(List<ReportResponseDTO> data)
        {
            var document = QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);

                    page.Header().Text("Reporte de Equipos").FontSize(22).Bold().AlignCenter();

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Serial").Bold();
                            header.Cell().Text("Tipo").Bold();
                            header.Cell().Text("Entrada").Bold();
                            header.Cell().Text("Dentro").Bold();
                        });

                        foreach (var r in data)
                        {
                            table.Cell().Text(r.Serial);
                            table.Cell().Text(r.EquipmentType);
                            table.Cell().Text(r.EntryDate.ToString("yyyy-MM-dd HH:mm"));
                            table.Cell().Text(r.IsInside ? "Sí" : "No");
                        }
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}
