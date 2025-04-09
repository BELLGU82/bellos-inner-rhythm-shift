
import React, { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type NeumorphCardProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
};

const NeumorphCard: React.FC<NeumorphCardProps> = ({ 
  children, 
  title, 
  className,
  innerClassName,
  style
}) => {
  return (
    <div className={cn("neumorph-card", className)} style={style}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-bell-foreground">{title}</h3>
      )}
      <div className={innerClassName}>
        {children}
      </div>
    </div>
  );
};

export default NeumorphCard;
