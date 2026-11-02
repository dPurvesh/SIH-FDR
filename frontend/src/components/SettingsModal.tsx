"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Building,
  Calculator,
  BellRing,
  ShieldCheck,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable settings
  const [reminderDaysStr, setReminderDaysStr] = useState<string>("90, 60, 30, 7");
  const [mathTolerance, setMathTolerance] = useState<number>(100);
  const [normEngineering, setNormEngineering] = useState<number>(3500000);
  const [normPharmacy, setNormPharmacy] = useState<number>(1500000);
  const [normMbaMca, setNormMbaMca] = useState<number>(1500000);
  const [normArchitecture, setNormArchitecture] = useState<number>(1500000);

  useEffect(() => {
    if (!isOpen) return;

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
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

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
      if (!res.ok) throw new Error("Failed to save settings");
      setSuccessMsg("AICTE APH rules updated and logged into SHA-256 hash ledger!");
      onSettingsUpdated?.();
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      alert(`Error saving rules: ${err.message}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0D3B66] text-white px-6 py-4 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Sliders className="w-5 h-5 text-[#0D3B66]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">
                Configurable AICTE APH Rules & Thresholds
              </h3>
              <p className="text-xs text-blue-200">
                Modify compound math tolerance, category deposit norms, and reminder intervals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D3B66] mb-2" />
            <span className="text-xs text-slate-500 font-medium">
              Loading current policy parameters...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center space-x-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Section 1: Reminder Ladder Interval */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <BellRing className="w-4 h-4 text-amber-600" />
                  <span>Configurable Reminder Ladder (Days)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Comma-separated days before maturity
                </span>
              </div>
              <input
                type="text"
                value={reminderDaysStr}
                onChange={(e) => setReminderDaysStr(e.target.value)}
                placeholder="90, 60, 30, 7"
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Specifies when automated T-minus renewal notifications dispatch to colleges and scrutiny desks.
              </p>
            </div>

            {/* Section 2: Compound Math Tolerance */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>Quarterly Compound Math Tolerance (INR)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Rule: |A_printed - A_calc| &le; Tolerance
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-700">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="10000"
                  value={mathTolerance}
                  onChange={(e) => setMathTolerance(Number(e.target.value))}
                  className="w-32 text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-500">
                  Default: ₹100.00 (Flags discrepancy exceeding this limit)
                </span>
              </div>
            </div>

            {/* Section 3: Prescribed APH Deposit Norms */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block mb-3 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Statutory APH Security Deposit Norms (INR)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Engineering & Technology (New Campus)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="50000"
                      value={normEngineering}
                      onChange={(e) => setNormEngineering(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Pharmacy Programs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="50000"
                      value={normPharmacy}
                      onChange={(e) => setNormPharmacy(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Management (MBA / MCA)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="50000"
                      value={normMbaMca}
                      onChange={(e) => setNormMbaMca(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Architecture & Town Planning
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="50000"
                      value={normArchitecture}
                      onChange={(e) => setNormArchitecture(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold pl-7 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset APH Defaults</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#0D3B66] hover:bg-blue-900 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to SHA-256 Ledger...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Apply & Update Policy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

