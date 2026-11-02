"use client";

import React from "react";
import {
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { StateHeatmapItem } from "@/types";

interface ExecutiveImpactTabProps {
  heatmap: StateHeatmapItem[];
}

export const ExecutiveImpactTab: React.FC<ExecutiveImpactTabProps> = ({
  heatmap,
}) => {
  const getRiskBadge = (score: number) => {
    if (score >= 6) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
          HIGH RISK ({score})
        </span>
      );
    }
    if (score >= 2) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          MEDIUM RISK ({score})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        LOW RISK ({score})
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Executive Impact & National State-Wise Risk Heatmap
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time concentration analysis of Fixed Deposit security reserves across Indian
            states alongside quantifiable before-and-after operational improvements.
          </p>
        </div>
      </div>

      {/* 1. State-Wise Risk Heatmap Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              National Security Deposit Risk Grid by State
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Weighted Risk Score = (Overdue &times; 3) + Expiring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heatmap.map((item) => (
            <div
              key={item.state}
              className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                item.risk_score >= 6
                  ? "bg-red-50/50 border-red-200 hover:border-red-400"
                  : item.risk_score >= 2
                  ? "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                  : "bg-slate-50/60 border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {item.state}
                </span>
                {getRiskBadge(item.risk_score)}
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Total Corpus Managed:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{item.total_corpus_cr} Cr
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Institutions:</span>
                  <span className="font-semibold text-slate-800">
                    {item.institution_count} Colleges
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Active Instruments:</span>
                  <span className="font-semibold text-slate-800">
                    {item.active_fdrs} FDRs
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-amber-700 font-medium">
                  {item.expiring_soon} Expiring Soon
                </span>
                <span
                  className={`font-bold ${
                    item.overdue_flagged > 0 ? "text-red-600" : "text-emerald-700"
                  }`}
                >
                  {item.overdue_flagged} Overdue / Flagged
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Before vs. After Impact Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Quantifiable Impact: Before vs. After VISHWAS-FDR
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Metric 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Scrutiny & Turnaround Time
            </span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                <span className="text-[10px] font-bold text-red-700 block uppercase">Manual Baseline</span>
                <span className="text-base font-black text-red-900 block mt-0.5">14–21 Days</span>
                <span className="text-[10px] text-red-600">Physical postal verification to issuing bank</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">VISHWAS-FDR</span>
                <span className="text-base font-black text-emerald-900 block mt-0.5">&lt; 60 Seconds</span>
                <span className="text-[10px] text-emerald-700 font-semibold">99.8% Speedup via CBS & Signed Link</span>
              </div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Discrepancy & Math Tamper Detection
            </span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                <span className="text-[10px] font-bold text-red-700 block uppercase">Manual Baseline</span>
                <span className="text-base font-black text-red-900 block mt-0.5">Manual Eye Check</span>
                <span className="text-[10px] text-red-600">Complex compound interest math slipped through</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">VISHWAS-FDR</span>
                <span className="text-base font-black text-emerald-900 block mt-0.5">100% Math Verification</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Pulsing SVG overlay catches ±₹100 variance</span>
              </div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Missed Maturity & Lapsed Renewals
            </span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                <span className="text-[10px] font-bold text-red-700 block uppercase">Manual Baseline</span>
                <span className="text-base font-black text-red-900 block mt-0.5">Frequent Lapses</span>
                <span className="text-[10px] text-red-600">Spreadsheet tracking led to missed 8-10 yr dates</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">VISHWAS-FDR</span>
                <span className="text-base font-black text-emerald-900 block mt-0.5">0% Missed Deadlines</span>
                <span className="text-[10px] text-emerald-700 font-semibold">T-90/60/30/7 ladder + Director escalations</span>
              </div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Release & Discharge Integrity
            </span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                <span className="text-[10px] font-bold text-red-700 block uppercase">Manual Baseline</span>
                <span className="text-base font-black text-red-900 block mt-0.5">Single-Point Risk</span>
                <span className="text-[10px] text-red-600">Pending student disputes or grants overlooked</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">VISHWAS-FDR</span>
                <span className="text-base font-black text-emerald-900 block mt-0.5">Clause 6.46 Gatekeeper</span>
                <span className="text-[10px] text-emerald-700 font-semibold">PGRC + Vigilance + Grants Bureau + Maker-Checker</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

