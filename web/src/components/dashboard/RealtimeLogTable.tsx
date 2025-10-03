import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { List, Wifi, WifiOff } from "lucide-react";
import type { LogEvent } from "../../hooks/useRealtimeLogs";

interface RealtimeLogTableProps {
  logs: LogEvent[];
  loading?: boolean;
  error?: string | null;
  isConnected?: boolean;
  searchQuery?: string;
}

// Single Responsibility: Component รับผิดชอบเฉพาะการแสดง real-time log table
export const RealtimeLogTable = ({ 
  logs, 
  loading, 
  error, 
  isConnected = false,
  searchQuery = ""
}: RealtimeLogTableProps) => {
  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.time.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.eventName && log.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (log.eventType && log.eventType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" /> 
            Real-time Log Events
            <Wifi className="h-4 w-4 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            Connecting to real-time logs...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" /> 
            Real-time Log Events
            <WifiOff className="h-4 w-4 text-red-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" /> 
          Real-time Log Events
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-normal text-gray-500">
            ({filteredLogs.length} logs)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
              <TableRow>
                <TableHead className="w-32">@timestamp</TableHead>
                <TableHead className="w-32">Event</TableHead>
                <TableHead>_source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 p-8">
                    {searchQuery ? `No logs found matching "${searchQuery}"` : 'No logs available'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-mono text-sm">
                      {log.time}
                      <div className="text-xs text-gray-500">
                        {log.ago}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.eventName && (
                        <div className="flex flex-col gap-1">
                          <span className={`
                            px-2 py-1 rounded text-xs font-medium inline-block w-fit
                            ${log.eventType === 'system' ? 'bg-blue-100 text-blue-800' : 
                              log.eventType === 'error' ? 'bg-red-100 text-red-800' : 
                              log.eventType === 'data' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {log.eventName}
                          </span>
                          {log.eventType && (
                            <span className="text-xs text-gray-500">
                              {log.eventType}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                      {log.source}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
