interface SimpleProgressProps {
    value: number;
    max?: number;
    className?: string;
  }
  
  export function SimpleProgress({ value = 0, max = 100, className = "" }: SimpleProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 rounded-full w-full overflow-hidden ${className}`}>
        <div 
          className="bg-primary rounded-full h-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    );
  }