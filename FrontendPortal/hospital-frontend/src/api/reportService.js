import axiosInstance from './axiosConfig';

export const reportService = {
  async generateReport(reportParams) {
    // Validar parámetros
    if (!reportParams.startDate || !reportParams.endDate) {
      throw new Error('Las fechas son requeridas');
    }

    // El formato viene en el objeto
    const format = reportParams.format || 'json';
    
    const payload = {
      startDate: reportParams.startDate,
      endDate: reportParams.endDate,
      onlyInside: reportParams.onlyInside !== undefined ? reportParams.onlyInside : true,
      format: format,
    };

    console.log('Payload enviado al servicio de reportes:', payload);

    const response = await axiosInstance.post(
      '/api/report/equipment',
      payload,
      {
        responseType: format === 'pdf' ? 'blob' : 'json',
      }
    );

    return response.data;
  },

  downloadPDF(blob, filename = 'reporte.pdf') {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};