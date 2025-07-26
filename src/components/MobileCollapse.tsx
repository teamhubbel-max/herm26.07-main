import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileCollapseProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const MobileCollapse: React.FC<MobileCollapseProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mobile-collapse ${className}`}>
      <div 
        className="mobile-collapse-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      <div className={`mobile-collapse-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};