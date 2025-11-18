import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { equipmentService } from '../api/equipmentService';
import { History, Search, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const Historial = () => {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadHistorial();
  }, []);

  useEffect(() => {
    filterRegistros();
  }, [searchTerm, dateFilter, registros]);

  const loadHistorial = async () => {
    try {
      const data = await equipmentService.getRegistros();
      setRegistros(data);
      setFilteredRegistros(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistros = () => {
    let filtered = [...registros];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.equipoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.areaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.responsable?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (r) => new Date(r.fechaIngreso).toISOString().split('T')[0] === dateFilter
      );
    }

    setFilteredRegistros(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historial</h1>
        <p className="text-gray-600 mt-2">Registro completo de movimientos de equipos</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipo, área o responsable..."
              className="input-field pl-10 w-full"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <History size={24} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Movimientos Registrados</h2>
            <p className="text-gray-600 text-sm">Total: {filteredRegistros.length} registros</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Equipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Área</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Responsable</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Salida</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistros.length > 0 ? (
                filteredRegistros.map((registro) => (
                  <motion.tr
                    key={registro.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                  >
                    <td className="px-4 py-3 text-sm">{registro.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{registro.equipoNombre}</td>
                    <td className="px-4 py-3 text-sm">{registro.areaNombre}</td>
                    <td className="px-4 py-3 text-sm">{registro.responsable}</td>
                    <td className="px-4 py-3 text-sm">{formatDateTime(registro.fechaIngreso)}</td>
                    <td className="px-4 py-3 text-sm">
                      {registro.fechaSalida ? formatDateTime(registro.fechaSalida) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          registro.fechaSalida
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {registro.fechaSalida ? 'Finalizado' : 'En instalación'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};