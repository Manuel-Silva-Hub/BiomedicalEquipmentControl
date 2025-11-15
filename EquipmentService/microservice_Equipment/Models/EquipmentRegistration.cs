using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.Models
{
    public class EquipmentRegistration
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string EquipmentType { get; set; } // Technological or Biomedical

        [Required]
        public string Serial { get; set; }

        public string Description { get; set; }

        public string QRCode { get; set; } // Optional for frequent teams
        public string PhotoUrl { get; set; }

        [Required]
        public DateTime EntryDate { get; set; } = DateTime.Now;

        public DateTime? OutDate { get; set; }

        [Required]
        public string LoginUser { get; set; }

        public string? OutUser { get; set; }

        public bool IsFrequent { get; set; } = false;
        public bool IsInside { get; set; } = true;

        public int AreaId { get; set; }
    }
}
