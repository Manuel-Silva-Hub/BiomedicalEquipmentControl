
namespace microservice_InvService.Models
{
    public class Equipo
    {
        public int Id { get; set; }

        public string EquipmentType { get; set; } = string.Empty; // Technological or Biomedical

        public string Serial { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? QRCode { get; set; } // Optional for frequent teams

        public string? PhotoUrl { get; set; }
    }
}
