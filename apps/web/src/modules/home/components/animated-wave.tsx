'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedWaveProps {}

export const AnimatedWave: React.FC<AnimatedWaveProps> = ({}) => {
  return (
    <motion.span
      className='ml-2 inline-block cursor-default'
      whileHover={{
        rotate: [0, 14, -8, 14, -4, 10, 0],
      }}
      transition={{
        duration: 2, // Adjust duration for a quicker wave
        repeat: Infinity,
        repeatType: 'loop',
      }}
      style={{
        display: 'inline-block',
        transformOrigin: '70% 70%',
      }}
    >
      👋
    </motion.span>
  );
};

export default AnimatedWave;
