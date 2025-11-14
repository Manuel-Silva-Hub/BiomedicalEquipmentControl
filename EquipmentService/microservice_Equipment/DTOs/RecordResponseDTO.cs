namespace microservice_Equipment.DTOs
{
    public class RecordResponseDTO
    {
        public int Id { get; set; }
        public string EquipmentType { get; set; }
        public string Serial { get; set; }
        public string Description { get; set; }
        public string QRCode { get; set; }
        public string PhotoUrl { get; set; }
        public string LoginUser { get; set; }
        public DateTime EntryDate { get; set; }
        public DateTime OutDate { get; set; }
        public string? OutUser { get; set; }
        public bool IsInside { get; set; }
    }
}
