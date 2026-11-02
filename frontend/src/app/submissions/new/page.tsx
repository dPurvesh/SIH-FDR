"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Building,
  Landmark,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  ShieldCheck,
  Eye,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function NewSubmissionPage() {
  const router = useRouter();
  const { dashboardData, refreshDashboard } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [institutionId, setInstitutionId] = useState<number>(1);
  const [category, setCategory] = useState<string>("ENGINEERING_NEW");
  const [fdrNumber, setFdrNumber] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("SBIN0004321");
  const [issuingBank, setIssuingBank] = useState<string>("State Bank of India");
  const [branchEmail, setBranchEmail] = useState<string>("branch.civillines.nagpur@sbi.co.in");
  const [principalAmount, setPrincipalAmount] = useState<number>(3500000);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [issueDate, setIssueDate] = useState<string>("2026-11-01");
  const [maturityDate, setMaturityDate] = useState<string>("2031-11-01");
  const [printedMaturityAmount, setPrintedMaturityAmount] = useState<number>(4948834.78);
  const [accountHolderText, setAccountHolderText] = useState<string>(
    "Visvesvaraya Institute of Technology, Nagpur Jointly with Member Secretary, AICTE"
  );

  // IFSC Lookup State
  const [ifscLookupResult, setIfscLookupResult] = useState<any | null>(null);
  const [ifscLoading, setIfscLoading] = useState<boolean>(false);

  // Upload & Verification State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // Norm amounts
  const categoryNorms: Record<string, { label: string; amount: number }> = {
    ENGINEERING_NEW: {
      label: "Engineering & Technology (New Technical Campus)",
      amount: 3500000,
    },
    PHARMACY: {
      label: "Pharmacy (B.Pharm / M.Pharm)",
      amount: 1500000,
    },
    MBA_MCA: {
      label: "Management / MCA Programs",
      amount: 1500000,
    },
    ARCHITECTURE: {
      label: "Architecture & Town Planning",
      amount: 1500000,
    },
  };

  const selectedNorm = categoryNorms[category] || categoryNorms.ENGINEERING_NEW;

  // Real-time IFSC lookup
  useEffect(() => {
    if (ifscCode.length >= 4) {
      setIfscLoading(true);
      fetch(`/api/banks/ifsc-lookup/${ifscCode}`)
        .then((res) => res.json())
        .then((data) => {
          setIfscLookupResult(data);
          if (data.found && data.bank_name) {
            setIssuingBank(data.bank_name);
          }
        })
        .catch((err) => console.error("IFSC lookup failed:", err))
        .finally(() => setIfscLoading(false));
    }
  }, [ifscCode]);

  // Real-time quarterly compound math calculation
  const calculateCompoundInterest = () => {
    if (!principalAmount || !interestRate || !issueDate || !maturityDate) {
      return principalAmount;
    }
    const d1 = new Date(issueDate);
    const d2 = new Date(maturityDate);
    const days = Math.max(1, (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    const n = days / 365.25;
    const a = principalAmount * Math.pow(1 + interestRate / 400, 4 * n);
    return Math.round(a * 100) / 100;
  };

  const autoCalculatedMaturity = calculateCompoundInterest();

  const handleApplyCalculatedMaturity = () => {
    setPrintedMaturityAmount(autoCalculatedMaturity);
  };

  // Submit FDR
  const handleSubmitFDR = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        // Fetch demo genuine PDF as default file blob if no manual file picked
        const demoRes = await fetch("/api/sample-pdfs/1_SBI_Genuine_FDR.pdf");
        const demoBlob = await demoRes.blob();
        formData.append("file", demoBlob, "Institution_FDR_Receipt.pdf");
      }

      formData.append("institution_id", String(institutionId));
      formData.append("fdr_number", fdrNumber || `FDR-${Date.now().toString().slice(-6)}`);
      formData.append("issuing_bank", issuingBank);
      formData.append("ifsc_code", ifscCode);
      formData.append("branch_email", branchEmail);
      formData.append("principal_amount", String(principalAmount));
      formData.append("interest_rate", String(interestRate));
      formData.append("issue_date", issueDate);
      formData.append("maturity_date", maturityDate);
      formData.append("printed_maturity_amount", String(printedMaturityAmount));
      formData.append("account_holder_text", accountHolderText);

      const res = await fetch("/api/fdrs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit Fixed Deposit Receipt.");
      }

      setVerificationResult(data);
      await refreshDashboard();
      setStep(4); // Success screen
    } catch (err: any) {
      console.error("Submission failed:", err);
      setUploadError(err.message || "Failed to submit FDR.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-[#1B365D] tracking-tight">
          Statutory Security Deposit Submission Wizard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          AICTE Approval Process Handbook (APH) 2024–27 Clause 6.46 Compliance Gate.
        </p>
      </div>

      {/* 3-Step Wizard Indicator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1
                  ? "bg-[#1B365D] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              1
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Category Norms
              </span>
              <span className="text-[10px] text-slate-400">
                Statutory deposit floor
              </span>
            </div>
          </div>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              step >= 2 ? "bg-[#1B365D]" : "bg-slate-200"
            }`}
          />

          {/* Step 2 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2
                  ? "bg-[#1B365D] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                FDR Instrument & Bank
              </span>
              <span className="text-[10px] text-slate-400">
                RBI Scheduled check & math
              </span>
            </div>
          </div>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              step >= 3 ? "bg-[#1B365D]" : "bg-slate-200"
            }`}
          />

          {/* Step 3 */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 3
                  ? "bg-[#1B365D] text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Document Upload & Seal
              </span>
              <span className="text-[10px] text-slate-400">
                PyMuPDF OCR & submit
              </span>
            </div>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 1: INSTITUTION & APPROVAL CATEGORY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Step 1: Select Institution & Approval Program Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AICTE prescribed security deposit norm will be dynamically calculated
              based on statutory regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Institution Select */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tendering Technical Institution
              </label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value={1}>
                  Visvesvaraya Institute of Technology, Nagpur (AISHE: C-45102)
                </option>
                <option value={2}>
                  Apex College of Pharmacy, Pune (AISHE: C-28901)
                </option>
                <option value={3}>
                  Karanataka Institute of Technology, Bengaluru (AISHE: C-12940)
                </option>
                <option value={4}>
                  Coimbatore Institute of Engineering, Tamil Nadu (AISHE: C-33890)
                </option>
                <option value={5}>
                  NCR Institute of Management & Technology, Ghaziabad (AISHE: C-51002)
                </option>
              </select>
            </div>

            {/* Approval Category */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Approval Program Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  setPrincipalAmount(categoryNorms[newCat].amount);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                {Object.entries(categoryNorms).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Norm Floor Display Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Statutory APH Norm Required
              </span>
              <span className="text-xl font-black text-[#1B365D] font-mono">
                ₹{selectedNorm.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Minimum principal deposit required to be locked in unencumbered fixed
                deposit.
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setStep(2)}
              className="bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs py-2 px-5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <span>Continue to Instrument Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 2: FDR INSTRUMENT & REAL-TIME BANK CHECK */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Step 2: Fixed Deposit Receipt Particulars & Bank Validation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time validation against the Reserve Bank of India (RBI) Scheduled
                Commercial Bank registry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* FDR Number */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                FDR Receipt Number
              </label>
              <input
                type="text"
                placeholder="e.g. SBI-FDR-2026-9901"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            {/* IFSC Code with Live Lookup */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Bank IFSC Code (Prefix checked in real time)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. SBIN0004321 or NNSB0000101"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
                {ifscLoading && (
                  <span className="absolute right-2.5 top-2.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  </span>
                )}
              </div>
            </div>

            {/* Live IFSC Status Banner */}
            {ifscLookupResult && (
              <div
                className={`sm:col-span-2 p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                  ifscLookupResult.eligible_for_aicte
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900 animate-pulse"
                }`}
              >
                {ifscLookupResult.eligible_for_aicte ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {ifscLookupResult.bank_name} (IFSC: {ifscLookupResult.ifsc})
                  </span>
                  <span className="text-[11px] block mt-0.5">
                    {ifscLookupResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Principal Amount */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Principal Amount (INR)
              </label>
              <input
                type="number"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
              {principalAmount < selectedNorm.amount && (
                <span className="text-[10px] text-red-600 font-bold block mt-1">
                  ⚠ Shortfall of ₹
                  {(selectedNorm.amount - principalAmount).toLocaleString("en-IN")}{" "}
                  from APH prescribed norm!
                </span>
              )}
            </div>

            {/* Interest Rate */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Date of Issue
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            {/* Maturity Date */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Date of Maturity
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            {/* Printed Maturity Amount with Quarterly Compounding Helper */}
            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="font-bold text-slate-700">
                  Printed Maturity Amount on Bank Receipt (INR)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    APH Formula: A = P(1+r/400)^(4n) = ₹
                    {autoCalculatedMaturity.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyCalculatedMaturity}
                    className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 hover:bg-blue-200 text-[10px] font-bold"
                  >
                    Use Calculated
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.01"
                value={printedMaturityAmount}
                onChange={(e) => setPrintedMaturityAmount(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            {/* Mandatory Account Holder Text */}
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Account Holder & Lien Endorsement Text (Must explicitly include AICTE)
              </label>
              <textarea
                rows={2}
                value={accountHolderText}
                onChange={(e) => setAccountHolderText(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-medium text-xs"
              />
              {!accountHolderText.toLowerCase().includes("aicte") && (
                <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                  ⚠ Error: Instrument must explicitly state "Jointly with Member
                  Secretary, AICTE" under APH Clause 6.46!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="text-slate-600 hover:text-slate-900 font-bold text-xs py-2 px-3 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setStep(3)}
              className="bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs py-2 px-5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <span>Continue to Document Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 3: DIGITAL DOCUMENT UPLOAD & VERIFY */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Step 3: Digital Document Upload & WORM Cryptographic Seal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload the official PDF Fixed Deposit Receipt issued by the bank.
              PyMuPDF will automatically extract visual bounding boxes and compute
              the SHA-256 digest.
            </p>
          </div>

          {/* Drag & Drop File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-[#1B365D] rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">
              Drag & Drop Bank FDR Receipt (PDF Format)
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">
              Scanned or digital PDF receipt issued by the branch manager.
            </p>

            <input
              type="file"
              accept=".pdf"
              id="file-upload"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              <span>Browse Computer</span>
            </label>

            {selectedFile && (
              <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Pre-submission Summary Review */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pre-Submission Verification Summary:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block">FDR Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {fdrNumber || "Auto-assigned"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Issuing Bank:</span>
                <span className="font-bold text-slate-800">{issuingBank}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Principal:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹{principalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Maturity Date:</span>
                <span className="font-mono font-bold text-slate-800">
                  {maturityDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Expected Maturity:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{printedMaturityAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">AICTE Lien:</span>
                <span className="font-bold text-emerald-700">
                  {accountHolderText.toLowerCase().includes("aicte") ? "✔ Yes" : "❌ No"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="text-slate-600 hover:text-slate-900 font-bold text-xs py-2 px-3 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleSubmitFDR}
              disabled={uploading}
              className="bg-[#128937] hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-lg flex items-center space-x-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sealing & Running 5-Point Check...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Sign & Submit FDR to AICTE</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STEP 4: SUCCESS CONFIRMATION & AUDIT RECEIPT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {step === 4 && verificationResult && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
              Registration Successful
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              FDR Submitted & Verified by AICTE 5-Point Engine
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Instrument has been locked in WORM storage, SHA-256 hashed into the
              forensic ledger, and elevated on the Trust Ladder.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">FDR Reference:</span>
              <span className="font-mono font-bold text-slate-900">
                {verificationResult.fdr_number}
              </span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="text-slate-500">Trust Stage:</span>
              <span className="font-bold text-blue-900">
                {verificationResult.trust_status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">SHA-256 Digest:</span>
              <span className="font-mono text-[10px] text-slate-600 truncate max-w-[200px]">
                {verificationResult.file_sha256}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-3">
            <Link
              href={`/scrutiny/${verificationResult.fdr_id}`}
              className="bg-[#1B365D] hover:bg-blue-900 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-xs flex items-center space-x-1.5"
            >
              <span>Open Scrutiny Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/my-deposits"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg"
            >
              View My Deposits
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
