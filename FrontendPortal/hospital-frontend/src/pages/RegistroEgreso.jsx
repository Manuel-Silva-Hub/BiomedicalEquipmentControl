import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { equipmentService } from '../api/equipmentService';
import { ArrowUpFromLine, AlertCircle, CheckCircle, Search, QrCode, Image as ImageIcon } from 'lucide-react';
import { QRScanner } from '../components/QRScanner'; // ← Importar

export const RegistroEgreso = () => {
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false); // ← Agregar estado
  
  const [formData, setFormData] = useState({
    outUser: '',
    exitReason: '',
    exitObservations: '',
  });

  useEffect(() => {
    loadRegistrosActivos();
  }, []);

  useEffect(() => {
    filterRegistros();
  }, [searchTerm, registros]);

  const loadRegistrosActivos = async () => {
    try {
      const data = await equipmentService.getRegistrosEnInstalacion();
      console.log('Registros activos:', data);
      setRegistros(data);
      setFilteredRegistros(data);
    } catch (error) {
      console.error('Error al cargar registros:', error);
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
        r.qrCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRegistros(filtered);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectRegistro = (registro) => {
    console.log('Registro seleccionado:', registro);
    setSelectedRegistro(registro);
    setError('');
    setSearchTerm(`${registro.equipmentType} - ${registro.serial}`);
  };

  // ← Nueva función: Manejar QR escaneado
  const handleQRScanned = (qrCode) => {
    console.log('Código QR escaneado:', qrCode);
    setSearchTerm(qrCode);
    setShowQRScanner(false);
    
    // Buscar registro por código QR
    const registroEncontrado = registros.find((r) => r.qrCode === qrCode);
    
    if (registroEncontrado) {
      handleSelectRegistro(registroEncontrado);
      setError('');
    } else {
      setError(`No se encontró ningún equipo activo con el código QR: ${qrCode}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRegistro) {
      setError('Debe seleccionar un equipo para registrar su salida');
      return;
    }

    if (!selectedRegistro.id) {
      setError('Error: El registro seleccionado no tiene ID válido');
      console.error('Registro sin ID:', selectedRegistro);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const exitData = {
        registroId: selectedRegistro.id,
        outUser: formData.outUser,
        exitReason: formData.exitReason,
        exitObservations: formData.exitObservations,
        exitDate: new Date().toISOString(),
      };

      console.log('ID del registro:', selectedRegistro.id);
      console.log('Datos de salida a enviar:', exitData);

      await equipmentService.updateExit(selectedRegistro.id, exitData);
      
      setSuccess(true);
      setSelectedRegistro(null);
      setSearchTerm('');
      setFormData({
        outUser: '',
        exitReason: '',
        exitObservations: '',
      });
      loadRegistrosActivos();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al registrar egreso:', err);
      console.error('Response:', err.response);
      
      let errorMessage = 'Error al registrar egreso';
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.title) {
          errorMessage = responseData.title;
          if (responseData.detail) {
            errorMessage += `: ${responseData.detail}`;
          }
        } else if (responseData.errors) {
          const errores = Object.values(responseData.errors).flat();
          errorMessage = errores.join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

      {/* Búsqueda */}
      <Card>
        <h3 className="text-lg font-bold mb-4">Buscar Equipo</h3>
        
        <div className="space-y-4">
          {/* Búsqueda por texto con botón QR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por Tipo, Serial o Código QR
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Monitor, BIO-001, QR123..."
                  className="input-field pl-10 w-full"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowQRScanner(!showQRScanner)}
              >
                <QrCode size={20} className="mr-2" />
                {showQRScanner ? 'Cerrar' : 'Escanear QR'}
              </Button>
            </div>
          </div>

          {/* Scanner QR */}
          {showQRScanner && (
            <Card className="bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Escanear Código QR</h3>
              <QRScanner
                onScan={handleQRScanned}
                onClose={() => setShowQRScanner(false)}
              />
            </Card>
          )}
        </div>

        {/* Resultados de búsqueda */}
        {searchTerm && filteredRegistros.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Resultados: {filteredRegistros.length} equipo(s) encontrado(s)
            </p>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {filteredRegistros.map((registro) => (
                <motion.div
                  key={registro.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectRegistro(registro)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRegistro?.id === registro.id
                      ? 'border-hospital-blue bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-hospital-blue hover:shadow'
                  }`}
                >
                  <div className="flex gap-4">
                    {registro.photoUrl ? (
                      <img
                        src={registro.photoUrl}
                        alt={registro.equipmentType}
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{registro.equipmentType}</h4>
                      <p className="text-sm text-gray-600">Serial: {registro.serial}</p>
                      <p className="text-sm text-gray-600">Área: {registro.name}</p>
                      {registro.qrCode && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <QrCode size={14} />
                          {registro.qrCode}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresó: {new Date(registro.entryDate).toLocaleDateString('es-CO')}
                      </p>
                    </div>

                    {selectedRegistro?.id === registro.id && (
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-hospital-blue text-white text-sm font-medium rounded-full">
                          Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay resultados */}
        {searchTerm && filteredRegistros.length === 0 && !selectedRegistro && (
          <div className="mt-4 text-center py-8 text-gray-500">
            <QrCode size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No se encontraron equipos con ese criterio de búsqueda</p>
            <p className="text-sm mt-1">Intenta escanear el código QR o buscar por otro término</p>
          </div>
        )}
      </Card>

      {/* Formulario de Egreso */}
      {selectedRegistro && (
        <>
          {/* Vista previa detallada del equipo seleccionado */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-700">Equipo Seleccionado</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedRegistro(null);
                  setSearchTerm('');
                }}
                className="text-sm"
              >
                Cambiar equipo
              </Button>
            </div>
            
            <div className="flex gap-4">
              {/* Imagen del equipo */}
              {selectedRegistro.photoUrl ? (
                <img
                  src={selectedRegistro.photoUrl}
                  alt={selectedRegistro.equipmentType}
                  className="w-32 h-32 object-cover rounded-lg border-2 border-blue-200 shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-lg border-2 border-blue-200 flex items-center justify-center shadow-md">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}

              {/* Información detallada */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Tipo de Equipo</p>
                  <p className="font-bold text-lg text-gray-900">{selectedRegistro.equipmentType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Número de Serie</p>
                  <p className="font-semibold text-gray-900">{selectedRegistro.serial}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Código QR</p>
                  <div className="flex items-center gap-1">
                    <QrCode size={16} className="text-hospital-blue" />
                    <p className="font-semibold text-gray-900">{selectedRegistro.qrCode || 'No disponible'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Área Actual</p>
                  <p className="font-semibold text-gray-900">{selectedRegistro.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600">Descripción</p>
                  <p className="text-sm text-gray-700">{selectedRegistro.description || 'Sin descripción'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Responsable de Ingreso</p>
                  <p className="text-sm text-gray-700">{selectedRegistro.loginUser}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fecha de Ingreso</p>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedRegistro.entryDate).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicador de tiempo en hospital */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700">Tiempo en hospital:</p>
                </div>
                <p className="text-sm font-bold text-hospital-blue">
                  {(() => {
                    const diff = Math.floor((new Date() - new Date(selectedRegistro.entryDate)) / (1000 * 60 * 60 * 24));
                    return diff === 0 ? 'Menos de 1 día' : `${diff} día${diff !== 1 ? 's' : ''}`;
                  })()}
                </p>
              </div>
            </div>
          </Card>

          {/* Formulario de egreso */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowUpFromLine size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Formulario de Egreso</h2>
                <p className="text-gray-600 text-sm">
                  Complete la información de salida del equipo
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable de Salida *
                  </label>
                  <input
                    type="text"
                    name="outUser"
                    value={formData.outUser}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nombre del responsable"
                    required
                    minLength={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingrese el nombre completo de quien autoriza la salida
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de Salida *
                  </label>
                  <select
                    name="exitReason"
                    value={formData.exitReason}
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
                  name="exitObservations"
                  value={formData.exitObservations}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Ingrese observaciones adicionales sobre el motivo de salida, condiciones del equipo, etc..."
                />
              </div>

              {/* Resumen antes de enviar */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Resumen del Registro</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Equipo:</span>
                    <span className="ml-2 font-semibold">{selectedRegistro.equipmentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Serial:</span>
                    <span className="ml-2 font-semibold">{selectedRegistro.serial}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Área:</span>
                    <span className="ml-2 font-semibold">{selectedRegistro.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha de salida:</span>
                    <span className="ml-2 font-semibold">{new Date().toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setSelectedRegistro(null);
                    setSearchTerm('');
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="danger" disabled={loading}>
                  {loading ? 'Registrando Egreso...' : 'Confirmar Egreso'}
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}

      {/* Mensaje informativo si no hay equipo seleccionado */}
      {!selectedRegistro && !searchTerm && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center py-8">
            <QrCode size={48} className="mx-auto mb-3 text-hospital-blue" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Busca el equipo a retirar
            </h3>
            <p className="text-gray-600 text-sm">
              Usa el campo de búsqueda o escanea el código QR del equipo que deseas registrar como egreso
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};