import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { inventoryService } from '../api/inventoryService';
import { Search, Plus, Edit, Trash2, Image, QrCode } from 'lucide-react';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

export const Inventario = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [formData, setFormData] = useState({
    equipmentType: '',
    serial: '',
    description: '',
    qrCode: '',
    photoUrl: '',
  });

  useEffect(() => {
    loadEquipos();
  }, []);

  useEffect(() => {
    const filtered = equipos.filter(equipo =>
      equipo.equipmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipos(filtered);
  }, [searchTerm, equipos]);

  const loadEquipos = async () => {
    try {
      const data = await inventoryService.getEquipos();
      console.log('Equipos cargados:', data);
      setEquipos(data);
      setFilteredEquipos(data);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipo) {
        await inventoryService.updateEquipo(editingEquipo.id, formData);
      } else {
        await inventoryService.createEquipo(formData);
      }
      loadEquipos();
      closeModal();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
      alert('Error al guardar el equipo. Verifica los datos.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await inventoryService.deleteEquipo(id);
        loadEquipos();
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
        alert('Error al eliminar el equipo.');
      }
    }
  };

  const openModal = (equipo = null) => {
    if (equipo) {
      setEditingEquipo(equipo);
      setFormData({
        equipmentType: equipo.equipmentType || '',
        serial: equipo.serial || '',
        description: equipo.description || '',
        qrCode: equipo.qrCode || '',
        photoUrl: equipo.photoUrl || '',
      });
    } else {
      setEditingEquipo(null);
      setFormData({
        equipmentType: '',
        serial: '',
        description: '',
        qrCode: '',
        photoUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEquipo(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-2">Gestión de equipos médicos</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={20} className="mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tipo, serial o descripción..."
            className="input-field pl-10 w-full"
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serial</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">QR</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Foto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEquipos.length > 0 ? (
                filteredEquipos.map((equipo) => (
                  <motion.tr
                    key={equipo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#F9FAFB' }}
                  >
                    <td className="px-4 py-3 text-sm">{equipo.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{equipo.equipmentType}</td>
                    <td className="px-4 py-3 text-sm">{equipo.serial}</td>
                    <td className="px-4 py-3 text-sm">
                      {equipo.description?.substring(0, 50)}
                      {equipo.description?.length > 50 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {equipo.qrCode ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <QrCode size={16} />
                          Sí
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {equipo.photoUrl ? (
                        <img
                          src={equipo.photoUrl}
                          alt={equipo.equipmentType}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Image size={16} />
                          Sin foto
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(equipo)}
                          className="p-2 text-hospital-blue hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(equipo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron equipos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Equipo *
            </label>
            <input
              type="text"
              value={formData.equipmentType}
              onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
              className="input-field"
              placeholder="Ej: Monitor Cardíaco"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Serie *
            </label>
            <input
              type="text"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              className="input-field"
              placeholder="Ej: MC-2024-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Descripción del equipo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código QR
            </label>
            <input
              type="text"
              value={formData.qrCode}
              onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
              className="input-field"
              placeholder="Código QR del equipo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Foto
            </label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="input-field"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.photoUrl && (
              <div className="mt-2">
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingEquipo ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};