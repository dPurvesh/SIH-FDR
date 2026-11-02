"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { RoleType } from "@/types";
import {
  ShieldCheck,
  User,
  Bell,
  Clock,
  Settings,
  ChevronDown,
  Building,
  UserCheck,
  Award,
  Landmark,
  Eye,
  Sliders,
  ExternalLink,
} from "lucide-react";

export const GovHeader: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    simulatedDate,
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    language,
    setLanguage,
    isSimulatorOpen,
    setIsSimulatorOpen,
    notifications,
    escalations,
    handleDateChange,
  } = useApp();

  const [simDaysInput, setSimDaysInput] = useState<number>(0);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showNotificationsMenu, setShowNotificationsMenu] =
    useState<boolean>(false);

  const getRoleLabel = (role: RoleType) => {
    switch (role) {
      case "INSTITUTION":
        return {
          title: "Institution Nodal Officer",
          name: "Apex Technical Institute (C-45102)",
          icon: <Building className="w-3.5 h-3.5 text-amber-500" />,
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "MAKER":
        return {
          title: "Scrutiny Officer (Maker)",
          name: "Sh. R.K. Verma (Regulation Bureau)",
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-600" />,
          badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
        };
      case "CHECKER":
        return {
          title: "Director, Regulation Bureau (Checker)",
          name: "Dr. A. Mehta (Competent Authority)",
          icon: <Award className="w-3.5 h-3.5 text-purple-600" />,
          badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
        };
      case "BANK_MANAGER":
        return {
          title: "Bank Branch Verifier",
          name: "Chief Manager, State Bank of India",
          icon: <Landmark className="w-3.5 h-3.5 text-emerald-600" />,
          badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
    }
  };

  const roleInfo = getRoleLabel(currentRole);

  return (
    <header className="w-full shrink-0 z-40 shadow-sm border-b border-slate-200">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. GIGW TOP UTILITY BAR (Deep Gov Navy #0B1F3A) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B1F3A] text-slate-200 text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between border-b border-blue-950">
        {/* Left: Gov Ribbon */}
        <div className="flex items-center space-x-2">
          {/* Mini Tricolor Bar */}
          <div className="flex flex-col w-3 h-3 rounded overflow-hidden shadow-xs border border-white/20 shrink-0">
            <span className="h-1 bg-[#FF9933] w-full" />
            <span className="h-1 bg-white w-full" />
            <span className="h-1 bg-[#138808] w-full" />
          </div>
          <span className="font-semibold text-slate-100 tracking-wide text-[11px]">
            भारत सरकार | Government of India | Ministry of Education
          </span>
        </div>

        {/* Center: Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:inline-block focus:bg-amber-400 focus:text-slate-950 focus:px-2 focus:py-0.5 focus:rounded text-xs font-bold"
        >
          Skip to Main Content
        </a>

        {/* Right: GIGW Accessibility & Utility Controls */}
        <div className="flex items-center space-x-3 text-[11px]">
          {/* Font Scaling A-, A, A+ */}
          <div className="flex items-center space-x-0.5 bg-slate-900/90 rounded px-1.5 py-0.5 border border-slate-700">
            <button
              onClick={() => setFontScale("normal")}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                fontScale === "normal"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Standard Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontScale("large")}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                fontScale === "large"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Large Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontScale("larger")}
              className={`px-1.5 py-0.5 rounded text-[12px] font-bold ${
                fontScale === "larger"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Largest Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center space-x-1 ${
              highContrast
                ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                : "border-slate-700 text-slate-300 hover:text-white"
            }`}
            title="Toggle GIGW High Contrast Mode"
          >
            <Eye className="w-3 h-3" />
            <span>{highContrast ? "Contrast: ON" : "Contrast"}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 text-[11px] border-l border-slate-700 pl-2.5">
            <button
              onClick={() => setLanguage("en")}
              className={`hover:underline ${
                language === "en" ? "text-amber-400 font-bold" : "text-slate-400"
              }`}
            >
              English
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setLanguage("hi")}
              className={`hover:underline ${
                language === "hi" ? "text-amber-400 font-bold" : "text-slate-400"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Audit & Timeline Simulator Trigger */}
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-amber-300 border border-blue-700 text-[10px] font-bold"
            title="Open Regulatory Timeline Simulator"
          >
            <Clock className="w-3 h-3" />
            <span>Timeline Simulator</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN INSTITUTIONAL BANNER (AICTE Navy / Pure White) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: State Emblem + AICTE Brand Typography */}
        <Link href="/dashboard" className="flex items-center space-x-3.5 group">
          {/* Ashoka Stambh / State Emblem Icon */}
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-300 p-1 flex items-center justify-center shrink-0">
            <svg
              className="w-8 h-8 text-[#1B365D]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L15 8H9L12 2Z" fill="#D97706" />
              <path d="M7 9H17V11H7V9Z" fill="#1B365D" />
              <path d="M8 12H16V18H8V12Z" fill="#1B365D" />
              <circle cx="12" cy="15" r="1.5" fill="#FFFFFF" />
              <path d="M5 19H19V21H5V19Z" fill="#D97706" />
            </svg>
          </div>

          <div className="border-l border-slate-300 pl-3">
            <div className="text-[12px] font-bold text-slate-800 leading-tight">
              अखिल भारतीय तकनीकी शिक्षा परिषद्
            </div>
            <div className="text-[13px] font-extrabold tracking-tight text-[#1B365D] leading-tight">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </div>
            <div className="text-[10px] font-semibold text-[#D97706] tracking-wide flex items-center space-x-1 mt-0.5">
              <span>REGULATION BUREAU</span>
              <span>•</span>
              <span className="text-slate-600 font-normal">
                VISHWAS-FDR Security Deposit & Lifecycle Portal
              </span>
            </div>
          </div>
        </Link>

        {/* Right: Quick Role Switcher Pill & Active User Status */}
        <div className="flex items-center space-x-3">
          {/* Quick Switch Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-colors ${roleInfo.badgeClass}`}
            >
              {roleInfo.icon}
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none">
                  Active User Role:
                </span>
                <span className="font-extrabold text-[11px] block">
                  {roleInfo.title}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-500" />
            </button>

            {/* Role Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                  Switch Active Role (Instant Context):
                </span>

                <button
                  onClick={() => {
                    setCurrentRole("INSTITUTION");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-start space-x-2.5 transition-colors ${
                    currentRole === "INSTITUTION"
                      ? "bg-amber-50 text-amber-950 border border-amber-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">Institution Portal</span>
                    <span className="text-[10px] text-slate-500">
                      Submit new FDRs, track ladder, request release
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole("MAKER");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-start space-x-2.5 transition-colors ${
                    currentRole === "MAKER"
                      ? "bg-blue-50 text-blue-950 border border-blue-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      Scrutiny Officer (Maker)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      5-Point APH verification, flag observations, recommend release
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole("CHECKER");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-start space-x-2.5 transition-colors ${
                    currentRole === "CHECKER"
                      ? "bg-purple-50 text-purple-950 border border-purple-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Award className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      Director Regulation Bureau (Checker)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Final statutory approve & issue discharge NOC
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole("BANK_MANAGER");
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-start space-x-2.5 transition-colors ${
                    currentRole === "BANK_MANAGER"
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Landmark className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      Bank Branch Verifier
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Zero-login CBS confirmation / lien validation
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Active Simulated Date Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Clock:
            </span>
            <span className="font-mono font-bold text-slate-800">
              {simulatedDate}
            </span>
          </div>

          {/* Notifications / Escalations Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 relative transition-colors"
              title="View Regulatory Alerts & Escalations"
            >
              <Bell className="w-4 h-4" />
              {escalations.length + notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {escalations.length + notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotificationsMenu && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-800">
                    Regulatory Reminders & Escalations
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    {escalations.length + notifications.length} active
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {escalations.map((esc, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-red-50 border border-red-200 text-red-900"
                    >
                      <span className="font-bold text-[11px] block">
                        🚨 {esc.type}
                      </span>
                      <p className="text-[10px] mt-0.5">{esc.message}</p>
                    </div>
                  ))}

                  {notifications.map((notif, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900"
                    >
                      <span className="font-bold text-[11px] block">
                        🔔 {notif.type} Reminder
                      </span>
                      <p className="text-[10px] mt-0.5">{notif.message}</p>
                    </div>
                  ))}

                  {escalations.length === 0 && notifications.length === 0 && (
                    <p className="text-slate-400 text-center py-4 text-xs">
                      No active overdue or expiry alerts.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. COLLAPSIBLE TIMELINE SIMULATOR UTILITY POPOVER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isSimulatorOpen && (
        <div className="bg-[#1B365D] text-white px-4 sm:px-6 py-2.5 border-t border-blue-900 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] uppercase">
              Simulation Engine
            </span>
            <span className="text-slate-200 font-medium">
              Advance institutional timeline to evaluate automatic T-90/60/30/7
              reminders and Director overdue escalations:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateChange(0)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
            >
              Day 0 (Nov 1)
            </button>
            <button
              onClick={() => handleDateChange(30)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
            >
              +30 Days
            </button>
            <button
              onClick={() => handleDateChange(60)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
            >
              +60 Days
            </button>
            <button
              onClick={() => handleDateChange(75)}
              className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-mono font-bold text-[11px]"
              title="Triggers SBI FDR Overdue Escalation (Matures Jan 15, 2027)"
            >
              +75 Days (Overdue!)
            </button>
            <button
              onClick={() => handleDateChange(180)}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
            >
              +180 Days
            </button>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="p-1 text-slate-300 hover:text-white ml-2 text-xs"
              title="Close Simulator Bar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
