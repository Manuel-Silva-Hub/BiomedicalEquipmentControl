using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.DTOs
{
    public class RegistrationEntryDTO
    {
        [Required]
        public string EquipmentType { get; set; }

        [Required]
        public string Serial { get; set; }

        public string? Description { get; set; }
        public string? QRCode { get; set; }
        public string? PhotoUrl { get; set; }

        [Required]
        public string LoginUser { get; set; }

        [Required]
        public DateTime EntryDate { get; set; } = DateTime.Now;

        public bool IsFrequent { get; set; } = false;
        public bool IsInside { get; set; } = true;

        public int AreaId { get; set; }
    }
}
