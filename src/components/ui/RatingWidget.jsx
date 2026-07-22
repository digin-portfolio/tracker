import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function RatingWidget({ initialRating = 0, onRate, max = 5 }) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hover || rating);
        
        return (
          <motion.div
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            onClick={() => {
              setRating(starValue);
              if (onRate) onRate(starValue);
            }}
            style={{ cursor: 'pointer' }}
          >
            <Star 
              size={24} 
              fill={isActive ? 'var(--warning)' : 'transparent'} 
              color={isActive ? 'var(--warning)' : 'var(--border)'} 
              style={{ transition: 'fill 0.2s, color 0.2s' }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
