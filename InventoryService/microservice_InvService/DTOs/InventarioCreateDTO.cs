namespace microservice_InvService.DTOs
{
    public class InventarioCreateDTO
    {
        public string EquipmentType { get; set; } = string.Empty;

        public string Serial { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? QRCode { get; set; }

        public string? PhotoUrl { get; set; }
    }
}
