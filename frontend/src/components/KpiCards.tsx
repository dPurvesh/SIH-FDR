"use client";

import React from "react";
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Landmark,
  TrendingUp,
  AlertOctagon,
} from "lucide-react";
import { KPIs } from "@/types";

interface KpiCardsProps {
  kpis: KPIs;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const bankConfirmedPct =
    kpis.total_fdrs > 0
      ? Math.round((kpis.bank_confirmed_instruments / kpis.total_fdrs) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* KPI 1: Total Deposit Corpus Managed */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Deposit Corpus
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{kpis.total_corpus_cr}{" "}
            <span className="text-base font-semibold text-slate-600">Cr</span>
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{formatINR(kpis.total_corpus_inr)}</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            {kpis.total_fdrs} Instruments
          </span>
        </div>
      </div>

      {/* KPI 2: Bank-Confirmed Instruments */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bank Confirmed Proof
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-emerald-700 tracking-tight">
            {kpis.bank_confirmed_instruments}
          </span>
          <span className="text-xs font-medium text-slate-500">
            / {kpis.total_fdrs} FDRs
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="text-slate-600">CBS API / Signed Magic Link</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {bankConfirmedPct}% Confirmed
          </span>
        </div>
      </div>

      {/* KPI 3: Flagged / Tampered Cases */}
      <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Flagged & Tampered
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center animate-pulse">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-red-600 tracking-tight">
            {kpis.flagged_tampered_cases}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Requires Scrutiny
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="text-red-700 font-medium">Math Discrepancy / Co-op Bank</span>
          <span className="font-mono text-red-600 font-bold">Priority #1</span>
        </div>
      </div>

      {/* KPI 4: Approaching Maturity / Overdue */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Maturity Escalations
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {kpis.approaching_maturity_overdue}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {kpis.overdue_count} Overdue
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>{kpis.expiring_soon_count} in T-90/60/30 window</span>
          <span className="font-semibold text-amber-700">Auto Reminders</span>
        </div>
      </div>
    </div>
  );
};

