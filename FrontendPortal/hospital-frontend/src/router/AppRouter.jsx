import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/Layout/ProtectedRoute';
import { MainLayout } from '../components/Layout/MainLayout';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Inventario } from '../pages/Inventario';
import { RegistroIngreso } from '../pages/RegistroIngreso';
import { RegistroEgreso } from '../pages/RegistroEgreso';
import { Reportes } from '../pages/Reportes';
import { Historial } from '../pages/Historial';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard - Todos los roles */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Inventario - TI y Empleado */}
            <Route
              path="inventario"
              element={
                <ProtectedRoute allowedRoles={['TI', 'Empleado']}>
                  <Inventario />
                </ProtectedRoute>
              }
            />

            {/* Registro Ingreso - TI y Vigilante */}
            <Route
              path="registro-ingreso"
              element={
                <ProtectedRoute allowedRoles={['TI', 'Vigilante']}>
                  <RegistroIngreso />
                </ProtectedRoute>
              }
            />

            {/* Registro Egreso - TI y Vigilante */}
            <Route
              path="registro-egreso"
              element={
                <ProtectedRoute allowedRoles={['TI', 'Vigilante']}>
                  <RegistroEgreso />
                </ProtectedRoute>
              }
            />

            {/* Reportes - Solo TI */}
            <Route
              path="reportes"
              element={
                <ProtectedRoute allowedRoles={['TI']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />

            {/* Historial - TI y Vigilante */}
            <Route
              path="historial"
              element={
                <ProtectedRoute allowedRoles={['TI', 'Vigilante']}>
                  <Historial />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};