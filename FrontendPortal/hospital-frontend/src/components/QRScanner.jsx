import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload } from 'lucide-react';

export const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  // Escanear desde imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          onScan(code.data);
        } else {
          setError('No se pudo leer el código QR de la imagen');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Escanear desde cámara
  const startCamera = async () => {
    try {
      setScanning(true);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, sube una imagen.');
      setScanning(false);
    }
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        onScan(code.data);
        stopCamera();
        return;
      }
    }
    
    if (scanning) {
      requestAnimationFrame(tick);
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Subir imagen */}
        <label className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 hover:border-hospital-blue rounded-lg p-6 text-center transition-colors">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Subir imagen QR</p>
            <p className="text-xs text-gray-500 mt-1">Click para seleccionar</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </label>

        {/* Escanear con cámara */}
        <button
          type="button"
          onClick={scanning ? stopCamera : startCamera}
          className="border-2 border-dashed border-gray-300 hover:border-hospital-blue rounded-lg p-6 text-center transition-colors"
        >
          <Camera size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {scanning ? 'Detener cámara' : 'Usar cámara'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {scanning ? 'Escaneando...' : 'Click para activar'}
          </p>
        </button>
      </div>

      {/* Video y canvas para escaneo */}
      {scanning && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg border"
            style={{ maxHeight: '400px' }}
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-4 border-hospital-blue rounded-lg pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white"></div>
          </div>
        </div>
      )}
    </div>
  );
};