import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { equipmentService } from '../api/equipmentService';
import { Package, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    equiposEnHospital: 0,
    ultimosIngresos: [],
    alertas: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Dashboard - Usuario actual:', user);
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const registros = await equipmentService.getRegistrosEnInstalacion();
      setStats({
        equiposEnHospital: registros.length,
        ultimosIngresos: registros.slice(0, 5),
        alertas: registros.filter(r => r.estado === 'alerta').length,
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    console.log('Navegando a:', path);
    console.log('Usuario actual:', user);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Equipos en Hospital',
      value: stats.equiposEnHospital,
      icon: Package,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Ingresos del Mes',
      value: 45,
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Alertas Activas',
      value: stats.alertas,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      trend: '-3%',
    },
    {
      title: 'Estado del Sistema',
      value: 'Óptimo',
      icon: Activity,
      color: 'bg-purple-500',
      trend: '100%',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.name || user?.email} - Rol: {user?.role}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <stat.icon size={32} className="text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Últimos Ingresos */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Equipos en Instalación</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Equipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Numero de Serie</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.ultimosIngresos.length > 0 ? (
                stats.ultimosIngresos.map((registro) => (
                  <motion.tr
                    key={registro.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                  >
                    <td className="px-4 py-3 text-sm">{registro.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{registro.equipmentType}</td>
                    <td className="px-4 py-3 text-sm">{registro.serial}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(registro.entryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Activo
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No hay equipos en instalación
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-xl transition-shadow" 
          onClick={() => handleNavigate('/registro-ingreso')}
        >
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-hospital-blue" />
            </div>
            <h3 className="font-bold text-lg">Registrar Ingreso</h3>
            <p className="text-gray-600 text-sm mt-2">Añadir nuevo equipo al hospital</p>
          </div>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-shadow" 
          onClick={() => handleNavigate('/registro-egreso')}
        >
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-red-600" />
            </div>
            <h3 className="font-bold text-lg">Registrar Egreso</h3>
            <p className="text-gray-600 text-sm mt-2">Retirar equipo del hospital</p>
          </div>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-xl transition-shadow" 
          onClick={() => handleNavigate('/reportes')}
        >
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-hospital-green" />
            </div>
            <h3 className="font-bold text-lg">Generar Reporte</h3>
            <p className="text-gray-600 text-sm mt-2">Exportar datos y estadísticas</p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};