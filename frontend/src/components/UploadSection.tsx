"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Ban,
  FileDown,
  Sparkles,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { VerificationResult } from "@/types";

interface UploadSectionProps {
  onVerificationComplete: (result: VerificationResult) => void;
  onRefreshDashboard: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onVerificationComplete,
  onRefreshDashboard,
}) => {
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [customUploading, setCustomUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quick 1-click test runner
  const handleTestSample = async (filename: string) => {
    setLoadingSample(filename);
    setUploadError(null);
    try {
      const res = await fetch(`/api/fdrs/test-sample/${filename}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data: VerificationResult = await res.json();
      onRefreshDashboard();
      onVerificationComplete(data);
    } catch (err: any) {
      console.error("Test sample failed", err);
      setUploadError(`Failed to run test on ${filename}: ${err.message}`);
    } finally {
      setLoadingSample(null);
    }
  };

  // Drag & drop file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF Fixed Deposit Receipts are accepted.");
      return;
    }

    setCustomUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    // Default form fields if uploading directly
    formData.append("fdr_number", `UPLOAD-${Date.now().toString().slice(-6)}`);
    formData.append("issuing_bank", "State Bank of India");
    formData.append("ifsc_code", "SBIN0004321");
    formData.append("branch_email", "branch@sbi.co.in");
    formData.append(
      "account_holder_text",
      "Visvesvaraya Institute of Technology, Nagpur Jointly with Member Secretary, AICTE"
    );
    formData.append("principal_amount", "3500000");
    formData.append("interest_rate", "7.0");
    formData.append("issue_date", "2026-11-01");
    formData.append("maturity_date", "2027-01-15");
    formData.append("printed_maturity_amount", "3550229.91");
    formData.append("institution_id", "1");

    try {
      const res = await fetch("/api/fdrs/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data: VerificationResult = await res.json();
      onRefreshDashboard();
      onVerificationComplete(data);
    } catch (err: any) {
      console.error("Custom upload failed", err);
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setCustomUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            5-Point AICTE Verification Engine & Interactive Sandbox
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Click any sample below to test AICTE rules in real time</span>
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 3 Quick Action Sample Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sample 1: SBI Genuine */}
        <div className="bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Sample 1 • Genuine
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                ₹35,00,000
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>State Bank of India</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              100% genuine instrument. AICTE lien valid, quarterly interest math
              matches exactly, matures in 75 days.
            </p>
          </div>
          <div className="pt-2 border-t border-emerald-100 flex items-center space-x-2">
            <button
              onClick={() => handleTestSample("1_SBI_Genuine_FDR.pdf")}
              disabled={loadingSample !== null}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              {loadingSample === "1_SBI_Genuine_FDR.pdf" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify Genuine FDR</span>
                </>
              )}
            </button>
            <a
              href="/api/sample-pdfs/1_SBI_Genuine_FDR.pdf"
              download
              title="Download Sample 1 PDF"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Sample 2: PNB Tampered Math */}
        <div className="bg-gradient-to-b from-red-50/50 to-white border border-red-200 rounded-xl p-4 flex flex-col justify-between hover:border-red-400 hover:shadow-md transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800">
                Sample 2 • Doctored Math
              </span>
              <span className="text-xs font-mono font-bold text-red-600">
                +₹5.48L Tampered
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Punjab National Bank</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Maturity doctored to ₹26.50L (calc: ₹21.01L). Triggers{" "}
              <span className="font-semibold text-red-700">
                MATH_TAMPER_SUSPECTED
              </span>{" "}
              with pulsing red bounding box.
            </p>
          </div>
          <div className="pt-2 border-t border-red-100 flex items-center space-x-2">
            <button
              onClick={() => handleTestSample("2_PNB_Tampered_Math_FDR.pdf")}
              disabled={loadingSample !== null}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              {loadingSample === "2_PNB_Tampered_Math_FDR.pdf" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Catching Tamper...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Catch Doctored Math</span>
                </>
              )}
            </button>
            <a
              href="/api/sample-pdfs/2_PNB_Tampered_Math_FDR.pdf"
              download
              title="Download Sample 2 PDF"
              className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Sample 3: Co-op Bank Invalid */}
        <div className="bg-gradient-to-b from-amber-50/50 to-white border border-amber-200 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Sample 3 • Prohibited Bank
              </span>
              <span className="text-xs font-mono font-bold text-amber-800">
                2 Violations
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center space-x-1.5">
              <Ban className="w-4 h-4 text-amber-600" />
              <span>Nagpur Nagrik Sahakari</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Co-operative Bank disallowed under AICTE APH + missing AICTE joint
              lien. Triggers dual red alerts.
            </p>
          </div>
          <div className="pt-2 border-t border-amber-100 flex items-center space-x-2">
            <button
              onClick={() => handleTestSample("3_CoopBank_Invalid_FDR.pdf")}
              disabled={loadingSample !== null}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              {loadingSample === "3_CoopBank_Invalid_FDR.pdf" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Bank...</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  <span>Detect Coop Bank</span>
                </>
              )}
            </button>
            <a
              href="/api/sample-pdfs/3_CoopBank_Invalid_FDR.pdf"
              download
              title="Download Sample 3 PDF"
              className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Drag & Drop File Upload Bar */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">
              Upload Custom Fixed Deposit Receipt (PDF)
            </h5>
            <p className="text-[11px] text-slate-500">
              Drag and drop any bank FDR receipt or select from disk to run
              instant 5-Point AICTE scrutiny.
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-[#0D3B66] hover:bg-blue-900 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 shrink-0 transition-colors">
          {customUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Processing OCR & Math...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Browse FDR PDF</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={customUploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

