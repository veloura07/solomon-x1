import { useState, useRef, useEffect, useCallback } from 'react';
import { AuditLog } from '../types';

interface UseWebSocketProps {
  url: string;
  onAuditLog: (log: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => void;
  onChatError: (error: string) => void;
}

export const useWebSocket = ({ url, onAuditLog, onChatError }: UseWebSocketProps) => {
  const [wsConnected, setWsConnected] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'failed'>('connecting');
  const [wsFailedNotify, setWsFailedNotify] = useState(false);
  const [wsNextRetrySeconds, setWsNextRetrySeconds] = useState<number>(0);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef<number>(1000);
  const wsRef = useRef<WebSocket | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for callbacks to avoid dependency cycles
  const onAuditLogRef = useRef(onAuditLog);
  const onChatErrorRef = useRef(onChatError);

  useEffect(() => {
    onAuditLogRef.current = onAuditLog;
    onChatErrorRef.current = onChatError;
  }, [onAuditLog, onChatError]);

  const clearTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const triggerBackoff = useCallback(() => {
    setWsConnected(false);
    setWsStatus(prev => {
      if (prev === 'connecting') {
        setWsFailedNotify(true);
      }
      return 'failed';
    });

    const baseDelay = reconnectDelayRef.current;
    const jitter = Math.random() * 800;
    const totalDelay = Math.min(baseDelay * 2 + jitter, 30000);
    reconnectDelayRef.current = Math.min(baseDelay * 2, 30000);

    const countdownMs = Math.round(totalDelay);
    let remainingSeconds = Math.ceil(countdownMs / 1000);
    setWsNextRetrySeconds(remainingSeconds);

    clearTimers();

    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setWsNextRetrySeconds(Math.max(0, remainingSeconds));
      if (remainingSeconds <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    return countdownMs;
  }, [clearTimers]);

  const connectWebSocketRef = useRef<(() => void) | null>(null);
  const isActiveRef = useRef(true);

  const connectWebSocket = useCallback(() => {
    clearTimers();
    setWsStatus('connecting');

    console.log(`[SolomonOS] Unsealing secure socket channel: ${url}`);

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.warn("[SolomonOS] Socket connection timed out. Aborting and retrying.");
          socket.close();
        }
      }, 8000);

      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        if (!isActiveRef.current) return;

        console.log("[SolomonOS] Cognitive link established successfully via WebSocket.");
        setWsConnected(true);
        setWsStatus('connected');
        setWsFailedNotify(false);
        reconnectDelayRef.current = 1000;
        setWsNextRetrySeconds(0);

        onAuditLogRef.current({
          actor: "TrustOS Enclave",
          action: "ESTABLISH_COGNITIVE_LINK",
          status: "AUTHORIZED",
          details: `Secure WebSocket interface verified. Connected to local cognitive engine at ${url}.`
        });
      };

      socket.onmessage = (event) => {
        if (!isActiveRef.current) return;
        try {
          const dataJSON = JSON.parse(event.data);
          console.log("[SolomonOS] Live frame telemetry package inbound:", dataJSON);

          if (dataJSON.event === "status") {
            onAuditLogRef.current({
              actor: "brain.py",
              action: "STATUS_UPDATE",
              status: "AUTHORIZED",
              details: `Core status transitions synced. Brain telemetry reported status is: [${dataJSON.state}]`
            });
          } else if (dataJSON.event === "error") {
            onChatErrorRef.current(dataJSON.message || "An exception occurred inside the local Ollama queue.");
          }
        } catch (e) {
          console.error("[SolomonOS] Frame stream error parsing payload JSON:", e);
        }
      };

      const handleConnectionFailure = (eventCode?: number) => {
        clearTimeout(connectionTimeout);
        if (!isActiveRef.current) return;

        const countdownMs = triggerBackoff();
        console.warn(`[SolomonOS] Cognitive link suspended (Code: ${eventCode ?? 'ERR'}). Triggering exponential backoff.`);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current && connectWebSocketRef.current) connectWebSocketRef.current();
        }, countdownMs);
      };

      socket.onclose = (event) => handleConnectionFailure(event.code);
      socket.onerror = (err) => {
        console.error("[SolomonOS] Connection fault on websocket link:", err);
      };

    } catch (err) {
      const countdownMs = triggerBackoff();
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isActiveRef.current && connectWebSocketRef.current) connectWebSocketRef.current();
      }, countdownMs);
    }
  }, [url, clearTimers, triggerBackoff]);

  connectWebSocketRef.current = connectWebSocket;

  const handleManualReconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectDelayRef.current = 1000;
    setWsFailedNotify(false);

    if (connectWebSocketRef.current) {
        connectWebSocketRef.current();
    }

    onAuditLogRef.current({
      actor: "Sovereign Human",
      action: "MANUAL_RECOVERY_TRIGGERED",
      status: "AUTHORIZED",
      details: "Bypassed exponential backoff timer. Forcing manual reconnection to WebSocket cognitive pool..."
    });
  }, [clearTimers]);

  useEffect(() => {
    isActiveRef.current = true;
    if (connectWebSocketRef.current) connectWebSocketRef.current();

    return () => {
      isActiveRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearTimers();
    };
  }, [clearTimers]);

  return {
    wsConnected,
    wsStatus,
    wsFailedNotify,
    wsNextRetrySeconds,
    wsRef,
    handleManualReconnect,
    setWsFailedNotify
  };
};
