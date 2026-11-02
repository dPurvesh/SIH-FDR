"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { FDRItem, TrustStatus, LifecycleStatus } from "@/types";

interface PriorityTableProps {
  fdrs: FDRItem[];
  onSelectFdr: (fdr: FDRItem) => void;
}

export const PriorityTable: React.FC<PriorityTableProps> = ({
  fdrs,
  onSelectFdr,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Extract unique states for dropdown
  const uniqueStates = Array.from(
    new Set(fdrs.map((f) => f.institution_state).filter(Boolean))
  ).sort();

  // Filtered and sorted list
  const filtered = fdrs.filter((fdr) => {
    const matchesSearch =
      fdr.fdr_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.issuing_bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fdr.aishe_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      stateFilter === "ALL" || fdr.institution_state === stateFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OVERDUE" && fdr.lifecycle_status === "OVERDUE") ||
      (statusFilter === "FLAGGED" && fdr.trust_status === "FLAGGED") ||
      (statusFilter === "EXPIRING_SOON" &&
        fdr.lifecycle_status === "EXPIRING_SOON") ||
      (statusFilter === "RELEASE_REQUESTED" &&
        fdr.lifecycle_status === "RELEASE_REQUESTED") ||
      (statusFilter === "BANK_CONFIRMED" &&
        fdr.trust_status === "BANK_CONFIRMED");

    return matchesSearch && matchesState && matchesStatus;
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderTrustBadge = (status: TrustStatus) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Submitted (Claimed)
          </span>
        );
      case "AUTO_CHECKED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Auto-Checked
          </span>
        );
      case "FLAGGED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
            Flagged
          </span>
        );
      case "BANK_CONFIRMED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Bank-Confirmed
          </span>
        );
      case "OFFICER_APPROVED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Officer-Approved
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const renderLifecycleBadge = (
    lifecycle: LifecycleStatus,
    days: number
  ) => {
    if (lifecycle === "OVERDUE" || days < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white shadow-sm animate-pulse">
          OVERDUE ({Math.abs(days)}d)
        </span>
      );
    }
    if (lifecycle === "RELEASE_REQUESTED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          Release Requested
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          Expiring in {days}d
        </span>
      );
    }
    if (days <= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          T-{days}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
        Active ({days}d)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-8">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Smart Officer Priority Queue & Instrument Registry
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-prioritizes Overdue instruments (#1), Tampered/Flagged (#2),
            and pending releases. Click any row to view Evidence Overlay.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FDR, College, Bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-60 bg-white"
            />
          </div>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All States</option>
            {uniqueStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="FLAGGED">Flagged / Tampered</option>
            <option value="EXPIRING_SOON">Expiring Soon (T-90)</option>
            <option value="RELEASE_REQUESTED">Release Requested</option>
            <option value="BANK_CONFIRMED">Bank Confirmed</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Urgency #</th>
              <th className="py-3 px-4">FDR Instrument</th>
              <th className="py-3 px-4">Institution & State</th>
              <th className="py-3 px-4">Principal (₹)</th>
              <th className="py-3 px-4">Maturity Date</th>
              <th className="py-3 px-4">Trust Stage</th>
              <th className="py-3 px-4">Lifecycle</th>
              <th className="py-3 px-4 text-right">Scrutiny Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-slate-400 font-medium"
                >
                  No Fixed Deposit Receipts match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((fdr, idx) => {
                const isOverdue =
                  fdr.lifecycle_status === "OVERDUE" ||
                  fdr.days_to_maturity < 0;
                const isFlagged = fdr.trust_status === "FLAGGED";

                return (
                  <tr
                    key={fdr.id}
                    onClick={() => onSelectFdr(fdr)}
                    className={`cursor-pointer transition-colors ${
                      isOverdue
                        ? "bg-red-50/70 hover:bg-red-100/60"
                        : isFlagged
                        ? "bg-amber-50/50 hover:bg-amber-100/60"
                        : "hover:bg-blue-50/40"
                    }`}
                  >
                    {/* Urgency Rank */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {fdr.urgency_score === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-[11px] font-black shadow-sm">
                          1
                        </span>
                      ) : fdr.urgency_score === 10 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black shadow-sm">
                          2
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium ml-1.5">
                          #{idx + 1}
                        </span>
                      )}
                    </td>

                    {/* FDR Instrument Number & Bank */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{fdr.fdr_number}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <span>{fdr.issuing_bank}</span>
                        {!fdr.is_scheduled_bank && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded">
                            Co-op Bank
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Institution & State */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate" title={fdr.institution_name}>
                        {fdr.institution_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                        <span>{fdr.institution_state}</span>
                        <span>•</span>
                        <span className="font-mono">{fdr.aishe_code}</span>
                      </div>
                    </td>

                    {/* Principal Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(fdr.principal_amount)}
                    </td>

                    {/* Maturity Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700">
                        {fdr.maturity_date}
                      </div>
                    </td>

                    {/* Trust Ladder Stage */}
                    <td className="py-3.5 px-4">
                      {renderTrustBadge(fdr.trust_status)}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3.5 px-4">
                      {renderLifecycleBadge(
                        fdr.lifecycle_status,
                        fdr.days_to_maturity
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFdr(fdr);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D3B66] text-white hover:bg-blue-900 shadow-sm transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Scrutinize</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

