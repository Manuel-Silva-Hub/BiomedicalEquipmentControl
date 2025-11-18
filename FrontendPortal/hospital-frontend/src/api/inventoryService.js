import axiosInstance from './axiosConfig';

export const inventoryService = {
  async getEquipos(search = '') {
    const response = await axiosInstance.get('/api/equipos', {
      params: { search },
    });
    return response.data;
  },

  async getEquipo(id) {
    const response = await axiosInstance.get(`/api/equipos/${id}`);
    return response.data;
  },

  async createEquipo(equipoData) {
    const response = await axiosInstance.post('/api/equipos', equipoData);
    return response.data;
  },

  async updateEquipo(id, equipoData) {
    const response = await axiosInstance.put(`/api/equipos/${id}`, equipoData);
    return response.data;
  },

  async deleteEquipo(id) {
    const response = await axiosInstance.delete(`/api/equipos/${id}`);
    return response.data;
  },
};