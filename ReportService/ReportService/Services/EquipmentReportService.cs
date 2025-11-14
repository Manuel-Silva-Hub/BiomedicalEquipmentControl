using ReportService.DTOs;
using ReportService.HttpClients;

namespace ReportService.Services
{
    public class EquipmentReportService : IEquipmentReportService
    {
        private readonly EquipmentHttpClient _client;

        public EquipmentReportService(EquipmentHttpClient client)
        {
            _client = client;
        }

        public async Task<List<ReportResponseDTO>> GetReportData(EquipmentReportRequest request, string token)
        {
            _client.SetToken(token);

            List<ReportResponseDTO> result = new();

            if (request.StartDate != null && request.EndDate != null)
            {
                result = await _client.GetByDate(request.StartDate.Value, request.EndDate.Value);
            }
            else if (request.OnlyInside == true)
            {
                result = await _client.GetInside();
            }
            else
            {
                result = await _client.GetAll();
            }

            if (request.OnlyInside == true)
            {
                result = result.Where(r => r.IsInside).ToList();
            }
            else
            {
                result = result.Where(r => !r.IsInside).ToList();
            }

            return result;
        }
    }
}
