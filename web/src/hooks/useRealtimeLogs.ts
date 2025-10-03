import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useSubIdContext } from "../contexts/SubIdContext";

export interface LogEvent {
  time: string;
  ago: string;
  source: string;
  timestamp?: string;
  eventType?: 'system' | 'data' | 'error';
  eventName?: string;
}

interface UseRealtimeLogsProps {
  token?: string;
  baseUrl?: string;
  maxLogs?: number;
}

export const useRealtimeLogs = ({
  baseUrl = "http://localhost:5167",
  maxLogs = 100,
}: UseRealtimeLogsProps = {}) => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { subId } = useSubIdContext();
  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Add system event function for internal logging
  const addSystemEvent = useCallback((eventName: string, message: string, eventType: 'system' | 'data' | 'error' = 'system') => {
    const systemEvent: LogEvent = {
      time: new Date().toTimeString().split(' ')[0],
      ago: 'now',
      source: message,
      timestamp: new Date().toISOString(),
      eventType,
      eventName
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [systemEvent, ...prevLogs];
      return updatedLogs.slice(0, maxLogs);
    });
  }, [maxLogs]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("Socket already connected, skipping connection attempt");
      return;
    }
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError("No authentication token provided. Please login first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Attempting to connect to Socket.IO at:", `${baseUrl}/ocr-logs`);

      const socket = io(`${baseUrl}/ocr-logs`, {
        query: {
          token: authToken,
        },
        auth: {
          token: authToken,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: false,
        forceNew: false,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket.IO connected successfully");
        setIsConnected(true);
        setLoading(false);
        setError(null);
        reconnectAttempts.current = 0;
        
        addSystemEvent('connect-success', `Successfully connected! Socket ID: ${socket.id}`);
       
    
        socket.emit('get-realtime-logs', {
          subId: subId || 'default-sub'
        });

      });

      socket.on('realtime-log', (data: any) => {
        try {
          if (Array.isArray(data)) {
            data.forEach((item, index) => {
              const newLog: LogEvent = {
                time: item.timestamp ? new Date(item.timestamp).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
                ago: 'now',
                source: JSON.stringify(item, null, 2),
                timestamp: item.timestamp || new Date().toISOString(),
                eventType: 'data',
                eventName: 'backend-log'
              };
              
              setLogs(prevLogs => {
                const updatedLogs = [newLog, ...prevLogs];
                return updatedLogs.slice(0, maxLogs);
              });
            });
          } else {            
            const newLog: LogEvent = {
              time: data.timestamp ? new Date(data.timestamp).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
              ago: 'now',
              source: JSON.stringify(data, null, 2), 
              timestamp: data.timestamp || new Date().toISOString(),
              eventType: 'data',
              eventName: 'backend-log'
            };
            
            console.log('Processed single log:', newLog);
            
            setLogs(prevLogs => {
              const updatedLogs = [newLog, ...prevLogs];
              return updatedLogs.slice(0, maxLogs);
            });
          }
        } catch (parseError) {
          console.error('==== ERROR PARSING LOG DATA ====');
          console.error('Parse Error:', parseError);
          console.error('Original data:', data);
          console.error('================================');
          setError('Error parsing log data');
          addSystemEvent('logs-error', `Error parsing log data: ${parseError}`, 'error');
        }
      });

      // เพิ่ม listener สำหรับ new-realtime-log event จาก change stream
      socket.on('new-realtime-log', (data: any) => {
        try {
          console.log('==== RECEIVED NEW-REALTIME-LOG EVENT ====');
          console.log('Raw data type:', typeof data);
          console.log('Raw data:', data);
          console.log('Full JSON:', JSON.stringify(data, null, 2));
          console.log('========================================');
          
          // เพิ่ม system event ว่าได้รับ log ใหม่
          addSystemEvent('new-realtime-log', `Received new real-time log from change stream`);
          
          // จัดการข้อมูล log จาก MongoDB change stream
          const newLog: LogEvent = {
            time: data.timestamp ? new Date(data.timestamp).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0],
            ago: 'live',
            source: JSON.stringify(data, null, 2), // ✅ แสดง Raw JSON
            timestamp: data.timestamp || new Date().toISOString(),
            eventType: 'data',
            eventName: 'live-log'
          };
          
          console.log('✅ Processed new real-time log:', newLog);
          
          setLogs(prevLogs => {
            const updatedLogs = [newLog, ...prevLogs];
            return updatedLogs.slice(0, maxLogs);
          });
        } catch (parseError) {
          setError("Error parsing new real-time log");
        }
      });

      socket.on("logs-error", (errorData: any) => {
        setError(errorData.message || "Error receiving logs");
      });

  

      socket.on("disconnect", (reason: string) => {
        setIsConnected(false);
        setLoading(false);

        // Clear heartbeat and refresh intervals
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }

        if (reason === "io server disconnect") {
          setError("Server disconnected the client. Please login again.");
          return;
        } else if (reason === "transport error") {
          setError("Transport error occurred");
        }

        if (
          reconnectAttempts.current < maxReconnectAttempts &&
          reason !== "io server disconnect" &&
          reason !== "io client disconnect"
        ) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current - 1),
            10000,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError(
            "Failed to connect to server. Please check if the server is running on localhost:5167",
          );
        }
      });

      socket.on("connect_error", (error: any) => {
        console.error("Socket.IO connection error:", error);

        if (
          error.message.includes("401") ||
          error.message.includes("403") ||
          error.message.includes("Unauthorized") ||
          error.message.includes("Authentication")
        ) {
          setError(
            "Authentication failed - Invalid or expired token. Please login again.",
          );
          // Clear the invalid token
          localStorage.removeItem('authToken');
        } else if (error.message.includes("timeout")) {
          setError("Connection timeout. Please check server status.");
        } else if (error.message.includes("ECONNREFUSED")) {
          setError(
            "Connection refused. Server may not be running on localhost:5167",
          );
        } else {
          setError(`Failed to connect to server: ${error.message}`);
        }
        setLoading(false);
      });
    } catch (connectionError) {
      console.error("Failed to create Socket.IO connection:", connectionError);
      const errorMessage =
        connectionError instanceof Error
          ? connectionError.message
          : "Unknown connection error";
      setError(`Failed to establish connection: ${errorMessage}`);
      setLoading(false);

    }
  }, [baseUrl, maxLogs, subId]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  // Add useEffect to reconnect when subId changes
  useEffect(() => {
    if (socketRef.current?.connected && subId) {
      socketRef.current.emit("get-realtime-logs", { subId });
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        if (socketRef.current?.connected && subId) {
          console.log("Auto-requesting logs with updated subId:", subId);
          socketRef.current.emit("get-realtime-logs", { subId });
        }
      }, 5000);
    }
  }, [subId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  // Add useEffect to automatically connect when hook is used
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const sendMessage = useCallback(
    (event: string, data?: any) => {
      if (socketRef.current?.connected) {
        console.log(`Sending message: ${event}`, data);
        socketRef.current.emit(event, data);
      } else {
        console.warn(`Cannot send message ${event}: Socket not connected`);
        setError("Socket not connected. Please wait for connection to establish.");
      }
    },
    [],
  );

  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    if (socketRef.current?.connected && subId) {
      refreshIntervalRef.current = setInterval(() => {
        if (socketRef.current?.connected && subId) {
          console.log("Auto-requesting logs with subId:", subId);
          socketRef.current.emit("get-realtime-logs", { subId });
        }
      }, 5000);
      console.log("Auto-refresh started (every 5 seconds)");
    }
  }, [subId]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log("Auto-refresh stopped");
    }
  }, []);

  return {
    logs,
    isConnected,
    error,
    loading,
    connect,
    disconnect,
    sendMessage,
    emit: sendMessage,
    clearLogs: () => setLogs([]),
    startAutoRefresh,
    stopAutoRefresh,
  };
};
