"""
VISHWAS-FDR | FastAPI Main Application
Team OG-7 | SIH 2026 | PS-26265
Endpoints implemented in Phase 1:
  GET  /api/dashboard
  POST /api/fdrs/upload
  GET  /api/sample-pdfs/{filename}
  GET  /api/fdrs/{id}/image          (rendered PNG)
  GET  /health
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import secrets
import shutil
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

from models import (
    AuditLog, FDRRecord, Institution, SessionLocal, SystemConfig,
    append_audit_block, create_tables, get_config, get_db, set_config,
)
from verification import run_verification_engine
from export_pdf import generate_audit_certificate_pdf, generate_discharge_noc_letter_pdf

# ─────────────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).parent
WORM_DIR       = BASE_DIR / "worm_storage"
RENDER_DIR     = BASE_DIR / "rendered_images"
SAMPLE_DIR     = BASE_DIR / "sample_fdrs"

WORM_DIR.mkdir(exist_ok=True)
RENDER_DIR.mkdir(exist_ok=True)
SAMPLE_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Simulation state (in-memory; persisted to SystemConfig on change)
# ─────────────────────────────────────────────────────────────────────────────
class SimulationState:
    def __init__(self):
        self._current_date = date(2026, 11, 1)

    @property
    def current_date(self) -> date:
        return self._current_date

    def set_date(self, d: date):
        self._current_date = d

    def days_remaining(self, maturity_date_str: str) -> int:
        mat = date.fromisoformat(maturity_date_str)
        return (mat - self._current_date).days


simulation_state = SimulationState()

# ─────────────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VISHWAS-FDR API",
    description="AICTE Security Deposit / FDR Lifecycle Portal — SIH 2026 PS-26265",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Startup
# ─────────────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_tables()

    # Seed data
    from seed_data import seed_database
    seed_database()

    # Generate demo PDFs
    from generate_demo_pdfs import generate_all
    if not (SAMPLE_DIR / "1_SBI_Genuine_FDR.pdf").exists():
        generate_all()
    else:
        print("[STARTUP] Sample PDFs already exist — skipping generation.")

    # Load simulated date from DB config
    db = SessionLocal()
    try:
        saved = get_config(db, "simulated_date", "2026-11-01")
        simulation_state.set_date(date.fromisoformat(saved))
    finally:
        db.close()

    print(f"[STARTUP] VISHWAS-FDR API ready | Simulated date: {simulation_state.current_date}")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def _lifecycle_status(days: int) -> str:
    if days < 0:
        return "OVERDUE"
    if days <= 30:
        return "EXPIRING_SOON"
    if days <= 90:
        return "EXPIRING_SOON"
    return "ACTIVE"


def _urgency_score(fdr: FDRRecord, days: int) -> int:
    """Lower score → higher priority in the officer queue."""
    score = 1000
    if fdr.lifecycle_status == "OVERDUE":
        score = 0
    elif fdr.trust_status == "FLAGGED":
        score = 10
    elif fdr.lifecycle_status == "RELEASE_REQUESTED":
        score = 20
    elif days <= 7:
        score = 30
    elif days <= 30:
        score = 50
    elif days <= 60:
        score = 100
    elif days <= 90:
        score = 200
    return score


def _fdr_to_dict(fdr: FDRRecord, db: Session, sim_date: date | None = None) -> dict:
    sd = sim_date or simulation_state.current_date
    days = (date.fromisoformat(fdr.maturity_date) - sd).days
    inst = fdr.institution
    return {
        "id":                       fdr.id,
        "fdr_number":               fdr.fdr_number,
        "institution_id":           fdr.institution_id,
        "institution_name":         inst.name if inst else "Unknown",
        "institution_state":        inst.state if inst else "",
        "institution_category":     inst.category if inst else "",
        "aishe_code":               inst.aishe_code if inst else "",
        "issuing_bank":             fdr.issuing_bank,
        "ifsc_code":                fdr.ifsc_code,
        "branch_email":             fdr.branch_email,
        "is_scheduled_bank":        fdr.is_scheduled_bank,
        "account_holder_text":      fdr.account_holder_text,
        "is_joint_aicte":           fdr.is_joint_aicte,
        "principal_amount":         fdr.principal_amount,
        "interest_rate":            fdr.interest_rate,
        "issue_date":               fdr.issue_date,
        "maturity_date":            fdr.maturity_date,
        "printed_maturity_amount":  fdr.printed_maturity_amount,
        "calculated_maturity_amount": fdr.calculated_maturity_amount,
        "math_discrepancy":         fdr.math_discrepancy,
        "trust_status":             fdr.trust_status,
        "lifecycle_status":         fdr.lifecycle_status,
        "flags":                    json.loads(fdr.flags_json or "[]"),
        "bbox_overlay":             json.loads(fdr.bbox_json or "[]"),
        "file_sha256":              fdr.file_sha256,
        "rendered_image_path":      fdr.rendered_image_path,
        "bank_verify_token":        fdr.bank_verify_token,
        "bank_confirmed_at":        fdr.bank_confirmed_at,
        "affidavit_6_uploaded":     fdr.affidavit_6_uploaded,
        "maker_officer":            fdr.maker_officer,
        "checker_officer":          fdr.checker_officer,
        "replaced_by_fdr_id":       fdr.replaced_by_fdr_id,
        "parent_fdr_id":            getattr(fdr, "parent_fdr_id", None),
        "scrutiny_remarks":         getattr(fdr, "scrutiny_remarks", None),
        "clarification_requested":  getattr(fdr, "clarification_requested", False),
        # Computed
        "days_to_maturity":         days,
        "urgency_score":            _urgency_score(fdr, days),
        # Institution clearances
        "pgrc_clearance":           inst.pgrc_clearance if inst else True,
        "vigilance_clearance":      inst.vigilance_clearance if inst else True,
        "grants_clearance":         inst.grants_clearance if inst else True,
        "required_fdr_amount":      inst.required_fdr_amount if inst else 0,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /health
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "simulated_date": str(simulation_state.current_date)}


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/dashboard
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    sim_date = simulation_state.current_date
    all_fdrs = db.query(FDRRecord).all()

    # Re-compute lifecycle status dynamically against sim_date
    for fdr in all_fdrs:
        days = (date.fromisoformat(fdr.maturity_date) - sim_date).days
        if fdr.lifecycle_status not in ("RELEASED", "ENCASHED", "RENEWAL_SUBMITTED",
                                         "RELEASE_REQUESTED", "RELEASE_RECOMMENDED"):
            if days < 0:
                fdr.lifecycle_status = "OVERDUE"
            elif days <= 90:
                fdr.lifecycle_status = "EXPIRING_SOON"
            else:
                fdr.lifecycle_status = "ACTIVE"

    # ── KPIs ─────────────────────────────────────────────────────────────────
    total_corpus   = sum(f.principal_amount for f in all_fdrs)
    bank_confirmed = sum(1 for f in all_fdrs if f.trust_status in ("BANK_CONFIRMED", "OFFICER_APPROVED"))
    flagged        = sum(1 for f in all_fdrs if f.trust_status == "FLAGGED")
    overdue        = sum(1 for f in all_fdrs if f.lifecycle_status == "OVERDUE")
    expiring       = sum(1 for f in all_fdrs if f.lifecycle_status == "EXPIRING_SOON")

    kpis = {
        "total_corpus_inr":             total_corpus,
        "total_corpus_cr":              round(total_corpus / 1e7, 2),
        "total_fdrs":                   len(all_fdrs),
        "bank_confirmed_instruments":   bank_confirmed,
        "flagged_tampered_cases":       flagged,
        "approaching_maturity_overdue": overdue + expiring,
        "overdue_count":                overdue,
        "expiring_soon_count":          expiring,
        "trust_ladder_breakdown": {
            "SUBMITTED":       sum(1 for f in all_fdrs if f.trust_status == "SUBMITTED"),
            "AUTO_CHECKED":    sum(1 for f in all_fdrs if f.trust_status == "AUTO_CHECKED"),
            "FLAGGED":         flagged,
            "BANK_CONFIRMED":  sum(1 for f in all_fdrs if f.trust_status == "BANK_CONFIRMED"),
            "OFFICER_APPROVED": sum(1 for f in all_fdrs if f.trust_status == "OFFICER_APPROVED"),
        },
    }

    # ── Priority-Ranked FDR List ──────────────────────────────────────────────
    fdr_dicts = [_fdr_to_dict(f, db, sim_date) for f in all_fdrs]
    priority_list = sorted(fdr_dicts, key=lambda x: (x["urgency_score"], x["days_to_maturity"]))

    # ── State Risk Heatmap ────────────────────────────────────────────────────
    state_map: dict[str, dict] = {}
    for f in all_fdrs:
        inst = f.institution
        state = inst.state if inst else "Unknown"
        days  = (date.fromisoformat(f.maturity_date) - sim_date).days
        if state not in state_map:
            state_map[state] = {
                "state": state,
                "total_corpus_inr": 0.0,
                "active_fdrs": 0,
                "expiring_soon": 0,
                "overdue_flagged": 0,
                "institutions": set(),
            }
        sm = state_map[state]
        sm["total_corpus_inr"]   += f.principal_amount
        sm["active_fdrs"]        += 1
        sm["institutions"].add(inst.id if inst else 0)
        if f.lifecycle_status == "OVERDUE" or f.trust_status == "FLAGGED":
            sm["overdue_flagged"] += 1
        elif f.lifecycle_status == "EXPIRING_SOON":
            sm["expiring_soon"]   += 1

    heatmap = []
    for state, sm in state_map.items():
        sm["institution_count"] = len(sm.pop("institutions"))
        sm["total_corpus_cr"]   = round(sm["total_corpus_inr"] / 1e7, 2)
        sm["risk_score"] = sm["overdue_flagged"] * 3 + sm["expiring_soon"]
        heatmap.append(sm)
    heatmap.sort(key=lambda x: -x["risk_score"])

    return {
        "simulated_date": str(sim_date),
        "kpis": kpis,
        "priority_list": priority_list,
        "state_heatmap": heatmap,
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── POST /api/fdrs/upload
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/fdrs/upload")
async def upload_fdr(
    file:                    UploadFile = File(...),
    fdr_number:              str = Form(...),
    issuing_bank:            str = Form(...),
    ifsc_code:               str = Form(...),
    branch_email:            str = Form(""),
    account_holder_text:     str = Form(""),
    principal_amount:        float = Form(...),
    interest_rate:           float = Form(...),
    issue_date:              str = Form(...),
    maturity_date:           str = Form(...),
    printed_maturity_amount: float = Form(...),
    institution_id:          int = Form(...),
    db: Session = Depends(get_db),
):
    # ── Read file bytes ───────────────────────────────────────────────────────
    pdf_bytes = await file.read()
    if not pdf_bytes[:4] == b"%PDF":
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF.")

    # ── Gather existing SHA-256s and FDR numbers for duplicate check ──────────
    target_existing = db.query(FDRRecord).filter(FDRRecord.fdr_number == fdr_number).first()
    existing_records = db.query(FDRRecord).all()
    if target_existing:
        # Exclude this record's own fdr_number and old sha256 so re-uploading/updating doesn't trigger false duplicate
        existing_sha256s = [r.file_sha256 for r in existing_records if r.file_sha256 and r.id != target_existing.id]
        existing_fdr_nums = [r.fdr_number for r in existing_records if r.id != target_existing.id]
    else:
        existing_sha256s = [r.file_sha256 for r in existing_records if r.file_sha256]
        existing_fdr_nums = [r.fdr_number for r in existing_records]

    # ── Fetch institution for norm check ─────────────────────────────────────
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail=f"Institution id={institution_id} not found.")

    # ── Load configurable norms ───────────────────────────────────────────────
    try:
        math_tol = float(get_config(db, "math_tolerance_inr", "100.0"))
    except:
        math_tol = 100.0

    norms = {
        "ENGINEERING_NEW": float(get_config(db, "norm_engineering", "3500000")),
        "PHARMACY":        float(get_config(db, "norm_pharmacy", "1500000")),
        "MBA_MCA":         float(get_config(db, "norm_mba_mca", "1500000")),
        "ARCHITECTURE":    float(get_config(db, "norm_architecture", "1500000")),
    }

    # ── Run 5-Point Verification Engine ──────────────────────────────────────
    submitted_data = {
        "fdr_number":              fdr_number,
        "issuing_bank":            issuing_bank,
        "ifsc_code":               ifsc_code,
        "account_holder_text":     account_holder_text or "",
        "principal_amount":        principal_amount,
        "interest_rate":           interest_rate,
        "issue_date":              issue_date,
        "maturity_date":           maturity_date,
        "printed_maturity_amount": printed_maturity_amount,
        "institution_category":    inst.category,
    }

    result = run_verification_engine(
        pdf_bytes=pdf_bytes,
        submitted_data=submitted_data,
        existing_sha256s=existing_sha256s,
        existing_fdr_numbers=existing_fdr_nums,
        db_norms=norms,
        math_tolerance=math_tol,
    )

    # ── WORM Storage: save by SHA-256 hash ───────────────────────────────────
    sha256 = result["file_sha256"]
    worm_path = WORM_DIR / f"{sha256}.pdf"
    if not worm_path.exists():
        worm_path.write_bytes(pdf_bytes)
        os.chmod(worm_path, 0o444)   # read-only (WORM simulation)

    # ── Save rendered PNG ─────────────────────────────────────────────────────
    png_path = RENDER_DIR / f"{sha256}.png"
    if not png_path.exists():
        png_path.write_bytes(result["png_bytes"])
    rendered_image_url = f"/api/fdrs/image/{sha256}.png"

    # ── Persist FDRRecord with dynamically extracted values ──────────────────
    ext = result.get("extracted_fields", {})
    actual_fdr_num = ext.get("fdr_number") or fdr_number
    actual_bank = ext.get("issuing_bank") or issuing_bank
    actual_ifsc = ext.get("ifsc_code") or ifsc_code
    actual_holder = ext.get("account_holder_text") or account_holder_text or result["page_data"].get("full_text", "")[:500]
    actual_principal = float(ext.get("principal_amount") or principal_amount)
    actual_rate = float(ext.get("interest_rate") or interest_rate)
    actual_issue = str(ext.get("issue_date") or issue_date)
    actual_maturity = str(ext.get("maturity_date") or maturity_date)
    actual_printed_mat = float(ext.get("printed_maturity_amount") or printed_maturity_amount)

    if target_existing:
        fdr = target_existing
        fdr.institution_id           = institution_id
        fdr.fdr_number               = actual_fdr_num
        fdr.issuing_bank             = actual_bank
        fdr.ifsc_code                = actual_ifsc
        fdr.branch_email             = branch_email
        fdr.is_scheduled_bank        = result["is_scheduled_bank"]
        fdr.account_holder_text      = actual_holder
        fdr.is_joint_aicte           = result["is_joint_aicte"]
        fdr.principal_amount         = actual_principal
        fdr.interest_rate            = actual_rate
        fdr.issue_date               = actual_issue
        fdr.maturity_date            = actual_maturity
        fdr.printed_maturity_amount  = actual_printed_mat
        fdr.calculated_maturity_amount = result["calculated_maturity_amount"]
        fdr.math_discrepancy         = result["math_discrepancy"]
        fdr.trust_status             = result["trust_status"]
        fdr.flags_json               = json.dumps(result["flags"])
        fdr.bbox_json                = json.dumps(result["bbox_overlay"])
        fdr.file_sha256              = sha256
        fdr.rendered_image_path      = rendered_image_url
    else:
        fdr = FDRRecord(
            institution_id           = institution_id,
            fdr_number               = actual_fdr_num,
            issuing_bank             = actual_bank,
            ifsc_code                = actual_ifsc,
            branch_email             = branch_email,
            is_scheduled_bank        = result["is_scheduled_bank"],
            account_holder_text      = actual_holder,
            is_joint_aicte           = result["is_joint_aicte"],
            principal_amount         = actual_principal,
            interest_rate            = actual_rate,
            issue_date               = actual_issue,
            maturity_date            = actual_maturity,
            printed_maturity_amount  = actual_printed_mat,
            calculated_maturity_amount = result["calculated_maturity_amount"],
            math_discrepancy         = result["math_discrepancy"],
            trust_status             = result["trust_status"],
            lifecycle_status         = "ACTIVE",
            flags_json               = json.dumps(result["flags"]),
            bbox_json                = json.dumps(result["bbox_overlay"]),
            file_sha256              = sha256,
            rendered_image_path      = rendered_image_url,
            affidavit_6_uploaded     = False,
        )
        db.add(fdr)
    db.commit()
    db.refresh(fdr)

    # ── Append Forensic Audit Block ───────────────────────────────────────────
    action = "AUTO_VERIFICATION_PASSED" if result["pass"] else "AUTO_VERIFICATION_FLAGGED"
    flag_codes = [f["code"] for f in result["flags"]]
    details = (
        f"FDR {fdr.fdr_number} uploaded | SHA-256: {sha256[:12]}... | "
        f"Trust: {result['trust_status']} | "
        f"Flags: {flag_codes if flag_codes else 'None'} | "
        f"Math Δ: ₹{result['math_discrepancy']:,.0f}"
    )
    append_audit_block(
        db, actor_role="SYSTEM_AI", action=action,
        details=details, fdr_id=fdr.id,
        actor_name="VISHWAS-FDR Verification Engine",
    )

    # ── Build response ────────────────────────────────────────────────────────
    response = {
        "success": True,
        "fdr_id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "issuing_bank": fdr.issuing_bank,
        "ifsc_code": fdr.ifsc_code,
        "account_holder_text": fdr.account_holder_text,
        "principal_amount": fdr.principal_amount,
        "interest_rate": fdr.interest_rate,
        "issue_date": fdr.issue_date,
        "maturity_date": fdr.maturity_date,
        "printed_maturity_amount": fdr.printed_maturity_amount,
        "institution_name": inst.name,
        "institution_state": inst.state,
        "trust_status": result["trust_status"],
        "overall_pass": result["pass"],
        "flags": result["flags"],
        "checks": result["checks"],
        "file_sha256": sha256,
        "rendered_image_url": rendered_image_url,
        "bbox_overlay": result["bbox_overlay"],
        "calculated_maturity_amount": result["calculated_maturity_amount"],
        "math_discrepancy": result["math_discrepancy"],
        "is_joint_aicte": result["is_joint_aicte"],
        "is_scheduled_bank": result["is_scheduled_bank"],
        "extracted_fields": ext,
        "png_base64": base64.b64encode(result["png_bytes"]).decode(),
    }
    return JSONResponse(content=response)


# ─────────────────────────────────────────────────────────────────────────────
# ── POST /api/fdrs/test-sample/{filename}
# ─────────────────────────────────────────────────────────────────────────────
SAMPLE_PRESETS = {
    "1_SBI_Genuine_FDR.pdf": {
        "fdr_number": "SBI-FDR-2026-9901",
        "issuing_bank": "State Bank of India",
        "ifsc_code": "SBIN0004321",
        "branch_email": "branch.civillines.nagpur@sbi.co.in",
        "account_holder_text": "Visvesvaraya Institute of Technology, Nagpur Jointly with Member Secretary, AICTE",
        "principal_amount": 3500000.0,
        "interest_rate": 7.0,
        "issue_date": "2026-11-01",
        "maturity_date": "2027-01-15",
        "printed_maturity_amount": 3550229.91,
        "institution_id": 1,
    },
    "2_PNB_Tampered_Math_FDR.pdf": {
        "fdr_number": "PNB-FDR-2026-7742",
        "issuing_bank": "Punjab National Bank",
        "ifsc_code": "PUNB0112200",
        "branch_email": "branch.shivajinagar.pune@pnb.co.in",
        "account_holder_text": "Apex College of Pharmacy, Pune Jointly with Member Secretary, AICTE",
        "principal_amount": 1500000.0,
        "interest_rate": 6.8,
        "issue_date": "2026-11-01",
        "maturity_date": "2031-11-01",
        "printed_maturity_amount": 2650000.0,
        "institution_id": 2,
    },
    "3_CoopBank_Invalid_FDR.pdf": {
        "fdr_number": "COOP-2026-1102",
        "issuing_bank": "Nagpur Nagrik Sahakari Co-operative Bank Ltd.",
        "ifsc_code": "NNSB0000101",
        "branch_email": "nnsb.dharampeth@gmail.com",
        "account_holder_text": "Apex Engineering Trust",
        "principal_amount": 3500000.0,
        "interest_rate": 8.5,
        "issue_date": "2026-11-01",
        "maturity_date": "2028-11-01",
        "printed_maturity_amount": 4134448.27,
        "institution_id": 2,
    },
}

@app.post("/api/fdrs/test-sample/{filename}")
def test_sample_fdr(filename: str, db: Session = Depends(get_db)):
    if filename not in SAMPLE_PRESETS:
        raise HTTPException(status_code=404, detail="Unknown sample preset.")
    
    pdf_path = SAMPLE_DIR / filename
    if not pdf_path.exists():
        from generate_demo_pdfs import generate_all
        generate_all()

    pdf_bytes = pdf_path.read_bytes()
    preset = SAMPLE_PRESETS[filename]
    inst_id = preset["institution_id"]
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    target_existing = db.query(FDRRecord).filter(FDRRecord.fdr_number == preset["fdr_number"]).first()
    existing_records = db.query(FDRRecord).all()
    if target_existing:
        existing_sha256s = [r.file_sha256 for r in existing_records if r.file_sha256 and r.id != target_existing.id]
        existing_fdr_nums = [r.fdr_number for r in existing_records if r.id != target_existing.id]
    else:
        existing_sha256s = [r.file_sha256 for r in existing_records if r.file_sha256]
        existing_fdr_nums = [r.fdr_number for r in existing_records]

    try:
        math_tol = float(get_config(db, "math_tolerance_inr", "100.0"))
    except:
        math_tol = 100.0

    norms = {
        "ENGINEERING_NEW": float(get_config(db, "norm_engineering", "3500000")),
        "PHARMACY":        float(get_config(db, "norm_pharmacy", "1500000")),
        "MBA_MCA":         float(get_config(db, "norm_mba_mca", "1500000")),
        "ARCHITECTURE":    float(get_config(db, "norm_architecture", "1500000")),
    }

    submitted_data = {
        "fdr_number":              preset["fdr_number"],
        "issuing_bank":            preset["issuing_bank"],
        "ifsc_code":               preset["ifsc_code"],
        "account_holder_text":     preset["account_holder_text"],
        "principal_amount":        preset["principal_amount"],
        "interest_rate":           preset["interest_rate"],
        "issue_date":              preset["issue_date"],
        "maturity_date":           preset["maturity_date"],
        "printed_maturity_amount": preset["printed_maturity_amount"],
        "institution_category":    inst.category,
    }

    result = run_verification_engine(
        pdf_bytes=pdf_bytes,
        submitted_data=submitted_data,
        existing_sha256s=existing_sha256s,
        existing_fdr_numbers=existing_fdr_nums,
        db_norms=norms,
        math_tolerance=math_tol,
    )

    sha256 = result["file_sha256"]
    worm_path = WORM_DIR / f"{sha256}.pdf"
    if not worm_path.exists():
        worm_path.write_bytes(pdf_bytes)
        try:
            os.chmod(worm_path, 0o444)
        except:
            pass

    png_path = RENDER_DIR / f"{sha256}.png"
    if not png_path.exists():
        png_path.write_bytes(result["png_bytes"])
    rendered_image_url = f"/api/fdrs/image/{sha256}.png"

    if target_existing:
        fdr = target_existing
        fdr.institution_id           = inst_id
        fdr.issuing_bank             = preset["issuing_bank"]
        fdr.ifsc_code                = preset["ifsc_code"]
        fdr.branch_email             = preset["branch_email"]
        fdr.is_scheduled_bank        = result["is_scheduled_bank"]
        fdr.account_holder_text      = preset["account_holder_text"]
        fdr.is_joint_aicte           = result["is_joint_aicte"]
        fdr.principal_amount         = preset["principal_amount"]
        fdr.interest_rate            = preset["interest_rate"]
        fdr.issue_date               = preset["issue_date"]
        fdr.maturity_date            = preset["maturity_date"]
        fdr.printed_maturity_amount  = preset["printed_maturity_amount"]
        fdr.calculated_maturity_amount = result["calculated_maturity_amount"]
        fdr.math_discrepancy         = result["math_discrepancy"]
        fdr.trust_status             = result["trust_status"]
        fdr.flags_json               = json.dumps(result["flags"])
        fdr.bbox_json                = json.dumps(result["bbox_overlay"])
        fdr.file_sha256              = sha256
        fdr.rendered_image_path      = rendered_image_url
    else:
        fdr = FDRRecord(
            institution_id           = inst_id,
            fdr_number               = preset["fdr_number"],
            issuing_bank             = preset["issuing_bank"],
            ifsc_code                = preset["ifsc_code"],
            branch_email             = preset["branch_email"],
            is_scheduled_bank        = result["is_scheduled_bank"],
            account_holder_text      = preset["account_holder_text"],
            is_joint_aicte           = result["is_joint_aicte"],
            principal_amount         = preset["principal_amount"],
            interest_rate            = preset["interest_rate"],
            issue_date               = preset["issue_date"],
            maturity_date            = preset["maturity_date"],
            printed_maturity_amount  = preset["printed_maturity_amount"],
            calculated_maturity_amount = result["calculated_maturity_amount"],
            math_discrepancy         = result["math_discrepancy"],
            trust_status             = result["trust_status"],
            lifecycle_status         = "ACTIVE",
            flags_json               = json.dumps(result["flags"]),
            bbox_json                = json.dumps(result["bbox_overlay"]),
            file_sha256              = sha256,
            rendered_image_path      = rendered_image_url,
            affidavit_6_uploaded     = False,
        )
        db.add(fdr)
    db.commit()
    db.refresh(fdr)

    action = "AUTO_VERIFICATION_PASSED" if result["pass"] else "AUTO_VERIFICATION_FLAGGED"
    flag_codes = [f["code"] for f in result["flags"]]
    details = (
        f"Demo Sample {filename} tested | FDR: {preset['fdr_number']} | "
        f"SHA-256: {sha256[:12]}... | Trust: {result['trust_status']} | "
        f"Flags: {flag_codes if flag_codes else 'None'}"
    )
    append_audit_block(
        db, actor_role="SYSTEM_AI", action=action,
        details=details, fdr_id=fdr.id,
        actor_name="Demo Sample Scrutiny Runner",
    )

    return {
        "success": True,
        "fdr_id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "issuing_bank": fdr.issuing_bank,
        "ifsc_code": fdr.ifsc_code,
        "account_holder_text": fdr.account_holder_text,
        "principal_amount": fdr.principal_amount,
        "interest_rate": fdr.interest_rate,
        "issue_date": fdr.issue_date,
        "maturity_date": fdr.maturity_date,
        "printed_maturity_amount": fdr.printed_maturity_amount,
        "institution_name": inst.name,
        "institution_state": inst.state,
        "trust_status": result["trust_status"],
        "overall_pass": result["pass"],
        "flags": result["flags"],
        "checks": result["checks"],
        "file_sha256": sha256,
        "rendered_image_url": rendered_image_url,
        "bbox_overlay": result["bbox_overlay"],
        "calculated_maturity_amount": result["calculated_maturity_amount"],
        "math_discrepancy": result["math_discrepancy"],
        "is_joint_aicte": result["is_joint_aicte"],
        "is_scheduled_bank": result["is_scheduled_bank"],
        "extracted_fields": result.get("extracted_fields", {}),
        "png_base64": base64.b64encode(result["png_bytes"]).decode(),
    }



# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/sample-pdfs/{filename}
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/sample-pdfs/{filename}")
def download_sample_pdf(filename: str):
    # Only allow the 3 known demo files
    allowed = {
        "1_SBI_Genuine_FDR.pdf",
        "2_PNB_Tampered_Math_FDR.pdf",
        "3_CoopBank_Invalid_FDR.pdf",
    }
    if filename not in allowed:
        raise HTTPException(status_code=404, detail="Sample file not found.")
    path = SAMPLE_DIR / filename
    if not path.exists():
        from generate_demo_pdfs import generate_all
        generate_all()
    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=filename,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/sample-pdfs/  (list)
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/sample-pdfs")
def list_sample_pdfs():
    samples = [
        {
            "filename": "1_SBI_Genuine_FDR.pdf",
            "label":    "SBI Genuine FDR",
            "bank":     "State Bank of India",
            "expected_result": "PASS — All 5 checks green",
            "flags": [],
        },
        {
            "filename": "2_PNB_Tampered_Math_FDR.pdf",
            "label":    "PNB Tampered Math FDR",
            "bank":     "Punjab National Bank",
            "expected_result": "FLAGGED — MATH_TAMPER_SUSPECTED",
            "flags": ["MATH_TAMPER_SUSPECTED"],
        },
        {
            "filename": "3_CoopBank_Invalid_FDR.pdf",
            "label":    "Co-op Bank Invalid FDR",
            "bank":     "Nagpur Nagrik Sahakari Co-operative Bank",
            "expected_result": "FLAGGED — PROHIBITED_COOP_BANK + MISSING_AICTE_LIEN",
            "flags": ["PROHIBITED_COOP_BANK", "MISSING_AICTE_LIEN"],
        },
    ]
    return {"samples": samples}


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/fdrs/image/{filename}
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/fdrs/image/{filename}")
def get_rendered_image(filename: str):
    path = RENDER_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Rendered image not found.")
    return FileResponse(str(path), media_type="image/png")





# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/fdrs/export-csv (Repository Master CSV Export)
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/fdrs/export-csv")
def export_fdrs_csv(db: Session = Depends(get_db)):
    """
    Exports the complete AICTE FDR Repository as an official CSV dataset.
    """
    import csv
    import io
    
    sim_date = simulation_state.current_date
    all_fdrs = db.query(FDRRecord).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "AISHE Code",
        "Institution Name",
        "State",
        "Category",
        "FDR Number",
        "Issuing Bank",
        "IFSC Code",
        "Principal Amount (INR)",
        "Interest Rate (%)",
        "Issue Date",
        "Maturity Date",
        "Printed Maturity (INR)",
        "Calculated Maturity (INR)",
        "Math Discrepancy (INR)",
        "Trust Status",
        "Lifecycle Status",
        "AICTE Joint Lien",
        "Scheduled Bank",
        "Days to Maturity",
    ])
    
    for f in all_fdrs:
        inst = f.institution
        days = (date.fromisoformat(f.maturity_date) - sim_date).days
        writer.writerow([
            inst.aishe_code if inst else "",
            inst.name if inst else "",
            inst.state if inst else "",
            inst.category if inst else "",
            f.fdr_number,
            f.issuing_bank,
            f.ifsc_code,
            f.principal_amount,
            f.interest_rate,
            f.issue_date,
            f.maturity_date,
            f.printed_maturity_amount,
            f.calculated_maturity_amount,
            f.math_discrepancy,
            f.trust_status,
            f.lifecycle_status,
            "YES" if f.is_joint_aicte else "NO",
            "YES" if f.is_scheduled_bank else "NO",
            days,
        ])
        
    csv_bytes = output.getvalue().encode("utf-8")
    filename = f"AICTE_Regulation_Bureau_FDR_Repository_{sim_date}.csv"
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )








# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/fdrs/{id}
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/fdrs/{fdr_id}")
def get_fdr(fdr_id: int, db: Session = Depends(get_db)):
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail=f"FDR id={fdr_id} not found.")
    return _fdr_to_dict(fdr, db)


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/fdrs
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/fdrs")
def list_fdrs(db: Session = Depends(get_db)):
    fdrs = db.query(FDRRecord).all()
    return {"fdrs": [_fdr_to_dict(f, db) for f in fdrs]}


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/institutions
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/institutions")
def list_institutions(db: Session = Depends(get_db)):
    insts = db.query(Institution).all()
    return {"institutions": [
        {
            "id": i.id, "aishe_code": i.aishe_code, "name": i.name,
            "state": i.state, "category": i.category,
            "required_fdr_amount": i.required_fdr_amount,
            "pgrc_clearance": i.pgrc_clearance,
            "vigilance_clearance": i.vigilance_clearance,
            "grants_clearance": i.grants_clearance,
        } for i in insts
    ]}


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/audit
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/audit")
def get_audit_log(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return {"audit_log": [
        {
            "id": l.id, "timestamp": l.timestamp,
            "actor_role": l.actor_role, "actor_name": l.actor_name,
            "action": l.action, "fdr_id": l.fdr_id,
            "details": l.details,
            "prev_hash": l.prev_hash[:16] + "...",
            "curr_hash": l.curr_hash[:16] + "...",
            "prev_hash_full": l.prev_hash,
            "curr_hash_full": l.curr_hash,
        } for l in reversed(logs)
    ]}


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/settings  |  PUT /api/settings
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    keys = ["reminder_days", "math_tolerance_inr",
            "norm_engineering", "norm_pharmacy", "norm_mba_mca", "norm_architecture",
            "simulated_date"]
    data = {k: get_config(db, k) for k in keys}
    try:
        data["reminder_days_list"] = json.loads(data.get("reminder_days", "[90,60,30,7]"))
    except:
        data["reminder_days_list"] = [90, 60, 30, 7]
    return data


@app.put("/api/settings")
def update_settings(payload: dict, db: Session = Depends(get_db)):
    allowed = {"reminder_days", "math_tolerance_inr",
               "norm_engineering", "norm_pharmacy", "norm_mba_mca", "norm_architecture"}
    for k, v in payload.items():
        if k in allowed:
            if isinstance(v, list):
                set_config(db, k, json.dumps(v))
            else:
                set_config(db, k, str(v))

    append_audit_block(
        db,
        actor_role="SCRUTINY_MAKER",
        action="SYSTEM_CONFIG_UPDATED",
        details=f"AICTE APH rules & reminder settings updated: {list(payload.keys())}",
        actor_name="AICTE Regulation Bureau Officer",
    )
    return {"updated": True, "settings": payload}


# ─────────────────────────────────────────────────────────────────────────────
# ── POST /api/simulation/set-date
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/simulation/set-date")
def set_simulation_date(payload: dict, db: Session = Depends(get_db)):
    """
    Accepts { "days_offset": 0-180 } or { "date": "YYYY-MM-DD" }
    Returns updated FDR list with new lifecycle statuses + triggered notifications.
    """
    base = date(2026, 11, 1)
    if "days_offset" in payload:
        offset = int(payload["days_offset"])
        new_date = base + __import__("datetime").timedelta(days=offset)
    elif "date" in payload:
        new_date = date.fromisoformat(payload["date"])
    else:
        raise HTTPException(status_code=400, detail="Provide 'days_offset' or 'date'.")

    simulation_state.set_date(new_date)
    set_config(db, "simulated_date", str(new_date))

    # Evaluate all FDRs
    try:
        reminder_days = json.loads(get_config(db, "reminder_days", "[90,60,30,7]"))
    except:
        reminder_days = [90, 60, 30, 7]

    all_fdrs = db.query(FDRRecord).all()
    notifications = []
    escalations   = []

    for fdr in all_fdrs:
        if fdr.lifecycle_status in ("RELEASED", "ENCASHED"):
            continue
        mat  = date.fromisoformat(fdr.maturity_date)
        days = (mat - new_date).days
        inst_name = fdr.institution.name if fdr.institution else "Technical Institute"

        # Update lifecycle status
        if fdr.lifecycle_status not in ("RELEASE_REQUESTED", "RELEASE_RECOMMENDED"):
            if days < 0:
                is_new_overdue = fdr.lifecycle_status != "OVERDUE"
                fdr.lifecycle_status = "OVERDUE"
                msg = (
                    f"FDR {fdr.fdr_number} ({inst_name}) is OVERDUE by {abs(days)} days "
                    f"(Matured on {fdr.maturity_date}). Urgent escalation dispatched to Director, Regulation Bureau."
                )
                escalations.append({
                    "fdr_id": fdr.id,
                    "fdr_number": fdr.fdr_number,
                    "institution": inst_name,
                    "type": "OVERDUE_ESCALATION",
                    "channel": "DIRECTOR_ALERT_SMS_EMAIL",
                    "message": msg,
                    "days_overdue": abs(days),
                    "maturity_date": fdr.maturity_date,
                    "principal_amount": fdr.principal_amount,
                })
                # Log to hash chain if newly overdue or escalated
                if is_new_overdue:
                    append_audit_block(
                        db, actor_role="SYSTEM_AI",
                        action="OVERDUE_ESCALATED_TO_DIRECTOR",
                        details=msg, fdr_id=fdr.id,
                        actor_name="Time Machine Escalation Engine",
                        simulated_ts=new_date.isoformat() + "T00:00:00+05:30",
                    )
            elif days <= 90:
                fdr.lifecycle_status = "EXPIRING_SOON"
            else:
                fdr.lifecycle_status = "ACTIVE"

        # Generate reminder notifications for active/expiring FDRs
        if days >= 0:
            active_tier = None
            if days <= 7 and 7 in reminder_days:
                active_tier = 7
            elif days <= 30 and 30 in reminder_days:
                active_tier = 30
            elif days <= 60 and 60 in reminder_days:
                active_tier = 60
            elif days <= 90 and 90 in reminder_days:
                active_tier = 90

            if active_tier is not None:
                rem_msg = (
                    f"⚠ T-{active_tier} REMINDER: FDR {fdr.fdr_number} ({inst_name}) "
                    f"matures in {days} days on {fdr.maturity_date}. "
                    f"Principal: ₹{fdr.principal_amount:,.0f}."
                )
                notifications.append({
                    "fdr_id": fdr.id,
                    "fdr_number": fdr.fdr_number,
                    "institution": inst_name,
                    "type": f"T-{active_tier}_REMINDER",
                    "tier": f"T-{active_tier}",
                    "channel": "INSTITUTION_EMAIL_SMS",
                    "days_remaining": days,
                    "maturity_date": fdr.maturity_date,
                    "principal_amount": fdr.principal_amount,
                    "message": rem_msg,
                })

    db.commit()

    return {
        "success":        True,
        "new_date":       str(new_date),
        "simulated_date": str(new_date),
        "days_offset":    (new_date - base).days,
        "notifications":  notifications,
        "escalations":    escalations,
        "overdue_count":  sum(1 for f in all_fdrs if f.lifecycle_status == "OVERDUE"),
        "expiring_count": sum(1 for f in all_fdrs if f.lifecycle_status == "EXPIRING_SOON"),
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── PHASE 3: INDEPENDENT BANK VERIFICATION ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/fdrs/{fdr_id}/request-bank-verification")
def request_bank_verification(fdr_id: int, db: Session = Depends(get_db)):
    """
    Generates a cryptographically signed verification token,
    logs BANK_LINK_DISPATCHED in the SHA-256 audit log,
    and returns the magic link /bank-verify/{token}.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    if not fdr.bank_verify_token:
        fdr.bank_verify_token = secrets.token_urlsafe(24)
        db.commit()
        db.refresh(fdr)

    inst_name = fdr.institution.name if fdr.institution else "Technical Institute"
    branch_email = fdr.branch_email or f"branch.{fdr.ifsc_code.lower()}@bank.co.in"
    details = (
        f"Signed Bank Verification Magic Link dispatched for FDR {fdr.fdr_number} | "
        f"Bank: {fdr.issuing_bank} | Branch Email: {branch_email} | "
        f"Token: {fdr.bank_verify_token[:8]}..."
    )
    append_audit_block(
        db,
        actor_role="SCRUTINY_MAKER",
        action="BANK_LINK_DISPATCHED",
        details=details,
        fdr_id=fdr.id,
        actor_name="AICTE Regulation Bureau Scrutiny Officer",
    )

    magic_link = f"/bank-verify/{fdr.bank_verify_token}"
    return {
        "success": True,
        "fdr_id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "token": fdr.bank_verify_token,
        "magic_link": magic_link,
        "branch_email": branch_email,
        "issuing_bank": fdr.issuing_bank,
    }


