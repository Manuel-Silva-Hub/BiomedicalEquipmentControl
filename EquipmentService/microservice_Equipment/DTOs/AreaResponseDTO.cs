namespace microservice_Equipment.DTOs
{
    public class AreaResponseDTO
    {
        public int AreaId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public List<RuleResponseDTO> Rules { get; set; }

    }
}
