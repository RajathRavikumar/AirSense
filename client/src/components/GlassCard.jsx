import React from 'react';

const variants = {
  elevated: "bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl",
  subtle: "bg-white/5 backdrop-blur-sm"
};

export const GlassCard = ({ children, className = "", variant = "elevated" }) => {
  return (
    <div className={`${variants[variant]} p-2 rounded-2xl ${className}`}>
      {children}
    </div>
  );
};