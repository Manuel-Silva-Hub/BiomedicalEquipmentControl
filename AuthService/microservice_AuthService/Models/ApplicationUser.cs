using Microsoft.AspNetCore.Identity;

namespace microservice_AuthService.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public string RolHospital { get; set; } // Ej: "Administrador", "Técnico", etc.
    }
}
