import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { vi } from 'vitest';

// Mock ThreeCanvas to avoid WebGL context errors in JSDOM
vi.mock('./components/ThreeCanvas', () => {
  return {
    default: () => <div data-testid="mock-three-canvas">ThreeCanvas</div>
  };
});

// Avoid warning in test output about WebSocket connection failing
class MockWebSocket {
  readyState = 1; // OPEN
  close = vi.fn();
  send = vi.fn();
  constructor() {
    setTimeout(() => {
      if (this.onopen) this.onopen({} as Event);
    }, 0);
  }
  onopen: ((ev: Event) => any) | null = null;
  onclose: ((ev: CloseEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  onmessage: ((ev: MessageEvent) => any) | null = null;
}

describe('App', () => {
  let originalWebSocket: any;

  // Mock scrollIntoView and WebSocket
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    originalWebSocket = global.WebSocket;
    global.WebSocket = MockWebSocket as any;
  });

  afterAll(() => {
    global.WebSocket = originalWebSocket;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles chat sending error (catch err message)', async () => {
    const user = userEvent.setup();

    // Mock global fetch to throw an error
    global.fetch = vi.fn(() => Promise.reject(new Error('Network disconnected')));

    render(<App />);

    // Find chat input and send button
    const chatInput = screen.getByPlaceholderText(/Whisper to/i);

    await user.type(chatInput, 'Hello world');

    // Find form and submit button
    const form = chatInput.closest('form');
    const submitBtn = form!.querySelector('button[type="submit"]');
    await user.click(submitBtn!);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Network disconnected')).toBeInTheDocument();
    });
  });

  it('handles chat sending error (fallback error message)', async () => {
    const user = userEvent.setup();

    // Mock global fetch to throw an error without a message
    global.fetch = vi.fn(() => Promise.reject({}));

    render(<App />);

    const chatInput = screen.getByPlaceholderText(/Whisper to/i);
    await user.type(chatInput, 'Test fallback error');

    const form = chatInput.closest('form');
    const submitBtn = form!.querySelector('button[type="submit"]');
    await user.click(submitBtn!);

    // Wait for fallback error message to appear
    await waitFor(() => {
      expect(screen.getByText('An unresolved neuron fault occurred on the loopback ports.')).toBeInTheDocument();
    });
  });
});
