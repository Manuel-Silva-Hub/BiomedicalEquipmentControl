using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReportService.DTOs;
using ReportService.Services;

namespace ReportService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly IEquipmentReportService _equipmentReportService;
        private readonly PdfGenerator _pdf;

        public ReportController(
        IEquipmentReportService equipmentReportService,
        PdfGenerator pdf)
        {
            _equipmentReportService = equipmentReportService;
            _pdf = pdf;
        }

        [HttpPost("equipment")]
        public async Task<IActionResult> GenerateEquipmentReport([FromBody] EquipmentReportRequest request)
        {
            var token = HttpContext.Request.Headers["Authorization"]
                             .ToString()
                             .Replace("Bearer ", "");

            var data = await _equipmentReportService.GetReportData(request, token);

            if (request.Format == "pdf")
            {
                var file = _pdf.GenerateEquipmentPdf(data);
                return File(file, "application/pdf", "reporte_equipos.pdf");
            }

            return Ok(data);
        }
    }
}
