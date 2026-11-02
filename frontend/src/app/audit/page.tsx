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
  Search,
  Filter,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

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

interface VerificationResult {
  valid: boolean;
  message: string;
  total_blocks: number;
  verified_blocks: number;
  genesis_hash: string;
  tip_hash: string;
  timestamp?: string;
}

export default function AuditPage() {
  const { simulatedDate } = useApp();

  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit?limit=250");
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
  }, [simulatedDate]);

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await fetch("/api/audit/verify");
      const data: VerificationResult = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Failed to verify cryptographic chain.");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCSV = () => {
    if (blocks.length === 0) return;
    const headers = [
      "Block ID",
      "Timestamp (IST)",
      "Actor Role",
      "Actor Name",
      "Action",
      "Target FDR",
      "Details",
      "Prev Hash",
      "Current Block Hash",
    ];
    const rows = blocks.map((b) => [
      b.id,
      b.timestamp,
      b.actor_role,
      `"${b.actor_name.replace(/"/g, '""')}"`,
      b.action,
      b.fdr_id ? `FDR-${b.fdr_id}` : "SYSTEM",
      `"${b.details.replace(/"/g, '""')}"`,
      b.prev_hash_full,
      b.curr_hash_full,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AICTE_Forensic_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const filteredBlocks = blocks.filter((b) => {
    const matchesRole = roleFilter === "ALL" || b.actor_role === roleFilter;
    const matchesQuery =
      searchQuery === "" ||
      b.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.fdr_id || "").includes(searchQuery);
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-[#D97706]" />
              <span>Cryptographic Trust Engine • WORM Architecture</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Forensic SHA-256 Audit Ledger & Chain Integrity Verifier
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Every deposit submission, AI compound interest verification, CBS attestation,
              and maker-checker release decision is cryptographically chained using SHA-256.
              Provides unalterable evidence compliant with MeitY and CAG audit guidelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={fetchAuditLog}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <a
              href="/api/audit/export-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-300" />
              <span>Download Compliance Certificate (PDF)</span>
            </a>

            <button
              onClick={handleVerifyChain}
              disabled={verifying}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 shadow-sm disabled:opacity-50 transition-colors"
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
            className={`mt-6 p-4 rounded-xl border flex items-center justify-between text-xs shadow-sm animate-in fade-in duration-200 ${
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
                  Genesis Hash: {verificationResult.genesis_hash.slice(0, 16)}... • Tip Hash:{" "}
                  {verificationResult.tip_hash.slice(0, 16)}... • Blocks Validated:{" "}
                  <span className="font-bold underline">
                    {verificationResult.verified_blocks}/{verificationResult.total_blocks}
                  </span>
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
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, details, actor, or FDR ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Role:</span>
          </span>
          {[
            { id: "ALL", label: "All Roles" },
            { id: "SYSTEM_AI", label: "System AI" },
            { id: "SCRUTINY_MAKER", label: "Maker" },
            { id: "DIRECTOR_CHECKER", label: "Checker" },
            { id: "BANK_MANAGER", label: "Bank" },
            { id: "INSTITUTION", label: "College" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === r.id
                  ? "bg-[#1B365D] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Actor & Action</th>
                <th className="py-3 px-4">Target Instrument</th>
                <th className="py-3 px-4">Cryptographic Event Details</th>
                <th className="py-3 px-4 font-mono">Prev Hash</th>
                <th className="py-3 px-4 font-mono">Current Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((block) => (
                  <tr key={block.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Block ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
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
                      <div className="font-bold text-slate-900 text-xs">
                        {block.action}
                      </div>
                      <div
                        className="text-[10px] text-slate-500 truncate max-w-[140px]"
                        title={block.actor_name}
                      >
                        {block.actor_name}
                      </div>
                    </td>

                    {/* Target FDR */}
                    <td className="py-3 px-4 font-mono font-semibold text-blue-900 whitespace-nowrap">
                      {block.fdr_id ? (
                        <a
                          href={`/scrutiny/${block.fdr_id}`}
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>FDR #{block.fdr_id}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-slate-400">GLOBAL</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 max-w-md">
                      <p
                        className="text-slate-700 text-xs leading-relaxed line-clamp-2"
                        title={block.details}
                      >
                        {block.details}
                      </p>
                    </td>

                    {/* Prev Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span title={block.prev_hash_full}>
                          {block.prev_hash}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              block.prev_hash_full,
                              `prev-${block.id}`
                            )
                          }
                          className="p-1 hover:text-slate-700 text-slate-300"
                          title="Copy Full SHA-256 Digest"
                        >
                          {copiedHash === `prev-${block.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Current Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] text-emerald-700 font-semibold whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span title={block.curr_hash_full}>
                          {block.curr_hash}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              block.curr_hash_full,
                              `curr-${block.id}`
                            )
                          }
                          className="p-1 hover:text-slate-700 text-slate-300"
                          title="Copy Full SHA-256 Digest"
                        >
                          {copiedHash === `curr-${block.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
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
}

