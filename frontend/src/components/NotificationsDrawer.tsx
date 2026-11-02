"use client";

import React, { useState } from "react";
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  Send,
  Building,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Flame,
} from "lucide-react";

export interface NotificationItem {
  fdr_id: number;
  fdr_number: string;
  institution: string;
  type: string;
  tier?: string;
  channel?: string;
  days_remaining?: number;
  days_overdue?: number;
  maturity_date?: string;
  principal_amount?: number;
  message: string;
}

export interface EscalationItem {
  fdr_id: number;
  fdr_number: string;
  institution: string;
  type: string;
  channel?: string;
  days_overdue: number;
  maturity_date?: string;
  principal_amount?: number;
  message: string;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  escalations: EscalationItem[];
  onSelectFdrById?: (fdrId: number) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  escalations,
  onSelectFdrById,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "ESCALATIONS" | "REMINDERS">(
    "ALL"
  );

  if (!isOpen) return null;

  const totalCount = notifications.length + escalations.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-[#0D3B66] text-white p-4 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Bell className="w-4 h-4 text-[#0D3B66]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                Live Notifications & Escalations Feed
              </h3>
              <p className="text-[11px] text-blue-200">
                Triggered automatically by Time Machine Clock Simulator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 p-2 text-xs shrink-0 gap-1.5">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors ${
              activeTab === "ALL"
                ? "bg-[#0D3B66] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("ESCALATIONS")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors flex items-center justify-center space-x-1 ${
              activeTab === "ESCALATIONS"
                ? "bg-red-600 text-white shadow-xs"
                : "text-red-700 hover:bg-red-50"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Escalations ({escalations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("REMINDERS")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition-colors flex items-center justify-center space-x-1 ${
              activeTab === "REMINDERS"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reminders ({notifications.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
          {totalCount === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No alerts active at this simulated date.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Drag the Time Machine slider forward +60d or +75d to fire automated notifications!
              </p>
            </div>
          ) : (
            <>
              {/* Escalations Section */}
              {(activeTab === "ALL" || activeTab === "ESCALATIONS") &&
                escalations.map((esc, i) => (
                  <div
                    key={`esc-${i}`}
                    className="p-3.5 rounded-xl bg-white border border-red-200 shadow-sm relative overflow-hidden group hover:border-red-400 transition-all"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-600" />
                    <div className="flex items-center justify-between mb-1 pl-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>OVERDUE ESCALATION</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-red-600">
                        {esc.days_overdue} Days Overdue
                      </span>
                    </div>

                    <div className="pl-1.5 mt-1.5">
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{esc.institution}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        FDR #{esc.fdr_number} • Matured {esc.maturity_date}
                      </p>
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed font-sans">
                        {esc.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1">
                          <Send className="w-3 h-3 text-red-500" />
                          <span>SMS & Email Dispatched to Director</span>
                        </span>
                        {onSelectFdrById && (
                          <button
                            onClick={() => {
                              onSelectFdrById(esc.fdr_id);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Reminders Section */}
              {(activeTab === "ALL" || activeTab === "REMINDERS") &&
                notifications.map((notif, i) => (
                  <div
                    key={`notif-${i}`}
                    className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
                    <div className="flex items-center justify-between mb-1 pl-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-900" />
                        <span>{notif.tier || "REMINDER"}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800">
                        {notif.days_remaining} Days Remaining
                      </span>
                    </div>

                    <div className="pl-1.5 mt-1.5">
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{notif.institution}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        FDR #{notif.fdr_number} • Matures {notif.maturity_date}
                      </p>
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed font-sans">
                        {notif.message}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1">
                          <Send className="w-3 h-3 text-amber-600" />
                          <span>SMS/Email to Principal & Registrar</span>
                        </span>
                        {onSelectFdrById && (
                          <button
                            onClick={() => {
                              onSelectFdrById(notif.fdr_id);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-0.5"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-center shrink-0">
          <p className="text-[11px] text-slate-400">
            Escalations are automatically chained into the SHA-256 Audit Ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

