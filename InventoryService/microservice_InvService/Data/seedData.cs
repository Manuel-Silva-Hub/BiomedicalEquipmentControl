using microservice_InvService.Models;
using Microsoft.EntityFrameworkCore;

namespace microservice_InvService.Data
{
    public static class SeedData
    {
        public static void Initialize(InventarioContext context)
        {
            if (context.Equipos.Any())
            {
                // Ya hay datos, no hacemos nada
                return;
            }

            context.Equipos.AddRange(
                new Equipo
                {
                    EquipmentType = "Biomedical",
                    Serial = "BIO-2025-001",
                    Description = "Portable ultrasound device",
                    QRCode = "QR001BIO",
                    PhotoUrl = "https://example.com/photos/ultrasound.jpg"
                },
                new Equipo
                {
                    EquipmentType = "Technological",
                    Serial = "TEC-2025-002",
                    Description = "HP EliteBook 840 G8 Laptop",
                    QRCode = "QR002TEC",
                    PhotoUrl = "https://example.com/photos/laptop.jpg"
                },
                new Equipo
                {
                    EquipmentType = "Biomedical",
                    Serial = "BIO-2025-003",
                    Description = "Heart rate monitor",
                    QRCode = "QR003BIO",
                    PhotoUrl = "https://example.com/photos/monitor.jpg"
                }
            );

            context.SaveChanges();
        }
    }
}
