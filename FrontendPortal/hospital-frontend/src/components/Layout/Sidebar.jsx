import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileText,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['TI', 'Vigilante', 'Empleado'] },
    { path: '/inventario', icon: Package, label: 'Inventario', roles: ['TI', 'Empleado'] },
    { path: '/equipos-ingresados', icon: CheckCircle, label: 'Equipos Ingresados', roles: ['TI', 'Vigilante'] }, // ← Nuevo
    { path: '/equipos-retirados', icon: XCircle, label: 'Equipos Retirados', roles: ['TI', 'Vigilante'] },
    { path: '/registro-ingreso', icon: ArrowDownToLine, label: 'Registro Ingreso', roles: ['TI', 'Vigilante'] },
    { path: '/registro-egreso', icon: ArrowUpFromLine, label: 'Registro Egreso', roles: ['TI', 'Vigilante'] },
    { path: '/reportes', icon: FileText, label: 'Reportes', roles: ['TI'] },
    { path: '/historial', icon: History, label: 'Historial', roles: ['TI', 'Vigilante'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        className="fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:shadow-none"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-hospital-blue">
              🏥 Hospital
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-hospital-blue text-white'
                          : 'text-gray-700 hover:bg-hospital-light'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.aside>
    </>
  );
};