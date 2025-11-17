namespace microservice_InvService.DTOs
{
    public class InventarioResponseDTO
    {
        public int Id { get; set; }                      // ID autogenerado
        public string EquipmentType { get; set; } = string.Empty;  // Tecnológico o Biomédico
        public string Serial { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? QRCode { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
