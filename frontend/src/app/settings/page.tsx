"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Building,
  Calculator,
  BellRing,
  ShieldCheck,
  Calendar,
  Clock,
  Landmark,
  Save,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const { simulatedDate, handleDateChange, refreshDashboard } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [reminderDaysStr, setReminderDaysStr] = useState<string>("90, 60, 30, 7");
  const [mathTolerance, setMathTolerance] = useState<number>(100);
  const [normEngineering, setNormEngineering] = useState<number>(3500000);
  const [normPharmacy, setNormPharmacy] = useState<number>(1500000);
  const [normMbaMca, setNormMbaMca] = useState<number>(1500000);
  const [normArchitecture, setNormArchitecture] = useState<number>(1500000);

  // Days offset calculation relative to 2026-11-01
  const baseDate = new Date("2026-11-01T00:00:00Z");
  const currentDate = new Date(`${simulatedDate}T00:00:00Z`);
  const diffDays = Math.round(
    (currentDate.getTime() - baseDate.getTime()) / (1000 * 3600 * 24)
  );

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();

      if (data.reminder_days_list) {
        setReminderDaysStr(data.reminder_days_list.join(", "));
      }
      if (data.math_tolerance_inr) {
        setMathTolerance(Number(data.math_tolerance_inr));
      }
      if (data.norm_engineering) {
        setNormEngineering(Number(data.norm_engineering));
      }
      if (data.norm_pharmacy) {
        setNormPharmacy(Number(data.norm_pharmacy));
      }
      if (data.norm_mba_mca) {
        setNormMbaMca(Number(data.norm_mba_mca));
      }
      if (data.norm_architecture) {
        setNormArchitecture(Number(data.norm_architecture));
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setErrorMsg(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Parse reminder days list
    const parsedReminderDays = reminderDaysStr
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => b - a);

    const payload = {
      reminder_days: JSON.stringify(parsedReminderDays),
      math_tolerance_inr: String(mathTolerance),
      norm_engineering: String(normEngineering),
      norm_pharmacy: String(normPharmacy),
      norm_mba_mca: String(normMbaMca),
      norm_architecture: String(normArchitecture),
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save settings");
      }

      const data = await res.json();
      setSuccessMsg("Statutory APH norms and reminder configuration successfully saved.");
      refreshDashboard();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setReminderDaysStr("90, 60, 30, 7");
    setMathTolerance(100);
    setNormEngineering(3500000);
    setNormPharmacy(1500000);
    setNormMbaMca(1500000);
    setNormArchitecture(1500000);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-[#D97706]" />
              <span>AICTE Approval Process Handbook (APH) • Policy Control Center</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              APH Norms, Math Engine & Automation Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Dynamically adjust prescribed security deposit thresholds under APH Chapter I & II,
              quarterly compounding tolerance limits, and automated statutory escalation intervals.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to APH Defaults</span>
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 shadow-sm animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Prescribed Deposit Norms */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1B365D] flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Statutory Program Deposit Norms (₹)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Minimum FDR principal required per technical discipline (APH Appendix 6).
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Engineering & Technology (Technical Campus)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={normEngineering}
                    onChange={(e) => setNormEngineering(Number(e.target.value))}
                    className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] font-mono text-slate-500 font-semibold w-24 text-right">
                    {formatINR(normEngineering)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pharmacy (B.Pharm / M.Pharm)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={normPharmacy}
                    onChange={(e) => setNormPharmacy(Number(e.target.value))}
                    className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] font-mono text-slate-500 font-semibold w-24 text-right">
                    {formatINR(normPharmacy)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Management (MBA) & MCA
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={normMbaMca}
                    onChange={(e) => setNormMbaMca(Number(e.target.value))}
                    className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] font-mono text-slate-500 font-semibold w-24 text-right">
                    {formatINR(normMbaMca)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Architecture & Applied Arts (B.Arch)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={normArchitecture}
                    onChange={(e) => setNormArchitecture(Number(e.target.value))}
                    className="flex-1 font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] font-mono text-slate-500 font-semibold w-24 text-right">
                    {formatINR(normArchitecture)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Math Engine & Verification Parameters */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Quarterly Compounding Math & OCR Tolerance
                </h3>
                <p className="text-[11px] text-slate-500">
                  Precision threshold for AICTE quarterly compounding validation.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Max Allowable Discrepancy / Rounding Tolerance (₹)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    max="1000"
                    value={mathTolerance}
                    onChange={(e) => setMathTolerance(Number(e.target.value))}
                    className="w-32 font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-[11px] text-slate-500">
                    Discrepancies exceeding this amount automatically fail Verification Point #1 and trigger defect flags.
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">
                  Indian Banking Statutory Compounding Formula:
                </span>
                <code className="text-blue-900 font-mono text-[11px] block bg-white p-2 rounded border border-slate-200">
                  A = P × (1 + r / 400) ^ (4 × n)
                </code>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  As mandated by RBI guidelines for term deposits exceeding 90 days. Days are accurately converted to quarter fractions.
                </p>
              </div>

              {/* Section 3: Reminder Ladder Intervals */}
              <div className="pt-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Automated Reminder Ladder (Days Prior to Maturity)
                </label>
                <input
                  type="text"
                  value={reminderDaysStr}
                  onChange={(e) => setReminderDaysStr(e.target.value)}
                  placeholder="e.g. 90, 60, 30, 7"
                  className="w-full font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Comma-separated list of milestone days (descending order). System dispatches automated SMS & Email notices to College Principal, Registrar, and Regional Officer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Timeline Simulator Interactive Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Temporal Clock & Maturity Simulator Controller
              </h3>
              <p className="text-[11px] text-slate-500">
                Live simulation controls for evaluating lifecycle stage transitions, automated reminders, and overdue escalation events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Active System Simulated Date
              </span>
              <div className="text-xl font-black font-mono text-[#1B365D]">
                {simulatedDate}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Offset: +{diffDays} days from base (2026-11-01)
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Quick Temporal Fast-Forward Jumps:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDateChange(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    diffDays === 0
                      ? "bg-[#1B365D] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Day 0 (Base: 2026-11-01)
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(60)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    diffDays === 60
                      ? "bg-[#1B365D] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  +60 Days (T-15 Urgent)
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(75)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    diffDays === 75
                      ? "bg-red-700 text-white shadow-sm"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  }`}
                  title="SBI Genuine FDR Matures on 2027-01-15 -> Turns Overdue"
                >
                  +75 Days (SBI Overdue Trigger)
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(90)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    diffDays === 90
                      ? "bg-[#1B365D] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  +90 Days
                </button>

                <button
                  type="button"
                  onClick={() => handleDateChange(180)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    diffDays === 180
                      ? "bg-[#1B365D] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  +180 Days (Half Year)
                </button>
              </div>

              {/* Slider Input */}
              <div className="pt-2">
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={diffDays}
                  onChange={(e) => handleDateChange(Number(e.target.value))}
                  className="w-full accent-[#1B365D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Day 0 (2026-11-01)</span>
                  <span>+90 Days</span>
                  <span>+180 Days (2027-04-30)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs shadow flex items-center space-x-2 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-300" />
                <span>Save All Regulatory Policies</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

