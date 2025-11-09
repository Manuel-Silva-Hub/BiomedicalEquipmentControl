using AutoMapper;
using microservice_InvService.Models;
using microservice_InvService.DTOs;

namespace microservice_InvService.Mappings
{
    public class InventarioProfile : Profile
    {
        public InventarioProfile()
        {
            CreateMap<Equipo, InventarioResponseDTO>();
            CreateMap<InventarioCreateDTO, Equipo>();
            CreateMap<InventarioUpdateDTO, Equipo>();
        }
    }
}
