import axiosInstance from './axiosConfig';

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL;

export const authService = {
  async login(email, password) {
    const response = await axiosInstance.post(`/auth/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async register(userData) {
    const response = await axiosInstance.post(`/auth/api/auth/register`, userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  decodeToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        console.error('Token inválido:', token);
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token no tiene 3 partes:', parts.length);
        return null;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Token decodificado exitosamente:', decoded);
      
      // ← CORRECCIÓN: Extraer el rol correctamente de las claims de Microsoft
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const nameClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const emailClaim = decoded['sub'] || decoded['email'];

      // Normalizar los campos
      const user = {
        id: nameClaim || decoded.nameid || decoded.sub || decoded.userId,
        name: emailClaim?.split('@')[0] || decoded.name || decoded.unique_name || 'Usuario',
        email: emailClaim || decoded.email || decoded.sub,
        role: roleClaim || decoded.role || decoded.Role || 'Empleado',
        exp: decoded.exp,
      };
      console.log('Usuario normalizado:', user);
      return user;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },
};