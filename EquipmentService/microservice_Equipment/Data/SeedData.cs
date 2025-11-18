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

            if (!context.Areas.Any())
            {
                context.Areas.AddRange(
                    new Area { Name = "Emergencias" },
                    new Area { Name = "UCI" },
                    new Area { Name = "Laboratorio" }
                );
                context.SaveChanges();
            }

            if (!context.AreaEquipmentRules.Any())
            {
                context.AreaEquipmentRules.AddRange(
                    new AreaEquipmentRule { AreaId = 1, AllowedEquipmentType = "Desfibrilador" },
                    new AreaEquipmentRule { AreaId = 1, AllowedEquipmentType = "Monitor de Signos Vitales" },
                    new AreaEquipmentRule { AreaId = 2, AllowedEquipmentType = "Ventilador Mecánico" },
                    new AreaEquipmentRule { AreaId = 2, AllowedEquipmentType = "Oxímetro de Pulso" },
                    new AreaEquipmentRule { AreaId = 3, AllowedEquipmentType = "Bomba de Infusión" },
                    new AreaEquipmentRule { AreaId = 3, AllowedEquipmentType = "Electrocardiógrafo" }
                );
                context.SaveChanges();
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
                    IsInside = true,
                    AreaId = 1
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
                    IsInside = true,
                    AreaId = 2
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
                    IsInside = true,
                    AreaId = 3
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
                    IsInside = true,
                    AreaId = 3
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
                    IsInside = true,
                    AreaId = 1
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
                    IsInside = false,
                    AreaId = 2
                }
            };

            context.Equipmentregistration.AddRange(equipos);
            context.SaveChanges();

            Console.WriteLine($"Se insertaron {equipos.Length} equipos de prueba.");
        }
    }
}