using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.DTOs
{
    public class RecordEgressDTO
    {
        public class RegistroEgresoDTO
        {
            [Required]
            public string ExitUser { get; set; }
        }
    }
}
