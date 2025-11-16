using System.ComponentModel.DataAnnotations;

namespace microservice_Equipment.Models
{
    public class Area
    {
        [Key]
        public int AreaId { get; set; }
        public string Name { get; set; }

        public ICollection<AreaEquipmentRule> Rules { get; set; } = new List<AreaEquipmentRule>();
    }
}
