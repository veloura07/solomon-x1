import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { Layer0Firewall } from './SolomonOSComponents';

test('renders Layer0Firewall component successfully', () => {
  const onAddAuditLog = vi.fn();
  render(<Layer0Firewall onAddAuditLog={onAddAuditLog} />);
  expect(screen.getByText('SHIELDS ACTIVE')).toBeInTheDocument();
  expect(screen.getByText('Zero Red Breaches')).toBeInTheDocument();
  expect(screen.getByText('3 Epistemic Targets')).toBeInTheDocument();
});

test('renders the violations list correctly', () => {
  const onAddAuditLog = vi.fn();
  render(<Layer0Firewall onAddAuditLog={onAddAuditLog} />);
  expect(screen.getByText('ATTEMPTED_FS_WRITE_OUTOFBOUND')).toBeInTheDocument();
  expect(screen.getByText('Ars Paulina Sandbox')).toBeInTheDocument();
  expect(screen.getByText('RULE_02_RESTRICTED_DISK')).toBeInTheDocument();
  expect(screen.getByText('WARN_GATED')).toBeInTheDocument();

  expect(screen.getByText('NON_ECC_HANDSHAKE_P2P')).toBeInTheDocument();
  expect(screen.getByText('L1 Network Enclave')).toBeInTheDocument();
  expect(screen.getByText('RULE_09_CORRECT_PARITY')).toBeInTheDocument();
  expect(screen.getByText('CLEARED_AUTOMATICALLY')).toBeInTheDocument();
});

test('renders the doubtItems list correctly', () => {
  const onAddAuditLog = vi.fn();
  render(<Layer0Firewall onAddAuditLog={onAddAuditLog} />);
  expect(screen.getByText('DuckDB local cache indices are completely validated')).toBeInTheDocument();
  expect(screen.getByText('Biometric sensor telemetry packet parities match sovereign master seed')).toBeInTheDocument();
  expect(screen.getByText('External server webhook is certified secure SSL key exchange')).toBeInTheDocument();
});

test('triggers shield hardening on button click', async () => {
  const onAddAuditLog = vi.fn();
  render(<Layer0Firewall onAddAuditLog={onAddAuditLog} />);
  const hardenButton = screen.getByText('FORCE COGNITIVE SHIELD');

  fireEvent.click(hardenButton);
  expect(screen.getByText('HARDENING...')).toBeInTheDocument();

  await waitFor(() => {
    expect(onAddAuditLog).toHaveBeenCalledWith({
      actor: "Layer 0 Sentinel",
      action: "HARDEN_COMPLIANCE_PARAMETERS",
      status: "AUTHORIZED",
      details: "Refreshed live enclave rules blocklist. Isolated red pipelines."
    });
  }, { timeout: 2000 });

  expect(screen.getByText('FORCE COGNITIVE SHIELD')).toBeInTheDocument();
});

test('triggers fact recheck on button click', () => {
  const onAddAuditLog = vi.fn();
  render(<Layer0Firewall onAddAuditLog={onAddAuditLog} />);

  const recheckButtons = screen.getAllByRole('button', { name: /RE-ESTABLISHED SEED VERIFICATION/i });
  expect(recheckButtons.length).toBe(3);

  fireEvent.click(recheckButtons[0]);

  expect(onAddAuditLog).toHaveBeenCalledWith({
    actor: "Doubt Engine",
    action: "EVALUATE_EPISTEMIC_FAITH",
    status: "AUTHORIZED",
    details: `Re-calculated contradiction density and verification bounds for fact reference f_1. Index stabilized.`
  });
});
