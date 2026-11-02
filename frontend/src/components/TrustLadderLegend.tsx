"use client";

import React from "react";
import {
  FileText,
  Cpu,
  CheckCheck,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

interface TrustLadderLegendProps {
  breakdown: {
    SUBMITTED: number;
    AUTO_CHECKED: number;
    FLAGGED: number;
    BANK_CONFIRMED: number;
    OFFICER_APPROVED: number;
  };
}

export const TrustLadderLegend: React.FC<TrustLadderLegendProps> = ({
  breakdown,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            The VISHWAS-FDR Trust Ladder
          </h3>
          <span className="text-xs text-slate-500 hidden md:inline">
            • Strict Separation of Institution Claims from Bank Proof
          </span>
        </div>
        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
          4-Stage Verification Lifecycle
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Step 1: SUBMITTED */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/80 flex flex-col justify-between relative group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <span className="text-xs font-bold text-slate-800">
                SUBMITTED
              </span>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {breakdown.SUBMITTED}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Raw Institution Claim. Zero regulatory trust granted.
          </p>
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center space-x-1">
            <FileText className="w-3 h-3 text-slate-400" />
            <span>PDF Uploaded</span>
          </div>
        </div>

        {/* Step 2: AUTO_CHECKED / FLAGGED */}
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 flex flex-col justify-between relative group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <span className="text-xs font-bold text-blue-900">
                AUTO-CHECKED
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                {breakdown.AUTO_CHECKED}
              </span>
              {breakdown.FLAGGED > 0 && (
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  {breakdown.FLAGGED} Flagged
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-blue-900 font-medium">
            5-Point AICTE OCR & Quarterly Math Engine evaluated.
          </p>
          <div className="mt-2 text-[10px] text-blue-700 font-mono flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-blue-500" />
            <span>SVG Evidence Overlay</span>
          </div>
        </div>

        {/* Step 3: BANK_CONFIRMED */}
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 flex flex-col justify-between relative group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <span className="text-xs font-bold text-emerald-950">
                BANK CONFIRMED
              </span>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {breakdown.BANK_CONFIRMED}
            </span>
          </div>
          <p className="text-[11px] text-emerald-900 font-medium">
            Branch Manager Zero-Login Magic Link / CBS API proof.
          </p>
          <div className="mt-2 text-[10px] text-emerald-800 font-mono flex items-center space-x-1">
            <CheckCheck className="w-3 h-3 text-emerald-600" />
            <span>Independent Bank Proof</span>
          </div>
        </div>

        {/* Step 4: OFFICER_APPROVED */}
        <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/60 flex flex-col justify-between relative group hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <span className="text-xs font-bold text-purple-950">
                OFFICER APPROVED
              </span>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              {breakdown.OFFICER_APPROVED}
            </span>
          </div>
          <p className="text-[11px] text-purple-900 font-medium">
            Scrutiny Officer sign-off. Locked in SHA-256 Ledger.
          </p>
          <div className="mt-2 text-[10px] text-purple-800 font-mono flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Legally Binding / Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

