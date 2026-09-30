import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={size ? { width: size, height: size } : {}}>
      <img 
        src="/logo.svg" 
        alt="U.N. Academy Khagrabari Logo" 
        className="w-full h-full object-contain filter drop-shadow-xs" 
        loading="eager"
      />
    </div>
  );
};
