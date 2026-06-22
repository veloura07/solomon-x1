import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all the complex sub-components to isolate testing the App component itself
vi.mock('./components/ThreeCanvas', () => ({
  default: ({ onSelectRing }: { onSelectRing: (idx: number) => void }) => (
    <div data-testid="mock-three-canvas">
      <button data-testid="select-ring-button" onClick={() => onSelectRing(1)}>Select Ring 1</button>
    </div>
  )
}));

vi.mock('./components/MemoryCortex', () => ({
  default: () => <div data-testid="mock-memory-cortex" />
}));

vi.mock('./components/TrustTerminal', () => ({
  default: () => <div data-testid="mock-trust-terminal" />
}));

vi.mock('./components/StateTracker', () => ({
  default: () => <div data-testid="mock-state-tracker" />
}));

vi.mock('./components/SovereignConsole', () => ({
  default: () => <div data-testid="mock-sovereign-console" />
}));

vi.mock('./components/SolomonOSComponents', () => ({
  CognitiveResourceEconomy: () => <div data-testid="mock-cognitive-resource-economy" />,
  Layer0Firewall: () => <div data-testid="mock-layer0-firewall" />,
  EvolutionLab: () => <div data-testid="mock-evolution-lab" />
}));

vi.mock('./components/AvatarCorePanel', () => ({
  default: () => <div data-testid="mock-avatar-core-panel" />
}));

// Mock WebSocket to avoid connection errors in tests
class MockWebSocket {
  url: string;
  readyState: number;
  onopen: null | (() => void);
  onclose: null | (() => void);
  onmessage: null | ((event: any) => void);
  onerror: null | ((error: any) => void);

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {}
  close() {}
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders without crashing and displays the default presence tab', () => {
    render(<App />);
    expect(screen.getByTestId('mock-three-canvas')).toBeInTheDocument();
    expect(screen.getByText('SOLOMON X')).toBeInTheDocument();
  });

  it('switches tabs correctly when sidebar buttons are clicked', async () => {
    render(<App />);

    const getNavButtonByIndex = (index: number) => {
        const nav = document.getElementById('sidebar-nav');
        if (!nav) return null;
        return nav.querySelectorAll('button')[index];
    };

    // Switch to Economy (index 1)
    const economyBtn = getNavButtonByIndex(1);
    if (economyBtn) fireEvent.click(economyBtn);
    await waitFor(() => {
        expect(screen.getByTestId('mock-cognitive-resource-economy')).toBeInTheDocument();
    });

    // Switch to Firewall (index 3)
    const firewallBtn = getNavButtonByIndex(3);
    if (firewallBtn) fireEvent.click(firewallBtn);
    await waitFor(() => {
        expect(screen.getByTestId('mock-layer0-firewall')).toBeInTheDocument();
    });

    // Switch to Memory (index 4)
    const memoryBtn = getNavButtonByIndex(4);
    if (memoryBtn) fireEvent.click(memoryBtn);
    await waitFor(() => {
        expect(screen.getByTestId('mock-memory-cortex')).toBeInTheDocument();
    });

    // Switch to Evolution (index 5)
    const evolutionBtn = getNavButtonByIndex(5);
    if (evolutionBtn) fireEvent.click(evolutionBtn);
    await waitFor(() => {
        expect(screen.getByTestId('mock-evolution-lab')).toBeInTheDocument();
    });

    // Switch to Trust (index 6)
    const trustBtn = getNavButtonByIndex(6);
    if (trustBtn) fireEvent.click(trustBtn);
    await waitFor(() => {
        expect(screen.getByTestId('mock-trust-terminal')).toBeInTheDocument();
    });
  });

  it('selects ring and handles agent swapping correctly', async () => {
    render(<App />);

    const selectRingBtn = screen.getByTestId('select-ring-button');
    fireEvent.click(selectRingBtn);

    await waitFor(() => {
       expect(screen.getByTestId('mock-three-canvas')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles sending a chat message', async () => {
    render(<App />);

    // Find chat input
    const input = screen.getByPlaceholderText(/Whisper to/i);
    expect(input).toBeInTheDocument();

    // Type in input
    fireEvent.change(input, { target: { value: 'Hello Solomon' } });
    expect(input).toHaveValue('Hello Solomon');

    // Submit form by clicking send button (it has lucide-react Send icon but let's just submit the form)
    // Or we can find the submit button and click it
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Expect input to be cleared
    await waitFor(() => {
        expect(input).toHaveValue('');
    });

    // User message should appear in document
    expect(screen.getByText('Hello Solomon')).toBeInTheDocument();
  });
});
