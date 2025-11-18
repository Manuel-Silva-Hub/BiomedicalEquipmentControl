import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { equipmentService } from '../api/equipmentService';
import { inventoryService } from '../api/inventoryService';
import { ArrowDownToLine, AlertCircle, CheckCircle, User } from 'lucide-react';

export const RegistroIngreso = () => {
  const [areas, setAreas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    equipoId: '',
    areaId: '',
    responsable: '',
    observaciones: '',
    isFrequent: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [areasData, equiposData] = await Promise.all([
        equipmentService.getAreas().catch(() => []),
        inventoryService.getEquipos(),
      ]);
      
      console.log('Áreas cargadas:', areasData); // Debug
      console.log('Equipos cargados:', equiposData); // Debug
      
      setAreas(areasData);
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log(`Campo ${name}:`, newValue, 'tipo:', typeof newValue); // Debug
    
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('FormData completo:', formData); // Debug

      // Validaciones
      if (!formData.equipoId || formData.equipoId === '') {
        throw new Error('Debe seleccionar un equipo');
      }

      if (!formData.areaId || formData.areaId === '') {
        throw new Error('Debe seleccionar un área');
      }

      if (!formData.responsable || formData.responsable.trim() === '') {
        throw new Error('Debe ingresar el nombre del responsable');
      }

      // Validar que el areaId sea un número válido
      const areaIdNumber = parseInt(formData.areaId, 10);
      console.log('areaId parseado:', areaIdNumber, 'válido:', !isNaN(areaIdNumber)); // Debug
      
      if (isNaN(areaIdNumber)) {
        throw new Error('El ID del área no es válido');
      }

      // Obtener los datos del equipo seleccionado
      const equipoSeleccionado = equipos.find(
        (eq) => eq.id === parseInt(formData.equipoId, 10)
      );

      if (!equipoSeleccionado) {
        throw new Error('Equipo no encontrado');
      }

      console.log('Equipo seleccionado:', equipoSeleccionado); // Debug

      // Crear payload según el formato del backend
      const entryData = {
        equipmentType: equipoSeleccionado.equipmentType,
        serial: equipoSeleccionado.serial,
        description: formData.observaciones || equipoSeleccionado.description || '',
        qrCode: equipoSeleccionado.qrCode || '',
        photoUrl: equipoSeleccionado.photoUrl || '',
        loginUser: formData.responsable,
        entryDate: new Date().toISOString(),
        isFrequent: formData.isFrequent,
        isInside: true,
        areaId: areaIdNumber,
      };

      console.log('Datos a enviar:', entryData);
      console.log('Payload JSON:', JSON.stringify(entryData, null, 2)); // Debug

      await equipmentService.createEntry(entryData);
      
      setSuccess(true);
      setFormData({
        equipoId: '',
        areaId: '',
        responsable: '',
        observaciones: '',
        isFrequent: false,
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al registrar ingreso:', err);
      console.error('Response:', err.response);
      
      if (err.response?.data?.errors) {
        const errores = Object.values(err.response.data.errors).flat();
        setError(errores.join(', '));
      } else {
        setError(err.response?.data?.message || err.message || 'Error al registrar ingreso');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registro de Ingreso</h1>
        <p className="text-gray-600 mt-2">Registrar entrada de equipo al hospital</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <CheckCircle size={20} />
          <span>¡Ingreso registrado exitosamente!</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ArrowDownToLine size={24} className="text-hospital-blue" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Formulario de Ingreso</h2>
            <p className="text-gray-600 text-sm">Complete todos los campos requeridos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo *
              </label>
              <select
                name="equipoId"
                value={formData.equipoId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.equipmentType} - {equipo.serial}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área de Destino *
              </label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccione un área</option>
                {areas.map((area) => (
                  <option key={area.areaId} value={area.areaId}>
                    {area.name}
                  </option>
                ))}
              </select>
              {/* Debug: Mostrar áreas cargadas */}
              {areas.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {areas.length} área(s) disponible(s)
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Nombre del responsable del ingreso"
                  required
                  minLength={3}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese el nombre completo de la persona responsable del registro
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFrequent"
                checked={formData.isFrequent}
                onChange={handleChange}
                className="w-4 h-4 text-hospital-blue border-gray-300 rounded focus:ring-hospital-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                ¿Es un ingreso frecuente?
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Marque esta opción si el equipo ingresa regularmente al hospital
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Ingrese observaciones adicionales sobre el equipo o el ingreso..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};