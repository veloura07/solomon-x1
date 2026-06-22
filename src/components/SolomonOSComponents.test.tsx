import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CognitiveResourceEconomy } from './SolomonOSComponents';

const mockAgents = [
  { index: 0, name: 'Ars Paulina', bandColor: 0xff0000, reputationScore: 85, tokenPool: 1500, state: 'IDLE' as const, tasksCompleted: 10, confidenceAvg: 0.9, position: [0,0,0] as [number, number, number] },
  { index: 1, name: 'Ars Fulcanelli', bandColor: 0x00ff00, reputationScore: 90, tokenPool: 500, state: 'IDLE' as const, tasksCompleted: 10, confidenceAvg: 0.9, position: [0,0,0] as [number, number, number] }
];

describe('CognitiveResourceEconomy', () => {
  const mockOnAddAuditLog = vi.fn();
  const mockOnUpdateAgentPool = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders total tokens and agents correctly', () => {
    render(
      <CognitiveResourceEconomy
        agents={mockAgents}
        onAddAuditLog={mockOnAddAuditLog}
        onUpdateAgentPool={mockOnUpdateAgentPool}
      />
    );
    expect(screen.getByText('2000')).toBeInTheDocument(); // 1500 + 500
    expect(screen.getAllByText('Ars Paulina')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ars Fulcanelli')[0]).toBeInTheDocument();
  });

  it('toggles global ring synchronizer and adds audit log', async () => {
    render(
      <CognitiveResourceEconomy
        agents={mockAgents}
        onAddAuditLog={mockOnAddAuditLog}
        onUpdateAgentPool={mockOnUpdateAgentPool}
      />
    );

    // Default is realtime
    expect(screen.getByText('REALTIME')).toBeInTheDocument();

    const toggleButton = screen.getByLabelText('Toggle Global Ring Synchronizer');
    fireEvent.click(toggleButton);

    expect(screen.getByText('COOLDOWN_IDLE')).toBeInTheDocument();
    expect(mockOnAddAuditLog).toHaveBeenCalledWith({
      actor: "Sovereign Human",
      action: "TOGGLE_RING_SYNC",
      status: "AUTHORIZED",
      details: expect.stringContaining("Global Ring Synchronizer set to DISABLED")
    });
  });

  it('triggers economy balancing, updates pools and adds audit logs', async () => {
    render(
      <CognitiveResourceEconomy
        agents={mockAgents}
        onAddAuditLog={mockOnAddAuditLog}
        onUpdateAgentPool={mockOnUpdateAgentPool}
      />
    );

    const balanceButton = screen.getByRole('button', { name: /BALANCE RESOURCE MATRIX/i });
    fireEvent.click(balanceButton);

    expect(balanceButton).toBeDisabled();
    expect(screen.getByText('REBALANCING COGNITIVE TOKENS ACROSS ALL SPECTRUMS...')).toBeInTheDocument();

    // Fast-forward or wait for the setTimeout
    await waitFor(() => {
      expect(mockOnAddAuditLog).toHaveBeenCalledWith(expect.objectContaining({
        action: "REBALANCE_MARKET_ALLOCATION"
      }));
    }, { timeout: 2500 });

    // Agent 0 has 1500 (> 1200), so -100
    expect(mockOnUpdateAgentPool).toHaveBeenCalledWith(0, -100);
    // Agent 1 has 500 (< 650), so +150
    expect(mockOnUpdateAgentPool).toHaveBeenCalledWith(1, 150);
  });

  it('casts senate yay vote, updates state and adds audit log', async () => {
    render(
      <CognitiveResourceEconomy
        agents={mockAgents}
        onAddAuditLog={mockOnAddAuditLog}
        onUpdateAgentPool={mockOnUpdateAgentPool}
      />
    );

    // Initial vote count is 7
    expect(screen.getByText('Yay: 7')).toBeInTheDocument();

    const yayButton = screen.getByRole('button', { name: /CONFIRM MASTER APPROVAL \(YAY\)/i });
    fireEvent.click(yayButton);

    // Vote count increases to 8
    expect(screen.getByText('Yay: 8')).toBeInTheDocument();
    // New vote added to stream
    expect(screen.getByText('Operator (You)')).toBeInTheDocument();

    expect(mockOnAddAuditLog).toHaveBeenCalledWith({
      actor: "Sovereign Human",
      action: "CAST_SENATE_VOTE",
      status: "AUTHORIZED",
      details: "Human master signature appended to Proposal #118."
    });
  });
});
