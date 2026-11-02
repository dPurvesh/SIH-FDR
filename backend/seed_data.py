"""
VISHWAS-FDR | Seed Data — 8 Institutions across 6 Indian States
Team OG-7 | SIH 2026 | PS-26265

Seeds realistic institutions and pre-populated FDRs so the dashboard,
Priority List, and State Risk Heatmap look rich on first boot.
"""
from __future__ import annotations

import json
from datetime import date, timedelta

from models import (
    AuditLog, FDRRecord, Institution, SessionLocal, SystemConfig,
    append_audit_block, create_tables,
)
from verification import calc_quarterly_compound

# Default simulated date
SIM_DATE = date(2026, 11, 1)


def _qcomp(p, r, issue, mat):
    return calc_quarterly_compound(p, r,
                                   date.fromisoformat(issue),
                                   date.fromisoformat(mat))


def seed_config(db):
    defaults = {
        "simulated_date":    "2026-11-01",
        "reminder_days":     "[90, 60, 30, 7]",
        "math_tolerance_inr": "100.0",
        "norm_engineering":  "3500000",
        "norm_pharmacy":     "1500000",
        "norm_mba_mca":      "1500000",
        "norm_architecture": "1500000",
    }
    for k, v in defaults.items():
        exists = db.query(SystemConfig).filter(SystemConfig.key == k).first()
        if not exists:
            db.add(SystemConfig(key=k, value=v))
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# Institution definitions
# ─────────────────────────────────────────────────────────────────────────────
INSTITUTIONS = [
    # id=1  — Maharashtra (Engineering, Genuine)
    {
        "aishe_code": "C-45102",
        "name": "Visvesvaraya Institute of Technology, Nagpur",
        "state": "Maharashtra",
        "category": "ENGINEERING_NEW",
        "required_fdr_amount": 3_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=2  — Maharashtra (Pharmacy, has tampered FDR)
    {
        "aishe_code": "C-77234",
        "name": "Apex College of Pharmacy, Pune",
        "state": "Maharashtra",
        "category": "PHARMACY",
        "required_fdr_amount": 1_500_000.0,
        "pgrc_clearance": False,       # ← BLOCKED: pending fee-refund dispute
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=3  — Karnataka (Engineering, expiring soon)
    {
        "aishe_code": "C-12034",
        "name": "Sai Vidya Institute of Technology, Bengaluru",
        "state": "Karnataka",
        "category": "ENGINEERING_NEW",
        "required_fdr_amount": 3_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=4  — Tamil Nadu (MBA, overdue)
    {
        "aishe_code": "C-30081",
        "name": "Annamalai School of Management, Chennai",
        "state": "Tamil Nadu",
        "category": "MBA_MCA",
        "required_fdr_amount": 1_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": False,  # ← Vigilance inquiry pending
        "grants_clearance": True,
    },
    # id=5  — Uttar Pradesh (Engineering, active)
    {
        "aishe_code": "C-58811",
        "name": "Harcourt Butler Technical University, Kanpur",
        "state": "Uttar Pradesh",
        "category": "ENGINEERING_NEW",
        "required_fdr_amount": 3_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=6  — Delhi (Architecture, release requested)
    {
        "aishe_code": "C-09921",
        "name": "School of Planning & Architecture, New Delhi",
        "state": "Delhi",
        "category": "ARCHITECTURE",
        "required_fdr_amount": 1_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=7  — Gujarat (Engineering, bank-confirmed)
    {
        "aishe_code": "C-61044",
        "name": "G.H. Patel College of Engineering, Vallabh Vidyanagar",
        "state": "Gujarat",
        "category": "ENGINEERING_NEW",
        "required_fdr_amount": 3_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
    # id=8  — Tamil Nadu (Pharmacy, officer-approved)
    {
        "aishe_code": "C-31199",
        "name": "PSG College of Pharmacy, Coimbatore",
        "state": "Tamil Nadu",
        "category": "PHARMACY",
        "required_fdr_amount": 1_500_000.0,
        "pgrc_clearance": True,
        "vigilance_clearance": True,
        "grants_clearance": True,
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# FDR definitions  (institution_id uses 1-based index of INSTITUTIONS list)
# ─────────────────────────────────────────────────────────────────────────────
def _fdr_rows(institution_ids: list[int]) -> list[dict]:
    """
    institution_ids: list of DB PKs in same order as INSTITUTIONS list.
    """
    i1, i2, i3, i4, i5, i6, i7, i8 = institution_ids

    rows = [
        # ── FDR 1: SBI Genuine — Visvesvaraya, Nagpur (matures 2027-01-15)
        {
            "institution_id": i1,
            "fdr_number": "SBI-FDR-2026-9901",
            "issuing_bank": "State Bank of India",
            "ifsc_code": "SBIN0004321",
            "branch_email": "branch.civillines.nagpur@sbi.co.in",
            "is_scheduled_bank": True,
            "account_holder_text": "Visvesvaraya Institute of Technology, Nagpur Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 3_500_000.0,
            "interest_rate": 7.0,
            "issue_date": "2026-11-01",
            "maturity_date": "2027-01-15",
            "printed_maturity_amount": None,   # filled below
            "trust_status": "AUTO_CHECKED",
            "lifecycle_status": "ACTIVE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
        # ── FDR 2: PNB Tampered — Apex Pharmacy, Pune
        {
            "institution_id": i2,
            "fdr_number": "PNB-FDR-2026-7742",
            "issuing_bank": "Punjab National Bank",
            "ifsc_code": "PUNB0112200",
            "branch_email": "branch.shivajinagar.pune@pnb.co.in",
            "is_scheduled_bank": True,
            "account_holder_text": "Apex College of Pharmacy, Pune Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 1_500_000.0,
            "interest_rate": 6.8,
            "issue_date": "2026-11-01",
            "maturity_date": "2031-11-01",
            "printed_maturity_amount": 2_650_000.0,  # doctored
            "trust_status": "FLAGGED",
            "lifecycle_status": "ACTIVE",
            "flags_json": json.dumps([{
                "code": "MATH_TAMPER_SUSPECTED",
                "reason": "Printed maturity ₹26,50,000 vs Calculated ₹21,01,424. Discrepancy ₹5,48,576.",
                "severity": "HIGH",
            }]),
            "affidavit_6_uploaded": False,
        },
        # ── FDR 3: Co-op Bank — Invalid (seeded as FLAGGED, not uploaded via endpoint)
        {
            "institution_id": i2,
            "fdr_number": "COOP-2026-1102",
            "issuing_bank": "Nagpur Nagrik Sahakari Co-operative Bank Ltd.",
            "ifsc_code": "NNSB0000101",
            "branch_email": "nnsb.dharampeth@gmail.com",
            "is_scheduled_bank": False,
            "account_holder_text": "Apex Engineering Trust",
            "is_joint_aicte": False,
            "principal_amount": 3_500_000.0,
            "interest_rate": 8.5,
            "issue_date": "2026-11-01",
            "maturity_date": "2028-11-01",
            "printed_maturity_amount": None,
            "trust_status": "FLAGGED",
            "lifecycle_status": "ACTIVE",
            "flags_json": json.dumps([
                {"code": "PROHIBITED_COOP_BANK",
                 "reason": "Co-operative Bank disallowed under AICTE APH.",
                 "severity": "HIGH"},
                {"code": "MISSING_AICTE_LIEN",
                 "reason": "No AICTE joint-holder or lien marker found.",
                 "severity": "HIGH"},
            ]),
            "affidavit_6_uploaded": False,
        },
        # ── FDR 4: Sai Vidya, Karnataka — EXPIRING_SOON (T-60 zone)
        {
            "institution_id": i3,
            "fdr_number": "CNR-FDR-2025-3309",
            "issuing_bank": "Canara Bank",
            "ifsc_code": "CNRB0005511",
            "branch_email": "branch.jayanagar.blr@canarabank.com",
            "is_scheduled_bank": True,
            "account_holder_text": "Sai Vidya Institute of Technology Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 3_500_000.0,
            "interest_rate": 6.5,
            "issue_date": "2024-10-01",
            "maturity_date": "2027-01-01",    # ~61 days from SIM_DATE → T-60
            "printed_maturity_amount": None,
            "trust_status": "BANK_CONFIRMED",
            "lifecycle_status": "EXPIRING_SOON",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
        # ── FDR 5: Annamalai, Tamil Nadu — OVERDUE (matured before SIM_DATE)
        {
            "institution_id": i4,
            "fdr_number": "IOB-FDR-2020-0812",
            "issuing_bank": "Indian Overseas Bank",
            "ifsc_code": "IOBA0002214",
            "branch_email": "branch.tnagar.chennai@iob.in",
            "is_scheduled_bank": True,
            "account_holder_text": "Annamalai School of Management Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 1_500_000.0,
            "interest_rate": 6.25,
            "issue_date": "2020-08-01",
            "maturity_date": "2026-08-01",   # ALREADY OVERDUE as of 2026-11-01
            "printed_maturity_amount": None,
            "trust_status": "BANK_CONFIRMED",
            "lifecycle_status": "OVERDUE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
        # ── FDR 6: HBTU Kanpur, UP — ACTIVE (T-90 zone)
        {
            "institution_id": i5,
            "fdr_number": "PNB-FDR-2024-5501",
            "issuing_bank": "Punjab National Bank",
            "ifsc_code": "PUNB0219900",
            "branch_email": "branch.civil.kanpur@pnb.co.in",
            "is_scheduled_bank": True,
            "account_holder_text": "Harcourt Butler Technical University Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 3_500_000.0,
            "interest_rate": 7.1,
            "issue_date": "2023-01-15",
            "maturity_date": "2027-01-25",   # ~85 days from SIM_DATE → T-90
            "printed_maturity_amount": None,
            "trust_status": "AUTO_CHECKED",
            "lifecycle_status": "ACTIVE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
        # ── FDR 7: SPA Delhi — RELEASE_REQUESTED (Clause 6.46 flow)
        {
            "institution_id": i6,
            "fdr_number": "HDFC-FDR-2018-7711",
            "issuing_bank": "HDFC Bank",
            "ifsc_code": "HDFC0001412",
            "branch_email": "branch.cp.delhi@hdfcbank.com",
            "is_scheduled_bank": True,
            "account_holder_text": "School of Planning & Architecture Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 1_500_000.0,
            "interest_rate": 7.5,
            "issue_date": "2018-06-01",
            "maturity_date": "2026-06-01",   # matured — release requested
            "printed_maturity_amount": None,
            "trust_status": "BANK_CONFIRMED",
            "lifecycle_status": "RELEASE_REQUESTED",
            "flags_json": "[]",
            "affidavit_6_uploaded": True,
        },
        # ── FDR 8: GCET Vallabh Vidyanagar — BANK_CONFIRMED, active
        {
            "institution_id": i7,
            "fdr_number": "BARB-FDR-2025-2234",
            "issuing_bank": "Bank of Baroda",
            "ifsc_code": "BARB0VALLABH",
            "branch_email": "branch.vallabh@bankofbaroda.com",
            "is_scheduled_bank": True,
            "account_holder_text": "G.H. Patel College of Engineering Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 3_500_000.0,
            "interest_rate": 6.9,
            "issue_date": "2025-03-01",
            "maturity_date": "2030-03-01",
            "printed_maturity_amount": None,
            "trust_status": "BANK_CONFIRMED",
            "lifecycle_status": "ACTIVE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
        # ── FDR 9: PSG Pharmacy, Coimbatore — OFFICER_APPROVED
        {
            "institution_id": i8,
            "fdr_number": "ICIC-FDR-2024-8801",
            "issuing_bank": "ICICI Bank",
            "ifsc_code": "ICIC0005543",
            "branch_email": "branch.rspuram.coimbatore@icicibank.com",
            "is_scheduled_bank": True,
            "account_holder_text": "PSG College of Pharmacy Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 1_500_000.0,
            "interest_rate": 7.25,
            "issue_date": "2024-04-01",
            "maturity_date": "2029-04-01",
            "printed_maturity_amount": None,
            "trust_status": "OFFICER_APPROVED",
            "lifecycle_status": "ACTIVE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
            "maker_officer": "Sh. R.K. Verma (Scrutiny Officer)",
            "checker_officer": "Dr. A. Mehta (Director, Regulation Bureau)",
        },
        # ── FDR 10: Sai Vidya Karnataka — second FDR SUBMITTED
        {
            "institution_id": i3,
            "fdr_number": "AXIS-FDR-2026-4417",
            "issuing_bank": "Axis Bank",
            "ifsc_code": "AXIS0001334",
            "branch_email": "branch.koramangala.blr@axisbank.com",
            "is_scheduled_bank": True,
            "account_holder_text": "Sai Vidya Institute of Technology Jointly with Member Secretary, AICTE",
            "is_joint_aicte": True,
            "principal_amount": 3_500_000.0,
            "interest_rate": 7.0,
            "issue_date": "2026-10-15",
            "maturity_date": "2028-10-15",
            "printed_maturity_amount": None,
            "trust_status": "SUBMITTED",
            "lifecycle_status": "ACTIVE",
            "flags_json": "[]",
            "affidavit_6_uploaded": False,
        },
    ]
    return rows


def _days_remaining(mat_date_str: str, sim_date: date = SIM_DATE) -> int:
    return (date.fromisoformat(mat_date_str) - sim_date).days


def seed_database():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Institution).count() > 0:
            print("[SEED] Database already seeded — skipping.")
            return

        print("[SEED] Seeding institutions and FDRs...")

        # Seed config
        seed_config(db)

        # Insert institutions
        inst_objs = []
        for inst_data in INSTITUTIONS:
            inst = Institution(**inst_data)
            db.add(inst)
            db.flush()
            inst_objs.append(inst)
        db.commit()
        institution_ids = [inst.id for inst in inst_objs]

        # Insert FDRs
        fdr_rows = _fdr_rows(institution_ids)
        fdr_objs = []
        for row in fdr_rows:
            # Calculate maturity amounts where None
            if row.get("printed_maturity_amount") is None:
                calc = _qcomp(
                    row["principal_amount"],
                    row["interest_rate"],
                    row["issue_date"],
                    row["maturity_date"],
                )
                row["printed_maturity_amount"] = calc
                row["calculated_maturity_amount"] = calc
                row["math_discrepancy"] = 0.0
            else:
                calc = _qcomp(
                    row["principal_amount"],
                    row["interest_rate"],
                    row["issue_date"],
                    row["maturity_date"],
                )
                row["calculated_maturity_amount"] = calc
                row["math_discrepancy"] = abs(row["printed_maturity_amount"] - calc)

            # bbox_json default
            row.setdefault("bbox_json", "[]")
            row.setdefault("rendered_image_path", None)
            row.setdefault("file_sha256", None)
            row.setdefault("bank_verify_token", None)
            row.setdefault("bank_confirmed_at", None)
            row.setdefault("maker_officer", None)
            row.setdefault("checker_officer", None)
            row.setdefault("replaced_by_fdr_id", None)

            fdr = FDRRecord(**row)
            db.add(fdr)
            db.flush()
            fdr_objs.append(fdr)

        db.commit()

        # Seed genesis audit block + one entry per FDR
        actor = "SYSTEM_AI"
        for fdr in fdr_objs:
            action_map = {
                "SUBMITTED":       "FDR_UPLOADED",
                "AUTO_CHECKED":    "AUTO_VERIFICATION_PASSED",
                "FLAGGED":         "AUTO_VERIFICATION_FLAGGED",
                "BANK_CONFIRMED":  "BANK_CONFIRMED_AUTHENTICITY",
                "OFFICER_APPROVED": "OFFICER_APPROVED_RECORD",
            }
            action = action_map.get(fdr.trust_status, "FDR_UPLOADED")
            details = (
                f"FDR {fdr.fdr_number} | {fdr.issuing_bank} | "
                f"Principal ₹{fdr.principal_amount:,.0f} | "
                f"Maturity {fdr.maturity_date} | Status: {fdr.trust_status}"
            )
            append_audit_block(db, actor, action, details, fdr_id=fdr.id)

        print(f"[SEED] OK: {len(inst_objs)} institutions, {len(fdr_objs)} FDRs, audit blocks seeded.")

    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    seed_database()
