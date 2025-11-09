using Microsoft.AspNetCore.Identity;
using microservice_AuthService.Models;

namespace microservice_AuthService.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // ?? Roles predefinidos
            string[] roles = new[] { "Administrador", "Técnico", "Enfermero" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // ?? Usuarios predefinidos
            var users = new List<ApplicationUser>
            {
                new ApplicationUser
                {
                    UserName = "admin@hospital.com",
                    Email = "admin@hospital.com",
                    FullName = "Carlos Ramírez",
                    RolHospital = "Administrador",
                    EmailConfirmed = true
                },
                new ApplicationUser
                {
                    UserName = "tecnico@hospital.com",
                    Email = "tecnico@hospital.com",
                    FullName = "María González",
                    RolHospital = "Técnico",
                    EmailConfirmed = true
                },
                new ApplicationUser
                {
                    UserName = "enfermero@hospital.com",
                    Email = "enfermero@hospital.com",
                    FullName = "Juan Pérez",
                    RolHospital = "Enfermero",
                    EmailConfirmed = true
                }
            };

            // ?? Contraseñas por defecto
            var defaultPassword = "Hospital123*";

            foreach (var user in users)
            {
                var existingUser = await userManager.FindByEmailAsync(user.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(user, defaultPassword);
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, user.RolHospital);
                    }
                }
            }
        }
    }
}
