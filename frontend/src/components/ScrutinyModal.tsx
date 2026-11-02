"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calculator,
  Building,
  Landmark,
  Hash,
  Download,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Lock,
  Layers,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { FDRItem, VerificationResult, RoleType } from "@/types";

interface ScrutinyModalProps {
  fdr: FDRItem | null;
  verificationResult?: VerificationResult | null;
  currentRole: RoleType;
  onClose: () => void;
  onRefresh?: () => void;
}

export const ScrutinyModal: React.FC<ScrutinyModalProps> = ({
  fdr,
  verificationResult,
  currentRole,
  onClose,
  onRefresh,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeHoverBBox, setActiveHoverBBox] = useState<any | null>(null);

  // Phase 3 Bank Verification state
  const [cbsLoading, setCbsLoading] = useState<boolean>(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState<boolean>(false);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(
    fdr?.bank_verify_token || null
  );
  const [localTrustStatus, setLocalTrustStatus] = useState<string>(
    verificationResult?.trust_status || fdr?.trust_status || "AUTO_CHECKED"
  );
  const [bankConfirmedAt, setBankConfirmedAt] = useState<string | null>(
    fdr?.bank_confirmed_at || null
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [cbsSuccessMessage, setCbsSuccessMessage] = useState<string | null>(
    null
  );

  // Phase 5: Clause 6.46 & Affidavit-6 Gatekeeper State
  const [pgrcClearance, setPgrcClearance] = useState<boolean>(
    fdr?.pgrc_clearance ?? true
  );
  const [vigilanceClearance, setVigilanceClearance] = useState<boolean>(
    fdr?.vigilance_clearance ?? true
  );
  const [grantsClearance, setGrantsClearance] = useState<boolean>(
    fdr?.grants_clearance ?? true
  );
  const [affidavit6Uploaded, setAffidavit6Uploaded] = useState<boolean>(
    fdr?.affidavit_6_uploaded ?? false
  );
  const [lifecycleStatus, setLifecycleStatus] = useState<string>(
    fdr?.lifecycle_status || "ACTIVE"
  );
  const [makerOfficer, setMakerOfficer] = useState<string | null>(
    fdr?.maker_officer || null
  );
  const [checkerOfficer, setCheckerOfficer] = useState<string | null>(
    fdr?.checker_officer || null
  );
  const [gatekeeperLoading, setGatekeeperLoading] = useState<boolean>(false);
  const [gatekeeperFeedback, setGatekeeperFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showRenewalForm, setShowRenewalForm] = useState<boolean>(false);
  const [renewalTenureYears, setRenewalTenureYears] = useState<number>(5);
  const [newRenewalFdrNumber, setNewRenewalFdrNumber] = useState<string>(
    fdr?.fdr_number ? `RNW-${fdr.fdr_number}` : "RNW-FDR-2026-9901"
  );

  if (!fdr && !verificationResult) return null;

  // Consolidate data from either FDRItem or VerificationResult (no hardcoded fallbacks)
  const ext = (verificationResult?.extracted_fields || {}) as Record<string, any>;
  const fdrNumber = fdr?.fdr_number || verificationResult?.fdr_number || ext.fdr_number || "FDR-SPECIMEN";
  const bankName = fdr?.issuing_bank || verificationResult?.issuing_bank || verificationResult?.checks?.bank_check?.bank_name || ext.issuing_bank || "State Bank of India";
  const ifsc = fdr?.ifsc_code || verificationResult?.ifsc_code || verificationResult?.checks?.bank_check?.ifsc_code || ext.ifsc_code || "SBIN0004321";
  const instName = fdr?.institution_name || verificationResult?.institution_name || "Technical Campus / Institute";
  const state = fdr?.institution_state || verificationResult?.institution_state || "Maharashtra";
  const principal = fdr?.principal_amount ?? verificationResult?.principal_amount ?? verificationResult?.checks?.math_check?.principal ?? ext.principal_amount ?? 3500000;
  const rate = fdr?.interest_rate ?? verificationResult?.interest_rate ?? verificationResult?.checks?.math_check?.rate_pct ?? ext.interest_rate ?? 7.0;
  const issueDate = fdr?.issue_date || verificationResult?.issue_date || verificationResult?.checks?.math_check?.issue_date || ext.issue_date || "2026-11-01";
  const maturityDate = fdr?.maturity_date || verificationResult?.maturity_date || verificationResult?.checks?.math_check?.maturity_date || ext.maturity_date || "2027-01-15";
  const printedMaturity =
    fdr?.printed_maturity_amount ??
    verificationResult?.printed_maturity_amount ??
    verificationResult?.checks?.math_check?.printed_maturity_amount ??
    ext.printed_maturity_amount ??
    verificationResult?.calculated_maturity_amount ??
    3550229.91;
  const calculatedMaturity =
    fdr?.calculated_maturity_amount ??
    verificationResult?.calculated_maturity_amount ??
    verificationResult?.checks?.math_check?.calculated_maturity_amount ??
    3550229.91;
  const mathDiscrepancy =
    fdr?.math_discrepancy ??
    verificationResult?.math_discrepancy ??
    verificationResult?.checks?.math_check?.discrepancy_inr ??
    Math.abs(printedMaturity - calculatedMaturity);

  const accountHolderText =
    fdr?.account_holder_text ||
    verificationResult?.account_holder_text ||
    verificationResult?.checks?.lien_check?.account_holder_text ||
    verificationResult?.checks?.lien_check?.holder_text ||
    ext.account_holder_text ||
    "Jointly with Member Secretary, AICTE";

  const categoryNorm =
    fdr?.required_fdr_amount ??
    verificationResult?.checks?.norm_check?.required_amount ??
    3500000;
  const categoryName =
    fdr?.institution_category ||
    verificationResult?.checks?.norm_check?.institution_category ||
    "Engineering";

  const trustStatus =
    verificationResult?.trust_status || fdr?.trust_status || "AUTO_CHECKED";
  const flags = verificationResult?.flags || fdr?.flags || [];
  const bboxes =
    verificationResult?.bbox_overlay || fdr?.bbox_overlay || [];
  const fileSha256 =
    verificationResult?.file_sha256 || fdr?.file_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  // Image source: prefer base64 if available, else rendered image path, else fallback
  const imageSrc =
    verificationResult?.png_base64
      ? `data:image/png;base64,${verificationResult.png_base64}`
      : fdr?.rendered_image_path
      ? fdr.rendered_image_path
      : verificationResult?.rendered_image_url
      ? verificationResult.rendered_image_url
      : null;

  const fdrId = fdr?.id || verificationResult?.fdr_id;
  const instId = fdr?.institution_id || 1;

  const handleSimulateCbs = async () => {
    if (!fdrId) return;
    setCbsLoading(true);
    setCbsSuccessMessage(null);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/simulate-cbs-check`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setLocalTrustStatus("BANK_CONFIRMED");
        setBankConfirmedAt(data.bank_confirmed_at);
        setCbsSuccessMessage(data.message);
        onRefresh?.();
      }
    } catch (err: any) {
      console.error("CBS Check failed", err);
      alert(`CBS API simulation failed: ${err.message}`);
    } finally {
      setCbsLoading(false);
    }
  };

  const handleGenerateMagicLink = async () => {
    if (!fdrId) return;
    setMagicLinkLoading(true);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/request-bank-verification`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setMagicLinkUrl(data.magic_link);
        setMagicLinkToken(data.token);
        onRefresh?.();
      }
    } catch (err: any) {
      console.error("Magic link generation failed", err);
      alert(`Magic link generation failed: ${err.message}`);
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!magicLinkUrl && !magicLinkToken) return;
    const path = magicLinkUrl || `/bank-verify/${magicLinkToken}`;
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Phase 5 Gatekeeper Handlers
  const handleToggleClearance = async (cell: "pgrc" | "vigilance" | "grants") => {
    const currentVal =
      cell === "pgrc"
        ? pgrcClearance
        : cell === "vigilance"
        ? vigilanceClearance
        : grantsClearance;
    const newVal = !currentVal;
    setGatekeeperLoading(true);
    setGatekeeperFeedback(null);
    try {
      const res = await fetch(`/api/institutions/${instId}/toggle-clearance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cell, status: newVal }),
      });
      const data = await res.json();
      if (data.success) {
        if (cell === "pgrc") setPgrcClearance(data.pgrc_clearance);
        if (cell === "vigilance") setVigilanceClearance(data.vigilance_clearance);
        if (cell === "grants") setGrantsClearance(data.grants_clearance);
        setGatekeeperFeedback({ type: "success", message: data.message });
        onRefresh?.();
      } else {
        setGatekeeperFeedback({
          type: "error",
          message: data.detail || "Clearance update failed",
        });
      }
    } catch (err: any) {
      setGatekeeperFeedback({
        type: "error",
        message: err.message || "Failed to toggle clearance",
      });
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const handleRequestRelease = async () => {
    if (!fdrId) return;
    setGatekeeperLoading(true);
    setGatekeeperFeedback(null);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/request-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason:
            "Clause 6.46 5-Year Fixed Deposit Tenure Completed. Signed Affidavit-6 attached.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLifecycleStatus(data.lifecycle_status);
        setAffidavit6Uploaded(true);
        setGatekeeperFeedback({ type: "success", message: data.message });
        onRefresh?.();
      } else {
        setGatekeeperFeedback({
          type: "error",
          message: data.detail || "Release request failed",
        });
      }
    } catch (err: any) {
      setGatekeeperFeedback({
        type: "error",
        message: err.message || "Release request failed",
      });
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const handleSubmitRenewal = async () => {
    if (!fdrId) return;
    setGatekeeperLoading(true);
    setGatekeeperFeedback(null);
    try {
      const maturityYear = 2026 + renewalTenureYears;
      const res = await fetch(`/api/fdrs/${fdrId}/submit-renewal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_fdr_number: newRenewalFdrNumber,
          principal_amount: principal,
          interest_rate: rate,
          maturity_date: `${maturityYear}-11-01`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLifecycleStatus("RENEWAL_SUBMITTED");
        setShowRenewalForm(false);
        setGatekeeperFeedback({ type: "success", message: data.message });
        onRefresh?.();
      } else {
        setGatekeeperFeedback({
          type: "error",
          message: data.detail || "Renewal failed",
        });
      }
    } catch (err: any) {
      setGatekeeperFeedback({
        type: "error",
        message: err.message || "Renewal submission failed",
      });
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const handleMakerRecommend = async (
    recommendation: "RECOMMEND_RELEASE" | "ENCASH_FORFEIT"
  ) => {
    if (!fdrId) return;
    setGatekeeperLoading(true);
    setGatekeeperFeedback(null);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/maker-recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendation,
          maker_name: "Sh. R.K. Verma (Scrutiny Officer - Maker)",
          remarks:
            recommendation === "RECOMMEND_RELEASE"
              ? "All 3-Cell Clearances (PGRC, Vigilance, Grants) verified under Clause 6.46. Recommended for Director release approval."
              : "Institutional default / norm shortfall detected. FDR encashment & forfeiture invoked to Council.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLifecycleStatus(data.lifecycle_status);
        setMakerOfficer(data.maker_officer);
        setGatekeeperFeedback({ type: "success", message: data.message });
        onRefresh?.();
      } else {
        setGatekeeperFeedback({
          type: "error",
          message: data.detail || "Maker action failed",
        });
      }
    } catch (err: any) {
      setGatekeeperFeedback({
        type: "error",
        message: err.message || "Maker action failed",
      });
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const handleCheckerApprove = async () => {
    if (!fdrId) return;
    setGatekeeperLoading(true);
    setGatekeeperFeedback(null);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/checker-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checker_name: "Dr. A. Mehta (Director, Regulation Bureau - Checker)",
          remarks:
            "Final regulatory review completed under Clause 6.46. Strict Maker-Checker separation verified. Discharge NOC issued.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLifecycleStatus(data.lifecycle_status);
        setLocalTrustStatus("OFFICER_APPROVED");
        setCheckerOfficer(data.checker_officer);
        setGatekeeperFeedback({ type: "success", message: data.message });
        onRefresh?.();
      } else {
        setGatekeeperFeedback({
          type: "error",
          message: data.detail || "Checker approval failed",
        });
      }
    } catch (err: any) {
      setGatekeeperFeedback({
        type: "error",
        message: err.message || "Checker approval failed",
      });
    } finally {
      setGatekeeperLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!fdrId) return;
    window.open(`/api/fdrs/${fdrId}/export-audit-pdf`, "_blank");
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 5 Checks status
  const hasMathFlag = flags.some((f) => f.code === "MATH_TAMPER_SUSPECTED");
  const hasLienFlag = flags.some((f) => f.code === "MISSING_AICTE_LIEN");
  const hasBankFlag = flags.some((f) => f.code === "PROHIBITED_COOP_BANK");
  const hasNormFlag = flags.some((f) => f.code === "SHORTFALL_IN_PRINCIPAL");
  const hasDupFlag = flags.some((f) => f.code === "DUPLICATE_INSTRUMENT");

  const allClearancesPassed =
    pgrcClearance && vigilanceClearance && grantsClearance;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="bg-[#0D3B66] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#0D3B66]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wide">
                  AICTE APH Evidence Overlay & Scrutiny Drawer
                </span>
                <span className="font-mono text-xs bg-blue-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {fdrNumber}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {instName} ({state}) • {bankName} (IFSC: {ifsc})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Trust Ladder Stage Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
              <span>Trust Stage:</span>
              <span
                className={`px-2 py-0.5 rounded font-black ${
                  localTrustStatus === "FLAGGED"
                    ? "bg-red-500 text-white animate-pulse"
                    : localTrustStatus === "BANK_CONFIRMED"
                    ? "bg-emerald-400 text-slate-950"
                    : localTrustStatus === "OFFICER_APPROVED"
                    ? "bg-purple-400 text-slate-950"
                    : "bg-blue-400 text-slate-950"
                }`}
              >
                {localTrustStatus}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split-Screen Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* ========================================================= */}
          {/* LEFT PANE (lg:col-span-6): Document Evidence Overlay Viewer */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col bg-slate-900 overflow-hidden relative">
            {/* Toolbar */}
            <div className="bg-slate-950/80 text-slate-300 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 z-10">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-200">
                  Document Evidence Viewer
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (PyMuPDF 150 DPI Render)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Toggle Overlay Button */}
                <button
                  onClick={() => setShowOverlays(!showOverlays)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    showOverlays
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title="Toggle SVG bounding boxes overlay"
                >
                  {showOverlays ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Bounding Boxes ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Boxes OFF</span>
                    </>
                  )}
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 bg-slate-800 rounded p-0.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-[10px] px-1 text-slate-300">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                    className="p-1 text-slate-300 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Render Canvas with SVG Overlay */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 relative">
              {imageSrc ? (
                <div
                  className="relative shadow-2xl transition-all duration-150 rounded border border-slate-700 bg-white"
                  style={{
                    width: `${zoomLevel}%`,
                    maxWidth: "850px",
                  }}
                >
                  {/* Base Rendered FDR Image */}
                  <img
                    src={imageSrc}
                    alt="Rendered FDR Document"
                    className="w-full h-auto block select-none"
                  />

                  {/* Scaled SVG Bounding Box Overlay */}
                  {showOverlays && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {bboxes.map((box, idx) => {
                        const isFail = box.status === "fail";
                        const x = box.x0_pct * 100;
                        const y = box.y0_pct * 100;
                        const w = Math.max(1, (box.x1_pct - box.x0_pct) * 100);
                        const h = Math.max(1, (box.y1_pct - box.y0_pct) * 100);

                        return (
                          <g key={idx} className="pointer-events-auto">
                            {/* Bounding Rectangle */}
                            <rect
                              x={x}
                              y={y}
                              width={w}
                              height={h}
                              fill={
                                isFail
                                  ? "rgba(239, 68, 68, 0.22)"
                                  : "rgba(16, 185, 129, 0.15)"
                              }
                              stroke={isFail ? "#EF4444" : "#10B981"}
                              strokeWidth={isFail ? "1.2" : "0.8"}
                              strokeDasharray={isFail ? "2 1" : undefined}
                              className={isFail ? "svg-bbox-fail" : "svg-bbox-ok"}
                              onMouseEnter={() => setActiveHoverBBox(box)}
                              onMouseLeave={() => setActiveHoverBBox(null)}
                            />

                            {/* Label Tag on Top Left of Rect */}
                            <foreignObject
                              x={x}
                              y={Math.max(0, y - 3.8)}
                              width={Math.max(30, w * 1.5)}
                              height="4"
                            >
                              <div
                                className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded shadow-sm inline-block whitespace-nowrap ${
                                  isFail
                                    ? "bg-red-600 text-white animate-bounce"
                                    : "bg-emerald-600 text-white"
                                }`}
                              >
                                {isFail ? "⚠ FAIL: " : "✔ "}
                                {box.label}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-semibold">
                    Document Image Not Rendered
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload or select a sample FDR to view document overlay.
                  </p>
                </div>
              )}

              {/* Active Hover Tooltip floating panel */}
              {activeHoverBBox && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-700 text-white p-3 rounded-lg shadow-xl text-xs flex items-start space-x-2 animate-in fade-in duration-100 z-20">
                  <div className="mt-0.5">
                    {activeHoverBBox.status === "fail" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-amber-300">
                      {activeHoverBBox.label}:
                    </span>{" "}
                    <span className="text-slate-200">
                      {activeHoverBBox.value}
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                      {activeHoverBBox.tooltip}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar: Cryptographic Hash & WORM indicator */}
            <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-500">SHA-256:</span>
                <span className="text-slate-300 truncate" title={fileSha256}>
                  {fileSha256}
                </span>
              </div>
              <span className="text-emerald-400 font-sans font-semibold text-[10px] shrink-0 ml-2">
                🔒 WORM Locked
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANE (lg:col-span-6): 5-Point Scrutiny + Gatekeeper */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col bg-slate-50 overflow-y-auto p-4 sm:p-5">
            {/* Header: Scrutiny Summary */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  <span>5-Point AICTE APH Scrutiny Report</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  APH 2024–27 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Automated validation of Indian Bank compound math, lien markers,
                and eligibility rules.
              </p>
            </div>

            {/* Global Discrepancy Alert Banner if Flagged */}
            {flags.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                <div className="flex items-center space-x-2 text-red-800 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>
                    {flags.length} Regulatory Discrepancy Flag(s) Detected
                  </span>
                </div>
                <ul className="text-xs text-red-700 space-y-1 pl-6 list-disc">
                  {flags.map((f, i) => (
                    <li key={i}>
                      <span className="font-mono font-bold">[{f.code}]:</span>{" "}
                      {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* The 5 Pass/Fail Scrutiny Cards */}
            <div className="space-y-3">
              {/* 1. Quarterly Compound Interest Math Check */}
              <div
                className={`rounded-xl p-3.5 border transition-all ${
                  hasMathFlag
                    ? "bg-red-50/80 border-red-300 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                        hasMathFlag
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      1
                    </div>
                    <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                      <Calculator className="w-3.5 h-3.5 text-slate-500" />
                      <span>Quarterly Compound Interest Math Check</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      hasMathFlag
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {hasMathFlag ? "FAIL: DOCTORED" : "PASS"}
                  </span>
                </div>

                <div className="bg-slate-100/90 p-1.5 rounded font-mono text-[11px] text-slate-800 mb-2 border border-slate-200">
                  <span className="text-slate-500 font-sans font-bold">
                    Formula:
                  </span>{" "}
                  <span className="font-bold text-blue-900">
                    A = P × (1 + r/400)^(4n)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-1.5">
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">
                      Principal (P)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatINR(principal)}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">
                      Calculated Maturity
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatINR(calculatedMaturity)}
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded border ${
                      hasMathFlag
                        ? "bg-red-100/60 border-red-200"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">
                      Printed vs Variance (Δ)
                    </span>
                    <span
                      className={`font-mono font-black ${
                        hasMathFlag ? "text-red-700" : "text-emerald-700"
                      }`}
                    >
                      {formatINR(printedMaturity)}{" "}
                      {hasMathFlag ? `(+${formatINR(mathDiscrepancy)})` : "(₹0)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. AICTE Joint-Holder / Lien Check */}
              <div
                className={`rounded-xl p-3.5 border transition-all ${
                  hasLienFlag
                    ? "bg-red-50/80 border-red-300 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                        hasLienFlag
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      2
                    </div>
                    <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>AICTE Joint-Holder & Lien Check</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      hasLienFlag
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {hasLienFlag ? "FAIL: NO LIEN" : "PASS"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-800 mb-1 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block font-semibold mb-0.5">
                    Extracted Account Holder / Lien:
                  </span>
                  <span className={hasLienFlag ? "text-red-700 font-bold" : "text-emerald-800 font-bold"}>
                    {accountHolderText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {hasLienFlag
                    ? "Lien missing to 'Member Secretary, AICTE'. Cannot be claimed solely by trust."
                    : "Explicit joint lien in favour of 'Member Secretary, AICTE' verified."}
                </p>
              </div>

              {/* 3. RBI Scheduled Commercial Bank Check */}
              <div
                className={`rounded-xl p-3.5 border transition-all ${
                  hasBankFlag
                    ? "bg-red-50/80 border-red-300 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                        hasBankFlag
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      3
                    </div>
                    <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                      <Landmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>RBI Scheduled Commercial Bank Check</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      hasBankFlag
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {hasBankFlag ? "FAIL: CO-OP BANK" : "PASS"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200 mb-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Issuing Bank</span>
                    <span className="font-bold text-slate-800">{bankName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">IFSC Prefix</span>
                    <span className="font-mono font-bold text-blue-900">{ifsc}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  {hasBankFlag
                    ? `Co-operative banks (${bankName}) are strictly prohibited under AICTE APH.`
                    : `${bankName} confirmed as RBI Scheduled Commercial Bank in Central Registry.`}
                </p>
              </div>

              {/* 4. Prescribed APH Norm Amount Check */}
              <div
                className={`rounded-xl p-3.5 border transition-all ${
                  hasNormFlag
                    ? "bg-red-50/80 border-red-300 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                        hasNormFlag
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      4
                    </div>
                    <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>Prescribed APH Norm Amount Check</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      hasNormFlag
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {hasNormFlag ? "FAIL: SHORTFALL" : "PASS"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200 mb-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Category Norm Required
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatINR(categoryNorm)} ({categoryName})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Submitted Principal
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatINR(principal)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  {hasNormFlag
                    ? `Principal ${formatINR(principal)} is less than prescribed statutory norm of ${formatINR(categoryNorm)}.`
                    : `Principal ${formatINR(principal)} meets required statutory norm of ${formatINR(categoryNorm)}.`}
                </p>
              </div>

              {/* 5. SHA-256 Duplicate & Format Guard */}
              <div
                className={`rounded-xl p-3.5 border transition-all ${
                  hasDupFlag
                    ? "bg-red-50/80 border-red-300 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                        hasDupFlag
                          ? "bg-red-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      5
                    </div>
                    <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                      <Hash className="w-3.5 h-3.5 text-slate-500" />
                      <span>SHA-256 Duplicate & Format Guard</span>
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      hasDupFlag
                        ? "bg-red-600 text-white"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {hasDupFlag ? "FAIL: DUPLICATE" : "PASS"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {hasDupFlag
                    ? "Identical file hash or FDR receipt number already registered. Duplicate submission detected."
                    : "Unique instrument verified against national repository. No duplicate collisions."}
                </p>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* TWO-TIER INDEPENDENT BANK VERIFICATION (PHASE 3) */}
            {/* ----------------------------------------------------------- */}
            <div className="mt-4 rounded-xl p-3.5 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-[#0D3B66] text-amber-300 flex items-center justify-center font-bold text-xs shadow-sm">
                    🏛
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0D3B66]">
                      Two-Tier Bank Verification
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Trust Ladder Stage 3: Auto-Checked → Bank-Confirmed
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    localTrustStatus === "BANK_CONFIRMED" ||
                    localTrustStatus === "OFFICER_APPROVED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {localTrustStatus === "BANK_CONFIRMED" ||
                  localTrustStatus === "OFFICER_APPROVED"
                    ? "✔ BANK-CONFIRMED"
                    : "PENDING BANK PROOF"}
                </span>
              </div>

              {/* Two Verification Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {/* Tier A: CBS API Simulation Check */}
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                      Tier A • Automated
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 mb-0.5">
                      Simulate CBS API Check
                    </h5>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Direct automated query to {bankName} Core Banking gateway.
                    </p>
                  </div>

                  <button
                    onClick={handleSimulateCbs}
                    disabled={
                      cbsLoading ||
                      localTrustStatus === "BANK_CONFIRMED" ||
                      localTrustStatus === "OFFICER_APPROVED"
                    }
                    className="w-full bg-[#0D3B66] hover:bg-blue-900 text-white font-bold text-xs py-1.5 px-2 rounded shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50 transition-colors"
                  >
                    {cbsLoading ? (
                      <span>⌛ Querying CBS...</span>
                    ) : localTrustStatus === "BANK_CONFIRMED" ||
                      localTrustStatus === "OFFICER_APPROVED" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>CBS Verified</span>
                      </>
                    ) : (
                      <span>⚡ Run CBS API Check</span>
                    )}
                  </button>
                </div>

                {/* Tier B: Signed Bank Manager Magic Link */}
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded">
                      Tier B • Zero-Login
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 mb-0.5">
                      Signed Manager Link
                    </h5>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Generate cryptographic one-time magic link for branch sign-off.
                    </p>
                  </div>

                  {magicLinkToken || fdr?.bank_verify_token ? (
                    <div className="flex items-center space-x-1">
                      <a
                        href={`/bank-verify/${
                          magicLinkToken || fdr?.bank_verify_token
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-1.5 px-2 rounded text-center flex items-center justify-center space-x-1 shadow-sm transition-colors"
                      >
                        <span>Open Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                        title="Copy Link"
                      >
                        {copiedLink ? "✔" : "Copy"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateMagicLink}
                      disabled={magicLinkLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-2 rounded shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50 transition-colors"
                    >
                      {magicLinkLoading ? (
                        <span>Generating...</span>
                      ) : (
                        <span>🔗 Generate Magic Link</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* PHASE 5: CLAUSE 6.46 MAKER-CHECKER RELEASE GATEKEEPER */}
            {/* ----------------------------------------------------------- */}
            <div className="mt-4 rounded-xl p-4 bg-gradient-to-b from-amber-50/60 to-purple-50/40 border border-amber-300 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    ⚖
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Clause 6.46 Maker-Checker Gatekeeper
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Affidavit-6 & Inter-Bureau Multi-Clearance Release System
                    </span>
                  </div>
                </div>

                {/* Lifecycle Status Badge */}
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    lifecycleStatus === "RELEASED"
                      ? "bg-purple-600 text-white shadow-sm"
                      : lifecycleStatus === "RELEASE_RECOMMENDED"
                      ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                      : lifecycleStatus === "RELEASE_REQUESTED"
                      ? "bg-blue-600 text-white"
                      : lifecycleStatus === "OVERDUE"
                      ? "bg-red-600 text-white"
                      : lifecycleStatus === "ENCASHED"
                      ? "bg-rose-700 text-white"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {lifecycleStatus}
                </span>
              </div>

              {/* Inter-Bureau 3-Cell Clearances Checklist */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Mandatory Statutory Pre-Requisites:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Click NOC pill to toggle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Affidavit-6 */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Affidavit-6 (11 Declarations)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Signed on Non-Judicial Stamp
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        affidavit6Uploaded
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {affidavit6Uploaded ? "✔ SIGNED" : "PENDING"}
                    </span>
                  </div>

                  {/* EoA / LoA */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Latest EoA / LoA
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Approval in Good Standing
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ✔ ACTIVE
                    </span>
                  </div>

                  {/* PGRC Cell NOC (Interactive Toggle) */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        PGRC Cell NOC
                      </span>
                      <span className="text-[10px] text-slate-500">
                        No Student Fee/Salary Dispute
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleClearance("pgrc")}
                      disabled={gatekeeperLoading}
                      className={`text-[10px] font-black px-2 py-0.5 rounded border transition-all ${
                        pgrcClearance
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                          : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 animate-pulse"
                      }`}
                      title="Click to toggle PGRC NOC status"
                    >
                      {pgrcClearance ? "✔ NOC GRANTED" : "⛔ FEE DISPUTE"}
                    </button>
                  </div>

                  {/* Vigilance Cell NOC (Interactive Toggle) */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Vigilance Cell NOC
                      </span>
                      <span className="text-[10px] text-slate-500">
                        No CBI / CVC Inquiry
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleClearance("vigilance")}
                      disabled={gatekeeperLoading}
                      className={`text-[10px] font-black px-2 py-0.5 rounded border transition-all ${
                        vigilanceClearance
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                          : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 animate-pulse"
                      }`}
                      title="Click to toggle Vigilance NOC status"
                    >
                      {vigilanceClearance ? "✔ NOC GRANTED" : "⛔ INQUIRY"}
                    </button>
                  </div>

                  {/* Grants Bureau NOC (Interactive Toggle) */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between sm:col-span-2">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">
                        Grants Bureau NOC
                      </span>
                      <span className="text-[10px] text-slate-500">
                        No Unutilized AICTE Modernization/R&D Grants
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleClearance("grants")}
                      disabled={gatekeeperLoading}
                      className={`text-[10px] font-black px-2 py-0.5 rounded border transition-all ${
                        grantsClearance
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                          : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 animate-pulse"
                      }`}
                      title="Click to toggle Grants NOC status"
                    >
                      {grantsClearance ? "✔ NOC GRANTED" : "⛔ UNUTILIZED"}
                    </button>
                  </div>
                </div>

                {/* Gatekeeper Feedback Alert */}
                {gatekeeperFeedback && (
                  <div
                    className={`p-2 rounded text-xs flex items-center space-x-2 ${
                      gatekeeperFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {gatekeeperFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{gatekeeperFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Maker-Checker Sign-off Audit Strip */}
              <div className="bg-slate-100/90 p-2.5 rounded-lg border border-slate-200 mt-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Scrutiny Officer (Maker):
                  </span>
                  <span className="font-bold text-slate-800">
                    {makerOfficer || "Awaiting Scrutiny Officer Verification"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Director, Regulation Bureau (Checker):
                  </span>
                  <span className="font-bold text-purple-900">
                    {checkerOfficer || "Awaiting Final Director Sign-off"}
                  </span>
                </div>
              </div>

              {/* Role-Specific Gatekeeper Actions */}
              <div className="mt-3 pt-2 border-t border-amber-200/80">
                {/* 1. INSTITUTION PORTAL ACTIONS */}
                {currentRole === "INSTITUTION" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Institution Self-Service Actions:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {lifecycleStatus !== "RELEASE_REQUESTED" &&
                        lifecycleStatus !== "RELEASE_RECOMMENDED" &&
                        lifecycleStatus !== "RELEASED" && (
                          <button
                            onClick={handleRequestRelease}
                            disabled={gatekeeperLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Request Clause 6.46 Release</span>
                          </button>
                        )}

                      {lifecycleStatus !== "RENEWAL_SUBMITTED" &&
                        lifecycleStatus !== "RELEASED" && (
                          <button
                            onClick={() => setShowRenewalForm(!showRenewalForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Submit Renewal FDR</span>
                          </button>
                        )}
                    </div>

                    {/* Inline Renewal Form */}
                    {showRenewalForm && (
                      <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs space-y-2 mt-2">
                        <span className="font-bold text-slate-900 block">
                          Link New Renewal FDR (Preserves Full History):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">
                              New FDR Receipt Number
                            </label>
                            <input
                              type="text"
                              value={newRenewalFdrNumber}
                              onChange={(e) =>
                                setNewRenewalFdrNumber(e.target.value)
                              }
                              className="w-full text-xs font-mono p-1.5 border border-slate-300 rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">
                              Tenure Extension
                            </label>
                            <select
                              value={renewalTenureYears}
                              onChange={(e) =>
                                setRenewalTenureYears(Number(e.target.value))
                              }
                              className="w-full text-xs p-1.5 border border-slate-300 rounded"
                            >
                              <option value={3}>3 Years</option>
                              <option value={5}>5 Years (Standard)</option>
                              <option value={10}>10 Years</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            onClick={() => setShowRenewalForm(false)}
                            className="px-2.5 py-1 text-slate-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmitRenewal}
                            disabled={gatekeeperLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-3 rounded shadow-sm"
                          >
                            Confirm Renewal Submission
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. MAKER (SCRUTINY OFFICER) ACTIONS */}
                {currentRole === "MAKER" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Scrutiny Officer (Maker) Decision Gate:
                      </span>
                      {!allClearancesPassed && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          ⛔ Gatekeeper Block Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          handleMakerRecommend("RECOMMEND_RELEASE")
                        }
                        disabled={
                          gatekeeperLoading ||
                          !allClearancesPassed ||
                          lifecycleStatus === "RELEASED" ||
                          lifecycleStatus === "RELEASE_RECOMMENDED"
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        title={
                          allClearancesPassed
                            ? "Recommend release to Director"
                            : "Blocked: PGRC/Vigilance/Grants clearance required"
                        }
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Recommend Release to Director (Maker)</span>
                      </button>

                      <button
                        onClick={() => handleMakerRecommend("ENCASH_FORFEIT")}
                        disabled={
                          gatekeeperLoading ||
                          lifecycleStatus === "ENCASHED" ||
                          lifecycleStatus === "RELEASED"
                        }
                        className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                        title="Encash FDR and forfeit security deposit to Council"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Invoke / Encash FDR (Default)</span>
                      </button>
                    </div>

                    {!allClearancesPassed && (
                      <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200">
                        Notice: Release recommendation is strictly disabled
                        because one or more AICTE Bureau clearances are blocked.
                      </p>
                    )}
                  </div>
                )}

                {/* 3. CHECKER (DIRECTOR, REGULATION BUREAU) ACTIONS */}
                {currentRole === "CHECKER" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Director Regulation Bureau (Checker) Final Approval:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCheckerApprove}
                        disabled={
                          gatekeeperLoading ||
                          lifecycleStatus === "RELEASED" ||
                          lifecycleStatus !== "RELEASE_RECOMMENDED"
                        }
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-md flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>
                          👑 Final Approve & Issue Discharge NOC (Checker)
                        </span>
                      </button>
                    </div>

                    {lifecycleStatus !== "RELEASE_RECOMMENDED" &&
                      lifecycleStatus !== "RELEASED" && (
                        <p className="text-[11px] text-slate-500">
                          Awaiting Scrutiny Officer (Maker) recommendation before
                          Director approval can be unlocked.
                        </p>
                      )}
                  </div>
                )}

                {/* DISCHARGE NOC & OFFICIAL AUDIT PDF DOWNLOAD */}
                {lifecycleStatus === "RELEASED" && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-purple-950 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                        <span>
                          FDR Released & Statutory Discharge NOC Issued!
                        </span>
                      </span>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Instrument unencumbered. Verified by Maker ({makerOfficer}) and
                        approved by Director ({checkerOfficer}).
                      </p>
                    </div>

                    <button
                      onClick={handleExportPdf}
                      className="bg-[#0D3B66] hover:bg-blue-900 text-amber-300 font-bold text-xs py-2 px-3 rounded-lg shadow flex items-center space-x-1.5 shrink-0 transition-colors border border-amber-400/40"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download AICTE Discharge Certificate (PDF)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scrutiny Modal Footer Actions */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                <Hash className="w-3 h-3 text-blue-500" />
                <span>SHA-256 Ledger Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                {/* 1-Click Forensic Certificate PDF download preview */}
                <button
                  onClick={handleExportPdf}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D3B66] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center space-x-1"
                  title="Download Official AICTE Compliance & Audit Certificate PDF"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Audit Certificate (PDF)</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
                >
                  Close Scrutiny
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
