"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Landmark,
  FileCheck2,
  Calendar,
  Lock,
  Loader2,
  ArrowRight,
  ExternalLink,
  CheckCheck,
  Ban,
  Clock,
  FileText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface BankVerifyData {
  success: boolean;
  fdr_id: number;
  fdr_number: string;
  issuing_bank: string;
  ifsc_code: string;
  branch_email: string;
  institution_name: string;
  aishe_code: string;
  state: string;
  principal_amount: number;
  interest_rate: number;
  issue_date: string;
  maturity_date: string;
  printed_maturity_amount: number;
  calculated_maturity_amount: number;
  is_joint_aicte: boolean;
  account_holder_text: string;
  trust_status: string;
  lifecycle_status: string;
  bank_confirmed_at: string | null;
  token: string;
}

export default function BankVerifyPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<BankVerifyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [managerName, setManagerName] = useState<string>(
    "Sh. A.K. Sharma (Chief Manager & Branch Head)"
  );
  const [remarks, setRemarks] = useState<string>(
    "All instrument particulars verified against Core Banking System (CBS) registry. AICTE lien confirmed."
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmationSuccess, setConfirmationSuccess] =
    useState<boolean>(false);
  const [rejected, setRejected] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>(
    "Instrument not traceable in branch CBS or lien not marked in favour of AICTE."
  );

  useEffect(() => {
    if (!token) return;

    const fetchTokenData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bank-verify/${token}`);
        if (!res.ok) {
          throw new Error("Invalid, expired, or non-existent verification link.");
        }
        const json: BankVerifyData = await res.json();
        setData(json);
        if (json.bank_confirmed_at || json.trust_status === "BANK_CONFIRMED") {
          setConfirmationSuccess(true);
        } else if (json.trust_status === "FLAGGED") {
          setRejected(true);
        }
        setError(null);
      } catch (err: any) {
        console.error("Token fetch error", err);
        setError(err.message || "Failed to load verification data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [token]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bank-verify/${token}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM",
          manager_name: managerName,
          remarks,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Confirmation failed");

      setConfirmationSuccess(true);
      setRejected(false);
      if (data) {
        setData({
          ...data,
          trust_status: result.trust_status,
          bank_confirmed_at: result.bank_confirmed_at || new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error("Action error", err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bank-verify/${token}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manager_name: managerName,
          reason: rejectReason,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Rejection failed");

      setRejected(true);
      setConfirmationSuccess(false);
      setShowRejectModal(false);
      if (data) {
        setData({
          ...data,
          trust_status: "FLAGGED",
        });
      }
    } catch (err: any) {
      console.error("Action error", err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-[#1B365D] mb-3" />
        <p className="text-sm font-bold text-slate-800">
          Validating Cryptographically Signed Bank Link...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Establishing secure handshake with AICTE Regulation Bureau CBS Bridge
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Invalid Verification Token
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            {error || "This verification link is invalid, expired, or has already been revoked."}
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold px-4 py-2.5 bg-[#1B365D] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
          >
            <span>Return to VISHWAS-FDR Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Gov Top Banner */}
      <div className="bg-[#0B1F3A] text-white text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span>भारत सरकार | Government of India • Reserve Bank of India CBS Bridge</span>
          <span className="font-mono text-emerald-400 font-semibold flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>256-Bit Cryptographic Link Verified</span>
          </span>
        </div>
      </div>

      {/* Official CBS Bank Header */}
      <header className="bg-[#1B365D] text-white shadow-md border-b border-blue-900">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shadow">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white">
                {data.issuing_bank} • Core Banking System (CBS) Portal
              </div>
              <div className="text-[11px] text-blue-200">
                Official AICTE Security Deposit Verification Gateway • IFSC:{" "}
                <span className="font-mono font-bold text-amber-300">{data.ifsc_code}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/10 text-white font-bold border border-white/20">
              ZERO-LOGIN MANAGER ATTESTATION
            </span>
          </div>
        </div>
      </header>

      {/* Main Verification View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top Banner with Bank & FDR Reference */}
          <div className="bg-gradient-to-r from-[#1B365D] via-[#24145C] to-[#1B365D] text-white p-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
                Security Deposit Attestation Request
              </span>
              <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded font-bold self-start sm:self-auto">
                FDR #{data.fdr_number}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">
              {data.institution_name}
            </h1>
            <p className="text-xs text-blue-200">
              AISHE: <span className="font-mono text-white font-semibold">{data.aishe_code}</span> • State: {data.state}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {/* Status Alert Banner if already confirmed or rejected */}
            {confirmationSuccess ? (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center space-x-3 text-emerald-900 shadow-sm animate-in fade-in duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center space-x-1.5">
                    <span>FDR Authenticity & AICTE Joint Lien Digitally Attested!</span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    This instrument has been confirmed by the branch manager against CBS records.
                    Trust Ladder status is now{" "}
                    <span className="font-black bg-emerald-200 px-1.5 py-0.2 rounded text-emerald-950">
                      BANK_CONFIRMED
                    </span>
                    . Chained into SHA-256 forensic audit ledger.
                  </p>
                </div>
              </div>
            ) : rejected ? (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 flex items-center space-x-3 text-red-900 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-red-950">
                    Instrument Disputed & Defect Flagged
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">
                    The branch manager has marked this FDR as non-traceable, disputed, or missing AICTE lien.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Instrument Particulars Grid */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-slate-400" />
                <span>Security Deposit Instrument Particulars (From Institution Claim)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Branch Details */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Issuing Branch Particulars
                  </span>
                  <div className="font-bold text-sm text-slate-900 mb-1">
                    {data.issuing_bank}
                  </div>
                  <div className="text-slate-600 text-[11px] space-y-0.5 font-mono">
                    <p>Branch IFSC: <span className="font-bold text-slate-900">{data.ifsc_code}</span></p>
                    <p>Official Branch Email: <span className="text-slate-800">{data.branch_email}</span></p>
                  </div>
                </div>

                {/* Financial Particulars */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Financial Particulars
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Principal Amount</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatINR(data.principal_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {data.interest_rate.toFixed(2)}% p.a.
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Maturity Date</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {data.maturity_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Printed Maturity Value</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatINR(data.printed_maturity_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory AICTE Lien Check Card */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#1B365D] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Mandatory AICTE Joint Lien & Holding Requirement
                  </h4>
                  <p className="text-xs text-blue-950 font-medium mb-2">
                    Account Holder Extracted from Certificate:{" "}
                    <span className="font-bold underline decoration-blue-400">
                      {data.account_holder_text}
                    </span>
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/70 px-2.5 py-1 rounded-md w-fit">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lien marked in favour of Member Secretary, AICTE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Manager Attestation Form */}
            {!confirmationSuccess && !rejected && (
              <div className="p-5 rounded-xl border border-slate-300 bg-slate-50/80 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center space-x-1.5">
                  <Landmark className="w-4 h-4 text-[#D97706]" />
                  <span>Authorized Branch Manager Digital Attestation</span>
                </h4>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Branch Manager Name & Designation
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Verification Remarks / CBS Reference / Sanction Note
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 italic mb-4 bg-white p-3 rounded-lg border border-slate-200">
                  "I hereby confirm that Fixed Deposit Receipt #{data.fdr_number} for {formatINR(data.principal_amount)} is authentic, genuine, unencumbered, and held under tripartite lien in favour of Member Secretary, AICTE in our Core Banking System (CBS) registry."
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-lg shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Digital Confirmation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        <span>Digitally Confirm FDR & AICTE Lien Authenticity</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={submitting}
                    className="w-full sm:w-auto px-4 py-3 rounded-lg text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                  >
                    Dispute / Reject FDR
                  </button>
                </div>
              </div>
            )}

            {/* Back to Portal Link */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">
                Token: {token.slice(0, 16)}...
              </span>
              <a
                href="/"
                className="font-bold text-[#1B365D] hover:underline flex items-center space-x-1"
              >
                <span>Return to VISHWAS-FDR Main Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dispute FDR Authenticity
                </h3>
                <p className="text-xs text-slate-500">
                  Formally notify AICTE Regulation Bureau of non-traceable or non-genuine instrument
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for Disputing / Rejecting Instrument
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="Enter specific CBS discrepancy reason..."
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center space-x-1.5"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                <span>Confirm Dispute & Flag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
