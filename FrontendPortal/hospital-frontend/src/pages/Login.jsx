import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI/Button';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando login...'); // Debug
      const user = await login(email, password);
      console.log('Login exitoso, usuario:', user); // Debug
      
      // Pequeña pausa para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Redirigiendo a dashboard...'); // Debug
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error en login:', err); // Debug
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Credenciales inválidas');
      } else if (err.response?.status === 400) {
        setError('Datos de login incorrectos');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hospital-blue to-hospital-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block p-4 bg-hospital-light rounded-full mb-4"
          >
            <Lock size={48} className="text-hospital-blue" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión Hospitalaria</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="usuario@hospital.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-hospital-blue font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};