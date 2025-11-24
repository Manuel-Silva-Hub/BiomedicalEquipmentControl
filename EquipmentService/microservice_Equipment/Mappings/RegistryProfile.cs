using AutoMapper;
using microservice_Equipment.DTOs;
using microservice_Equipment.Models;
using static microservice_Equipment.DTOs.RecordEgressDTO;

namespace microservice_Equipment.Mappings
{
    public class RegistryProfile : Profile
    {
        public RegistryProfile()
        {
            // De DTO a Entidad (Ingreso)
            CreateMap<RegistrationEntryDTO, EquipmentRegistration>()
                .ForMember(dest => dest.EntryDate, opt => opt.MapFrom(src => src.EntryDate.ToLocalTime()))
                .ForMember(dest => dest.IsInside, opt => opt.MapFrom(src => true));

            // De Entidad a DTO (Respuesta)
            CreateMap<EquipmentRegistration, RecordResponseDTO>()
                .ForMember(dest => dest.Name, 
                            opt => opt.MapFrom(src => src.Area.Name));

            CreateMap<Area, AreaResponseDTO>()
    .ForMember(dest => dest.Rules, opt => opt.MapFrom(src => src.Rules));

            CreateMap<AreaDTO, Area>();

            CreateMap<AreaEquipmentRule, RuleResponseDTO>();
            CreateMap<RuleDTO, AreaEquipmentRule>();

        }
    }
}
