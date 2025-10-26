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
                .ForMember(dest => dest.EntryDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.IsInside, opt => opt.MapFrom(src => true));

            // De Entidad a DTO (Respuesta)
            CreateMap<EquipmentRegistration, RecordResponseDTO>();
        }
    }
}
