import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { equipmentService } from '../api/equipmentService';
import { inventoryService } from '../api/inventoryService';
import { QRScanner } from '../components/QRScanner';
import { 
  ArrowDownToLine, 
  AlertCircle, 
  CheckCircle, 
  User, 
  AlertTriangle,
  Search,
  Image as ImageIcon,
  QrCode
} from 'lucide-react';

export const RegistroIngreso = () => {
  const [areas, setAreas] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [registrosActivos, setRegistrosActivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
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
      const [areasData, equiposData, registrosData] = await Promise.all([
        equipmentService.getAreas().catch(() => []),
        inventoryService.getEquipos(),
        equipmentService.getRegistrosEnInstalacion().catch(() => []),
      ]);
      
      console.log('Áreas cargadas:', areasData);
      console.log('Equipos cargados:', equiposData);
      console.log('Registros activos:', registrosData);
      
      setAreas(areasData);
      setEquipos(equiposData);
      setRegistrosActivos(registrosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    }
  };

  const handleQRScanned = (qrCode) => {
  console.log('Código QR escaneado:', qrCode);
  setSearchTerm(qrCode);
  setShowQRScanner(false);

  const equipoEncontrado = equipos.find((eq) => eq.qrCode === qrCode);
  
    if (equipoEncontrado) {
      handleSelectEquipo(equipoEncontrado);
    } else {
      setError(`No se encontró ningún equipo con el código QR: ${qrCode}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    if (name === 'equipoId') {
      setWarning('');
      verificarEquipoYaDentro(value);
    }
  };

  const verificarEquipoYaDentro = (equipoId) => {
    if (!equipoId) return;

    const equipoSeleccionado = equipos.find((eq) => eq.id === parseInt(equipoId, 10));
    if (!equipoSeleccionado) return;

    const yaRegistrado = registrosActivos.find(
      (registro) => 
        registro.serial === equipoSeleccionado.serial && 
        registro.isInside === true
    );

    if (yaRegistrado) {
      setWarning(
        `⚠️ ADVERTENCIA: Este equipo ya está registrado dentro del hospital en el área "${yaRegistrado.name}" desde el ${new Date(yaRegistrado.entryDate).toLocaleDateString('es-CO')}.`
      );
    } else {
      setWarning('');
    }
  };

  const handleSelectEquipo = (equipo) => {
    setFormData({ ...formData, equipoId: equipo.id.toString() });
    setSearchTerm(`${equipo.equipmentType} - ${equipo.serial}`);
    setShowResults(false);
    verificarEquipoYaDentro(equipo.id.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('FormData completo:', formData);

      if (!formData.equipoId || formData.equipoId === '') {
        throw new Error('Debe seleccionar un equipo');
      }

      if (!formData.areaId || formData.areaId === '') {
        throw new Error('Debe seleccionar un área');
      }

      if (!formData.responsable || formData.responsable.trim() === '') {
        throw new Error('Debe ingresar el nombre del responsable');
      }

      const areaIdNumber = parseInt(formData.areaId, 10);
      if (isNaN(areaIdNumber)) {
        throw new Error('El ID del área no es válido');
      }

      const equipoSeleccionado = equipos.find(
        (eq) => eq.id === parseInt(formData.equipoId, 10)
      );

      if (!equipoSeleccionado) {
        throw new Error('Equipo no encontrado');
      }

      console.log('Equipo seleccionado:', equipoSeleccionado);

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

      await equipmentService.createEntry(entryData);
      
      setSuccess(true);
      setWarning('');
      setSearchTerm('');
      setFormData({
        equipoId: '',
        areaId: '',
        responsable: '',
        observaciones: '',
        isFrequent: false,
      });

      loadData();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al registrar ingreso:', err);
      console.error('Response completo:', err.response);
      
      let errorMessage = 'Error al registrar ingreso';

      if (err.message && !err.response) {
        errorMessage = err.message;
      } else if (err.response?.data) {
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
        } else if (err.response.status === 403 || err.response.status === 401) {
          errorMessage = '❌ Este equipo NO está autorizado para ingresar a esta área.';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipos = equipos.filter((eq) =>
    eq.equipmentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.qrCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const equipoSeleccionado = formData.equipoId 
    ? equipos.find((eq) => eq.id === parseInt(formData.equipoId, 10))
    : null;

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

      {warning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Advertencia:</p>
              <p>{warning}</p>
            </div>
          </div>
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
          <div className="grid grid-cols-1 gap-6">
            {/* Búsqueda de Equipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Equipo *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Buscar por tipo, serial o código QR..."
                    className="input-field pl-10 w-full"
                    required
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

              {/* Scanner QR */}
              {showQRScanner && (
                <Card className="mt-4">
                  <QRScanner
                    onScan={handleQRScanned}
                    onClose={() => setShowQRScanner(false)}
                  />
                </Card>
              )}

              {/* Resultados de búsqueda */}
              {showResults && searchTerm && filteredEquipos.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-64 overflow-y-auto bg-white shadow-lg">
                  {filteredEquipos.map((equipo) => (
                    <div
                      key={equipo.id}
                      onClick={() => handleSelectEquipo(equipo)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex gap-3"
                    >
                      {equipo.photoUrl ? (
                        <img
                          src={equipo.photoUrl}
                          alt={equipo.equipmentType}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{equipo.equipmentType}</p>
                        <p className="text-sm text-gray-600">Serial: {equipo.serial}</p>
                        {equipo.qrCode && (
                          <p className="text-xs text-gray-500">QR: {equipo.qrCode}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vista previa del equipo seleccionado */}
            {equipoSeleccionado && (
              <Card className="bg-blue-50 border-blue-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Vista Previa del Equipo</h3>
                <div className="flex gap-4">
                  {equipoSeleccionado.photoUrl ? (
                    <img
                      src={equipoSeleccionado.photoUrl}
                      alt={equipoSeleccionado.equipmentType}
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded border flex items-center justify-center">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Tipo</p>
                      <p className="font-semibold">{equipoSeleccionado.equipmentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Serial</p>
                      <p className="font-semibold">{equipoSeleccionado.serial}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Código QR</p>
                      <p className="font-semibold">{equipoSeleccionado.qrCode || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">Descripción</p>
                      <p className="text-sm">{equipoSeleccionado.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Área de Destino */}
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
            </div>

            {/* Responsable */}
            <div>
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
            </div>

            {/* Es Frecuente */}
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
            </div>

            {/* Observaciones */}
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
                placeholder="Ingrese observaciones adicionales..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !!warning}
            >
              {loading ? 'Registrando...' : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};