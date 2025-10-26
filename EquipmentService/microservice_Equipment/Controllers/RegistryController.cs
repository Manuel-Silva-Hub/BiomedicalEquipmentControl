using AutoMapper;
using microservice_Equipment.Data;
using microservice_Equipment.DTOs;
using microservice_Equipment.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static microservice_Equipment.DTOs.RecordEgressDTO;
namespace microservice_Equipment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RegistryController : ControllerBase
    {
        private readonly RegistroContext _context;
        private readonly IMapper _mapper;

        public RegistryController(RegistroContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // POST: api/registro/ingreso
        [HttpPost("ingreso")]
        public async Task<IActionResult> RegistrarIngreso([FromBody] RegistrationEntryDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entidad = _mapper.Map<EquipmentRegistration>(dto);
            _context.Equipmentregistration.Add(entidad);
            await _context.SaveChangesAsync();

            var respuesta = _mapper.Map<RecordResponseDTO>(entidad);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = entidad.Id }, respuesta);
        }

        // PUT: api/registro/egreso/{id}
        [HttpPut("egreso/{id}")]
        public async Task<IActionResult> RegistrarEgreso(int id, [FromBody] RegistroEgresoDTO dto)
        {
            var registro = await _context.Equipmentregistration.FindAsync(id);
            if (registro == null || !registro.IsInside)
                return NotFound("El equipo no está dentro del hospital o no existe.");

            registro.OutDate = DateTime.Now;
            registro.OutUser = dto.ExitUser;
            registro.IsInside = false;

            await _context.SaveChangesAsync();

            var respuesta = _mapper.Map<RecordResponseDTO>(registro);
            return Ok(respuesta);
        }

        // GET: api/registro
        [HttpGet]
        [Authorize(Roles = "TI,Vigilante")]
        public async Task<ActionResult<IEnumerable<RecordResponseDTO>>> ObtenerTodos()
        {
            var registros = await _context.Equipmentregistration
                .OrderByDescending(r => r.EntryDate)
                .ToListAsync();

            var respuesta = _mapper.Map<IEnumerable<RecordResponseDTO>>(registros);
            return Ok(respuesta);
        }

        // GET: api/registro/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "TI,Vigilante")]
        public async Task<ActionResult<RecordResponseDTO>> ObtenerPorId(int id)
        {
            var registro = await _context.Equipmentregistration.FindAsync(id);
            if (registro == null)
                return NotFound();

            var respuesta = _mapper.Map<RecordResponseDTO>(registro);
            return Ok(respuesta);
        }

        // GET: api/registro/fecha?inicio=2025-10-01&fin=2025-10-22
        [HttpGet("fecha")]
        [Authorize(Roles = "TI")]
        public async Task<ActionResult<IEnumerable<RecordResponseDTO>>> FiltrarPorFecha(DateTime inicio, DateTime fin)
        {
            var registros = await _context.Equipmentregistration
                .Where(r => r.EntryDate >= inicio && r.EntryDate <= fin)
                .ToListAsync();

            if (!registros.Any())
                return NotFound("No se encontraron registros en el rango especificado.");

            var respuesta = _mapper.Map<IEnumerable<RecordResponseDTO>>(registros);
            return Ok(respuesta);
        }

        // GET: api/registro/en-instalacion
        [HttpGet("en-instalacion")]
        [Authorize(Roles = "TI,Vigilante")]
        public async Task<ActionResult<IEnumerable<RecordResponseDTO>>> ObtenerEquiposEnInstalacion()
        {
            var registros = await _context.Equipmentregistration
                .Where(r => r.IsInside)
                .ToListAsync();

            var respuesta = _mapper.Map<IEnumerable<RecordResponseDTO>>(registros);
            return Ok(respuesta);
        }

        // DELETE: api/registro/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "TI")]
        public async Task<IActionResult> EliminarRegistro(int id)
        {
            var registro = await _context.Equipmentregistration.FindAsync(id);
            if (registro == null)
                return NotFound("Registro no encontrado.");

            _context.Equipmentregistration.Remove(registro);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
