using AutoMapper;
using microservice_Equipment.Data;
using microservice_Equipment.DTOs;
using microservice_Equipment.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace microservice_Equipment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "TI, Vigilante")]
    public class AreaController : ControllerBase
    {
        private readonly RegistroContext _context;
        private readonly IMapper _mapper;

        public AreaController(RegistroContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/area
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AreaResponseDTO>>> GetAreas()
        {
            var areas = await _context.Areas
                .Include(a => a.Rules)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<AreaResponseDTO>>(areas));
        }

        // GET: api/area/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<AreaResponseDTO>> GetArea(int id)
        {
            var area = await _context.Areas
                .Include(a => a.Rules)
                .FirstOrDefaultAsync(a => a.AreaId == id);

            if (area == null)
                return NotFound("Área no encontrada.");

            return Ok(_mapper.Map<AreaResponseDTO>(area));
        }

        // POST: api/area
        [HttpPost]
        public async Task<IActionResult> CreateArea([FromBody] AreaDTO dto)
        {
            var area = _mapper.Map<Area>(dto);

            _context.Areas.Add(area);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArea), new { id = area.AreaId },
                _mapper.Map<AreaResponseDTO>(area));
        }

        // PUT: api/area/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArea(int id, [FromBody] AreaDTO dto)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area == null)
                return NotFound("Área no encontrada.");

            area.Name = dto.Name;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/area/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArea(int id)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area == null)
                return NotFound("Área no encontrada.");

            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/area/{id}/rules
        [HttpPost("{id}/rules")]
        public async Task<IActionResult> AddRule(int id, [FromBody] RuleDTO dto)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area == null)
                return NotFound("Área no encontrada.");

            var rule = new AreaEquipmentRule
            {
                AreaId = id,
                AllowedEquipmentType = dto.AllowedEquipmentType
            };

            _context.AreaEquipmentRules.Add(rule);
            await _context.SaveChangesAsync();

            return Ok(_mapper.Map<RuleResponseDTO>(rule));
        }

        // DELETE: api/area/{areaId}/rules/{ruleId}
        [HttpDelete("{areaId}/rules/{ruleId}")]
        public async Task<IActionResult> DeleteRule(int areaId, int ruleId)
        {
            var rule = await _context.AreaEquipmentRules
                .FirstOrDefaultAsync(r => r.Id == ruleId && r.AreaId == areaId);

            if (rule == null)
                return NotFound("Regla no encontrada.");

            _context.AreaEquipmentRules.Remove(rule);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
