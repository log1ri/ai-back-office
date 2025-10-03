import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import LogsAnalyticsDashboard from "../../components/charts/LogsAnalyticsDashboard";
import {
  ChevronRight,
  Filter,
  List,
  Wifi,
  WifiOff,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useRealtimeLogs } from "../../hooks/useRealtimeLogs";
import { useSubIdContext } from "../../contexts/SubIdContext";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { subId: contextSubId } = useSubIdContext();
  
  // Use context subId, but allow override for testing
  const [localSubId, setLocalSubId] = useState("test");
  const activeSubId = localSubId || contextSubId;

  const {
    logs: realtimeLogs,
    isConnected,
    loading,
    error,
    clearLogs,
    sendMessage,
  } = useRealtimeLogs({
    baseUrl: "http://localhost:5167",
    maxLogs: 50,
  });

  const displayLogs = realtimeLogs;

  const filteredLogs = displayLogs.filter((log) => {
    try {
      const parsedData = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
      return (
        (parsedData.province ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(parsedData.status ?? "").includes(searchTerm.toLowerCase()) ||
        (parsedData.action ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (parsedData.regNum ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.eventName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (e) {
      return log.source.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  // Function to manually request logs with specific subId
  const handleGetRealtimeLogs = () => {
    if (sendMessage && activeSubId) {
      const requestData = {
        subId: activeSubId,
      };
      sendMessage("get-realtime-logs", requestData);
    }
  };

  // Function to get available SubIds
  const handleGetAvailableSubIds = () => {
    if (sendMessage) {
      sendMessage("get-available-subids", {});
    }
  };

  // Function to create test data for demonstration
  const handleCreateTestData = () => {
    const testLogs = [
      {
        id: '6889e2ede1ab1caefc9be2fd',
        action: 'extract_data_yolo',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        subId: '686756400ae6dcd28bee12af',
        status: 200,
        regNum: 'ABC123',
        province: 'Bangkok'
      },
      {
        id: '6889e1f8e1ab1caefc9be2fc',
        action: 'extract_data_yolo',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        subId: '686756400ae6dcd28bee12af',
        status: 200,
        regNum: 'XYZ789',
        province: 'Chiang Mai'
      },
      {
        id: '6889ebd2e1ab1caefc9be301',
        action: 'newdata',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        subId: '686756400ae6dcd28bee12af',
        status: 400,
        regNum: 'DEF456',
        province: 'Phuket'
      },
      {
        id: '6881af1ae1ab1caefc9be2ee',
        action: 'process_image',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        subId: '686756400ae6dcd28bee12af',
        status: 200,
        regNum: 'GHI999',
        province: 'Pattaya'
      }
    ];

    // Add test data to logs by simulating socket events
    testLogs.forEach((_data, index) => {
      setTimeout(() => {
        // Simulate receiving test data
        // Note: In a real scenario, this would be handled by the socket connection
        // For now, this serves as a demonstration of the data structure
      }, index * 1000);
    });
  };

  const filterableFields = [
    "@timestamp",
    "@timestamp_received",
    "client_identity",
    "country",
    "host",
    "logscene_error",
    "message",
    "referer",
    "request",
    "severity",
    "status",
    "user_agent",
  ];

  return (
    <div className="flex h-screen">
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              Dashboard - Real-time Logs
            </h2>

            {/* Debug Info */}
            <div className="text-xs text-gray-500">
              Logs: {realtimeLogs.length} | Status:{" "}
              {isConnected
                ? "Connected"
                : loading
                  ? "Connecting..."
                  : "Disconnected"}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnected</span>
                </div>
              )}
              {loading && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                  Loading...
                </div>
              )}
              {error && (
                <div className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm max-w-md truncate">
                  Error: {error}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>

            <Button variant="outline">Last 1 hr</Button>
          </div>
        </header>

   

        <div className="flex-1 flex overflow-hidden">
          {/* Dashboard Grid */}
          <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto">
            {/* Main Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Filter and Search */}
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
                <Input
                  placeholder="Search logs, events, types..."
                  className="flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* SubId Input for manual testing */}
                <Input
                  placeholder="SubId (e.g. test, sample, sub001)"
                  className="w-48"
                  value={localSubId}
                  onChange={(e) => setLocalSubId(e.target.value)}
                  title="SubId is required by backend to filter logs. Try: test, sample, sub001, or check database for actual subIds"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetRealtimeLogs}
                  disabled={!isConnected}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Get Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetAvailableSubIds}
                  disabled={!isConnected}
                  className="flex items-center gap-2"
                >
                  📋 SubIds
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTestData}
                  className="flex items-center gap-2"
                >
                  🧪 Test Data
                </Button>
                <div className="text-sm text-gray-500">
                  {filteredLogs.length} logs
                </div>
              </div>
              
              {/* Analytics Dashboard */}
              <LogsAnalyticsDashboard logs={realtimeLogs} />

              {/* Log Events Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Real-time Log Events
                    {isConnected ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Wifi className="h-4 w-4" />
                        <span className="text-sm font-normal">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-sm font-normal">Offline</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0">
                        <TableRow>
                          <TableHead className="w-32">@timestamp</TableHead>
                          <TableHead className="w-32">Event</TableHead>
                          <TableHead>_source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-gray-500 p-8"
                            >
                              {searchTerm ? (
                                `No logs found matching "${searchTerm}"`
                              ) : (
                                <div className="space-y-2">
                                  <div className="font-medium">
                                    No logs available
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div>
                                      � <strong>Problem:</strong> Backend
                                      returns empty array `[]`
                                    </div>
                                    <div>
                                      💡 <strong>Solutions:</strong>
                                    </div>
                                    <div>
                                      • Click <strong>"📋 Get SubIds"</strong>{" "}
                                      to see available SubIds
                                    </div>
                                    <div>
                                      • Click <strong>"➕ Create Test"</strong>{" "}
                                      to create test data
                                    </div>
                                    <div>
                                      • Try different SubId: "test", "sample",
                                      "sub001"
                                    </div>
                                    <div>• Check Console for debug info</div>
                                    <div>
                                      📊 <strong>Current SubId:</strong> "
                                      <span className="font-mono bg-gray-200 px-1 rounded">
                                        {activeSubId}
                                      </span>
                                      "
                                    </div>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLogs.map((log, index) => {
                            // Parse the JSON data from log.source
                            let parsedData: any = {};
                            try {
                              parsedData = typeof log.source === 'string' ? JSON.parse(log.source) : log.source;
                            } catch (e) {
                              parsedData = { error: 'Failed to parse data' };
                            }
                            
                            return (
                              <TableRow
                                key={`${log.timestamp || Date.now()}-${index}`}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="font-mono text-sm">
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}
                                  <div className="text-xs text-gray-500">
                                    {parsedData.subId || 'Unknown SubId'}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  <div className="flex flex-col gap-1">
                                    <span className="px-2 py-1 rounded text-xs font-medium inline-block w-fit bg-blue-100 text-blue-800">
                                      {parsedData.action || log.eventName || 'Unknown Action'}
                                    </span>
                                    {parsedData.status && (
                                      <span className={`px-2 py-1 rounded text-xs font-medium inline-block w-fit ${
                                        parsedData.status === 200 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        Status: {parsedData.status}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm max-w-md">
                                  <div className="truncate">
                                    {parsedData.regNum && parsedData.province && (
                                      <div className="text-sm">
                                        <strong>Vehicle:</strong> {parsedData.regNum} ({parsedData.province})
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-1">
                                      <strong>ID:</strong> {parsedData.id || 'No ID'}
                                    </div>
                                    {parsedData.timestamp && (
                                      <div className="text-xs text-gray-600">
                                        <strong>Original Time:</strong> {new Date(parsedData.timestamp).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Type to filter fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input placeholder="Filter fields..." className="mb-4" />
                  <div className="space-y-2">
                    {filterableFields.map((field) => (
                      <div
                        key={field}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <span className="font-mono text-sm">{field}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
