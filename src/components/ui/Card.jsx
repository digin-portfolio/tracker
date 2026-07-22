import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import '../ui.css';

export function Card({ 
  children, 
  className,
  glass = false,
  hover = true,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'card',
        glass && 'card-glass',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
