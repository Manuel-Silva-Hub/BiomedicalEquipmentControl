import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

// ← Helper para extraer token string
const extractTokenString = (response) => {
  console.log('Extrayendo token de:', response);
  
  // Si es string directo
  if (typeof response === 'string') {
    return response;
  }
  
  // Si es objeto, buscar en diferentes posibles ubicaciones
  const possiblePaths = [
    response.token,
    response.data?.token,
    response.token?.token,
    response.data?.token?.token,
  ];
  
  for (const path of possiblePaths) {
    if (typeof path === 'string') {
      console.log('Token encontrado:', path);
      return path;
    }
  }
  
  console.error('No se encontró token string en:', response);
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = authService.decodeToken(token);
        console.log('Usuario cargado desde token:', decoded);
        if (decoded) {
          setUser(decoded);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      // ← Usar helper
      const tokenString = extractTokenString(response);
      
      if (!tokenString) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      localStorage.setItem('token', tokenString);
      
      const decoded = authService.decodeToken(tokenString);
      
      if (!decoded) {
        throw new Error('No se pudo decodificar el token');
      }

      setUser(decoded);
      return decoded;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // ← Usar helper
      const tokenString = extractTokenString(response);
      
      if (!tokenString) {
        throw new Error('No se recibió un token válido del servidor');
      }
      
      localStorage.setItem('token', tokenString);
      
      const decoded = authService.decodeToken(tokenString);
      
      if (!decoded) {
        throw new Error('No se pudo decodificar el token');
      }

      setUser(decoded);
      return decoded;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};