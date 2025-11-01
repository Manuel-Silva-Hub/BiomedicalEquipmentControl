using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.DTOs
{
    public class RecordEgressDTO
    {
        [Required]
        public string OutUser { get; set; }
    }
}
