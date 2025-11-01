using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using microservice_Equipment.Controllers;
using microservice_Equipment.Data;
using microservice_Equipment.DTOs;
using microservice_Equipment.Models;
using Microsoft.AspNetCore.Mvc;
using microservice_Equipment.Mappings;
using Microsoft.EntityFrameworkCore.InMemory;

namespace microservice_Equipment.Tests.Controllers
{
    public class RegistryControllerTests
    {
        private readonly IMapper _mapper;

        public RegistryControllerTests()
        {
            var config = new MapperConfiguration(cfg => cfg.AddProfile<RegistryProfile>());
            _mapper = config.CreateMapper();
        }

        private RegistroContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<RegistroContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new RegistroContext(options);
        }

        private RegistryController GetController(RegistroContext context)
        {
            return new RegistryController(context, _mapper);
        }

        // Método helper para crear registros de prueba
        private EquipmentRegistration CrearRegistroPrueba(
            string serial = "EQ-TEST",
            string equipmentType = "Monitor",
            string description = "Equipo de prueba",
            string qrCode = "QR-TEST",
            string photoUrl = "https://example.com/test.jpg",
            string loginUser = "testuser",
            bool isInside = true,
            string? outuser = null,
            DateTime? entryDate = null,
            DateTime? outDate = null)
        {
            return new EquipmentRegistration
            {
                Serial = serial,
                EquipmentType = equipmentType,
                Description = description,
                QRCode = qrCode,
                PhotoUrl = photoUrl,
                LoginUser = loginUser,
                IsInside = isInside,
                OutUser = outuser,
                EntryDate = entryDate ?? DateTime.Now,
                OutDate = outDate
            };
        }

        [Fact]
        public async Task RegistrarIngreso_DebeCrearNuevoRegistro()
        {
            var context = GetContext(nameof(RegistrarIngreso_DebeCrearNuevoRegistro));
            var controller = GetController(context);

            var dto = new RegistrationEntryDTO
            {
                Serial = "EQ-123",
                EquipmentType = "Monitor",
                Description = "Equipo médico de prueba",
                LoginUser = "alexis",
                PhotoUrl = "https://example.com/photo1.jpg",
                QRCode = "QR1",
                IsInside = true,
                EntryDate = DateTime.Now
            };

            var result = await controller.RegistrarIngreso(dto);

            var created = Assert.IsType<CreatedAtActionResult>(result);
            var value = Assert.IsType<RecordResponseDTO>(created.Value);
            Assert.Equal("EQ-123", value.Serial);
            Assert.True(value.IsInside);
        }

        [Fact]
        public async Task RegistrarEgreso_DebeActualizarYMarcarSalida()
        {
            var context = GetContext(nameof(RegistrarEgreso_DebeActualizarYMarcarSalida));

            // CORREGIDO: Usar el método helper con todas las propiedades
            var entity = CrearRegistroPrueba(
                serial: "EQ-001",
                equipmentType: "Monitor",
                description: "Equipo en uso",
                qrCode: "QR001",
                photoUrl: "https://example.com/photo.jpg",
                loginUser: "usuario1",
                isInside: true
            );

            context.Equipmentregistration.Add(entity);
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var dto = new RecordEgressDTO { OutUser = "vigilante" };

            var result = await controller.RegistrarEgreso(entity.Id, dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            var value = Assert.IsType<RecordResponseDTO>(ok.Value);
            Assert.False(value.IsInside);
            Assert.NotEqual(default(DateTime), value.OutDate);
        }

        [Fact]
        public async Task ObtenerTodos_DebeRetornarLista()
        {
            var context = GetContext(nameof(ObtenerTodos_DebeRetornarLista));

            // CORREGIDO: Agregar todas las propiedades requeridas
            context.Equipmentregistration.AddRange(
                CrearRegistroPrueba(serial: "EQ1", qrCode: "QR1"),
                CrearRegistroPrueba(serial: "EQ2", qrCode: "QR2")
            );
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var result = await controller.ObtenerTodos();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<RecordResponseDTO>>(ok.Value);
            Assert.Equal(2, list.Count());
        }

        [Fact]
        public async Task ObtenerPorId_DebeRetornarUnRegistro()
        {
            var context = GetContext(nameof(ObtenerPorId_DebeRetornarUnRegistro));

            // CORREGIDO: Usar el método helper
            var entity = CrearRegistroPrueba(
                serial: "EQ-777",
                qrCode: "QR-777"
            );

            context.Equipmentregistration.Add(entity);
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var result = await controller.ObtenerPorId(entity.Id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var value = Assert.IsType<RecordResponseDTO>(ok.Value);
            Assert.Equal("EQ-777", value.Serial);
        }

        [Fact]
        public async Task FiltrarPorFecha_DebeRetornarRegistrosEnRango()
        {
            var context = GetContext(nameof(FiltrarPorFecha_DebeRetornarRegistrosEnRango));

            // CORREGIDO: Agregar todas las propiedades
            context.Equipmentregistration.AddRange(
                CrearRegistroPrueba(
                    serial: "EQ1",
                    qrCode: "QR1",
                    entryDate: new DateTime(2025, 10, 10)
                ),
                CrearRegistroPrueba(
                    serial: "EQ2",
                    qrCode: "QR2",
                    entryDate: new DateTime(2025, 10, 15)
                )
            );
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var result = await controller.FiltrarPorFecha(
                new DateTime(2025, 10, 1),
                new DateTime(2025, 10, 20)
            );

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<RecordResponseDTO>>(ok.Value);
            Assert.Equal(2, list.Count());
        }

        [Fact]
        public async Task ObtenerEquiposEnInstalacion_DebeRetornarSoloActivos()
        {
            var context = GetContext(nameof(ObtenerEquiposEnInstalacion_DebeRetornarSoloActivos));

            // CORREGIDO: Especificar todas las propiedades
            context.Equipmentregistration.AddRange(
                CrearRegistroPrueba(
                    serial: "EQ1",
                    qrCode: "QR1",
                    isInside: true
                ),
                CrearRegistroPrueba(
                    serial: "EQ2",
                    qrCode: "QR2",
                    isInside: false
                )
            );
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var result = await controller.ObtenerEquiposEnInstalacion();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<RecordResponseDTO>>(ok.Value);
            Assert.Single(list); // solo 1 dentro
        }

        [Fact]
        public async Task EliminarRegistro_DebeEliminarCorrectamente()
        {
            var context = GetContext(nameof(EliminarRegistro_DebeEliminarCorrectamente));

            // CORREGIDO: Usar el método helper
            var entity = CrearRegistroPrueba(
                serial: "EQ-DEL",
                qrCode: "QR-DEL"
            );

            context.Equipmentregistration.Add(entity);
            await context.SaveChangesAsync();

            var controller = GetController(context);
            var result = await controller.EliminarRegistro(entity.Id);

            Assert.IsType<NoContentResult>(result);
            Assert.Empty(context.Equipmentregistration);
        }
    }
}
