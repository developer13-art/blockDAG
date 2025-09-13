import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
        
        // Send ping to keep connection alive
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socketRef.current.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts
  };
}

// Hook for real-time leaderboard updates
export function useLeaderboardUpdates() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'leaderboard_update') {
        setLeaderboard(message.data);
      }
    },
    onConnect: () => {
      // Join leaderboard room for updates
      sendMessage({ type: 'join_room', data: { room: 'leaderboard' } });
    }
  });

  return { leaderboard };
}

// Hook for real-time market updates
export function useMarketUpdates() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<Record<string, any>>({});
  
  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'market_update':
          setMarkets(message.data);
          break;
        case 'price_update':
          setMarketPrices(prev => ({
            ...prev,
            [message.data.marketId]: message.data
          }));
          break;
      }
    },
    onConnect: () => {
      // Join markets room for updates
      sendMessage({ type: 'join_room', data: { room: 'markets' } });
    }
  });

  return { markets, marketPrices };
}

// Hook for real-time task updates
export function useTaskUpdates() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  
  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'task_update':
          setTasks(message.data);
          break;
        case 'user_task_update':
          setUserTasks(message.data);
          break;
      }
    },
    onConnect: () => {
      // Join tasks room for updates
      sendMessage({ type: 'join_room', data: { room: 'tasks' } });
    }
  });

  return { tasks, userTasks };
}

// Hook for real-time user updates (XP, balance, etc.)
export function useUserUpdates() {
  const [userStats, setUserStats] = useState<any>(null);
  
  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'user_stats_update') {
        setUserStats(message.data);
      }
    },
    onConnect: () => {
      // Join user-specific room for updates
      sendMessage({ type: 'join_room', data: { room: 'user_updates' } });
    }
  });

  return { userStats };
}
