using microservice_Equipment.Data;
using microservice_Equipment.Models;

namespace microservice_Equipment.Data
{
    public static class SeedData
    {
        public static void Initialize(RegistroContext context)
        {
            if (context.Equipmentregistration.Any())
            {
                Console.WriteLine("⚠La base de datos ya tiene datos. No se insertarán duplicados.");
                return;
            }

            var equipos = new[]
            {
                new EquipmentRegistration
                {
                    EquipmentType = "Monitor de Signos Vitales",
                    Serial = "MSV-2024-001",
                    Description = "Monitor multiparamétrico",
                    QRCode = "QR-MSV-001",  
                    PhotoUrl = "",  
                    EntryDate = DateTime.Now.AddHours(-5),
                    LoginUser = "admin@hospital.com",
                    IsInside = true
                },
                new EquipmentRegistration
                {
                    EquipmentType = "Ventilador Mecánico",
                    Serial = "VM-2024-002",
                    Description = "Ventilador para UCI",
                    QRCode = "QR-VM-002",
                    PhotoUrl = "",
                    EntryDate = DateTime.Now.AddHours(-4),
                    LoginUser = "enfermeria@hospital.com",
                    IsInside = true
                },
                new EquipmentRegistration
                {
                    EquipmentType = "Bomba de Infusión",
                    Serial = "BI-2024-003",
                    Description = "Bomba volumétrica",
                    QRCode = "QR-BI-003",
                    PhotoUrl = "",
                    EntryDate = DateTime.Now.AddHours(-3),
                    LoginUser = "admin@hospital.com",
                    IsInside = true
                },
                new EquipmentRegistration
                {
                    EquipmentType = "Electrocardiografo",
                    Serial = "ECG-2024-004",
                    Description = "ECG de 12 derivaciones",
                    QRCode = "QR-ECG-004",
                    PhotoUrl = "",
                    EntryDate = DateTime.Now.AddHours(-2),
                    LoginUser = "cardiologia@hospital.com",
                    IsInside = true
                },
                new EquipmentRegistration
                {
                    EquipmentType = "Desfibrilador",
                    Serial = "DEF-2024-005",
                    Description = "Desfibrilador bifásico",
                    QRCode = "QR-DEF-005",
                    PhotoUrl = "",
                    EntryDate = DateTime.Now.AddHours(-1),
                    LoginUser = "urgencias@hospital.com",
                    IsInside = true
                },
                new EquipmentRegistration
                {
                    EquipmentType = "Oxímetro de Pulso",
                    Serial = "OXI-2024-006",
                    Description = "Oxímetro portátil",
                    QRCode = "QR-OXI-006",
                    PhotoUrl = "",
                    EntryDate = DateTime.Now.AddDays(-5),
                    LoginUser = "admin@hospital.com",
                    OutDate = DateTime.Now.AddDays(-3),
                    OutUser = "admin@hospital.com",
                    IsInside = false
                }
            };

            context.Equipmentregistration.AddRange(equipos);
            context.SaveChanges();

            Console.WriteLine($"Se insertaron {equipos.Length} equipos de prueba.");
        }
    }
}