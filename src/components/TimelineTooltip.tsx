import { formatHours } from "@/lib/utils";

interface TooltipProps {
  show: boolean;
  x: number;
  y: number;
  data: {
    label: string;
    startTime: string;
    endTime: string;
    duration: number;
  } | null;
}

export function TimelineTooltip({ show, x, y, data }: TooltipProps) {
  if (!show || !data) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none"
      style={{
        left: x,
        top: y - 80,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="font-medium">{data.label}</div>
      <div className="text-gray-600">{data.startTime} - {data.endTime}</div>
      <div className="text-gray-600">{formatHours(data.duration)}</div>
    </div>
  );
}