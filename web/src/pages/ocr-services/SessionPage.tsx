import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { useSessions, useCountClosedSession } from "../../hooks/useSessions";
import { useDashboardStats} from "../../hooks/useDashboardStats";
import type { VehicleSession, SessionFilters, } from "../../types/api.types";
import { format } from "date-fns";
import { useSubIdContext } from "../../contexts/SubIdContext";

export default function SessionPage() {
  const { subId } = useSubIdContext();
  const [filters, setFilters] = useState<SessionFilters>({
    search: "",
    status: undefined,
    page: 1,
    limit: 10,
    sortBy: "lastSeenAt",
    order: "desc",
  });
  
  const [selectedSession, setSelectedSession] = useState<VehicleSession | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { data: sessionResponse, isLoading, error } = useSessions(filters, subId);
  const { data: closedSessionData} = useCountClosedSession(subId);
  const {currentlyInside} = useDashboardStats(subId || "");
  
  // Format duration from seconds to human readable format
  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "N/A";
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate current duration for ongoing sessions
  const getCurrentDuration = (entry: VehicleSession['entry']): string => {
    if (!entry) return "N/A";
    const start = new Date(entry.time);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    return formatDuration(diffSeconds);
  };

  // Unified duration display: only live-calc for OPEN sessions, else rely on backend
  const getDisplayDuration = (session: VehicleSession): string => {
    if (session.durationSec !== null) return formatDuration(session.durationSec);
    if (session.status === "OPEN" && session.entry) return getCurrentDuration(session.entry);
    return "N/A";
  };

  // Get time from entry or exit
  const getEntryTime = (session: VehicleSession): string => {
    if (session.entry?.time) {
      return format(new Date(session.entry.time), "dd/MM/yy HH:mm:ss");
    }
    return "N/A";
  };

  const getExitTime = (session: VehicleSession): string => {
    if (session.exit?.time) {
      return format(new Date(session.exit.time), "dd/MM/yy HH:mm:ss");
    }
    return "-";
  };

  // Get display date for table
  const getSessionDate = (session: VehicleSession): string => {
    const time = session.entry?.time || session.exit?.time || session.lastSeenAt;
    if (!time) return "N/A";
    return format(new Date(time), "dd/MM/yy");
  };

  const handleViewDetail = (session: VehicleSession) => {
    setSelectedSession(session);
    setIsDetailOpen(true);
  };

  const handleFilterChange = (key: keyof SessionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Only reset to page 1 if we're not changing the page itself
      page: key === 'page' ? value : 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      page: 1,
      limit: 10,
      sortBy: "lastSeenAt",
      order: "desc",
    });
  };

  // Calculate stats from session data
  const stats = sessionResponse ? {
    totalSessions: sessionResponse.total_records,
    averageDuration: sessionResponse.data
      .filter(s => s.durationSec !== null)
      .reduce((sum, s) => sum + (s.durationSec || 0), 0) / 
      sessionResponse.data.filter(s => s.durationSec !== null).length || 0
  } : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Parking Sessions
            </h1>
            <p className="text-muted-foreground mt-1">
              Review vehicle entry and exit history
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSessions}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Open
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {currentlyInside ? currentlyInside : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Closed
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    {closedSessionData ? closedSessionData.totalSessions : 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Average Time
                  </p>
                  <p className="text-2xl font-bold text-purple-500">
                    {formatDuration(stats.averageDuration)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="flex-1 min-w-[200px] max-w-md">
                <Input
                  type="text"
                  placeholder="Search license plate..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="h-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value: string) => handleFilterChange("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CONFLICT">Conflict</SelectItem>
                  <SelectItem value="ABANDONED">Abandoned</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={filters.sortBy || "lastSeenAt"}
                onValueChange={(value: any) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastSeenAt">Last Seen</SelectItem>
                  <SelectItem value="durationSec">Duration</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>

              {/* Order */}
              <Select
                value={filters.order || "desc"}
                onValueChange={(value: any) => handleFilterChange("order", value)}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select
                value={filters.limit?.toString() || "10"}
                onValueChange={(value: string) => handleFilterChange("limit", parseInt(value))}
              >
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue placeholder="10/page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10/page</SelectItem>
                  <SelectItem value="25">25/page</SelectItem>
                  <SelectItem value="50">50/page</SelectItem>
                  <SelectItem value="100">100/page</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-9"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Session Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                Error loading data
              </div>
            ) : !sessionResponse || sessionResponse.data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No data found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead className="text-center">Province</TableHead>
                      <TableHead className="text-center">Time In</TableHead>
                      <TableHead className="text-center">Time Out</TableHead>
                      <TableHead className="text-center">Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionResponse.data.map((session) => (
                      <TableRow
                        key={session.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => handleViewDetail(session)}
                      >
                        <TableCell>
                          {getSessionDate(session)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {session.reg_num}
                        </TableCell>
                        <TableCell className="text-center">{session.province || "-"}</TableCell>
                        <TableCell className="text-center">
                          {session.entry ? format(new Date(session.entry.time), "HH:mm:ss") : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {session.exit ? format(new Date(session.exit.time), "HH:mm:ss") : "-"}
                        </TableCell>
                        <TableCell className="text-center">{getDisplayDuration(session)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              session.status === "CONFLICT"
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : session.status === "CLOSED"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : session.status === "OPEN"
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-gray-500 hover:bg-gray-600 text-white"
                            }
                          >
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(session);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {sessionResponse && sessionResponse.total_records > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((sessionResponse.current_page - 1) * (filters.limit || 10)) + 1} to {Math.min(sessionResponse.current_page * (filters.limit || 10), sessionResponse.total_records)} of {sessionResponse.total_records} records
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {sessionResponse.current_page} of {sessionResponse.total_pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.max(1, (filters.page || 1) - 1);
                        handleFilterChange("page", newPage);
                      }}
                      disabled={sessionResponse.current_page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.min(sessionResponse.total_pages, (filters.page || 1) + 1);
                        handleFilterChange("page", newPage);
                      }}
                      disabled={sessionResponse.current_page >= sessionResponse.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Session Details</DialogTitle>
                <DialogDescription>
                  Parking information for vehicle {selectedSession.reg_num}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      License Plate
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedSession.reg_num}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Province
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedSession.province || "-"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Time In
                    </p>
                    <p className="text-lg">
                      {getEntryTime(selectedSession)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Time Out
                    </p>
                    <p className="text-lg">
                      {getExitTime(selectedSession)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Parking Duration
                    </p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {getDisplayDuration(selectedSession)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        selectedSession.status === "CONFLICT"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : selectedSession.status === "CLOSED"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : selectedSession.status === "OPEN"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-500 hover:bg-gray-600 text-white"
                      }
                    >
                      {selectedSession.status}
                    </Badge>
                  </div>

                  {selectedSession.entry && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Entry Camera
                      </p>
                      <p className="text-lg">{selectedSession.entry.camId}</p>
                    </div>
                  )}

                  {selectedSession.exit && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Exit Camera
                      </p>
                      <p className="text-lg">{selectedSession.exit.camId}</p>
                    </div>
                  )}
                </div>

                {/* Note: Images section removed as API doesn't provide image URLs */}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
