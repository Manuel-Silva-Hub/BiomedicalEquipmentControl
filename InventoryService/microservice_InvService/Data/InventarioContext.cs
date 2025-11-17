
using microservice_InvService.Models;
using Microsoft.EntityFrameworkCore;

namespace microservice_InvService.Data
{
    public class InventarioContext : DbContext
    {
        public InventarioContext(DbContextOptions<InventarioContext> options)
            : base(options)
        {
        }

        public DbSet<Equipo> Equipos { get; set; }
    }
}
