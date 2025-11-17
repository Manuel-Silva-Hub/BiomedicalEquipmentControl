using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using microservice_AuthService.Models;

namespace microservice_AuthService.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        //  public DbSet<User> Users { get; set; }
        //  public DbSet<Role> Roles { get; set; }
    }
}
