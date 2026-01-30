
import React from 'react';
import { motion } from 'framer-motion';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center space-x-3 group cursor-pointer select-none`}>
      <motion.div 
        whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
        className="relative"
      >
        {/* Layered Orbitals */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={`${iconSizes[size]} absolute inset-0 border-[1px] border-primary/20 rounded-full blur-[1px]`}
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`${iconSizes[size]} absolute inset-[-4px] border-[1px] border-white/5 rounded-full`}
        />
        
        {/* Core Glow */}
        <motion.div 
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(229,9,20,0.3)",
              "0 0 40px rgba(229,9,20,0.6)",
              "0 0 20px rgba(229,9,20,0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
        />

        <svg 
          viewBox="0 0 100 100" 
          className={`${iconSizes[size]} relative z-10 filter drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]`}
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF6B6B' }} />
              <stop offset="100%" style={{ stopColor: '#E50914' }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d="M35,25 L75,50 L35,75 Z"
            fill="url(#logoGrad)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            filter="url(#glow)"
          />
          <motion.rect
            x="22" y="25" width="6" height="50"
            fill="white"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ originY: 1 }}
          />
        </svg>
      </motion.div>
      
      <motion.span 
        className={`font-heading font-black tracking-tighter uppercase italic flex flex-col leading-none ${sizes[size]}`}
      >
        <span className="text-white group-hover:text-primary transition-colors">OTT</span>
        <motion.span 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-primary text-[0.6em] tracking-[0.4em] -mt-1 font-sans not-italic"
        >
          TRUSTED
        </motion.span>
      </motion.span>
    </div>
  );
};

export default Logo;