@app.get("/api/bank-verify/{token}")
def get_bank_verification_data(token: str, db: Session = Depends(get_db)):
    """
    Validates the token and returns complete instrument details for the
    Bank Branch Manager verification view.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.bank_verify_token == token).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="Invalid or expired bank verification link.")

    inst = fdr.institution
    return {
        "success": True,
        "fdr_id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "issuing_bank": fdr.issuing_bank,
        "ifsc_code": fdr.ifsc_code,
        "branch_email": fdr.branch_email or f"branch.{fdr.ifsc_code.lower()}@bank.co.in",
        "institution_name": inst.name if inst else "Unknown",
        "aishe_code": inst.aishe_code if inst else "",
        "state": inst.state if inst else "",
        "principal_amount": fdr.principal_amount,
        "interest_rate": fdr.interest_rate,
        "issue_date": fdr.issue_date,
        "maturity_date": fdr.maturity_date,
        "printed_maturity_amount": fdr.printed_maturity_amount,
        "calculated_maturity_amount": fdr.calculated_maturity_amount,
        "is_joint_aicte": fdr.is_joint_aicte,
        "account_holder_text": fdr.account_holder_text,
        "trust_status": fdr.trust_status,
        "lifecycle_status": fdr.lifecycle_status,
        "bank_confirmed_at": fdr.bank_confirmed_at,
        "token": token,
    }


@app.post("/api/bank-verify/{token}/confirm")
def confirm_bank_verification(token: str, payload: dict, db: Session = Depends(get_db)):
    """
    Validates token, allows Bank Branch Manager to confirm or reject instrument,
    upgrades trust_status from AUTO_CHECKED to BANK_CONFIRMED (or FLAGGED),
    and logs BANK_CONFIRMED_AUTHENTICITY into SHA-256 hash chain.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.bank_verify_token == token).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="Invalid or expired verification token.")

    action = payload.get("action", "CONFIRM").upper()
    manager_name = payload.get("manager_name", "Chief Manager / Branch Head")
    remarks = payload.get(
        "remarks",
        "Digitally verified and confirmed unencumbered lien in favour of Member Secretary, AICTE."
    )
    now_ts = datetime.now(timezone.utc).isoformat()

    if action == "CONFIRM":
        fdr.trust_status = "BANK_CONFIRMED"
        fdr.bank_confirmed_at = now_ts
        db.commit()

        details = (
            f"FDR {fdr.fdr_number} confirmed by Bank Branch Manager ({manager_name}) | "
            f"Bank: {fdr.issuing_bank} (IFSC: {fdr.ifsc_code}) | "
            f"Lien marked to Member Secretary, AICTE confirmed. Remarks: {remarks}"
        )
        append_audit_block(
            db,
            actor_role="BANK_MANAGER",
            action="BANK_CONFIRMED_AUTHENTICITY",
            details=details,
            fdr_id=fdr.id,
            actor_name=manager_name,
        )

        return {
            "success": True,
            "fdr_id": fdr.id,
            "trust_status": "BANK_CONFIRMED",
            "bank_confirmed_at": now_ts,
            "message": "FDR authenticity and AICTE lien successfully confirmed by issuing bank.",
        }
    else:
        # Bank Manager disputes instrument
        fdr.trust_status = "FLAGGED"
        flags = json.loads(fdr.flags_json or "[]")
        flags.append({
            "code": "BANK_REJECTED_AUTHENTICITY",
            "reason": f"Issuing Bank Branch Manager disputed instrument authenticity: {remarks}",
            "severity": "BLOCK",
        })
        fdr.flags_json = json.dumps(flags)
        db.commit()

        details = (
            f"FDR {fdr.fdr_number} REJECTED / DISPUTED by Bank Branch Manager ({manager_name}) | "
            f"Reason: {remarks}"
        )
        append_audit_block(
            db,
            actor_role="BANK_MANAGER",
            action="BANK_REJECTED_AUTHENTICITY",
            details=details,
            fdr_id=fdr.id,
            actor_name=manager_name,
        )

        return {
            "success": False,
            "fdr_id": fdr.id,
            "trust_status": "FLAGGED",
            "message": "Instrument disputed by bank branch manager and flagged as non-genuine.",
        }


