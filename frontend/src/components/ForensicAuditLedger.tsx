"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Hash,
  Clock,
  UserCheck,
  Lock,
  Layers,
  FileDown,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface AuditBlock {
  id: number;
  timestamp: string;
  actor_role: string;
  actor_name: string;
  action: string;
  fdr_id: number | null;
  details: string;
  prev_hash: string;
  curr_hash: string;
  prev_hash_full: string;
  curr_hash_full: string;
}

export const ForensicAuditLedger: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit?limit=200");
      const data = await res.json();
      setBlocks(data.audit_log || []);
    } catch (err) {
      console.error("Failed to fetch audit log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await fetch("/api/audit/verify");
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const getActorBadge = (role: string) => {
    switch (role) {
      case "SYSTEM_AI":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            SYSTEM_AI
          </span>
        );
      case "SCRUTINY_MAKER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            SCRUTINY_MAKER
          </span>
        );
      case "DIRECTOR_CHECKER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            DIRECTOR_CHECKER
          </span>
        );
      case "BANK_MANAGER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
            BANK_MANAGER
          </span>
        );
      case "INSTITUTION":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            INSTITUTION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Verification Action */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-700" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Cryptographic SHA-256 Forensic Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Every upload, AI check, bank verification, time machine escalation, and
            maker-checker release is chained into an immutable SHA-256 hash log.
            Guarantees 100% tamper evidence for CAG and RTI inquiries.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchAuditLog}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title="Refresh Blocks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 disabled:opacity-50 transition-colors"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recomputing Hashes...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Hash Chain Integrity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs shadow-sm animate-in fade-in duration-150 ${
            verificationResult.valid
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-red-50 border-red-300 text-red-950"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                verificationResult.valid
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {verificationResult.valid ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {verificationResult.message}
              </h4>
              <p className="text-[11px] opacity-90 mt-0.5 font-mono">
                Genesis Block: {verificationResult.genesis_hash} • Tip Hash:{" "}
                {verificationResult.tip_hash} • Blocks Validated:{" "}
                {verificationResult.verified_blocks}/{verificationResult.total_blocks}
              </p>
            </div>
          </div>

          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs font-bold hover:underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Audit Blocks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Actor & Action</th>
                <th className="py-3 px-4">Target FDR</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4 font-mono">Prev Hash</th>
                <th className="py-3 px-4 font-mono">Current Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Block ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>#{block.id}</span>
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {block.timestamp.slice(0, 19).replace("T", " ")}
                    </td>

                    {/* Actor Role & Action */}
                    <td className="py-3 px-4">
                      <div className="mb-1">{getActorBadge(block.actor_role)}</div>
                      <div className="font-bold text-slate-800 text-[11px]">
                        {block.action}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={block.actor_name}>
                        {block.actor_name}
                      </div>
                    </td>

                    {/* FDR ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-blue-900">
                      {block.fdr_id ? `FDR #${block.fdr_id}` : "System"}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-700 text-xs leading-relaxed truncate" title={block.details}>
                        {block.details}
                      </p>
                    </td>

                    {/* Prev Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      <span className="truncate block max-w-[100px]" title={block.prev_hash_full}>
                        {block.prev_hash}
                      </span>
                    </td>

                    {/* Curr Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] text-emerald-700 font-semibold">
                      <span className="truncate block max-w-[110px]" title={block.curr_hash_full}>
                        {block.curr_hash}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

