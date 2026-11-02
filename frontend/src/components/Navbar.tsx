"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Clock,
  UserCheck,
  Building2,
  Calendar,
  FastForward,
  RotateCcw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Flame,
} from "lucide-react";
import { RoleType } from "@/types";

interface NavbarProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  simulatedDate: string;
  onDateChange: (daysOffset: number) => Promise<any>;
  escalationCount?: number;
  notificationCount?: number;
  onToggleNotifications?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  simulatedDate,
  onDateChange,
  escalationCount = 0,
  notificationCount = 0,
  onToggleNotifications,
  onOpenSettings,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const totalAlerts = escalationCount + notificationCount;

  const handleSliderChange = async (val: number) => {
    setSliderVal(val);
    setIsSimulating(true);
    try {
      const res = await onDateChange(val);
      if (res?.escalations?.length > 0) {
        setLastNotification(
          `🚨 ${res.escalations.length} OVERDUE escalation(s) triggered & logged into SHA-256 ledger!`
        );
      } else if (res?.notifications?.length > 0) {
        setLastNotification(
          `🔔 ${res.notifications.length} renewal reminder(s) dispatched!`
        );
      } else {
        setLastNotification(null);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleQuickJump = async (days: number) => {
    await handleSliderChange(days);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D3B66] text-white shadow-xl border-b border-blue-900/40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & AICTE Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-[#0D3B66]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wide text-white">
                VISHWAS-FDR
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                AICTE APH 2024–27
              </span>
              <span className="text-xs text-blue-200 hidden md:inline">
                | Regulation Bureau
              </span>
            </div>
            <p className="text-xs text-blue-200/90 font-medium tracking-tight">
              Security Deposit & Lifecycle Portal •{" "}
              <span className="text-amber-300 font-semibold italic">
                Trust Ladder + Never Miss a Deadline
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Notifications & Escalations Trigger */}
          <button
            onClick={onToggleNotifications}
            className={`relative p-2 rounded-xl border transition-all flex items-center space-x-1.5 text-xs font-semibold ${
              escalationCount > 0
                ? "bg-red-600/30 border-red-400/60 text-red-200 hover:bg-red-600/40 animate-pulse"
                : totalAlerts > 0
                ? "bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30"
                : "bg-[#08233D]/80 border-blue-400/20 text-blue-200 hover:bg-white/10"
            }`}
            title="Open Notifications & Escalations Feed"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Alerts Feed</span>
            {totalAlerts > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  escalationCount > 0
                    ? "bg-red-600 text-white"
                    : "bg-amber-400 text-slate-950"
                }`}
              >
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Configurable APH Rules Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#08233D]/80 border border-blue-400/20 text-blue-200 hover:bg-white/10 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title="Configure APH Rules & Deposit Norms"
          >
            <Sliders className="w-4 h-4 text-blue-300" />
            <span className="hidden sm:inline">Rules & Settings</span>
          </button>

          {/* Live Role Switcher Pill */}
          <div className="flex items-center bg-[#08233D]/90 p-1 rounded-xl border border-blue-400/20 shadow-inner">
            <div className="text-[11px] text-blue-300/80 font-bold uppercase tracking-wider px-2 hidden 2xl:block">
              Role:
            </div>
            <button
              onClick={() => onRoleChange("INSTITUTION")}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentRole === "INSTITUTION"
                  ? "bg-amber-400 text-slate-950 shadow-md scale-[1.02]"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Institution</span>
            </button>
            <button
              onClick={() => onRoleChange("MAKER")}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentRole === "MAKER"
                  ? "bg-emerald-400 text-slate-950 shadow-md scale-[1.02]"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Officer (Maker)</span>
            </button>
            <button
              onClick={() => onRoleChange("CHECKER")}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentRole === "CHECKER"
                  ? "bg-purple-400 text-slate-950 shadow-md scale-[1.02]"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Director (Checker)</span>
            </button>
            <button
              onClick={() => onRoleChange("BANK_MANAGER")}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                currentRole === "BANK_MANAGER"
                  ? "bg-cyan-400 text-slate-950 shadow-md scale-[1.02]"
                  : "text-blue-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>🏦 Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Time Machine Clock Simulator Bar */}
      <div className="bg-[#0A2E50] border-t border-blue-900/60 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Label + Active Simulated Date */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Time Machine Simulator:</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/60 px-2.5 py-1 rounded-md border border-amber-400/30">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono text-xs font-bold text-amber-200">
                {simulatedDate}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                +{sliderVal} Days
              </span>
            </div>
            {isSimulating && (
              <span className="text-[11px] text-amber-300 italic animate-pulse">
                Recalculating lifecycle & triggers...
              </span>
            )}
          </div>

          {/* Slider and Quick Jump Buttons */}
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <span className="text-[10px] text-blue-300/80 font-mono">Day 0</span>
            <input
              type="range"
              min="0"
              max="180"
              value={sliderVal}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 focus:outline-none"
            />
            <span className="text-[10px] text-blue-300/80 font-mono">+180d</span>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => handleQuickJump(0)}
                title="Reset to Day 0 (2026-11-01)"
                className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-blue-200 hover:bg-slate-700 hover:text-white flex items-center space-x-1 border border-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Day 0</span>
              </button>
              <button
                onClick={() => handleQuickJump(60)}
                title="Jump forward +60 Days to trigger T-60 notifications"
                className="px-2 py-0.5 rounded text-[11px] bg-blue-900/60 text-blue-100 hover:bg-blue-800 flex items-center space-x-1 border border-blue-700/60"
              >
                <FastForward className="w-3 h-3 text-blue-300" />
                <span>+60d</span>
              </button>
              <button
                onClick={() => handleQuickJump(75)}
                title="Jump +75 Days: Watch SBI FDR mature and turn OVERDUE live on screen!"
                className="px-2.5 py-0.5 rounded text-[11px] bg-amber-500/30 text-amber-200 font-bold hover:bg-amber-500/50 flex items-center space-x-1 border border-amber-400/40 shadow-sm"
              >
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                <span>+75d (SBI Matures)</span>
              </button>
              <button
                onClick={() => handleQuickJump(90)}
                title="Jump forward +90 Days"
                className="px-2 py-0.5 rounded text-[11px] bg-blue-900/60 text-blue-100 hover:bg-blue-800 flex items-center space-x-1 border border-blue-700/60"
              >
                <span>+90d</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Notification Toast */}
        {lastNotification && (
          <div className="max-w-7xl mx-auto mt-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-md flex items-center justify-between text-xs text-amber-200">
            <span className="font-medium">{lastNotification}</span>
            <button
              onClick={() => setLastNotification(null)}
              className="text-amber-300 hover:text-white font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
