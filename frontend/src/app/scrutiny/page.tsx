"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { FDRItem } from "@/types";
import {
  SearchCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Building,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function ScrutinyQueuePage() {
  const { dashboardData, currentRole } = useApp();
  const [filterType, setFilterType] = useState<"ALL" | "FLAGGED" | "PENDING">(
    "ALL"
  );
  const [search, setSearch] = useState("");

  const fdrs = dashboardData?.priority_list || [];

  const filtered = fdrs.filter((fdr) => {
    const matchesSearch =
      !search ||
      fdr.fdr_number.toLowerCase().includes(search.toLowerCase()) ||
      fdr.institution_name.toLowerCase().includes(search.toLowerCase()) ||
      fdr.issuing_bank.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "FLAGGED" && fdr.trust_status === "FLAGGED") ||
      (filterType === "PENDING" &&
        (fdr.trust_status === "SUBMITTED" || fdr.trust_status === "AUTO_CHECKED"));

    return matchesSearch && matchesFilter;
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1B365D] tracking-tight flex items-center space-x-2">
            <SearchCheck className="w-5 h-5 text-blue-700" />
            <span>AICTE 5-Point Scrutiny Workstation Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Priority-ranked officer scrutiny queue under AICTE Approval Process
            Handbook regulations.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-0.5 rounded-lg border border-slate-300 text-xs">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-md font-bold transition-colors ${
              filterType === "ALL"
                ? "bg-white text-[#1B365D] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Instruments ({fdrs.length})
          </button>
          <button
            onClick={() => setFilterType("FLAGGED")}
            className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center space-x-1 ${
              filterType === "FLAGGED"
                ? "bg-white text-red-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Flagged / Defect ({fdrs.filter((f) => f.trust_status === "FLAGGED").length})</span>
          </button>
          <button
            onClick={() => setFilterType("PENDING")}
            className={`px-3 py-1 rounded-md font-bold transition-colors ${
              filterType === "PENDING"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({fdrs.filter((f) => f.trust_status === "SUBMITTED" || f.trust_status === "AUTO_CHECKED").length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter queue by institution, FDR number, or issuing bank..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white"
        />
      </div>

      {/* Scrutiny Queue List */}
      <div className="space-y-3">
        {filtered.map((fdr) => {
          const isFlagged = fdr.trust_status === "FLAGGED";

          return (
            <div
              key={fdr.id}
              className={`p-4 rounded-xl border bg-white shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isFlagged
                  ? "border-red-300 bg-red-50/15"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isFlagged
                      ? "bg-red-100 text-red-700"
                      : fdr.trust_status === "BANK_CONFIRMED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isFlagged ? "⚠" : "✔"}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {fdr.fdr_number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        isFlagged
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {fdr.trust_status}
                    </span>
                    {fdr.math_discrepancy > 100 && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded animate-pulse">
                        Math Tamper (+{formatINR(fdr.math_discrepancy)})
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-xs text-slate-800 block mt-0.5">
                    {fdr.institution_name} ({fdr.institution_state})
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {fdr.issuing_bank} (IFSC: {fdr.ifsc_code}) • Principal:{" "}
                    <b>{formatINR(fdr.principal_amount)}</b>
                  </span>

                  {fdr.scrutiny_remarks && (
                    <p className="text-[11px] text-red-800 bg-red-50 p-1.5 rounded mt-1 border border-red-200">
                      <b>Observation:</b> {fdr.scrutiny_remarks}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  href={`/scrutiny/${fdr.id}`}
                  className="px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>Open Scrutiny Workstation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No Fixed Deposit cases matched the active filter.
          </div>
        )}
      </div>
    </div>
  );
}

