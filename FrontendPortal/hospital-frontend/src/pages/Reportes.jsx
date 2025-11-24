import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { reportService } from '../api/reportService';
import { FileText, Download, Table, AlertCircle, CheckCircle } from 'lucide-react';

export const Reportes = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    onlyInside: true,
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateDates = () => {
    if (!filters.startDate || !filters.endDate) {
      setError('Debe seleccionar las fechas de inicio y fin');
      return false;
    }

    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    if (start > end) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin');
      return false;
    }

    return true;
  };

  const generateJSONReport = async () => {
    setError('');
    setSuccess('');
    
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    try {
      // Construir payload según el formato del backend
      const payload = {
        startDate: new Date(filters.startDate).toISOString(),
        endDate: new Date(filters.endDate).toISOString(),
        onlyInside: filters.onlyInside,
        format: 'json',
      };

      console.log('Generando reporte JSON con:', payload);

      const data = await reportService.generateReport(payload);
      console.log('Reporte recibido:', data);
      
      setReportData(data);
      setSuccess('Reporte generado exitosamente');
    } catch (err) {
      console.error('Error al generar reporte JSON:', err);
      setError(err.response?.data?.message || 'Error al generar reporte JSON');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = async () => {
    setError('');
    setSuccess('');
    
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    try {
      // Construir payload según el formato del backend
      const payload = {
        startDate: new Date(filters.startDate).toISOString(),
        endDate: new Date(filters.endDate).toISOString(),
        onlyInside: filters.onlyInside,
        format: 'pdf',
      };

      console.log('Generando reporte PDF con:', payload);

      const blob = await reportService.generateReport(payload);
      
      // Generar nombre de archivo con las fechas
      const startDateStr = filters.startDate.replace(/-/g, '');
      const endDateStr = filters.endDate.replace(/-/g, '');
      const filename = `reporte_equipos_${startDateStr}_${endDateStr}.pdf`;
      
      reportService.downloadPDF(blob, filename);
      setSuccess('Reporte PDF descargado exitosamente');
    } catch (err) {
      console.error('Error al generar reporte PDF:', err);
      setError(err.response?.data?.message || 'Error al generar reporte PDF');
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha de hace 30 días
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  // Obtener fecha de hoy
  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-2">Generar reportes de equipos médicos</p>
      </div>

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

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
        >
          <CheckCircle size={20} />
          <span>{success}</span>
        </motion.div>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FileText size={24} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Filtros de Reporte</h2>
            <p className="text-gray-600 text-sm">Configure los parámetros del reporte</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate || getDefaultStartDate()}
                onChange={handleFilterChange}
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha de inicio del período a consultar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate || getDefaultEndDate()}
                onChange={handleFilterChange}
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha de fin del período a consultar
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="onlyInside"
                checked={filters.onlyInside}
                onChange={handleFilterChange}
                className="w-4 h-4 text-hospital-blue border-gray-300 rounded focus:ring-hospital-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                Solo equipos dentro del hospital
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Filtrar únicamente los equipos que actualmente están dentro de las instalaciones
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={generateJSONReport} disabled={loading}>
              <Table size={20} className="mr-2" />
              {loading ? 'Generando...' : 'Generar JSON'}
            </Button>
            <Button onClick={downloadPDFReport} variant="success" disabled={loading}>
              <Download size={20} className="mr-2" />
              {loading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </div>
      </Card>

      {reportData && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Resultados del Reporte</h2>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total de registros: <strong>{Array.isArray(reportData) ? reportData.length : 0}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Período: {filters.startDate} al {filters.endDate}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Serial</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha Salida</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(reportData) && reportData.length > 0 ? (
                  reportData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{item.registrationId || item.id || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.equipmentType || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.serial || '-'}</td>
                      <td className="px-4 py-3 text-sm">{item.loginUser || item.responsable || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.entryDate ? new Date(item.entryDate).toLocaleDateString('es-CO') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.outDate && new Date(item.outDate).getFullYear() > 1900
                          ? new Date(item.outDate).toLocaleDateString('es-CO')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.isInside ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isInside ? 'Dentro' : 'Fuera'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No hay datos disponibles para el período seleccionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
};