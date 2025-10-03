import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useRealtimeLogs } from '../hooks/useRealtimeLogs';
import { RealtimeLogTable } from '../components/dashboard/RealtimeLogTable';
import { Play, Square, RotateCcw } from 'lucide-react';

export const EventTrackingTestPage = () => {
  // ใช้ mock token สำหรับการทดสอบ
  const mockToken = localStorage.getItem('token') || sessionStorage.getItem('token') || 'mock-jwt-token';
  
  const { 
    logs, 
    isConnected, 
    error, 
    loading, 
    connect, 
    disconnect, 
    sendMessage,
    clearLogs,
    // addSystemEvent 
  } = useRealtimeLogs({ 
    token: mockToken,
    baseUrl: 'http://localhost:5167',
    maxLogs: 50
  });

  const handleTestEvents = () => {
    // จำลอง events ต่างๆ เพื่อทดสอบ
    setTimeout(() => {
      sendMessage('get-realtime-logs', { message: 'Testing get-realtime-logs event' });
    }, 500);
    
    setTimeout(() => {
      sendMessage('realtime-log', { message: 'Testing realtime-log event' });
    }, 1000);
    
    setTimeout(() => {
      sendMessage('logs-error', { message: 'Testing logs-error event', type: 'error' });
    }, 1500);
    
    setTimeout(() => {
      sendMessage('custom-event', { message: 'Testing custom event', type: 'system' });
    }, 2000);
  };

  const handleSendTestMessage = () => {
    sendMessage('test-message', { 
      data: 'Hello from event tracking test',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Tracking & Real-time Logs Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}>
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {loading && (
              <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm">
                Connecting...
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={connect}
              disabled={isConnected || loading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Connect
            </Button>
            
            <Button
              onClick={disconnect}
              disabled={!isConnected}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Disconnect
            </Button>
            
            <Button
              onClick={clearLogs}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Logs
            </Button>
            
            <Button
              onClick={handleTestEvents}
              variant="secondary"
            >
              Test Events
            </Button>
            
            <Button
              onClick={handleSendTestMessage}
              disabled={!isConnected}
              variant="secondary"
            >
              Send Test Message
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {logs.filter((log: any) => log.eventType === 'system').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Error Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {logs.filter((log: any) => log.eventType === 'error').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Event Types Found:</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(logs.map((log: any) => log.eventName).filter(Boolean))).map((eventName: any) => (
                <span 
                  key={String(eventName)}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {String(eventName)}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recent Events:</h3>
            <div className="text-sm space-y-1">
              {logs.slice(0, 5).map((log: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">{log.time}</span>
                  {log.eventName && (
                    <span className={`
                      px-2 py-1 rounded text-xs
                      ${log.eventType === 'system' ? 'bg-blue-100 text-blue-800' : 
                        log.eventType === 'error' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {log.eventName}
                    </span>
                  )}
                  <span className="text-gray-700 truncate">{log.source}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* แสดง RealtimeLogTable ที่อัปเดตแล้ว */}
      <RealtimeLogTable 
        logs={logs}
        loading={loading}
        error={error}
        isConnected={isConnected}
      />
    </div>
  );
};
