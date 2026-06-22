import { render, screen, act, waitFor } from '@testing-library/react';
import App from '../App';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock ThreeCanvas to speed up test and avoid webgl issues
vi.mock('../components/ThreeCanvas', () => {
    return {
        default: () => <div data-testid="mock-three-canvas"></div>
    };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ScrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

describe('App Websocket Error Handling', () => {
  let mockWebSocket: any;
  let wsInstances: any[] = [];
  let OriginalWebSocket = global.WebSocket;

  beforeEach(() => {
    // Mock the WebSocket
    wsInstances = [];
    mockWebSocket = vi.fn().mockImplementation(function() {
        const wsInstance = {
          readyState: 0,
          close: vi.fn(),
          send: vi.fn(),
          onopen: null,
          onmessage: null,
          onerror: null,
          onclose: null,
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3
        };
        wsInstances.push(wsInstance);

        // Simulate connection open shortly after instantiation
        setTimeout(() => {
          wsInstance.readyState = 1;
          if (typeof wsInstance.onopen === 'function') {
            (wsInstance as any).onopen();
          }
        }, 10);

        return wsInstance;
    });
    // @ts-ignore
    mockWebSocket.CONNECTING = 0;
    // @ts-ignore
    mockWebSocket.OPEN = 1;
    // @ts-ignore
    mockWebSocket.CLOSING = 2;
    // @ts-ignore
    mockWebSocket.CLOSED = 3;

    // Replace global WebSocket with our mock
    (global as any).WebSocket = mockWebSocket;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (global as any).WebSocket = OriginalWebSocket;
  });

  it('handles malformed JSON payload correctly and logs to console', async () => {
    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Wait for the WebSocket to connect
    await waitFor(() => {
      expect(wsInstances.length).toBeGreaterThan(0);
      expect(wsInstances[0].onopen).not.toBeNull();
    });

    const wsInstance = wsInstances[0];

    // Ensure onmessage is set
    await waitFor(() => {
      expect(wsInstance.onmessage).not.toBeNull();
    });

    // Simulate receiving a malformed JSON message
    act(() => {
      wsInstance.onmessage({ data: '{ malformed json ' });
    });

    // Verify console.error was called with the specific message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[SolomonOS] Frame stream error parsing payload JSON:",
      expect.any(SyntaxError)
    );

    consoleErrorSpy.mockRestore();
  });

  it('displays chat error message when receiving an error event from websocket', async () => {
      render(<App />);

      // Wait for connection
      await waitFor(() => {
        expect(wsInstances.length).toBeGreaterThan(0);
        expect(wsInstances[0].onopen).not.toBeNull();
      });

      const wsInstance = wsInstances[0];

      // Ensure onmessage is set
      await waitFor(() => {
        expect(wsInstance.onmessage).not.toBeNull();
      });

      const errorMessage = "Custom error from Ollama queue";

      // Simulate receiving an error JSON message
      act(() => {
        wsInstance.onmessage({ data: JSON.stringify({ event: "error", message: errorMessage }) });
      });

      // Assert error message exists in the document
      await waitFor(() => {
         expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
  });
});
