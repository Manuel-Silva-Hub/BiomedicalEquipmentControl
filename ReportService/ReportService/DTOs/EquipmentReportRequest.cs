namespace ReportService.DTOs
{
    public class EquipmentReportRequest
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? OnlyInside { get; set; }
        public string Format { get; set; } = "json"; // json o pdf
    }
}
