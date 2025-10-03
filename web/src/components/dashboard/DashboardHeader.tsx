import { Button } from "../../components/ui/button";

interface DashboardHeaderProps {
  onTimeRangeChange?: (range: string) => void;
  timeRange?: string;
  isConnected?: boolean;
  onToggleConnection?: () => void;
  logsCount?: number;
}

// Single Responsibility: Component รับผิดชอบเฉพาะ dashboard header
export const DashboardHeader = ({ 
  onTimeRangeChange,
  timeRange = "Last 1 hr",
  isConnected = false,
  onToggleConnection,
  logsCount = 0
}: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-semibold">Explore</h2>
        {logsCount > 0 && (
          <span className="text-sm text-gray-500">({logsCount} logs)</span>
        )}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline"
          onClick={() => onTimeRangeChange?.(timeRange)}
        >
          {timeRange}
        </Button>
        <Button 
          variant={isConnected ? "destructive" : "default"}
          onClick={onToggleConnection}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>
    </header>
  );
};
