import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

export interface LogEvent {
  time: string;
  ago: string;
  source: string;
  timestamp?: string;
  eventType?: 'system' | 'data' | 'error'; // เพิ่ม event type
  eventName?: string; // เพิ่ม event name
}

interface UseRealtimeLogsProps {
  token?: string;
  baseUrl?: string;
  maxLogs?: number;
}

export const useRealtimeLogs = ({ 
  token = '', 
  baseUrl = 'http://localhost:5167', // เปลี่ยนเป็น http สำหรับ Socket.IO
  maxLogs = 100 
}: UseRealtimeLogsProps = {}) => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Helper function เพื่อเพิ่ม system events ลงใน logs
  const addSystemEvent = useCallback((eventName: string, message: string, type: 'system' | 'error' = 'system') => {
    const systemLog: LogEvent = {
      time: new Date().toISOString().split('T')[1].split('.')[0],
      ago: 'now',
      source: message,
      timestamp: new Date().toISOString(),
      eventType: type,
      eventName: eventName
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [systemLog, ...prevLogs];
      return updatedLogs.slice(0, maxLogs);
    });
  }, [maxLogs]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    // ตรวจสอบว่ามี token หรือไม่
    if (!token) {
      setError('No authentication token provided. Please login first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Connecting to Socket.IO...', { baseUrl, hasToken: !!token });
      
      // เพิ่ม system event ว่ากำลังเชื่อมต่อ
      addSystemEvent('connect-attempt', 'Attempting to connect to Socket.IO server...');
      
      // สร้าง Socket.IO connection พร้อม JWT token authentication
      const socket = io(baseUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'], // รองรับทั้ง websocket และ polling
        timeout: 5000,
        reconnection: false // เราจะจัดการ reconnection เอง
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket.IO connected successfully with JWT token');
        setIsConnected(true);
        setLoading(false);
        setError(null);
        reconnectAttempts.current = 0;
        
        // เพิ่ม system event ว่าเชื่อมต่อสำเร็จ
        addSystemEvent('connect-success', 'Successfully connected to Socket.IO server');
        
        // Request real-time logs และ track event นี้
        socket.emit('get-realtime-logs');
        addSystemEvent('get-realtime-logs', 'Requesting real-time logs from server');
      });

      socket.on('realtime-log', (data: any) => {
        try {
          // เพิ่ม system event ว่าได้รับ log ใหม่
          addSystemEvent('realtime-log', `Received real-time log data`);
          
          const newLog: LogEvent = {
            time: data['@timestamp'] || new Date().toISOString().split('T')[1].split('.')[0],
            ago: data.ago || 'now',
            source: data._source || data.message || JSON.stringify(data) || 'Unknown log entry',
            timestamp: data['@timestamp'] || new Date().toISOString(),
            eventType: 'data',
            eventName: 'realtime-log'
          };
          
          setLogs(prevLogs => {
            const updatedLogs = [newLog, ...prevLogs];
            return updatedLogs.slice(0, maxLogs);
          });
        } catch (parseError) {
          console.error('Error parsing log data:', parseError);
          setError('Error parsing log data');
          addSystemEvent('logs-error', `Error parsing log data: ${parseError}`, 'error');
        }
      });

      socket.on('logs-error', (errorData: any) => {
        console.error('Logs error:', errorData);
        setError(errorData.message || 'Error receiving logs');
        
        // เพิ่ม system event สำหรับ error
        addSystemEvent('logs-error', `Server error: ${errorData.message || 'Unknown error'}`, 'error');
      });

      socket.on('disconnect', (reason: string) => {
        console.log('Socket.IO disconnected:', reason);
        setIsConnected(false);
        setLoading(false);
        
        // เพิ่ม system event สำหรับ disconnect
        addSystemEvent('disconnect', `Disconnected from server: ${reason}`, 'error');
        
        // Handle specific disconnect reasons
        if (reason === 'io server disconnect') {
          setError('Server disconnected the client. Please login again.');
          return; // Server-side disconnect, don't reconnect
        } else if (reason === 'transport error') {
          setError('Transport error occurred');
        }
        
        // Auto-reconnect logic for network issues
        if (reconnectAttempts.current < maxReconnectAttempts && 
            reason !== 'io server disconnect' && 
            reason !== 'io client disconnect') {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 10000);
          
          addSystemEvent('reconnect-attempt', `Attempting to reconnect in ${delay}ms (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Failed to connect to server. Please check if the server is running on localhost:5167');
          addSystemEvent('reconnect-failed', 'Maximum reconnection attempts reached', 'error');
        }
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket.IO connection error:', {
          error: error.message,
          type: error.type,
          description: error.description,
          timestamp: new Date().toISOString()
        });
        
        // เพิ่ม system event สำหรับ connection error
        addSystemEvent('connect-error', `Connection error: ${error.message}`, 'error');
        
        // More specific error messages
        if (error.message.includes('401') || error.message.includes('403')) {
          setError('Authentication failed - Invalid or expired token. Please login again.');
        } else if (error.message.includes('timeout')) {
          setError('Connection timeout. Please check server status.');
        } else {
          setError(`Failed to connect to server: ${error.message}`);
        }
        setLoading(false);
      });

    } catch (connectionError) {
      console.error('Failed to create Socket.IO connection:', connectionError);
      const errorMessage = connectionError instanceof Error 
        ? connectionError.message 
        : 'Unknown connection error';
      setError(`Failed to establish connection: ${errorMessage}`);
      setLoading(false);
      
      // เพิ่ม system event สำหรับ connection error
      addSystemEvent('connection-failed', `Failed to establish connection: ${errorMessage}`, 'error');
    }
  }, [token, baseUrl, maxLogs, addSystemEvent]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
    
    // เพิ่ม system event สำหรับ manual disconnect
    addSystemEvent('manual-disconnect', 'Manually disconnected from server');
  }, [addSystemEvent]);

  const sendMessage = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      
      // เพิ่ม system event สำหรับ message ที่ส่งออกไป
      addSystemEvent('message-sent', `Sent message: ${event}`);
    } else {
      console.warn('Socket.IO is not connected');
      addSystemEvent('message-failed', 'Cannot send message - Socket.IO not connected', 'error');
    }
  }, [addSystemEvent]);

  useEffect(() => {
    // เชื่อมต่อเฉพาะเมื่อมี token เท่านั้น
    if (token && token.trim() !== '') {
      connect();
    } else {
      setError('Authentication token is required');
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, token]);

  return {
    logs,
    isConnected,
    error,
    loading,
    connect,
    disconnect,
    sendMessage, // ตอนนี้รับ (event: string, data?: any)
    emit: sendMessage, // alias สำหรับ Socket.IO style
    clearLogs: () => setLogs([]),
    addSystemEvent // Export helper function สำหรับใช้งานภายนอก
  };
};
