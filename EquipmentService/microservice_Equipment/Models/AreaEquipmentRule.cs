using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.Models
{
    public class AreaEquipmentRule
    {
        [Key]
        public int Id { get; set; }
        public int AreaId { get; set; }
        public string AllowedEquipmentType { get; set; }

        public Area Area { get; set; }
    }
}
