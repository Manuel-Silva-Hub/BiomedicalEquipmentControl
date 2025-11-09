using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using microservice_InvService.Data;
using microservice_InvService.Models;
using microservice_InvService.DTOs;

namespace microservice_InvService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquiposController : ControllerBase
    {
        private readonly InventarioContext _context;
        private readonly IMapper _mapper;

        public EquiposController(InventarioContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // 🔹 GET: api/Equipos?search=valor
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventarioResponseDTO>>> GetEquipos([FromQuery] string? search)
        {
            var query = _context.Equipos.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(e =>
                    e.EquipmentType.Contains(search) ||
                    e.Serial.Contains(search) ||
                    (e.Description != null && e.Description.Contains(search))
                );
            }

            var equipos = await query.OrderBy(e => e.EquipmentType).ToListAsync();
            return Ok(_mapper.Map<IEnumerable<InventarioResponseDTO>>(equipos));
        }

        // 🔹 GET: api/Equipos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<InventarioResponseDTO>> GetEquipo(int id)
        {
            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null) return NotFound("Equipo no encontrado.");

            return Ok(_mapper.Map<InventarioResponseDTO>(equipo));
        }

        // 🔹 POST: api/Equipos
        [HttpPost]
        public async Task<ActionResult<InventarioResponseDTO>> PostEquipo(InventarioCreateDTO dto)
        {
            var equipo = _mapper.Map<Equipo>(dto);
            _context.Equipos.Add(equipo);
            await _context.SaveChangesAsync();

            var response = _mapper.Map<InventarioResponseDTO>(equipo);
            return CreatedAtAction(nameof(GetEquipo), new { id = equipo.Id }, response);
        }

        // 🔹 PUT: api/Equipos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEquipo(int id, InventarioUpdateDTO dto)
        {
            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null) return NotFound("Equipo no encontrado.");

            _mapper.Map(dto, equipo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 🔹 DELETE: api/Equipos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEquipo(int id)
        {
            var equipo = await _context.Equipos.FindAsync(id);
            if (equipo == null) return NotFound("Equipo no encontrado.");

            _context.Equipos.Remove(equipo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
