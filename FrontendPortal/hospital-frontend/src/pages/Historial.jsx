import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Modal } from '../components/UI/Modal';
import { equipmentService } from '../api/equipmentService';
import { History, Search, Calendar, Eye } from 'lucide-react';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const Historial = () => {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadHistorial();
  }, []);

  useEffect(() => {
    filterRegistros();
  }, [searchTerm, dateFilter, registros]);

  const loadHistorial = async () => {
    try {
      const data = await equipmentService.getRegistros();
      console.log('Historial cargado:', data); // Debug
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
          r.equipmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.loginUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.areaName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (r) => new Date(r.entryDate).toISOString().split('T')[0] === dateFilter
      );
    }

    setFilteredRegistros(filtered);
  };

  const openDetails = (registro) => {
    setSelectedRegistro(registro);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedRegistro(null);
    setIsModalOpen(false);
  };

  // ← Nueva función: Determinar el estado real del registro
  const getEstadoRegistro = (registro) => {
    // Si isInside es true, está dentro
    if (registro.isInside === true) {
      return {
        texto: 'En instalación',
        clase: 'bg-green-100 text-green-800',
      };
    }
    // Si isInside es false, está fuera
    else if (registro.isInside === false) {
      return {
        texto: 'Finalizado',
        clase: 'bg-gray-100 text-gray-800',
      };
    }
    // Fallback: Si no tiene isInside pero tiene exitDate
    else if (registro.exitDate) {
      return {
        texto: 'Finalizado',
        clase: 'bg-gray-100 text-gray-800',
      };
    }
    // Por defecto
    else {
      return {
        texto: 'En instalación',
        clase: 'bg-green-100 text-green-800',
      };
    }
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Registros</p>
              <p className="text-3xl font-bold mt-2">{registros.length}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <History size={32} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Instalación</p>
              <p className="text-3xl font-bold mt-2">
                {registros.filter((r) => r.isInside === true).length}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <Calendar size={32} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Finalizados</p>
              <p className="text-3xl font-bold mt-2">
                {registros.filter((r) => r.isInside === false).length}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <Search size={32} className="text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipo, serial, responsable o área..."
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

      {/* Tabla */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <History size={24} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Movimientos Registrados</h2>
            <p className="text-gray-600 text-sm">
              Mostrando: {filteredRegistros.length} de {registros.length} registros
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serial</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Área</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Responsable</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Salida</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistros.length > 0 ? (
                filteredRegistros.map((registro) => {
                  const estado = getEstadoRegistro(registro);
                  return (
                    <motion.tr
                      key={registro.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: '#F9FAFB' }}
                    >
                      <td className="px-4 py-3 text-sm">{registro.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {registro.equipmentType}
                      </td>
                      <td className="px-4 py-3 text-sm">{registro.serial}</td>
                      <td className="px-4 py-3 text-sm">{registro.name}</td>
                      <td className="px-4 py-3 text-sm">{registro.loginUser}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatDateTime(registro.entryDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {registro.outDate && !registro.outDate.startsWith('0001')
                          ? formatDateTime(registro.outDate) 
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${estado.clase}`}>
                          {estado.texto}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => openDetails(registro)}
                          className="p-2 text-hospital-blue hover:bg-blue-50 rounded flex items-center gap-1"
                        >
                          <Eye size={18} />
                          <span>Ver</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalles */}
      {selectedRegistro && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeDetails}
          title="Detalles del Registro"
        >
          <div className="space-y-4">
            {/* Estado destacado */}
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">Estado Actual</p>
              <span
                className={`inline-block px-4 py-2 text-lg font-bold rounded-full ${
                  getEstadoRegistro(selectedRegistro).clase
                }`}
              >
                {getEstadoRegistro(selectedRegistro).texto}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID de Registro</p>
                <p className="text-lg font-semibold">
                  {selectedRegistro.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Equipo</p>
                <p className="text-lg font-semibold">
                  {selectedRegistro.equipmentType}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Serial</p>
                <p className="text-lg font-semibold">{selectedRegistro.serial}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Área</p>
                <p className="text-lg font-semibold">{selectedRegistro.name}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Descripción</p>
              <p className="text-gray-700">
                {selectedRegistro.description || 'Sin descripción'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Responsable Ingreso
                </p>
                <p className="text-gray-700">{selectedRegistro.loginUser}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha Ingreso</p>
                <p className="text-gray-700">
                  {formatDateTime(selectedRegistro.entryDate)}
                </p>
              </div>
            </div>

            {selectedRegistro.outDate && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Responsable Salida
                  </p>
                  <p className="text-gray-700">
                    {selectedRegistro.outUser || 'No registrado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha Salida</p>
                  <p className="text-gray-700">
                    {!selectedRegistro.outDate || 
                    selectedRegistro.outDate.startsWith('0001') ||
                    new Date(selectedRegistro.outDate).getFullYear() === 1
                      ? "-" 
                      : formatDateTime(selectedRegistro.outDate)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Código QR</p>
                <p className="text-gray-700">
                  {selectedRegistro.qrCode || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Es Frecuente</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedRegistro.isFrequent
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedRegistro.isFrequent ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            {selectedRegistro.photoUrl && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Fotografía</p>
                <img
                  src={selectedRegistro.photoUrl}
                  alt={selectedRegistro.equipmentType}
                  className="w-full max-h-64 object-contain rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};