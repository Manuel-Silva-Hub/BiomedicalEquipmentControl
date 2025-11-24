import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Modal } from '../components/UI/Modal';
import { equipmentService } from '../api/equipmentService';
import { Search, Eye, XCircle, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export const EquiposRetirados = () => {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEquiposRetirados();
  }, []);

  useEffect(() => {
    filterRegistros();
  }, [searchTerm, registros]);

  const loadEquiposRetirados = async () => {
    try {
      // Obtener todos los registros y filtrar los que tienen salida
      const allRegistros = await equipmentService.getRegistros();
      const retirados = allRegistros.filter((r) => !r.isInside || r.exitDate);
      console.log('Equipos retirados:', retirados);
      setRegistros(retirados);
      setFilteredRegistros(retirados);
    } catch (error) {
      console.error('Error al cargar equipos retirados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistros = () => {
    if (!searchTerm) {
      setFilteredRegistros(registros);
      return;
    }

    const filtered = registros.filter(
      (r) =>
        r.equipmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.loginUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  const calcularDiasEnHospital = (entryDate, outDate) => {
    if (!entryDate || !outDate) return '-';
    const entry = new Date(entryDate);
    const exit = new Date(outDate);
    const diffTime = Math.abs(exit - entry);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
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
        <h1 className="text-3xl font-bold text-gray-900">Equipos Retirados</h1>
        <p className="text-gray-600 mt-2">
          Historial de equipos que salieron del hospital
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Retirados</p>
              <p className="text-3xl font-bold mt-2">{registros.length}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <XCircle size={32} className="text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="text-3xl font-bold mt-2">
                {
                  registros.filter((r) => {
                    if (!r.outDate) return false;
                    const exitDate = new Date(r.outDate);
                    const now = new Date();
                    return (
                      exitDate.getMonth() === now.getMonth() &&
                      exitDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <Calendar size={32} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Filtrados</p>
              <p className="text-3xl font-bold mt-2">{filteredRegistros.length}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <Search size={32} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tipo, serial, responsable o área..."
            className="input-field pl-10 w-full"
          />
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Tipo de Equipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Serial
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Área
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Fecha Salida
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Días en Hospital
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistros.length > 0 ? (
                filteredRegistros.map((registro) => (
                  <motion.tr
                    key={registro.registrationId}
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
                    <td className="px-4 py-3 text-sm">
                      {registro.outDate
                        ? formatDateTime(registro.outDate)
                        : 'Sin fecha'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {calcularDiasEnHospital(
                        registro.entryDate,
                        registro.outDate
                      )}
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron equipos retirados
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
          title="Detalles del Equipo Retirado"
        >
          <div className="space-y-4">
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
              <p className="text-sm font-medium text-gray-500 mb-2">
                Descripción
              </p>
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
                <p className="text-sm font-medium text-gray-500">
                  Responsable Salida
                </p>
                <p className="text-gray-700">
                  {selectedRegistro.outUser || 'No registrado'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha Ingreso</p>
                <p className="text-gray-700">
                  {formatDateTime(selectedRegistro.entryDate)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha Salida</p>
                <p className="text-gray-700">
                  {selectedRegistro.outDate
                    ? formatDateTime(selectedRegistro.outDate)
                    : 'Sin fecha'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Tiempo en Hospital
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {calcularDiasEnHospital(
                  selectedRegistro.entryDate,
                  selectedRegistro.outDate
                )}
              </p>
            </div>

            {selectedRegistro.photoUrl && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Fotografía
                </p>
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