using ReportService.DTOs;

namespace ReportService.Services
{
    public interface IEquipmentReportService
    {
        Task<List<ReportResponseDTO>> GetReportData(EquipmentReportRequest request, string token);
    }
}
