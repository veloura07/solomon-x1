import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

// Mock ThreeCanvas completely to avoid WebGL / Three.js errors in JSDOM
vi.mock('./components/ThreeCanvas', () => {
  return {
    default: () => <div data-testid="mock-three-canvas">ThreeCanvas</div>
  };
});

describe('App', () => {
  beforeEach(() => {
    // We want to mock WebSocket to immediately throw upon instantiation
    vi.stubGlobal('WebSocket', class {
      constructor() {
        throw new Error('Immediate instantiation fault');
      }
    });

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    // Silence console logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('handles socket connection fault on instantiation', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('COGNITIVE LINK FAULT')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Link Failed|Reattempting in/i)).toBeInTheDocument();
    });
  });
});
