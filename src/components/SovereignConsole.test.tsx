import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import SovereignConsole from './SovereignConsole';
import { AgentSpec } from '../types';

// Mock ThreeCanvas component because Three.js components usually fail in jsdom
vi.mock('./ThreeCanvas', () => ({
  default: () => <div data-testid="mock-three-canvas" />,
}));

const mockAgents: AgentSpec[] = [
  {
    name: 'Agent 1',
    tokenPool: 100,
    roleDescription: 'Role 1',
    index: 1,
    bandColor: { r: 100, g: 100, b: 100, toString: () => "646464" } as any,
    accentColor: 1,
    frameColor: 1,
    detailType: 'crossStruts',
    stoneAngle: 1,
    stoneColor: 1,
    agentInstructions: 'Inst 1',
    reputationScore: 100
  },
  {
    name: 'Agent 2',
    tokenPool: 200,
    roleDescription: 'Role 2',
    index: 2,
    bandColor: { r: 200, g: 200, b: 200, toString: () => "c8c8c8" } as any,
    accentColor: 2,
    frameColor: 2,
    detailType: 'hexNodes',
    stoneAngle: 2,
    stoneColor: 2,
    agentInstructions: 'Inst 2',
    reputationScore: 100
  },
];

const mockProps = {
  agents: mockAgents,
  onAddMemory: vi.fn(),
  onAddAuditLog: vi.fn(),
  onAddChatMessage: vi.fn(),
  onSetSelectedRingIndex: vi.fn(),
  onUpdateAgentPool: vi.fn(),
};

describe('SovereignConsole', () => {
  // Silence react unique key warning which is expected because
  // mock agents do not have IDs in types and are usually rendered via index
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args) => {
      if (typeof args[0] === 'string' && /Warning: Each child in a list should have a unique "key" prop/.test(args[0])) return;
      originalError.call(console, ...args);
    };
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders Phase I by default', () => {
    render(<SovereignConsole {...mockProps} />);

    const phase1Btn = screen.getByRole('button', { name: /Phase I: The Pillars/i });
    expect(phase1Btn).toBeInTheDocument();

    expect(screen.getByText(/INITIATIVE OPTIONS: \[Option A\]/i)).toBeInTheDocument();
  });

  it('switches to Phase 2 content when Phase II button is clicked', () => {
    render(<SovereignConsole {...mockProps} />);

    const phase2Btn = screen.getByRole('button', { name: /Phase II: Synergy/i });
    fireEvent.click(phase2Btn);

    expect(screen.getByText(/INITIATIVE OPTIONS: \[Option B\]/i)).toBeInTheDocument();
  });

  it('switches to Phase 3 content when Phase III button is clicked', () => {
    render(<SovereignConsole {...mockProps} />);

    const phase3Btn = screen.getByRole('button', { name: /Phase III: Scalability/i });
    fireEvent.click(phase3Btn);

    expect(screen.getByText(/INITIATIVE OPTIONS: \[Option C\]/i)).toBeInTheDocument();
  });
});