@app.post("/api/fdrs/{fdr_id}/simulate-cbs")
@app.post("/api/fdrs/{fdr_id}/simulate-cbs-check")
def simulate_cbs_check(fdr_id: int, db: Session = Depends(get_db)):
    """
    Tier-A Instant Core Banking Solution (CBS) API query.
    Direct integration simulator to bank CBS gateway (SBI, PNB, Canara, BoB).
    Upgrades trust_status to BANK_CONFIRMED and logs CBS_API_VERIFIED in SHA-256 chain.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    now_ts = datetime.now(timezone.utc).isoformat()
    fdr.trust_status = "BANK_CONFIRMED"
    fdr.bank_confirmed_at = now_ts
    db.commit()

    details = (
        f"Automated CBS API Query to {fdr.issuing_bank} Core Gateway (IFSC: {fdr.ifsc_code}) | "
        f"FDR {fdr.fdr_number} verified: Principal Rs.{fdr.principal_amount:,.0f}, "
        f"Lien 'AICTE-MS-LIEN-ACTIVE', Match: 100% | Trust Level Elevated to BANK_CONFIRMED"
    )
    append_audit_block(
        db,
        actor_role="SYSTEM_AI",
        action="CBS_API_VERIFIED",
        details=details,
        fdr_id=fdr.id,
        actor_name="Core Banking Solution (CBS) API Bridge",
    )

    return {
        "success": True,
        "fdr_id": fdr.id,
        "trust_status": "BANK_CONFIRMED",
        "bank_confirmed_at": now_ts,
        "message": f"Core Banking API check successful: {fdr.issuing_bank} confirms FDR & AICTE Lien.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── PHASE 5: CLAUSE 6.46 MAKER-CHECKER RELEASE & FORENSIC HASH CHAIN
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/fdrs/{fdr_id}/request-release")
def request_fdr_release(fdr_id: int, payload: dict | None = None, db: Session = Depends(get_db)):
    """
    Institution requests Clause 6.46 Release & Refund of Security Deposit.
    Uploads signed Affidavit-6 declaration.
    Sets lifecycle_status = RELEASE_REQUESTED.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    fdr.lifecycle_status = "RELEASE_REQUESTED"
    fdr.affidavit_6_uploaded = True
    db.commit()

    inst_name = fdr.institution.name if fdr.institution else "College"
    details = (
        f"Institution requested Clause 6.46 Release for FDR {fdr.fdr_number} ({inst_name}) | "
        f"Signed Affidavit-6 (11 Declarations) uploaded & submitted for 3-cell scrutiny."
    )
    append_audit_block(
        db,
        actor_role="INSTITUTION",
        action="CLAUSE_6_46_RELEASE_REQUESTED",
        details=details,
        fdr_id=fdr.id,
        actor_name=f"{inst_name} (Authorized Registrar)",
    )

    return {
        "success": True,
        "fdr_id": fdr.id,
        "lifecycle_status": "RELEASE_REQUESTED",
        "affidavit_6_uploaded": True,
        "message": "Clause 6.46 release request submitted. Routed to AICTE Scrutiny Officer (Maker) desk.",
    }


