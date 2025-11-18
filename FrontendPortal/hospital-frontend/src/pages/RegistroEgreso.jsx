import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { equipmentService } from '../api/equipmentService';
import { ArrowUpFromLine, AlertCircle, CheckCircle } from 'lucide-react';

export const RegistroEgreso = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    registroId: '',
    OutUser: '',
    motivoSalida: '',
    observacionesSalida: '',
  });

  useEffect(() => {
    loadRegistrosActivos();
  }, []);

  const loadRegistrosActivos = async () => {
    try {
      const data = await equipmentService.getRegistrosEnInstalacion();
      setRegistros(data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const exitData = {
        OutUser: formData.OutUser,
        motivoSalida: formData.motivoSalida,
        observacionesSalida: formData.observacionesSalida,
        fechaSalida: new Date().toISOString(),
      };

      await equipmentService.updateExit(formData.registroId, exitData);
      setSuccess(true);
      setFormData({
        registroId: '',
        OutUser: '',
        motivoSalida: '',
        observacionesSalida: '',
      });
      loadRegistrosActivos();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar egreso');
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
        <h1 className="text-3xl font-bold text-gray-900">Registro de Egreso</h1>
        <p className="text-gray-600 mt-2">Registrar salida de equipo del hospital</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <CheckCircle size={20} />
          <span>¡Egreso registrado exitosamente!</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-lg">
            <ArrowUpFromLine size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Formulario de Egreso</h2>
            <p className="text-gray-600 text-sm">Complete todos los campos requeridos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registro de Ingreso *
              </label>
              <select
                name="registroId"
                value={formData.registroId}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccione un registro</option>
                {registros.map((registro) => (
                  <option key={registro.id} value={registro.id}>
                    ID: {registro.id} - {registro.equipoNombre} - Área: {registro.areaId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable de Salida *
              </label>
              <input
                type="text"
                name="OutUser"
                value={formData.OutUser}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del responsable"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Salida *
              </label>
              <select
                name="motivoSalida"
                value={formData.motivoSalida}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Seleccione un motivo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Reparación">Reparación</option>
                <option value="Traslado">Traslado</option>
                <option value="Baja">Baja definitiva</option>
                <option value="Devolución">Devolución a proveedor</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones de Salida
            </label>
            <textarea
              name="observacionesSalida"
              value={formData.observacionesSalida}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Ingrese observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Egreso'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};