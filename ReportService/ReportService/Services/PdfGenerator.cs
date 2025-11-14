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

                    // Título
                    page.Header().Element(header =>
                    {
                        header.Row(row =>
                        {
                            row.RelativeItem().AlignCenter().Text("Reporte de Equipos")
                                .FontSize(22)
                                .Bold()
                                .FontColor(Colors.Blue.Darken2);
                        });
                    });

                    // Contenido
                    page.Content().PaddingVertical(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(); // Serial
                            columns.RelativeColumn(); // Tipo
                            columns.RelativeColumn(); // Entrada
                            columns.RelativeColumn(); // Salida
                            columns.RelativeColumn(); // Dentro
                            columns.RelativeColumn(); // LoginUser
                            columns.RelativeColumn(); // OutUser
                        });

                        // Encabezado con color y borde
                        table.Header(header =>
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Serial").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Tipo").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Entrada").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Salida").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Dentro").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Login User").Bold();
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Border(1).Text("Out User").Bold();
                        });

                        // Filas alternadas
                        int index = 0;
                        foreach (var r in data)
                        {
                            var backgroundColor = index % 2 == 0
                                ? Colors.White
                                : Colors.Grey.Lighten4;

                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.Serial);
                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.EquipmentType);
                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.EntryDate.ToString("yyyy-MM-dd HH:mm"));
                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5)
                                .Text(
                                    r.OutDate == null || r.OutDate == DateTime.MinValue
                                    ? "—"
                                    : r.OutDate.Value.ToString("yyyy-MM-dd HH:mm")
                                );

                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.IsInside ? "Sí" : "No");

                            // Nuevas columnas
                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.LoginUser ?? "—");
                            table.Cell().Background(backgroundColor).BorderBottom(1).Padding(5).Text(r.OutUser ?? "—");

                            index++;
                        }
                    });
                });
            });


            return document.GeneratePdf();
        }
    }
}
