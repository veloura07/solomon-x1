import { useState } from "react";
import { AuditLog } from "../types";
import { ShieldAlert, Fingerprint, Lock, Unlock, Key, RefreshCw, Terminal, CheckCircle2 } from "lucide-react";

interface TrustTerminalProps {
  auditLogs: AuditLog[];
  onAddAuditLog: (log: Omit<AuditLog, "id" | "timestamp" | "cryptographicHash">) => void;
}

export default function TrustTerminal({ auditLogs, onAddAuditLog }: TrustTerminalProps) {
  const [isTpmSealed, setIsTpmSealed] = useState(true);
  const [handshaking, setHandshaking] = useState(false);
  const [tpmLogs, setTpmLogs] = useState<string[]>([
    "INFO: SECURE BOOT GUARD INITIATED...",
    "TPM 2.0: Detecing Platform Configuration Registers [PCR-00]...",
    "TPM 2.0: Integrity state sealed successfully inside Enclave. SHA-256 verification OK."
  ]);

  // Biometric scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanApproved, setScanApproved] = useState(false);

  const runHandshake = () => {
    setHandshaking(true);
    setTpmLogs(prev => [...prev, "HANDSHAKE: Requesting Diffie-Hellman key rotation...", "DH: Rotating key exchange 0xA4F8 <--> 0xCB93..."]);
    
    setTimeout(() => {
      setHandshaking(false);
      setIsTpmSealed(!isTpmSealed);
      setTpmLogs(prev => [
        ...prev, 
        `TPM 2.0: Boot registers successfully ${isTpmSealed ? "UNSEALED" : "SEALED"} via rotating key constraints.`,
        "HANDSHAKE: Handshake completed with 0 errors. Handshake velocity: 4.8ms"
      ]);
      
      onAddAuditLog({
        actor: "TrustOS Enclave",
        action: isTpmSealed ? "UNSEAL_TPM_REGISTERS" : "SEAL_TPM_REGISTERS",
        status: "AUTHORIZED",
        details: `Cryptographic handshaking unsealed boot registers cleanly under standard system parameters. Error state: 0.`
      });
    }, 1800);
  };

  const handleTriggerFingerprint = () => {
    setShowScanner(true);
    setScanning(false);
    setScanApproved(false);
  };

  const runBiometricScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanApproved(true);
      setTimeout(() => {
        setShowScanner(false);
        // Add audit log
        onAddAuditLog({
          actor: "Human Sovereign",
          action: "Sovereignty Biometric Gate Auth",
          status: "AUTHORIZED",
          details: "Fingerprint scanner validated raw ridge density successfully. Cryptographic single-use authorize token 0xFA92BC87 committed."
        });
      }, 1000);
    }, 2000);
  };

  return (
    <div id="trust-terminal-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-slate-300">
      
      {/* 1. Terminal / Enclave status */}
      <div id="enclave-status-pane" className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">TrustOS Enclave</h3>
              <p className="text-[10px] text-slate-500">TPM 2.0 INTEGRITY STATUS</p>
            </div>
          </div>

          {/* Sealed / Unsealed Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 mb-5 transition ${
            isTpmSealed 
              ? "bg-purple-950/20 border-purple-800/40" 
              : "bg-orange-950/20 border-orange-800/40"
          }`}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 uppercase">ENCLAVE BARRIER STATUS</span>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${
                isTpmSealed ? "text-purple-400" : "text-orange-400"
              }`}>
                {isTpmSealed ? (
                  <>
                    <Lock className="w-4 h-4" />
                    TPM SEALED (SECURE)
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 animate-pulse" />
                    UNSEALED COGNITIVE MODE
                  </>
                )}
              </span>
            </div>

            <button 
              onClick={runHandshake}
              disabled={handshaking}
              className={`p-2 rounded-lg border flex items-center justify-center transition ${
                isTpmSealed 
                  ? "bg-slate-900 border-slate-800 hover:text-purple-300 text-slate-400 hover:border-purple-500/30" 
                  : "bg-slate-900 border-slate-800 hover:text-orange-300 text-slate-400 hover:border-orange-500/30"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${handshaking ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Credentials / Enclave Keys */}
          <div className="space-y-3 text-xs mb-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
              <span className="text-[10px] text-slate-500">BOOT PROTOCOL</span>
              <span className="text-slate-300">Diffie-Hellman CJS</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
              <span className="text-[10px] text-slate-500">ENCLAVE HASH ENGINE</span>
              <span className="text-slate-300">SHA-256 (Signed)</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
              <span className="text-[10px] text-slate-500">SOVEREIGN MODE</span>
              <span className="text-emerald-400 font-semibold">GRADUATED ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Tactile Authorization Gate */}
        <div className="space-y-2 mt-auto">
          <button
            onClick={handleTriggerFingerprint}
            className="w-full h-11 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Fingerprint className="w-4 h-4" />
            Biometric Sovereignty Handshake
          </button>
        </div>
      </div>

      {/* 2. Interactive TPM Handshake Logs & signed ledger logs */}
      <div id="trust-logger-term" className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden h-[440px]">
        {/* Terminal Tab Bar */}
        <div className="bg-slate-900 px-4 h-11 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-[11px] font-bold text-slate-300">DUCKDB IMMUTABLE AUDIT SYSTEM</span>
          </div>
          <span className="text-[10px] text-slate-500">BLOCKS INDEXED: {auditLogs.length}</span>
        </div>

        {/* Upper Portion: Terminal Stream */}
        <div className="p-4 bg-slate-950 border-b border-slate-900 overflow-y-auto h-[130px] text-[10px] text-purple-400 space-y-1.5">
          {tpmLogs.map((log, i) => (
            <div key={i} className="flex gap-2 leading-relaxed">
              <span className="text-slate-500 font-bold select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
          {handshaking && (
            <div className="flex items-center gap-1 text-slate-400 animate-pulse">
              <span>&gt; PROCESSING SYSTEM MATRIX INJECTS...</span>
            </div>
          )}
        </div>

        {/* Lower Portion: Audit Logs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Append-Only signed ledger records</div>

          {auditLogs.map((log) => (
            <div key={log.id} className="border border-slate-900 hover:border-slate-800 bg-slate-950 hover:bg-slate-900/40 p-3.5 rounded-xl transition">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-200 font-bold">{log.actor}</span>
                  <span className="text-slate-600 text-xs">→</span>
                  <span className="text-[10px] text-purple-400 font-bold uppercase">{log.action}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase">
                  {log.status}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal mb-2">
                {log.details}
              </p>

              <div className="flex items-center justify-between text-[8px] text-slate-500 border-t border-slate-900 pt-1.5">
                <span>TS: {new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-slate-500 font-mono select-all">SHA-256: {log.cryptographicHash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biometric Interactive Scanner Backdrop/Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full mx-4 text-center space-y-5 shadow-2xl relative">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100">SOVEREIGNTY SCANNER</h4>
              <p className="text-[10px] text-slate-400">TOUCH CAPACITIVE READER TO SIGN DECREE</p>
            </div>

            {/* Tactile fingerprint scanner button */}
            <button
              onClick={runBiometricScan}
              disabled={scanning || scanApproved}
              className={`relative mx-auto w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all bg-slate-950 shadow-inner group overflow-hidden ${
                scanApproved 
                  ? "border-emerald-500 text-emerald-400 shadow-emerald-500/10" 
                  : scanning 
                  ? "border-purple-500 text-purple-400 shadow-purple-500/20" 
                  : "border-slate-800 text-slate-500 hover:border-purple-500/40 hover:text-purple-400"
              }`}
            >
              {/* Spinning green laser scans */}
              {scanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-purple-400 shadow-lg shadow-purple-400 animate-bounce top-1/2" />
              )}
              
              {scanApproved ? (
                <CheckCircle2 className="w-10 h-10 animate-pulse text-emerald-400" />
              ) : (
                <Fingerprint className="w-12 h-12 group-hover:scale-105 transition" />
              )}
            </button>

            <div className="text-xs h-4 flex items-center justify-center">
              {scanning ? (
                <span className="text-purple-400 animate-pulse">RECONSTRUCTING COGNITIVE RIDGE MAP...</span>
              ) : scanApproved ? (
                <span className="text-emerald-400 font-bold">SOVEREIGN STATUS AUTHENTICATED</span>
              ) : (
                <span className="text-slate-400">CLICK SCANNER TO SENSE IDENTITY</span>
              )}
            </div>

            <div className="flex justify-center border-t border-slate-800 pt-4">
              <button
                type="button"
                disabled={scanning}
                onClick={() => setShowScanner(false)}
                className="px-4 h-8 text-[10px] text-slate-500 font-mono hover:text-slate-300 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-800 disabled:opacity-50"
              >
                CANCEL GATING
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
