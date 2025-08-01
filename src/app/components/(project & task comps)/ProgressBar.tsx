interface ProgressBarProps {
    value: number;
    max: number;
    colorClass?: string;
    label: string;
  }
  
  export default function ProgressBar({
    value,
    max,
    colorClass = 'bg-blue-500',
    label,
  }: ProgressBarProps) {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const displayValue = Math.min(Math.round(percentage), 100);
  
    return (
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{displayValue}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${colorClass}`}
            style={{ width: `${displayValue}%` }}
          ></div>
        </div>
      </div>
    );
  }