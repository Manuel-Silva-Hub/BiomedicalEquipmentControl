import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};