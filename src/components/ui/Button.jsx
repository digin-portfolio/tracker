import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import '../ui.css';

export function Button({ 
  children, 
  variant = 'primary', 
  className, 
  icon: Icon,
  ...props 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={clsx(
        'btn',
        `btn-${variant}`,
        className
      )}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </motion.button>
  );
}
