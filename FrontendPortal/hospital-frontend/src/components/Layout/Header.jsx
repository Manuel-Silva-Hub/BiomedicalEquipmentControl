import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-md px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-hospital-blue">
          Sistema Hospitalario
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-hospital-light rounded-lg">
          <User size={20} className="text-hospital-blue" />
          <div className="text-sm">
            <p className="font-medium">{user?.name || 'Usuario'}</p>
            <p className="text-gray-500 text-xs">{user?.role || 'Rol'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </motion.header>
  );
};