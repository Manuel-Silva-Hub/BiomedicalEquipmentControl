using microservice_Equipment.Models;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using microservice_Equipment.Models;

namespace microservice_Equipment.Data
{
    public class RegistroContext : DbContext
    {
        public RegistroContext(DbContextOptions<RegistroContext> options) : base(options) { }

        public DbSet<EquipmentRegistration> Equipmentregistration { get; set; }
    }
}
