"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { FDRItem, VerificationResult } from "@/types";
import {
  SearchCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Calculator,
  Building,
  Landmark,
  Hash,
  Download,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
  X,
  FileText,
  UserCheck,
} from "lucide-react";

export default function ScrutinyWorkstationPage() {
  const params = useParams();
  const router = useRouter();
  const fdrId = Number(params?.id);

  const { dashboardData, currentRole, refreshDashboard } = useApp();

  const [fdr, setFdr] = useState<FDRItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeHoverBBox, setActiveHoverBBox] = useState<any | null>(null);

  // Officer Actions State
  const [observationModalOpen, setObservationModalOpen] =
    useState<boolean>(false);
  const [observationNotes, setObservationNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Bank Verification State
  const [cbsLoading, setCbsLoading] = useState<boolean>(false);
  const [magicLinkUrl, setMagicLinkUrl] = useState<string | null>(null);

  // Fetch FDR details
  useEffect(() => {
    if (fdrId) {
      setLoading(true);
      fetch(`/api/fdrs/${fdrId}`)
        .then((res) => res.json())
        .then((data) => {
          setFdr(data);
          if (data.bank_verify_token) {
            setMagicLinkUrl(`/bank-verify/${data.bank_verify_token}`);
          }
        })
        .catch((err) => console.error("Error loading FDR:", err))
        .finally(() => setLoading(false));
    }
  }, [fdrId]);

  if (loading || !fdr) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        <span className="font-bold text-slate-800">
          Loading AICTE Scrutiny Workstation...
        </span>
      </div>
    );
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const flags = fdr.flags || [];
  const bboxes = fdr.bbox_overlay || [];
  const hasMathFlag = flags.some((f) => f.code === "MATH_TAMPER_SUSPECTED");
  const hasLienFlag = flags.some((f) => f.code === "MISSING_AICTE_LIEN");
  const hasBankFlag = flags.some((f) => f.code === "PROHIBITED_COOP_BANK");
  const hasNormFlag = flags.some((f) => f.code === "SHORTFALL_IN_PRINCIPAL");
  const hasDupFlag = flags.some((f) => f.code === "DUPLICATE_INSTRUMENT");

  // Handler: Flag Observation Remark
  const handleFlagObservation = async () => {
    if (!observationNotes.trim()) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/fdrs/${fdr.id}/flag-observation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observation_notes: observationNotes,
          officer_name: "Sh. R.K. Verma (Scrutiny Officer - Maker)",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFdr({
          ...fdr,
          trust_status: "FLAGGED",
          scrutiny_remarks: observationNotes,
          clarification_requested: true,
        });
        setObservationModalOpen(false);
        setActionMessage(
          "Official scrutiny remark recorded and routed to Institution dashboard."
        );
        await refreshDashboard();
      } else {
        alert(data.detail || "Failed to record observation");
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Simulate CBS check
  const handleSimulateCbs = async () => {
    setCbsLoading(true);
    try {
      const res = await fetch(`/api/fdrs/${fdr.id}/simulate-cbs-check`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setFdr({
          ...fdr,
          trust_status: "BANK_CONFIRMED",
          bank_confirmed_at: data.bank_confirmed_at,
        });
        setActionMessage(
          "Core Banking Gateway confirmed unencumbered lien in favour of AICTE!"
        );
        await refreshDashboard();
      }
    } catch (err: any) {
      alert(`CBS check failed: ${err.message}`);
    } finally {
      setCbsLoading(false);
    }
  };

  // Handler: Generate Magic Link
  const handleGenerateMagicLink = async () => {
    try {
      const res = await fetch(
        `/api/fdrs/${fdr.id}/request-bank-verification`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        setMagicLinkUrl(data.magic_link);
        await refreshDashboard();
      }
    } catch (err: any) {
      alert(`Magic link generation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Workstation Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link
            href="/scrutiny"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Back to Scrutiny Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black text-sm text-slate-900">
                {fdr.fdr_number}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                  fdr.trust_status === "FLAGGED"
                    ? "bg-red-100 text-red-800"
                    : fdr.trust_status === "BANK_CONFIRMED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {fdr.trust_status}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {fdr.institution_name} ({fdr.institution_state}) • {fdr.issuing_bank}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setObservationModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-red-600" />
            <span>Flag Observation Remark</span>
          </button>

          <a
            href={`/api/fdrs/${fdr.id}/export-audit-pdf`}
            download
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit PDF</span>
          </a>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2-COLUMN DEDICATED WORKSPACE */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (7 cols): Document Canvas with SVG Overlay */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex flex-col">
          {/* Viewer Toolbar */}
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-[11px] text-slate-200">
              PyMuPDF 150 DPI Render Canvas
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  showOverlays
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {showOverlays ? "Bounding Boxes ON" : "Boxes OFF"}
              </button>

              <div className="flex items-center space-x-1 bg-slate-800 rounded p-0.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
                  className="p-0.5 text-slate-300 hover:text-white"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="font-mono text-[9px] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-0.5 text-slate-300 hover:text-white"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Render Area */}
          <div className="p-4 overflow-auto flex items-center justify-center min-h-[480px] bg-slate-950/70 relative">
            {fdr.rendered_image_path ? (
              <div
                className="relative shadow-2xl rounded border border-slate-700 bg-white"
                style={{ width: `${zoomLevel}%`, maxWidth: "800px" }}
              >
                <img
                  src={fdr.rendered_image_path}
                  alt="Rendered FDR"
                  className="w-full h-auto block select-none"
                />

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
                            className={isFail ? "svg-bbox-fail" : "svg-bbox-ok"}
                            onMouseEnter={() => setActiveHoverBBox(box)}
                            onMouseLeave={() => setActiveHoverBBox(null)}
                          />

                          <foreignObject
                            x={x}
                            y={Math.max(0, y - 4)}
                            width={Math.max(35, w * 1.5)}
                            height="4"
                          >
                            <div
                              className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded shadow-sm inline-block ${
                                isFail
                                  ? "bg-red-600 text-white"
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
              <div className="text-center p-8 text-slate-400 text-xs">
                Document image not available.
              </div>
            )}

            {/* Hover Tooltip */}
            {activeHoverBBox && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700 text-white p-2.5 rounded-lg shadow-xl text-xs flex items-start space-x-2 z-20">
                <div>
                  <span className="font-bold text-amber-300">
                    {activeHoverBBox.label}:
                  </span>{" "}
                  <span className="text-slate-200">
                    {activeHoverBBox.value}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {activeHoverBBox.tooltip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom WORM Seal */}
          <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>SHA-256: {fdr.file_sha256}</span>
            <span className="text-emerald-400 font-bold">🔒 WORM Immutable</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (5 cols): Structured 5-Point Checklist */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                5-Point AICTE APH Regulatory Checklist
              </h3>
              <p className="text-[11px] text-slate-500">
                Statutory validation against Approval Process Handbook rules.
              </p>
            </div>

            {/* 1. Math Check */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                hasMathFlag
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center space-x-1.5 text-slate-900">
                  <Calculator className="w-3.5 h-3.5 text-slate-500" />
                  <span>1. Quarterly Compound Interest Math Check</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    hasMathFlag
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasMathFlag ? "FAIL: DOCTORED" : "PASS"}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200 mt-1">
                A = P(1+r/400)^(4n) • Calc:{" "}
                <b>{formatINR(fdr.calculated_maturity_amount)}</b> vs Printed:{" "}
                <b>{formatINR(fdr.printed_maturity_amount)}</b>
              </div>
              {hasMathFlag && (
                <span className="text-[10px] font-bold text-red-600 block mt-1">
                  Discrepancy: +{formatINR(fdr.math_discrepancy)} exceeds ₹100
                  tolerance.
                </span>
              )}
            </div>

            {/* 2. Joint Lien Check */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                hasLienFlag
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center space-x-1.5 text-slate-900">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>2. Joint Holder / AICTE Lien Check</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    hasLienFlag
                      ? "bg-red-600 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasLienFlag ? "FAIL: NO LIEN" : "PASS"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Holder: <i>{fdr.account_holder_text}</i>
              </p>
            </div>

            {/* 3. RBI Scheduled Bank Check */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                hasBankFlag
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center space-x-1.5 text-slate-900">
                  <Landmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>3. RBI Scheduled Commercial Bank Check</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    hasBankFlag
                      ? "bg-red-600 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasBankFlag ? "FAIL: CO-OP BANK" : "PASS"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {fdr.issuing_bank} (IFSC: {fdr.ifsc_code})
              </p>
            </div>

            {/* 4. APH Norm Amount Check */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                hasNormFlag
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center space-x-1.5 text-slate-900">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>4. Prescribed APH Norm Amount Check</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    hasNormFlag
                      ? "bg-red-600 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasNormFlag ? "FAIL: SHORTFALL" : "PASS"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Principal: {formatINR(fdr.principal_amount)} vs Required:{" "}
                {formatINR(fdr.required_fdr_amount || 3500000)}
              </p>
            </div>

            {/* 5. SHA-256 Duplicate Guard */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                hasDupFlag
                  ? "bg-red-50 border-red-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center space-x-1.5 text-slate-900">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>5. SHA-256 Duplicate & Format Guard</span>
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    hasDupFlag
                      ? "bg-red-600 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasDupFlag ? "FAIL: DUPLICATE" : "PASS"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block mt-1 truncate">
                {fdr.file_sha256}
              </span>
            </div>
          </div>

          {/* Two-Tier Bank Verification Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1B365D]">
                Independent Bank Verification (Tier A & B)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {fdr.trust_status === "BANK_CONFIRMED" ||
                fdr.trust_status === "OFFICER_APPROVED"
                  ? "✔ Confirmed"
                  : "Pending Bank"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleSimulateCbs}
                disabled={cbsLoading}
                className="w-full p-2.5 rounded-lg bg-[#1B365D] hover:bg-blue-900 text-white font-bold shadow-xs text-center transition-colors"
              >
                {cbsLoading ? "Querying CBS..." : "⚡ Run CBS API Query"}
              </button>

              {magicLinkUrl ? (
                <a
                  href={magicLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs text-center transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Open Bank Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={handleGenerateMagicLink}
                  className="w-full p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs text-center transition-colors"
                >
                  🔗 Generate Magic Link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Remark Modal */}
      {observationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Record Scrutiny Observation & Defect Remark
              </h3>
              <button
                onClick={() => setObservationModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p>
                Instrument: <b>{fdr.fdr_number}</b> ({fdr.institution_name})
              </p>
              <p className="text-[11px] text-slate-500">
                Type the official regulatory defect observation. This will flag the
                instrument on the institution portal and prompt them to submit a
                corrected replacement FDR.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Official Observation Remark / Defect Finding
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Printed maturity of Rs. 26,50,000 does not match calculated quarterly compounding of Rs. 21,01,310.71. Please upload verified bank endorsement."
                  value={observationNotes}
                  onChange={(e) => setObservationNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setObservationModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagObservation}
                disabled={actionLoading || !observationNotes.trim()}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {actionLoading ? "Recording..." : "Record & Route Observation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

