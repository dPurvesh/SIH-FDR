"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { FDRItem } from "@/types";
import {
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FilePlus,
  ArrowRight,
  Download,
  UploadCloud,
  FileText,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";

const MyDepositsPage = () => {
  const { dashboardData, currentRole, refreshDashboard } = useApp();

  const [rectifyFdr, setRectifyFdr] = useState<FDRItem | null>(null);
  const [rectifyFile, setRectifyFile] = useState<File | null>(null);
  const [rectifyLoading, setRectifyLoading] = useState<boolean>(false);
  const [rectifySuccess, setRectifySuccess] = useState<string | null>(null);

  // Find FDRs belonging to the institution (or display all for demo ease)
  const allFdrs = dashboardData?.priority_list || [];
  // For demo, if currentRole === "INSTITUTION", filter to institution_id === 2 (Apex) or 1 (VIT), or display all
  const institutionFdrs =
    currentRole === "INSTITUTION"
      ? allFdrs.filter((f) => f.institution_id === 1 || f.institution_id === 2)
      : allFdrs;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUploadRectified = async () => {
    if (!rectifyFdr || !rectifyFile) return;
    setRectifyLoading(true);
    setRectifySuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", rectifyFile);
      formData.append("institution_id", String(rectifyFdr.institution_id));
      formData.append("fdr_number", rectifyFdr.fdr_number);
      formData.append("issuing_bank", rectifyFdr.issuing_bank);
      formData.append("ifsc_code", rectifyFdr.ifsc_code);
      formData.append("principal_amount", String(rectifyFdr.principal_amount));
      formData.append("interest_rate", String(rectifyFdr.interest_rate));
      formData.append("issue_date", rectifyFdr.issue_date);
      formData.append("maturity_date", rectifyFdr.maturity_date);
      formData.append(
        "printed_maturity_amount",
        String(rectifyFdr.calculated_maturity_amount || rectifyFdr.printed_maturity_amount)
      );

      const res = await fetch("/api/fdrs/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload replacement FDR.");
      }

      await refreshDashboard();
      setRectifySuccess(
        "Replacement FDR uploaded successfully! Scrutiny engine re-evaluated and cleared observation."
      );
      setTimeout(() => {
        setRectifyFdr(null);
        setRectifySuccess(null);
      }, 2000);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setRectifyLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1B365D] tracking-tight">
            Institution Security Deposit Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track Trust Ladder progression, statutory clearances, and renewal /
            release workflows under AICTE Clause 6.46.
          </p>
        </div>

        <Link
          href="/submissions/new"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4 text-amber-400" />
          <span>Submit New Deposit</span>
        </Link>
      </div>

      {/* Institution Info Card */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Tendering Technical Institution
            </span>
            <span className="font-extrabold text-sm text-slate-900 block">
              Visvesvaraya Institute of Technology & Apex Campuses
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              AISHE: C-45102 / C-28901 • Region: Western (Maharashtra)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">
              Total Deposits
            </span>
            <span className="font-black text-[#1B365D] font-mono text-sm">
              {institutionFdrs.length} FDRs
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">
              Total Value
            </span>
            <span className="font-black text-emerald-700 font-mono text-sm">
              ₹
              {(
                institutionFdrs.reduce(
                  (acc, f) => acc + f.principal_amount,
                  0
                ) / 1e7
              ).toFixed(2)}{" "}
              Cr
            </span>
          </div>
        </div>
      </div>

      {/* Observation Remark Banner if Any Flagged Case */}
      {institutionFdrs.some((f) => f.clarification_requested || f.trust_status === "FLAGGED") && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-xs">
          <div className="flex items-center space-x-2 text-red-900 font-extrabold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Action Required: Scrutiny Officer Observation Flagged</span>
          </div>
          <p className="text-xs text-red-800">
            One or more of your security deposit instruments have been flagged by
            the Regulation Bureau with official scrutiny remarks. Please review the
            remarks below and upload a corrected instrument.
          </p>
        </div>
      )}

      {/* Deposit Cards Grid */}
      <div className="space-y-4">
        {institutionFdrs.map((fdr) => (
          <div
            key={fdr.id}
            className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
              fdr.trust_status === "FLAGGED"
                ? "border-red-300 bg-red-50/10"
                : "border-slate-200"
            }`}
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {fdr.fdr_number}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {fdr.issuing_bank}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    IFSC: {fdr.ifsc_code} • {fdr.institution_name}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    fdr.trust_status === "BANK_CONFIRMED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : fdr.trust_status === "OFFICER_APPROVED"
                      ? "bg-purple-100 text-purple-800 border border-purple-300"
                      : fdr.trust_status === "FLAGGED"
                      ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {fdr.trust_status}
                </span>

                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                  {fdr.lifecycle_status}
                </span>
              </div>
            </div>

            {/* Middle: Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Principal Amount
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(fdr.principal_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Interest Rate
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {fdr.interest_rate.toFixed(2)}% p.a.
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Maturity Date
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {fdr.maturity_date}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Maturity Value
                </span>
                <span
                  className={`font-mono font-bold ${
                    fdr.math_discrepancy > 100
                      ? "text-red-600"
                      : "text-emerald-700"
                  }`}
                >
                  {formatINR(fdr.printed_maturity_amount)}
                </span>
              </div>
            </div>

            {/* Official Scrutiny Remark Box if Flagged */}
            {(fdr.scrutiny_remarks || fdr.clarification_requested) && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900 my-2">
                <span className="font-bold flex items-center space-x-1 text-red-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>AICTE Scrutiny Officer Observation:</span>
                </span>
                <p className="text-[11px] mt-0.5 text-red-800">
                  {fdr.scrutiny_remarks ||
                    "Discrepancy detected during 5-point verification. Please upload a verified replacement instrument."}
                </p>
                <div className="mt-2">
                  <button
                    onClick={() => setRectifyFdr(fdr)}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                  >
                    Upload Corrected Replacement FDR
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono truncate max-w-sm">
                <span>SHA: {(fdr.file_sha256 || "").slice(0, 20)}...</span>
                <span>•</span>
                <span>Lien: {fdr.is_joint_aicte ? "✔ AICTE" : "❌ Missing"}</span>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`/api/fdrs/${fdr.id}/export-audit-pdf`}
                  download
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center space-x-1"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Compliance PDF</span>
                </a>

                {fdr.lifecycle_status === "RELEASED" && (
                  <a
                    href={`/api/fdrs/${fdr.id}/export-discharge-pdf`}
                    download
                    className="px-2.5 py-1 rounded bg-[#1B365D] text-amber-300 font-bold text-[11px] flex items-center space-x-1 shadow-xs"
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>Discharge NOC Letter</span>
                  </a>
                )}

                <Link
                  href={`/scrutiny/${fdr.id}`}
                  className="px-3 py-1 rounded bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-[11px] flex items-center space-x-1"
                >
                  <span>View Scrutiny Canvas</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rectification Modal */}
      {rectifyFdr && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Upload Replacement / Rectified FDR
              </h3>
              <button
                onClick={() => setRectifyFdr(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Instrument: <b>{rectifyFdr.fdr_number}</b> (
                {rectifyFdr.institution_name})
              </p>
              <div className="p-2.5 bg-red-50 rounded-lg text-red-900 text-[11px]">
                <b>Observation Note:</b> {rectifyFdr.scrutiny_remarks}
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center mt-3">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <span className="font-bold text-xs block text-slate-800">
                  Select Corrected Bank FDR Receipt (PDF)
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setRectifyFile(e.target.files?.[0] || null)}
                  className="mt-2 text-xs"
                />
              </div>

              {rectifySuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200 text-xs font-bold">
                  {rectifySuccess}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRectifyFdr(null)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadRectified}
                disabled={rectifyLoading}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                {rectifyLoading ? "Submitting..." : "Submit Rectified Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDepositsPage;
