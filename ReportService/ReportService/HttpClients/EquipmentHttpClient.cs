using Newtonsoft.Json;
using ReportService.DTOs;
using System.Net.Http.Headers;

namespace ReportService.HttpClients
{
    public class EquipmentHttpClient
    {
        private readonly HttpClient _client;

        public EquipmentHttpClient(IHttpClientFactory factory)
        {
            _client = factory.CreateClient("EquipmentService");
        }

        public void SetToken(string token)
        {
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        // GET api/registro
        public async Task<List<ReportResponseDTO>> GetAll()
        {
            var res = await _client.GetAsync("api/registry");
            if (!res.IsSuccessStatusCode) return new List<ReportResponseDTO>();

            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<ReportResponseDTO>>(json);
        }

        // GET api/registro/fecha
        public async Task<List<ReportResponseDTO>> GetByDate(DateTime start, DateTime end)
        {
            var res = await _client.GetAsync($"api/registry/fecha?inicio={start:O}&fin={end:O}");
            if (!res.IsSuccessStatusCode) return new List<ReportResponseDTO>();

            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<ReportResponseDTO>>(json);
        }

        // GET api/registro/en-instalacion
        public async Task<List<ReportResponseDTO>> GetInside()
        {
            var res = await _client.GetAsync("api/registry/en-instalacion");
            if (!res.IsSuccessStatusCode) return new List<ReportResponseDTO>();

            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<ReportResponseDTO>>(json);
        }
    }
}
