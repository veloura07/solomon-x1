import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TrustTerminal from './TrustTerminal';
import { AuditLog } from '../types';

describe('TrustTerminal Component', () => {
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      actor: 'System',
      action: 'BOOT',
      status: 'AUTHORIZED',
      details: 'System initialized.',
      timestamp: "2023-01-01T00:00:00Z",
      cryptographicHash: 'abc123hash',
    },
  ];

  const mockOnAddAuditLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders with TPM SEALED status initially', () => {
    render(<TrustTerminal auditLogs={mockAuditLogs} onAddAuditLog={mockOnAddAuditLog} />);

    expect(screen.getByText('TPM SEALED (SECURE)')).toBeInTheDocument();
    expect(screen.getByText('System initialized.')).toBeInTheDocument();
    expect(screen.getByText('Biometric Sovereignty Handshake')).toBeInTheDocument();
  });

  it('toggles TPM sealing state after running handshake', async () => {
    render(<TrustTerminal auditLogs={mockAuditLogs} onAddAuditLog={mockOnAddAuditLog} />);

    const buttons = screen.getAllByRole('button');
    const handshakeBtn = buttons[0];

    await act(async () => {
      fireEvent.click(handshakeBtn);
    });

    expect(screen.getByText('HANDSHAKE: Requesting Diffie-Hellman key rotation...')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1800);
    });

    await waitFor(() => {
      expect(screen.getByText('UNSEALED COGNITIVE MODE')).toBeInTheDocument();
    });

    expect(mockOnAddAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "UNSEAL_TPM_REGISTERS",
    }));
  });

  it('handles the biometric scanner process', async () => {
    render(<TrustTerminal auditLogs={mockAuditLogs} onAddAuditLog={mockOnAddAuditLog} />);

    const triggerScanBtn = screen.getByText('Biometric Sovereignty Handshake');

    await act(async () => {
      fireEvent.click(triggerScanBtn);
    });

    expect(screen.getByText('SOVEREIGNTY SCANNER')).toBeInTheDocument();

    const scannerModalText = screen.getByText('TOUCH CAPACITIVE READER TO SIGN DECREE');
    // Find the fingerprint button using its position (first button after the text)
    // The structure is: div>div>h4, p(TOUCH...) then the button is next sibling
    const scannerModalDiv = scannerModalText.parentElement?.parentElement;
    const scannerBtn = scannerModalDiv?.querySelector('button');

    expect(scannerBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(scannerBtn!);
    });

    expect(screen.getByText('RECONSTRUCTING COGNITIVE RIDGE MAP...')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText('SOVEREIGN STATUS AUTHENTICATED')).toBeInTheDocument();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.queryByText('SOVEREIGNTY SCANNER')).not.toBeInTheDocument();
    });

    expect(mockOnAddAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "Sovereignty Biometric Gate Auth",
    }));
  });

  it('cancels biometric gating', async () => {
    render(<TrustTerminal auditLogs={mockAuditLogs} onAddAuditLog={mockOnAddAuditLog} />);

    const triggerScanBtn = screen.getByText('Biometric Sovereignty Handshake');

    await act(async () => {
      fireEvent.click(triggerScanBtn);
    });

    expect(screen.getByText('SOVEREIGNTY SCANNER')).toBeInTheDocument();

    const cancelBtn = screen.getByText('CANCEL GATING');

    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(screen.queryByText('SOVEREIGNTY SCANNER')).not.toBeInTheDocument();
  });

  it('triggers audit trail download', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const mockAnchor = originalCreateElement('a');
    mockAnchor.click = vi.fn();
    mockAnchor.remove = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    });

    render(<TrustTerminal auditLogs={mockAuditLogs} onAddAuditLog={mockOnAddAuditLog} />);

    const downloadBtn = screen.getByTitle('Download cryptographically signed session audit report');

    await act(async () => {
      fireEvent.click(downloadBtn);
    });

    expect(mockAnchor.getAttribute('href')).toContain('data:text/json;charset=utf-8,');
    expect(mockAnchor.getAttribute('download')).toMatch(/solomonx_signed_audit_.*\.json/);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.remove).toHaveBeenCalled();

    expect(mockOnAddAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "DOWNLOAD_SIGNED_AUDIT_TRAIL",
    }));

    vi.restoreAllMocks();
  });
});