@app.post("/api/fdrs/{fdr_id}/submit-renewal")
def submit_fdr_renewal(fdr_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Institution submits a renewed FDR, linking it to the maturing instrument.
    Full audit trail and lineage preserved.
    """
    old_fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not old_fdr:
        raise HTTPException(status_code=404, detail="Original FDR not found.")

    new_fdr_num = payload.get("new_fdr_number", f"RNW-{old_fdr.fdr_number}")
    principal = float(payload.get("principal_amount", old_fdr.principal_amount))
    rate = float(payload.get("interest_rate", old_fdr.interest_rate))
    maturity_date = payload.get("maturity_date", "2031-11-01")
    issue_date = payload.get("issue_date", old_fdr.maturity_date)

    # Calculate renewed maturity amount
    calc_mat = old_fdr.calculated_maturity_amount or principal

    new_fdr = FDRRecord(
        institution_id=old_fdr.institution_id,
        fdr_number=new_fdr_num,
        issuing_bank=old_fdr.issuing_bank,
        ifsc_code=old_fdr.ifsc_code,
        branch_email=old_fdr.branch_email,
        is_scheduled_bank=old_fdr.is_scheduled_bank,
        account_holder_text=old_fdr.account_holder_text,
        is_joint_aicte=old_fdr.is_joint_aicte,
        principal_amount=principal,
        interest_rate=rate,
        issue_date=issue_date,
        maturity_date=maturity_date,
        printed_maturity_amount=calc_mat,
        calculated_maturity_amount=calc_mat,
        math_discrepancy=0.0,
        trust_status="SUBMITTED",
        lifecycle_status="ACTIVE",
        flags_json="[]",
        bbox_json="[]",
    )
    db.add(new_fdr)
    db.flush()

    old_fdr.lifecycle_status = "RENEWAL_SUBMITTED"
    old_fdr.replaced_by_fdr_id = new_fdr.id
    db.commit()

    details = (
        f"FDR Renewal submitted: Old FDR {old_fdr.fdr_number} linked to New Renewal FDR {new_fdr.fdr_number} "
        f"| Principal: Rs.{principal:,.0f} | New Maturity: {maturity_date}"
    )
    append_audit_block(
        db,
        actor_role="INSTITUTION",
        action="FDR_RENEWAL_SUBMITTED",
        details=details,
        fdr_id=old_fdr.id,
        actor_name=old_fdr.institution.name if old_fdr.institution else "College",
    )

    return {
        "success": True,
        "old_fdr_id": old_fdr.id,
        "new_fdr_id": new_fdr.id,
        "new_fdr_number": new_fdr.fdr_number,
        "message": f"Renewal FDR {new_fdr.fdr_number} created and linked to prior instrument.",
    }


@app.post("/api/institutions/{inst_id}/toggle-clearance")
def toggle_institution_clearance(inst_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Simulates internal AICTE Cell status changes (PGRC, Vigilance, Grants Bureau).
    Allows judges/evaluators to demo how release is automatically blocked if student disputes exist.
    """
    inst = db.query(Institution).filter(Institution.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    cell = payload.get("cell", "").lower()
    status = bool(payload.get("status", True))

    if cell == "pgrc":
        inst.pgrc_clearance = status
    elif cell == "vigilance":
        inst.vigilance_clearance = status
    elif cell == "grants":
        inst.grants_clearance = status
    else:
        raise HTTPException(status_code=400, detail="cell must be 'pgrc', 'vigilance', or 'grants'.")

    db.commit()

    cell_label = {
        "pgrc": "PGRC Cell (Student Fee-Refund & Salary Grievance)",
        "vigilance": "Vigilance Cell (CBI / CVC Inquiry)",
        "grants": "Grants Bureau (Unutilized Development Grants)",
    }.get(cell, cell)

    details = (
        f"Internal AICTE Clearance updated for {inst.name} | Cell: {cell_label} | "
        f"New Status: {'NOC GRANTED' if status else 'BLOCKED / INQUIRY PENDING'}"
    )
    append_audit_block(
        db,
        actor_role="SYSTEM_AI",
        action="CLEARANCE_STATUS_UPDATED",
        details=details,
        actor_name="AICTE Inter-Bureau Workflow Bridge",
    )

    return {
        "success": True,
        "institution_id": inst.id,
        "institution_name": inst.name,
        "pgrc_clearance": inst.pgrc_clearance,
        "vigilance_clearance": inst.vigilance_clearance,
        "grants_clearance": inst.grants_clearance,
        "message": f"{cell_label} status updated to {'NOC GRANTED' if status else 'BLOCKED'}.",
    }


@app.post("/api/fdrs/{fdr_id}/maker-recommend")
def maker_recommend_release(fdr_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Maker Action (Scrutiny Officer):
    Enforces Clause 6.46 3-Cell Gatekeeper (PGRC + Vigilance + Grants Bureau).
    Recommends release or forfeiture.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    inst = fdr.institution
    recommendation = payload.get("recommendation", "RECOMMEND_RELEASE")
    maker_name = payload.get("maker_name", "Sh. R.K. Verma (Scrutiny Officer)")
    remarks = payload.get("remarks", "All clearances verified under Clause 6.46. Release recommended.")

    if recommendation == "RECOMMEND_RELEASE":
        # Check 3-Cell Clearances Gatekeeper
        if not inst.pgrc_clearance:
            raise HTTPException(
                status_code=400,
                detail="Clause 6.46 Gatekeeper Blocked: PGRC Cell NOC missing. Institution has unresolved student fee-refund / faculty salary grievances.",
            )
        if not inst.vigilance_clearance:
            raise HTTPException(
                status_code=400,
                detail="Clause 6.46 Gatekeeper Blocked: Vigilance Cell NOC missing. Disciplinary / court inquiry pending.",
            )
        if not inst.grants_clearance:
            raise HTTPException(
                status_code=400,
                detail="Clause 6.46 Gatekeeper Blocked: Grants Bureau NOC missing. Unutilized AICTE development grant pending.",
            )

        fdr.lifecycle_status = "RELEASE_RECOMMENDED"
        fdr.maker_officer = maker_name
        db.commit()

        details = (
            f"Maker Scrutiny: Release RECOMMENDED for FDR {fdr.fdr_number} ({inst.name}) | "
            f"Officer: {maker_name} | Clearances: PGRC=✔, Vigilance=✔, Grants=✔. Remarks: {remarks}"
        )
        append_audit_block(
            db,
            actor_role="SCRUTINY_MAKER",
            action="RELEASE_RECOMMENDED",
            details=details,
            fdr_id=fdr.id,
            actor_name=maker_name,
        )

        return {
            "success": True,
            "fdr_id": fdr.id,
            "lifecycle_status": "RELEASE_RECOMMENDED",
            "maker_officer": maker_name,
            "message": "Maker scrutiny complete: 3 internal cell clearances verified. Recommended to Director (Checker).",
        }
    else:
        # Encashment / forfeiture recommendation
        fdr.lifecycle_status = "ENCASHED"
        fdr.maker_officer = maker_name
        db.commit()

        details = (
            f"Maker Scrutiny: FDR ENCASHMENT / FORFEITURE INVOKED for FDR {fdr.fdr_number} ({inst.name}) | "
            f"Officer: {maker_name} | Reason: Institutional default under APH Norms. Remarks: {remarks}"
        )
        append_audit_block(
            db,
            actor_role="SCRUTINY_MAKER",
            action="FDR_ENCASHED_FORFEITURE",
            details=details,
            fdr_id=fdr.id,
            actor_name=maker_name,
        )

        return {
            "success": True,
            "fdr_id": fdr.id,
            "lifecycle_status": "ENCASHED",
            "maker_officer": maker_name,
            "message": "FDR encashment invoked and security deposit forfeited to Council accounts.",
        }


@app.post("/api/fdrs/{fdr_id}/checker-approve")
def checker_approve_release(fdr_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Checker Action (Director, Regulation Bureau):
    Enforces strict Maker != Checker separation of powers.
    Issues final statutory Discharge NOC and elevates trust status to OFFICER_APPROVED.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    checker_name = payload.get("checker_name", "Dr. A. Mehta (Director, Regulation Bureau)")
    remarks = payload.get("remarks", "Final regulatory approval granted under Clause 6.46. Discharge NOC generated.")

    # Strict Maker-Checker separation check
    if fdr.maker_officer and checker_name.strip().lower() == fdr.maker_officer.strip().lower():
        raise HTTPException(
            status_code=400,
            detail="Statutory Violation: Maker and Checker cannot be the same officer. Separation of duties is strictly enforced.",
        )

    inst = fdr.institution
    if not (inst.pgrc_clearance and inst.vigilance_clearance and inst.grants_clearance):
        raise HTTPException(
            status_code=400,
            detail="Checker Gatekeeper Blocked: One or more cell clearances are invalid.",
        )

    fdr.lifecycle_status = "RELEASED"
    fdr.checker_officer = checker_name
    fdr.trust_status = "OFFICER_APPROVED"
    db.commit()

    details = (
        f"Checker Sign-off: Final Approval & Discharge NOC Issued for FDR {fdr.fdr_number} ({inst.name}) | "
        f"Director: {checker_name} | Maker: {fdr.maker_officer} | Security Deposit Released & Refund Authorized."
    )
    append_audit_block(
        db,
        actor_role="DIRECTOR_CHECKER",
        action="RELEASE_APPROVED_NOC_ISSUED",
        details=details,
        fdr_id=fdr.id,
        actor_name=checker_name,
    )

    return {
        "success": True,
        "fdr_id": fdr.id,
        "lifecycle_status": "RELEASED",
        "trust_status": "OFFICER_APPROVED",
        "checker_officer": checker_name,
        "message": "Statutory Discharge NOC issued. Instrument released and sealed in cryptographic ledger.",
    }


@app.get("/api/audit/verify")
def verify_audit_chain(db: Session = Depends(get_db)):
    """
    Forensic Ledger Verification:
    Recalculates every SHA-256 block hash from Genesis (0*64) to the tip.
    Guarantees 100% cryptographic tamper evidence for CAG/RTI inspections.
    """
    from models import GENESIS_HASH, _compute_hash

    blocks = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if not blocks:
        return {"valid": True, "total_blocks": 0, "message": "Ledger is empty."}

    prev_hash = GENESIS_HASH
    for b in blocks:
        if b.prev_hash != prev_hash:
            return {
                "valid": False,
                "tamper_detected": True,
                "broken_block_id": b.id,
                "expected_prev_hash": prev_hash,
                "actual_prev_hash": b.prev_hash,
                "message": f"Tampering detected at Block #{b.id}: prev_hash mismatch!",
            }
        recomputed = _compute_hash(
            b.prev_hash, b.timestamp, b.actor_role, b.action, b.fdr_id, b.details or ""
        )
        if b.curr_hash != recomputed:
            return {
                "valid": False,
                "tamper_detected": True,
                "broken_block_id": b.id,
                "message": f"Tampering detected at Block #{b.id}: curr_hash hash mismatch!",
            }
        prev_hash = b.curr_hash

    return {
        "valid": True,
        "tamper_detected": False,
        "total_blocks": len(blocks),
        "verified_blocks": len(blocks),
        "genesis_hash": GENESIS_HASH[:16] + "...",
        "tip_hash": prev_hash[:16] + "...",
        "message": "100% Tamper-Evident: All Blocks Cryptographically Verified",
    }


@app.get("/api/fdrs/{fdr_id}/export-audit-pdf")
def export_audit_pdf(fdr_id: int, db: Session = Depends(get_db)):
    """
    Generates official ReportLab AICTE Regulation Bureau Compliance & Discharge Certificate.
    Includes institution particulars, Trust Ladder milestones, Clause 6.46 clearances,
    Maker-Checker signatures, and full SHA-256 forensic audit hash table.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")

    inst = fdr.institution
    audit_blocks = db.query(AuditLog).filter(
        (AuditLog.fdr_id == fdr.id) | (AuditLog.fdr_id == None)
    ).order_by(AuditLog.id.asc()).all()

    pdf_bytes = generate_audit_certificate_pdf(fdr, inst, audit_blocks)

    filename = f"AICTE_Regulation_Bureau_Compliance_Certificate_{fdr.fdr_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@app.get("/api/audit/export-pdf")
def export_global_audit_pdf(db: Session = Depends(get_db)):
    """
    Generates the official AICTE Forensic SHA-256 Audit Certificate PDF for the active ledger.
    """
    fdr = db.query(FDRRecord).first()
    inst = fdr.institution if fdr else None
    audit_blocks = db.query(AuditLog).order_by(AuditLog.id.asc()).all()

    pdf_bytes = generate_audit_certificate_pdf(fdr, inst, audit_blocks)

    filename = f"AICTE_Regulation_Bureau_Forensic_Audit_Ledger_{simulation_state.current_date}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )








# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/banks/ifsc-lookup/{ifsc} (Real-Time Bank & Eligibility Lookup)
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/banks/ifsc-lookup/{ifsc}")
def lookup_ifsc(ifsc: str):
    """
    Real-time IFSC validation against RBI Scheduled Commercial Bank registry.
    Detects prohibited co-operative banks instantly.
    """
    code = ifsc.strip().upper()
    prefix = code[:4]
    from verification import SCHEDULED_BANK_IFSC_PREFIXES, _is_coop_bank, _is_scheduled_bank
    
    bank_name = SCHEDULED_BANK_IFSC_PREFIXES.get(prefix)
    if not bank_name:
        return {
            "found": False,
            "ifsc": code,
            "prefix": prefix,
            "bank_name": "Unregistered / Unknown Bank",
            "is_scheduled_bank": False,
            "is_cooperative": False,
            "eligible_for_aicte": False,
            "message": f"IFSC prefix '{prefix}' is not recognized in the RBI Scheduled Commercial Bank registry.",
        }
        
    is_coop = _is_coop_bank(bank_name, code)
    is_sched = _is_scheduled_bank(bank_name, code)
    eligible = is_sched and not is_coop
    
    return {
        "found": True,
        "ifsc": code,
        "prefix": prefix,
        "bank_name": bank_name,
        "is_scheduled_bank": is_sched,
        "is_scheduled_commercial_bank": eligible,
        "is_cooperative": is_coop,
        "eligible_for_aicte": eligible,
        "message": (
            "Eligible RBI Scheduled Commercial Bank under AICTE APH Norms."
            if eligible
            else f"Prohibited: '{bank_name}' is a Co-operative Bank. AICTE APH regulations strictly prohibit FDRs from Co-operative Banks."
        ),
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── POST /api/fdrs/{fdr_id}/flag-observation (Scrutiny Observation Remark)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/fdrs/{fdr_id}/flag-observation")
def flag_fdr_observation(fdr_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Scrutiny Officer records an official observation remark / clarification request.
    Routes the remark directly to the Institution's dashboard for replacement FDR upload.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")
        
    notes = (payload.get("observation_notes") or payload.get("remarks") or "").strip()
    officer_name = payload.get("officer_name", "Sh. R.K. Verma (Scrutiny Officer)")
    if not notes:
        raise HTTPException(status_code=400, detail="Observation remarks are required.")
        
    fdr.scrutiny_remarks = notes
    fdr.clarification_requested = True
    fdr.trust_status = "FLAGGED"
    db.commit()
    
    inst = fdr.institution
    inst_name = inst.name if inst else "Institution"
    details = (
        f"Scrutiny Observation flagged for FDR {fdr.fdr_number} ({inst_name}) | "
        f"Officer: {officer_name} | Remark: {notes}"
    )
    append_audit_block(
        db,
        actor_role="SCRUTINY_MAKER",
        action="CLARIFICATION_REQUESTED",
        details=details,
        fdr_id=fdr.id,
        actor_name=officer_name,
    )
    
    return {
        "success": True,
        "fdr_id": fdr.id,
        "fdr_number": fdr.fdr_number,
        "trust_status": "FLAGGED",
        "clarification_requested": True,
        "scrutiny_remarks": notes,
        "message": "Official scrutiny observation recorded and routed to Institution dashboard for rectification.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── POST /api/bank-verify/{token}/reject (Bank Branch Verification Rejection)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/api/bank-verify/{token}/reject")
def bank_reject_fdr(token: str, payload: dict, db: Session = Depends(get_db)):
    """
    Bank Branch Manager formally rejects the instrument in CBS records.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.bank_verify_token == token).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="Invalid verification token.")
        
    reason = payload.get("reason", "CBS record mismatch / Lien not marked in core banking system.")
    manager_name = payload.get("manager_name", "Branch Manager")
    
    fdr.trust_status = "FLAGGED"
    fdr.scrutiny_remarks = f"Bank Verification Rejected: {reason}"
    db.commit()
    
    details = (
        f"Bank Verification REJECTED for FDR {fdr.fdr_number} by {fdr.issuing_bank} | "
        f"Manager: {manager_name} | Reason: {reason}"
    )
    append_audit_block(
        db,
        actor_role="BANK_MANAGER",
        action="BANK_REJECTED_AUTHENTICITY",
        details=details,
        fdr_id=fdr.id,
        actor_name=f"{fdr.issuing_bank} Branch Manager",
    )
    
    return {
        "success": True,
        "fdr_id": fdr.id,
        "trust_status": "FLAGGED",
        "message": "Bank rejection recorded. Instrument flagged for regulatory inquiry.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# ── GET /api/fdrs/{fdr_id}/export-discharge-pdf (Official Discharge NOC PDF)
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/api/fdrs/{fdr_id}/export-discharge-pdf")
def export_discharge_pdf(fdr_id: int, db: Session = Depends(get_db)):
    """
    Generates official AICTE Regulation Bureau Discharge Order & Relinquishment of Lien
    Letter under Approval Process Handbook Clause 6.46.
    """
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise HTTPException(status_code=404, detail="FDR not found.")
        
    sim_date = str(simulation_state.current_date)
    pdf_bytes = generate_discharge_noc_letter_pdf(fdr.id, db, sim_date)
    filename = f"AICTE_Discharge_Order_FDR_{fdr.fdr_number}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )










