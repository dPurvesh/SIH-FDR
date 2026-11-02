"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
  FileDown,
  RefreshCw,
  Building,
  UserCheck,
  Ban,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Landmark,
  X,
  Loader2,
  Send,
  History,
  CheckCheck,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface FDRItem {
  id: number;
  fdr_number: string;
  institution_name: string;
  aishe_code: string;
  state: string;
  issuing_bank: string;
  ifsc_code: string;
  principal_amount: number;
  interest_rate: number;
  issue_date: string;
  maturity_date: string;
  printed_maturity_amount: number;
  calculated_maturity_amount: number;
  trust_status: string;
  lifecycle_status: string;
  days_remaining: number;
  urgency_score: number;
  maker_officer: string | null;
  checker_officer: string | null;
  parent_fdr_id: number | null;
  scrutiny_remarks: string | null;
  institution: {
    id: number;
    name: string;
    aishe_code: string;
    state: string;
    pgrc_clearance: boolean;
    vigilance_clearance: boolean;
    grants_clearance: boolean;
  };
}

export default function LifecyclePage() {
  const { currentRole, simulatedDate, refreshDashboard } = useApp();

  const [fdrs, setFdrs] = useState<FDRItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "maturities" | "release" | "renewals" | "encashments"
  >("maturities");

  // Selected FDR for Clause 6.46 Gatekeeper Drawer/Modal
  const [selectedFdr, setSelectedFdr] = useState<FDRItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Form states inside Gatekeeper
  const [makerName, setMakerName] = useState<string>(
    "Sh. R.K. Verma (Scrutiny Officer)"
  );
  const [checkerName, setCheckerName] = useState<string>(
    "Dr. A. Mehta (Director, Regulation Bureau)"
  );
  const [officerRemarks, setOfficerRemarks] = useState<string>(
    "Verified in accordance with AICTE APH Clause 6.46. All statutory clearances confirmed."
  );
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Maturity interval filter
  const [maturityFilter, setMaturityFilter] = useState<string>("ALL");

  const fetchFDRs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fdrs");
      const data = await res.json();
      setFdrs(data.fdrs || []);
    } catch (err) {
      console.error("Failed to fetch FDRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFDRs();
  }, [simulatedDate]);

  const openGatekeeper = (fdr: FDRItem) => {
    setSelectedFdr(fdr);
    setIsDrawerOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const closeGatekeeper = () => {
    setIsDrawerOpen(false);
    setSelectedFdr(null);
    setActionError(null);
    setActionSuccess(null);
  };

  // Toggle internal clearance NOCs
  const handleToggleClearance = async (cell: "pgrc" | "vigilance" | "grants") => {
    if (!selectedFdr) return;
    const currentStatus =
      cell === "pgrc"
        ? selectedFdr.institution.pgrc_clearance
        : cell === "vigilance"
        ? selectedFdr.institution.vigilance_clearance
        : selectedFdr.institution.grants_clearance;

    try {
      const res = await fetch(
        `/api/institutions/${selectedFdr.institution.id}/toggle-clearance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cell, status: !currentStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update cell clearance");
      const result = await res.json();

      // Update local state
      const updatedInstitution = {
        ...selectedFdr.institution,
        pgrc_clearance: result.pgrc_clearance,
        vigilance_clearance: result.vigilance_clearance,
        grants_clearance: result.grants_clearance,
      };

      const updatedFdr = { ...selectedFdr, institution: updatedInstitution };
      setSelectedFdr(updatedFdr);

      // Update in fdrs list
      setFdrs((prev) =>
        prev.map((f) => (f.id === selectedFdr.id ? updatedFdr : f))
      );
    } catch (err: any) {
      alert(`Clearance toggle error: ${err.message}`);
    }
  };

  // Maker Recommend Action
  const handleMakerRecommend = async (recommendation: "RECOMMEND_RELEASE" | "ENCASH") => {
    if (!selectedFdr) return;
    setSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/fdrs/${selectedFdr.id}/maker-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendation,
          maker_name: makerName,
          remarks: officerRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to execute Maker recommendation.");
      }

      setActionSuccess(data.message);
      fetchFDRs();
      refreshDashboard();

      if (selectedFdr) {
        setSelectedFdr({
          ...selectedFdr,
          lifecycle_status: data.lifecycle_status,
          maker_officer: data.maker_officer,
        });
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Checker Final Approve Action
  const handleCheckerApprove = async () => {
    if (!selectedFdr) return;
    setSubmittingAction(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/fdrs/${selectedFdr.id}/checker-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checker_name: checkerName,
          remarks: officerRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to execute Checker approval.");
      }

      setActionSuccess(data.message);
      fetchFDRs();
      refreshDashboard();

      if (selectedFdr) {
        setSelectedFdr({
          ...selectedFdr,
          lifecycle_status: data.lifecycle_status,
          trust_status: data.trust_status,
          checker_officer: data.checker_officer,
        });
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered groups
  const upcomingMaturities = fdrs
    .filter((f) => f.lifecycle_status !== "RELEASED" && f.lifecycle_status !== "ENCASHED")
    .filter((f) => {
      if (maturityFilter === "OVERDUE") return f.days_remaining < 0;
      if (maturityFilter === "T-7") return f.days_remaining >= 0 && f.days_remaining <= 7;
      if (maturityFilter === "T-30") return f.days_remaining > 7 && f.days_remaining <= 30;
      if (maturityFilter === "T-60") return f.days_remaining > 30 && f.days_remaining <= 60;
      if (maturityFilter === "T-90") return f.days_remaining > 60 && f.days_remaining <= 90;
      return true;
    })
    .sort((a, b) => a.days_remaining - b.days_remaining);

  const releaseRequests = fdrs.filter(
    (f) =>
      f.lifecycle_status === "RELEASE_REQUESTED" ||
      f.lifecycle_status === "RELEASE_RECOMMENDED" ||
      f.lifecycle_status === "RELEASED" ||
      f.lifecycle_status === "OVERDUE" ||
      f.trust_status === "BANK_CONFIRMED" ||
      f.trust_status === "OFFICER_APPROVED"
  );

  const renewalsList = fdrs.filter(
    (f) => f.lifecycle_status === "RENEWAL_SUBMITTED" || f.parent_fdr_id !== null
  );

  const encashmentsList = fdrs.filter((f) => f.lifecycle_status === "ENCASHED");

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-[#D97706]" />
              <span>AICTE Regulation Bureau • Statutory Lifecycle Gatekeeper</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Security Deposit Lifecycle & Clause 6.46 Gatekeeper
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Automated maturity tracking (T-90, T-60, T-30, T-7), tripartite lien renewals,
              and strict Maker-Checker release protocols under AICTE APH Clause 6.46 with
              mandatory PGRC, Vigilance, and Grants Bureau clearances.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={fetchFDRs}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("maturities")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "maturities"
                ? "border-[#1B365D] text-[#1B365D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Upcoming Maturities & Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
              {upcomingMaturities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("release")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "release"
                ? "border-[#1B365D] text-[#1B365D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>Clause 6.46 Release Gatekeeper</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
              {releaseRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("renewals")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "renewals"
                ? "border-[#1B365D] text-[#1B365D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Deposit Renewals & Rollovers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
              {renewalsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("encashments")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === "encashments"
                ? "border-[#1B365D] text-[#1B365D]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Ban className="w-4 h-4 text-red-600" />
            <span>Encashment & Default Enforcements</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800 font-mono">
              {encashmentsList.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Upcoming Maturities */}
      {activeTab === "maturities" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-500 mr-1">Filter by Horizon:</span>
            {[
              { id: "ALL", label: "All Active" },
              { id: "OVERDUE", label: "Overdue (Days < 0)" },
              { id: "T-7", label: "T-7 Days (Critical)" },
              { id: "T-30", label: "T-30 Days (Urgent)" },
              { id: "T-60", label: "T-60 Days (Attention)" },
              { id: "T-90", label: "T-90 Days (Advance Notice)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMaturityFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  maturityFilter === f.id
                    ? "bg-[#1B365D] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Maturities Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Urgency & Days</th>
                    <th className="py-3 px-4">FDR Number</th>
                    <th className="py-3 px-4">Institution / State</th>
                    <th className="py-3 px-4">Issuing Bank & IFSC</th>
                    <th className="py-3 px-4 text-right">Principal Amount</th>
                    <th className="py-3 px-4">Maturity Date</th>
                    <th className="py-3 px-4">Lifecycle Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {upcomingMaturities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No instruments match the selected maturity horizon.
                      </td>
                    </tr>
                  ) : (
                    upcomingMaturities.map((fdr) => (
                      <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Urgency */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {fdr.days_remaining < 0 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              <span>OVERDUE ({Math.abs(fdr.days_remaining)}d ago)</span>
                            </span>
                          ) : fdr.days_remaining <= 7 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>T-{fdr.days_remaining}d (Critical)</span>
                            </span>
                          ) : fdr.days_remaining <= 30 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-200">
                              <Clock className="w-3.5 h-3.5 text-yellow-600" />
                              <span>T-{fdr.days_remaining}d (Urgent)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                              <span>T-{fdr.days_remaining}d</span>
                            </span>
                          )}
                        </td>

                        {/* FDR Number */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {fdr.fdr_number}
                        </td>

                        {/* Institution */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate" title={fdr.institution_name}>
                            {fdr.institution_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {fdr.aishe_code} • {fdr.state}
                          </div>
                        </td>

                        {/* Bank */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{fdr.issuing_bank}</div>
                          <div className="text-[11px] font-mono text-slate-500">{fdr.ifsc_code}</div>
                        </td>

                        {/* Principal */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatINR(fdr.principal_amount)}
                        </td>

                        {/* Maturity Date */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {fdr.maturity_date}
                        </td>

                        {/* Lifecycle Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fdr.lifecycle_status === "OVERDUE"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {fdr.lifecycle_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openGatekeeper(fdr)}
                              className="px-2.5 py-1 rounded bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                            >
                              <span>Gatekeeper</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/scrutiny/${fdr.id}`}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Open in Scrutiny Workstation"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Clause 6.46 Release Gatekeeper Table */}
      {activeTab === "release" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900 mb-0.5">
                AICTE Approval Process Handbook (APH) Clause 6.46 Relinquishment of Lien Protocol
              </h4>
              <p className="leading-relaxed">
                Security deposits shall NOT be released until: (1) Mandatory tenure completion,
                (2) Affidavit-6 with 11 statutory declarations furnished, and (3) Tripartite No Objection
                Certificates (NOC) granted by PGRC Cell (No fee dispute), Vigilance Cell (No inquiry pending),
                and Grants Bureau (No unspent grants). Maker must recommend and Checker (Director) must approve.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">FDR Number</th>
                    <th className="py-3 px-4">Institution Name</th>
                    <th className="py-3 px-4">Principal Amount</th>
                    <th className="py-3 px-4">PGRC NOC</th>
                    <th className="py-3 px-4">Vigilance NOC</th>
                    <th className="py-3 px-4">Grants NOC</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4 text-right">Gatekeeper Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {releaseRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No pending release requests found.
                      </td>
                    </tr>
                  ) : (
                    releaseRequests.map((fdr) => (
                      <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {fdr.fdr_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate" title={fdr.institution_name}>
                          {fdr.institution_name}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {formatINR(fdr.principal_amount)}
                        </td>

                        {/* PGRC NOC */}
                        <td className="py-3 px-4">
                          {fdr.institution.pgrc_clearance ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              NOC Clear
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              Dispute Blocked
                            </span>
                          )}
                        </td>

                        {/* Vigilance NOC */}
                        <td className="py-3 px-4">
                          {fdr.institution.vigilance_clearance ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              NOC Clear
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              Inquiry Blocked
                            </span>
                          )}
                        </td>

                        {/* Grants NOC */}
                        <td className="py-3 px-4">
                          {fdr.institution.grants_clearance ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              NOC Clear
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              Grants Pending
                            </span>
                          )}
                        </td>

                        {/* Current Stage */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fdr.lifecycle_status === "RELEASED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : fdr.lifecycle_status === "RELEASE_RECOMMENDED"
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {fdr.lifecycle_status}
                          </span>
                        </td>

                        {/* Gatekeeper Trigger */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openGatekeeper(fdr)}
                            className="px-3 py-1.5 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Open Gatekeeper</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Renewals & Rollovers */}
      {activeTab === "renewals" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Deposit Renewal & Rollover Chain Repository
              </h3>
              <p className="text-xs text-slate-500">
                Maintains uninterrupted security deposit compliance across consecutive 5-year tenures.
              </p>
            </div>
            <a
              href="/submissions/new"
              className="px-3 py-2 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <span>Submit Renewal FDR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">New FDR No.</th>
                  <th className="py-3 px-4">Linked Parent FDR</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Principal Amount</th>
                  <th className="py-3 px-4">Tenure Period</th>
                  <th className="py-3 px-4">Trust Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {renewalsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No renewal instruments linked yet.
                    </td>
                  </tr>
                ) : (
                  renewalsList.map((fdr) => (
                    <tr key={fdr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {fdr.fdr_number}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-900 font-semibold">
                        {fdr.parent_fdr_id ? `FDR #${fdr.parent_fdr_id}` : "Rollover Initial"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {fdr.institution_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatINR(fdr.principal_amount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {fdr.issue_date} to {fdr.maturity_date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {fdr.trust_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Encashment / Default */}
      {activeTab === "encashments" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 text-red-900 flex items-center space-x-2">
              <Ban className="w-4 h-4 text-red-600" />
              <span>AICTE Security Deposit Forfeitures & Legal Encashments</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory encashment record for institutions found guilty of gross norms violation, closure default, or unrefunded student fees under AICTE APH Regulations.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">FDR Number</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Principal Forfeited</th>
                  <th className="py-3 px-4">Issuing Bank</th>
                  <th className="py-3 px-4">Enforcing Officer</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {encashmentsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No FDRs encashed or forfeited.
                    </td>
                  </tr>
                ) : (
                  encashmentsList.map((fdr) => (
                    <tr key={fdr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-red-900">
                        {fdr.fdr_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {fdr.institution_name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatINR(fdr.principal_amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{fdr.issuing_bank}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {fdr.maker_officer || "AICTE Regulation Bureau"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                          FORFEITED / ENCASHED
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CLAUSE 6.46 GATEKEEPER MODAL / DRAWER */}
      {/* ======================================================== */}
      {isDrawerOpen && selectedFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1B365D] text-white p-5 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-amber-200 font-bold">
                      FDR #{selectedFdr.fdr_number}
                    </span>
                    <span className="text-xs font-semibold text-blue-200">
                      • {selectedFdr.issuing_bank}
                    </span>
                  </div>
                  <h2 className="text-base font-black tracking-tight text-white mt-0.5">
                    AICTE APH Clause 6.46 Maker-Checker Gatekeeper
                  </h2>
                </div>
              </div>

              <button
                onClick={closeGatekeeper}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Institution & Instrument Brief */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Institution / AISHE
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedFdr.institution_name}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    {selectedFdr.aishe_code} • {selectedFdr.state}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Security Deposit Principal
                  </span>
                  <div className="font-mono font-bold text-base text-slate-900 mt-0.5">
                    {formatINR(selectedFdr.principal_amount)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Maturity: {selectedFdr.maturity_date}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Lifecycle & Trust Stage
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {selectedFdr.trust_status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {selectedFdr.lifecycle_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert Banners */}
              {actionError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-950">Statutory Release Gate Blocked</h5>
                    <p className="mt-0.5 leading-relaxed">{actionError}</p>
                  </div>
                </div>
              )}

              {actionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h5 className="font-bold text-emerald-950">Action Executed Successfully</h5>
                      <p className="mt-0.5">{actionSuccess}</p>
                    </div>
                  </div>

                  {selectedFdr.lifecycle_status === "RELEASED" && (
                    <a
                      href={`/api/fdrs/${selectedFdr.id}/export-discharge-pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download AICTE Discharge Order (PDF)</span>
                    </a>
                  )}
                </div>
              )}

              {/* 5 STATUTORY PREREQUISITES */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center space-x-1.5">
                  <FileCheck2 className="w-4 h-4 text-slate-500" />
                  <span>Clause 6.46 Mandatory Statutory Verification Matrix</span>
                </h4>

                <div className="space-y-3">
                  {/* Item 1: Affidavit-6 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          Affidavit-6 (11 Declarations on ₹100 Non-Judicial Stamp Paper)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Notarized undertaking confirming complete fulfillment of APH faculty, infrastructure & statutory dues norms.
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1 shrink-0">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified & Sealed</span>
                    </span>
                  </div>

                  {/* Item 2: EoA / LoA Verification */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          Extension of Approval (EoA / LoA) Database Cross-Check
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Validated against central AICTE council approval repository for AY 2024-2027.
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1 shrink-0">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Approval In Order</span>
                    </span>
                  </div>

                  {/* Item 3: PGRC NOC */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        selectedFdr.institution.pgrc_clearance
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        3
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          PGRC Cell NOC (Public Grievance Redressal Cell)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ensures zero pending student fee-refund disputes or faculty salary grievances.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleClearance("pgrc")}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                          selectedFdr.institution.pgrc_clearance
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                        }`}
                        title="Click to toggle status for demo"
                      >
                        {selectedFdr.institution.pgrc_clearance ? "✔ NOC Clear (Click to Block)" : "✖ Dispute Pending (Click to Clear)"}
                      </button>
                    </div>
                  </div>

                  {/* Item 4: Vigilance NOC */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        selectedFdr.institution.vigilance_clearance
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        4
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          Vigilance Cell NOC (Anti-Corruption / CBI / CVC Inquiries)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Verifies no criminal, disciplinary, or financial inquiry pending against trust/management.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleClearance("vigilance")}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                          selectedFdr.institution.vigilance_clearance
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                        }`}
                        title="Click to toggle status for demo"
                      >
                        {selectedFdr.institution.vigilance_clearance ? "✔ NOC Clear (Click to Block)" : "✖ Inquiry Pending (Click to Clear)"}
                      </button>
                    </div>
                  </div>

                  {/* Item 5: Grants Bureau NOC */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        selectedFdr.institution.grants_clearance
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        5
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          Grants Bureau NOC (AICTE Scheme Fund Utilization)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Verifies that no unutilized MODROB, RPS, ATAL Academy, or SWAYAM grant funds are outstanding.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleClearance("grants")}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                          selectedFdr.institution.grants_clearance
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                        }`}
                        title="Click to toggle status for demo"
                      >
                        {selectedFdr.institution.grants_clearance ? "✔ NOC Clear (Click to Block)" : "✖ Unspent Grants (Click to Clear)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAKER & CHECKER ACTIONS SECTION */}
              <div className="border-t border-slate-200 pt-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Maker Section */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Stage 1: Maker Scrutiny Officer Recommendation
                    </span>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Scrutiny Officer Name
                    </label>
                    <input
                      type="text"
                      value={makerName}
                      onChange={(e) => setMakerName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white mb-2"
                    />

                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => handleMakerRecommend("RECOMMEND_RELEASE")}
                        disabled={submittingAction || selectedFdr.lifecycle_status === "RELEASED"}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
                      >
                        {submittingAction ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Recommend Release (Maker)</span>
                      </button>

                      <button
                        onClick={() => handleMakerRecommend("ENCASH")}
                        disabled={submittingAction || selectedFdr.lifecycle_status === "RELEASED"}
                        className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs disabled:opacity-50 transition-colors"
                        title="Enforce forfeiture due to norm violations"
                      >
                        Encash / Forfeit
                      </button>
                    </div>
                  </div>

                  {/* Checker Section */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                      Stage 2: Checker Director Bureau Approval
                    </span>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Director (Checker) Name
                    </label>
                    <input
                      type="text"
                      value={checkerName}
                      onChange={(e) => setCheckerName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-purple-300 bg-white mb-2"
                    />

                    <button
                      onClick={handleCheckerApprove}
                      disabled={
                        submittingAction ||
                        selectedFdr.lifecycle_status === "RELEASED" ||
                        selectedFdr.lifecycle_status !== "RELEASE_RECOMMENDED"
                      }
                      className="w-full mt-3 px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm disabled:opacity-40 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      {submittingAction ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                      )}
                      <span>Final Approve & Issue Discharge NOC (Checker)</span>
                    </button>
                    {selectedFdr.lifecycle_status !== "RELEASE_RECOMMENDED" &&
                      selectedFdr.lifecycle_status !== "RELEASED" && (
                        <p className="text-[10px] text-purple-700/80 mt-1 italic text-center">
                          Requires Maker Recommendation before Checker approval.
                        </p>
                      )}
                  </div>
                </div>

                {/* Remarks Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Formal Regulatory Scrutiny Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={officerRemarks}
                    onChange={(e) => setOfficerRemarks(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                AICTE APH 2024-2027 • Clause 6.46 Enforcement Engine
              </span>

              <div className="flex items-center space-x-3">
                {selectedFdr.lifecycle_status === "RELEASED" && (
                  <a
                    href={`/api/fdrs/${selectedFdr.id}/export-discharge-pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Discharge NOC Letter</span>
                  </a>
                )}
                <button
                  onClick={closeGatekeeper}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

