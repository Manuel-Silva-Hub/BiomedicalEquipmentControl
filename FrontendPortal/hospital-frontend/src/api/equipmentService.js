import axiosInstance from './axiosConfig';

// Ya no necesitas la URL, usa rutas relativas
export const equipmentService = {
  // Areas
  async getAreas() {
    const response = await axiosInstance.get('/api/area');
    return response.data;
  },

  async getArea(id) {
    const response = await axiosInstance.get(`/api/area/${id}`);
    return response.data;
  },

  async createArea(areaData) {
    const response = await axiosInstance.post('/api/area', areaData);
    return response.data;
  },

  async updateArea(id, areaData) {
    const response = await axiosInstance.put(`/api/area/${id}`, areaData);
    return response.data;
  },

  async deleteArea(id) {
    const response = await axiosInstance.delete(`/api/area/${id}`);
    return response.data;
  },

  // Reglas de área
  async addAreaRule(areaId, ruleData) {
    const response = await axiosInstance.post(`/api/area/${areaId}/rules`, ruleData);
    return response.data;
  },

  async deleteAreaRule(areaId, ruleId) {
    const response = await axiosInstance.delete(`/api/area/${areaId}/rules/${ruleId}`);
    return response.data;
  },

  // Registros
  async createEntry(entryData) {
  // Validar que areaId sea un número
  const areaId = Number(entryData.areaId);
  if (isNaN(areaId)) {
    throw new Error('El ID del área debe ser un número válido');
  }

  const payload = {
    equipmentType: entryData.equipmentType,
    serial: entryData.serial,
    description: entryData.description || '',
    qrCode: entryData.qrCode || '',
    photoUrl: entryData.photoUrl || '',
    loginUser: entryData.loginUser, // Ahora viene del campo "responsable"
    entryDate: entryData.entryDate || new Date().toISOString(),
    isFrequent: entryData.isFrequent || false,
    isInside: true,
    areaId: areaId, // Número validado
  };

  console.log('Payload enviado al backend:', payload);
  console.log('Tipo de areaId:', typeof payload.areaId, 'Valor:', payload.areaId);
  
  const response = await axiosInstance.post('/api/registry/ingreso', payload);
  return response.data;
  },

  async updateExit(id, exitData) {
    console.log('updateExit - ID:', id); // Debug
    console.log('updateExit - Data:', exitData); // Debug
    const response = await axiosInstance.put(`/api/registry/egreso/${id}`, exitData);
    return response.data;
  },

  async getRegistros() {
    const response = await axiosInstance.get('/api/registry');
    return response.data;
  },

  async getRegistro(id) {
    const response = await axiosInstance.get(`/api/registry/${id}`);
    return response.data;
  },

  async getRegistrosByFecha(params) {
    const response = await axiosInstance.get('/api/registry/fecha', { params });
    return response.data;
  },

  async getRegistrosEnInstalacion() {
    const response = await axiosInstance.get('/api/registry/en-instalacion');
    return response.data;
  },

  async deleteRegistro(id) {
    const response = await axiosInstance.delete(`/api/registry/${id}`);
    return response.data;
  },
};