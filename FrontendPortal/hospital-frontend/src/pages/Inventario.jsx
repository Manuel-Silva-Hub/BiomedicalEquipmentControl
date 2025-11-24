import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { inventoryService } from '../api/inventoryService';
import { equipmentService } from '../api/equipmentService'; // ← Agregar import
import { Search, Plus, Edit, Trash2, Download, QrCode, Shield } from 'lucide-react'; // ← Agregar Shield
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import QRCodeLib from 'qrcode';

export const Inventario = () => {
  const [equipos, setEquipos] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [areas, setAreas] = useState([]); // ← Nuevo estado
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [createRule, setCreateRule] = useState(false); // ← Nuevo estado
  const [selectedAreaForRule, setSelectedAreaForRule] = useState(''); // ← Nuevo estado
  
  const [formData, setFormData] = useState({
    equipmentType: '',
    serial: '',
    description: '',
    qrCode: '',
    photoUrl: '',
  });

  useEffect(() => {
    loadEquipos();
    loadAreas(); // ← Cargar áreas
  }, []);

  useEffect(() => {
    const filtered = equipos.filter(equipo =>
      equipo.equipmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipos(filtered);
  }, [searchTerm, equipos]);

  useEffect(() => {
    if (formData.qrCode && formData.qrCode.trim() !== '') {
      generateQRCode(formData.qrCode);
    } else {
      setQrCodeImage('');
    }
  }, [formData.qrCode]);

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

  // ← Nueva función: Cargar áreas
  const loadAreas = async () => {
    try {
      const data = await equipmentService.getAreas();
      console.log('Áreas cargadas:', data);
      setAreas(data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const generateQRCode = async (text) => {
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeImage(qrDataUrl);
    } catch (error) {
      console.error('Error al generar código QR:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeImage) return;

    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `QR_${formData.serial || formData.qrCode || 'equipo'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let equipoCreado;
      
      if (editingEquipo) {
        await inventoryService.updateEquipo(editingEquipo.id, formData);
        equipoCreado = { ...editingEquipo, ...formData };
      } else {
        equipoCreado = await inventoryService.createEquipo(formData);
        
        // ← Descargar QR automáticamente después de crear
        if (qrCodeImage) {
          setTimeout(() => {
            downloadQRCode();
          }, 500);
        }

        // ← Crear regla de área si está activada
        if (createRule && selectedAreaForRule && formData.equipmentType) {
          try {
            const ruleData = {
              allowedEquipmentType: formData.equipmentType
            };
            
            console.log('Creando regla para área:', selectedAreaForRule);
            console.log('Datos de la regla:', ruleData);
            
            await equipmentService.addAreaRule(selectedAreaForRule, ruleData);
            
            alert(`✅ Equipo creado y regla agregada exitosamente al área seleccionada`);
          } catch (ruleError) {
            console.error('Error al crear regla:', ruleError);
            alert(`⚠️ Equipo creado, pero hubo un error al crear la regla: ${ruleError.message}`);
          }
        }
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
      setFormData(equipo);
      if (equipo.qrCode) {
        generateQRCode(equipo.qrCode);
      }
    } else {
      setEditingEquipo(null);
      setFormData({
        equipmentType: '',
        serial: '',
        description: '',
        qrCode: '',
        photoUrl: '',
      });
      setQrCodeImage('');
      setCreateRule(false); // ← Reset
      setSelectedAreaForRule(''); // ← Reset
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEquipo(null);
    setQrCodeImage('');
    setCreateRule(false);
    setSelectedAreaForRule('');
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
                          {equipo.qrCode}
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
                        <span className="text-gray-400">Sin foto</span>
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
              placeholder="Ingrese el código QR del equipo"
            />
            
            {qrCodeImage && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start gap-4">
                  <img 
                    src={qrCodeImage} 
                    alt="QR Code" 
                    className="w-32 h-32 border-2 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Vista previa del código QR
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Este código QR se descargará automáticamente al crear el equipo
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={downloadQRCode}
                      className="text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Descargar ahora
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

          {/* ← NUEVA SECCIÓN: Crear regla de área */}
          {!editingEquipo && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-hospital-blue" />
                <h3 className="text-sm font-bold text-gray-700">Regla de Acceso al Área</h3>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createRule}
                    onChange={(e) => {
                      setCreateRule(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedAreaForRule('');
                      }
                    }}
                    className="w-4 h-4 text-hospital-blue border-gray-300 rounded focus:ring-hospital-blue"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Crear regla para permitir este tipo de equipo en un área específica
                  </span>
                </label>

                {createRule && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Área *
                    </label>
                    <select
                      value={selectedAreaForRule}
                      onChange={(e) => setSelectedAreaForRule(e.target.value)}
                      className="input-field"
                      required={createRule}
                    >
                      <option value="">Seleccione un área</option>
                      {areas.map((area) => (
                        <option key={area.areaId} value={area.areaId}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Se creará una regla que permitirá equipos de tipo "<strong>{formData.equipmentType || '...'}</strong>" en el área seleccionada
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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