"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { FDRItem, TrustStatus, LifecycleStatus } from "@/types";
import { ExecutiveImpactTab } from "@/components/ExecutiveImpactTab";
import {
  Search,
  Filter,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Layers,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const { dashboardData, loading, error, refreshDashboard, currentRole } =
    useApp();

  const [activeTab, setActiveTab] = useState<"REPOSITORY" | "HEATMAP">(
    "REPOSITORY"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [trustFilter, setTrustFilter] = useState("ALL");
  const [lifecycleFilter, setLifecycleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const kpis = dashboardData?.kpis;
  const fdrs = dashboardData?.priority_list || [];

  // Filter unique states
  const uniqueStates = Array.from(
    new Set(fdrs.map((f) => f.institution_state).filter(Boolean))
  ).sort();

  // Filtered FDRs
  const filteredFdrs = fdrs.filter((fdr) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      fdr.fdr_number.toLowerCase().includes(q) ||
      fdr.institution_name.toLowerCase().includes(q) ||
      fdr.aishe_code.toLowerCase().includes(q) ||
      fdr.issuing_bank.toLowerCase().includes(q);

    const matchesState =
      stateFilter === "ALL" || fdr.institution_state === stateFilter;
    const matchesTrust =
      trustFilter === "ALL" || fdr.trust_status === trustFilter;
    const matchesLifecycle =
      lifecycleFilter === "ALL" || fdr.lifecycle_status === lifecycleFilter;

    return matchesSearch && matchesState && matchesTrust && matchesLifecycle;
  });

  const totalPages = Math.ceil(filteredFdrs.length / itemsPerPage) || 1;
  const paginatedFdrs = filteredFdrs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <span className="ux4g-badge-neutral px-2 py-0.5 rounded text-[11px] font-semibold inline-block">
            Submitted
          </span>
        );
      case "AUTO_CHECKED":
        return (
          <span className="ux4g-badge-info px-2 py-0.5 rounded text-[11px] font-semibold inline-block">
            Auto-Checked
          </span>
        );
      case "BANK_CONFIRMED":
        return (
          <span className="ux4g-badge-success px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-[#128937]" />
            <span>Bank-Confirmed</span>
          </span>
        );
      case "OFFICER_APPROVED":
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[11px] font-black inline-flex items-center space-x-1">
            <span>👑 Officer-Approved</span>
          </span>
        );
      case "FLAGGED":
        return (
          <span className="ux4g-badge-danger px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center space-x-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-[#B3251E]" />
            <span>Flagged / Defect</span>
          </span>
        );
    }
  };

  const renderLifecycleBadge = (fdr: FDRItem) => {
    const status = fdr.lifecycle_status;
    switch (status) {
      case "ACTIVE":
        return (
          <span className="ux4g-badge-success px-2 py-0.5 rounded text-[10px] font-semibold inline-block">
            Active Deposit
          </span>
        );
      case "EXPIRING_SOON":
        return (
          <span className="ux4g-badge-warning px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1">
            <Clock className="w-2.5 h-2.5 text-[#D46B08]" />
            <span>Expiring ({fdr.days_to_maturity}d)</span>
          </span>
        );
      case "OVERDUE":
        return (
          <span className="ux4g-badge-danger px-2 py-0.5 rounded text-[10px] font-black inline-flex items-center space-x-1">
            <AlertTriangle className="w-2.5 h-2.5 text-[#B3251E]" />
            <span>OVERDUE ({Math.abs(fdr.days_to_maturity)}d)</span>
          </span>
        );
      case "RELEASE_REQUESTED":
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
            Release Requested
          </span>
        );
      case "RELEASE_RECOMMENDED":
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-400 px-2 py-0.5 rounded text-[10px] font-black inline-block animate-pulse">
            Maker Recommended
          </span>
        );
      case "RELEASED":
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
            Discharged (NOC)
          </span>
        );
      case "RENEWAL_SUBMITTED":
        return (
          <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded text-[10px] font-semibold inline-block">
            Renewal Submitted
          </span>
        );
      case "ENCASHED":
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
            Encashment Invoked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP SUMMARY BAR & BANNER */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1B365D] tracking-tight flex items-center space-x-2">
            <span>Executive Overview & FDR Repository</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized regulatory repository of statutory security deposits under
            AICTE Approval Process Handbook (APH) 2024–27.
          </p>
        </div>

        {/* View Switcher Tabs (Repository Table vs. State Risk Heatmap) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setActiveTab("REPOSITORY")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === "REPOSITORY"
                  ? "bg-white text-[#1B365D] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Master Repository
            </button>
            <button
              onClick={() => setActiveTab("HEATMAP")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center space-x-1 ${
                activeTab === "HEATMAP"
                  ? "bg-white text-[#1B365D] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>State Risk Heatmap</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <a
            href="/api/fdrs/export-csv"
            download
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
            title="Download Master Repository as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4 UX4G STANDARD KPI CARDS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Corpus Managed */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Total Corpus Managed
              </span>
              <Building className="w-4 h-4 text-[#1B365D]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#1B365D] font-mono tracking-tight">
                ₹{kpis.total_corpus_cr} Cr
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {kpis.total_fdrs} registered fixed deposit instruments
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 font-semibold">
                {kpis.bank_confirmed_instruments} Bank-Confirmed
              </span>
              <span className="text-slate-400 font-mono">100% WORM Sealed</span>
            </div>
          </div>

          {/* Card 2: Pending Scrutiny / Auto-Checked */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Under Scrutiny (Auto-Checked)
              </span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-900 font-mono tracking-tight">
                {kpis.trust_ladder_breakdown.AUTO_CHECKED +
                  kpis.trust_ladder_breakdown.SUBMITTED}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Passed 5-Point OCR & compound interest math check
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <Link
                href="/scrutiny"
                className="text-blue-700 font-bold hover:underline flex items-center space-x-1"
              >
                <span>Open Scrutiny Queue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Defect / Flagged / Tampered */}
          <div className="bg-white rounded-xl p-4 border border-red-200 shadow-xs flex flex-col justify-between bg-red-50/20">
            <div className="flex items-center justify-between text-xs text-red-700 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Flagged Discrepancies
              </span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-red-600 font-mono tracking-tight">
                {kpis.flagged_tampered_cases}
              </div>
              <span className="text-[11px] text-red-700 mt-0.5 block">
                Math doctored or prohibited co-op bank
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-red-100 flex items-center justify-between text-[11px]">
              <span className="text-red-700 font-bold">
                Action Required by Officer
              </span>
            </div>
          </div>

          {/* Card 4: Approaching Expiry & Overdue */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Expiring Soon / Overdue
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-900 font-mono tracking-tight">
                {kpis.approaching_maturity_overdue}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {kpis.overdue_count} overdue • {kpis.expiring_soon_count} within 90
                days
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <Link
                href="/lifecycle"
                className="text-amber-800 font-bold hover:underline flex items-center space-x-1"
              >
                <span>View Lifecycle Drawer</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: MASTER REPOSITORY TABLE (PAGINATED & FILTERED) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "REPOSITORY" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filtering Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by AISHE Code, Institution Name, FDR Number, or Bank..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1B365D]"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* State Filter */}
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium"
              >
                <option value="ALL">All States ({uniqueStates.length})</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Trust Status Filter */}
              <select
                value={trustFilter}
                onChange={(e) => {
                  setTrustFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium"
              >
                <option value="ALL">All Trust Stages</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="AUTO_CHECKED">Auto-Checked</option>
                <option value="BANK_CONFIRMED">Bank-Confirmed</option>
                <option value="FLAGGED">Flagged / Defect</option>
                <option value="OFFICER_APPROVED">Officer-Approved</option>
              </select>

              {/* Lifecycle Filter */}
              <select
                value={lifecycleFilter}
                onChange={(e) => {
                  setLifecycleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium"
              >
                <option value="ALL">All Lifecycle Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRING_SOON">Expiring Soon (90d)</option>
                <option value="OVERDUE">Overdue</option>
                <option value="RELEASE_REQUESTED">Release Requested</option>
                <option value="RELEASED">Discharged (NOC)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-[#1B365D] text-white font-semibold">
                <tr>
                  <th className="px-4 py-3">AISHE & Institution</th>
                  <th className="px-4 py-3">FDR Number & Issuing Bank</th>
                  <th className="px-4 py-3 text-right">Principal Deposit</th>
                  <th className="px-4 py-3 text-right">Maturity Value</th>
                  <th className="px-4 py-3">Maturity Date & Tenure</th>
                  <th className="px-4 py-3">Trust Ladder</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedFdrs.map((fdr) => (
                  <tr
                    key={fdr.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* 1. AISHE & Institution */}
                    <td className="px-4 py-3">
                      <div className="flex items-start space-x-2">
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">
                            {fdr.institution_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {fdr.aishe_code} • {fdr.institution_state}
                          </span>
                          {fdr.clarification_requested && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.2 rounded">
                              Observation Flagged
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. FDR Number & Bank */}
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-800 block">
                        {fdr.fdr_number}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {fdr.issuing_bank}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        IFSC: {fdr.ifsc_code}
                      </span>
                    </td>

                    {/* 3. Principal */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                      {formatINR(fdr.principal_amount)}
                    </td>

                    {/* 4. Maturity Value */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono font-bold ${
                          fdr.math_discrepancy > 100
                            ? "text-red-600"
                            : "text-slate-800"
                        }`}
                      >
                        {formatINR(fdr.printed_maturity_amount)}
                      </span>
                      {fdr.math_discrepancy > 100 && (
                        <span className="text-[10px] font-bold text-red-600 block">
                          Δ +{formatINR(fdr.math_discrepancy)}
                        </span>
                      )}
                    </td>

                    {/* 5. Maturity Date & Countdown */}
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-800 block">
                        {fdr.maturity_date}
                      </span>
                      <div className="mt-0.5">{renderLifecycleBadge(fdr)}</div>
                    </td>

                    {/* 6. Trust Ladder Badge */}
                    <td className="px-4 py-3">
                      {renderTrustBadge(fdr.trust_status)}
                    </td>

                    {/* 7. Action Button */}
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/scrutiny/${fdr.id}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-[11px] shadow-xs transition-colors"
                      >
                        <span>Scrutiny</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}

                {paginatedFdrs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400 text-xs"
                    >
                      No Fixed Deposit instruments matched your active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing{" "}
              <span className="font-bold">
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredFdrs.length
                )}
              </span>{" "}
              to{" "}
              <span className="font-bold">
                {Math.min(currentPage * itemsPerPage, filteredFdrs.length)}
              </span>{" "}
              of <span className="font-bold">{filteredFdrs.length}</span>{" "}
              instruments
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <span className="px-2 font-bold font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: NATIONAL STATE RISK HEATMAP & EXECUTIVE IMPACT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "HEATMAP" && (
        <ExecutiveImpactTab heatmap={dashboardData?.state_heatmap || []} />
      )}
    </div>
  );
};

