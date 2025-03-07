
import React from 'react';
import { cn } from "@/lib/utils";

interface DynamicProgressProps {
  value: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  labelSuffix?: string;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const DynamicProgress = React.forwardRef<
  HTMLDivElement,
  DynamicProgressProps
>(({ 
  value = 0, 
  className, 
  variant = 'default',
  showLabel = false,
  labelSuffix = '%',
  height = 'md',
  animated = true,
  ...props 
}, ref) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Generate color classes based on variant
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };
  
  // Generate height classes
  const getHeightClasses = (): string => {
    switch (height) {
      case 'xs':
        return 'h-1';
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-secondary",
        getHeightClasses(),
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all", 
          getVariantClasses(),
          animated && "duration-500",
          height === 'lg' && "flex items-center justify-end pr-2"
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {showLabel && height === 'lg' && (
          <span className="text-xs font-medium text-white">
            {Math.round(clampedValue)}{labelSuffix}
          </span>
        )}
      </div>
      
      {showLabel && height !== 'lg' && (
        <div className="mt-1 flex justify-between text-xs">
          <span>{Math.round(clampedValue)}{labelSuffix}</span>
          <span>100{labelSuffix}</span>
        </div>
      )}
    </div>
  );
});

DynamicProgress.displayName = "DynamicProgress";

export { DynamicProgress };
