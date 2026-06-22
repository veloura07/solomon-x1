import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AvatarCorePanel from './AvatarCorePanel';

describe('AvatarCorePanel', () => {
  const defaultProps = {
    activeAgentName: 'TestAgent-01',
    activeAgentColor: 0x9933ff, // A purple color
  };

  it('renders the activeAgentName', () => {
    render(<AvatarCorePanel {...defaultProps} />);

    // The active agent name should be displayed and uppercase
    const agentNameElement = screen.getByText('TestAgent-01');
    expect(agentNameElement).toBeInTheDocument();
  });

  it('renders the correct active agent color as a style', () => {
    render(<AvatarCorePanel {...defaultProps} />);

    const agentNameElement = screen.getByText('TestAgent-01');
    expect(agentNameElement).toHaveStyle({ color: '#9933ff' });
  });

  it('displays the initial voiceActor state correctly', () => {
    render(<AvatarCorePanel {...defaultProps} />);

    // Check if the default voice actor is rendered
    expect(screen.getByText('Arsa-V1-Ambient-N')).toBeInTheDocument();
  });

  it('displays the initial latency state correctly', () => {
    render(<AvatarCorePanel {...defaultProps} />);

    // Check if the default latency is rendered
    expect(screen.getByText('8.2ms')).toBeInTheDocument();
  });

  it('updates latency when calibration button is clicked', async () => {
    vi.useFakeTimers();

    render(<AvatarCorePanel {...defaultProps} />);

    // Find the calibration button
    const calibrateButton = screen.getByRole('button', { name: /CALIBRATE LIP-SYNC PARITY/i });

    // Click the button
    await act(async () => {
      calibrateButton.click();
    });

    // Latency should be updated to 4.1ms immediately
    expect(screen.getByText('4.1ms')).toBeInTheDocument();

    // Fast forward time by 1200ms
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Latency should revert to 8.2ms
    expect(screen.getByText('8.2ms')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('cleans up interval on unmount', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<AvatarCorePanel {...defaultProps} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
