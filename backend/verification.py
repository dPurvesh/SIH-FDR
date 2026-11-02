"""
VISHWAS-FDR | 5-Point AICTE APH Entry Verification Engine
Team OG-7 | SIH 2026 | PS-26265

Rules implemented:
  1. Quarterly Compound Interest Math Check         → MATH_TAMPER_SUSPECTED
  2. AICTE Joint-Holder / Lien Check                → MISSING_AICTE_LIEN
  3. RBI Scheduled Commercial Bank Check            → PROHIBITED_COOP_BANK
  4. Prescribed APH Deposit Norm Check              → SHORTFALL_IN_PRINCIPAL
  5. SHA-256 Duplicate & Format Guard               → DUPLICATE_INSTRUMENT
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF

# ─────────────────────────────────────────────────────────────────────────────
# RBI Scheduled Commercial Bank Registry (IFSC prefix → Bank name)
# ─────────────────────────────────────────────────────────────────────────────
SCHEDULED_BANK_IFSC_PREFIXES: dict[str, str] = {
    "SBIN": "State Bank of India",
    "PUNB": "Punjab National Bank",
    "CNRB": "Canara Bank",
    "BARB": "Bank of Baroda",
    "HDFC": "HDFC Bank",
    "ICIC": "ICICI Bank",
    "UBIN": "Union Bank of India",
    "BKID": "Bank of India",
    "IOBA": "Indian Overseas Bank",
    "ANDB": "Andhra Bank",
    "CORP": "Corporation Bank",
    "VIJB": "Vijaya Bank",
    "ALLA": "Allahabad Bank",
    "UCBA": "UCO Bank",
    "MAHB": "Bank of Maharashtra",
    "PSIB": "Punjab & Sind Bank",
    "INDB": "Indian Bank",
    "IDBI": "IDBI Bank",
    "AXIS": "Axis Bank",
    "KKBK": "Kotak Mahindra Bank",
    "YESB": "Yes Bank",
    "IDFC": "IDFC First Bank",
    "FDRL": "Federal Bank",
    "KARB": "Karnataka Bank",
    "KVBL": "Karur Vysya Bank",
    "LAVB": "Laxmi Vilas Bank",
    "SRCB": "Saraswat Bank",       # scheduled cooperative — check name for co-op
    "SIBL": "South Indian Bank",
    "TMBL": "Tamilnad Mercantile Bank",
    "DCBL": "DCB Bank",
    "RATN": "RBL Bank",
    "NKGS": "NKGSB Co-op Bank",   # co-op — will be caught by name check
    "MSNU": "Mudhol Co-op Bank",   # co-op
    "NNSB": "Nagpur Nagrik Sahakari Co-op Bank",  # co-op — prohibited
    "GDCB": "Goa Urban Co-op Bank",
}

# Names containing these keywords → Co-operative Bank (prohibited)
COOP_BANK_KEYWORDS = [
    "co-operative", "cooperative", "sahakari", "nagrik", "urban coop",
    "gramin bank", "urban co-op", "co op bank",
]

# AICTE lien / joint-holder keywords (case-insensitive)
AICTE_LIEN_KEYWORDS = [
    "jointly with aicte",
    "jointly with member secretary, aicte",
    "jointly with member secretary aicte",
    "lien marked to member secretary",
    "lien marked to aicte",
    "lien to member secretary",
    "lien to aicte",
    "member secretary, aicte",
]

# APH category deposit norms (INR)
CATEGORY_NORMS: dict[str, float] = {
    "ENGINEERING_NEW": 3_500_000.0,
    "PHARMACY":        1_500_000.0,
    "MBA_MCA":         1_500_000.0,
    "ARCHITECTURE":    1_500_000.0,
}
MATH_TOLERANCE_INR = 100.0  # configurable via SystemConfig


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Quarterly Compound Interest
# ─────────────────────────────────────────────────────────────────────────────
def calc_quarterly_compound(principal: float, rate_pct: float,
                             issue_dt: date, maturity_dt: date) -> float:
    """A = P * (1 + r/400)^(4n)  where n = exact years as float."""
    delta_days = (maturity_dt - issue_dt).days
    n = delta_days / 365.25
    A = principal * ((1 + rate_pct / 400) ** (4 * n))
    return round(A, 2)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: SHA-256 of file bytes
# ─────────────────────────────────────────────────────────────────────────────
def sha256_of_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# Helper: detect co-op bank by name
# ─────────────────────────────────────────────────────────────────────────────
def _is_coop_bank(bank_name: str, ifsc: str) -> bool:
    lower = bank_name.lower()
    if any(kw in lower for kw in COOP_BANK_KEYWORDS):
        return True
    prefix = ifsc[:4].upper() if ifsc else ""
    mapped = SCHEDULED_BANK_IFSC_PREFIXES.get(prefix, "")
    if any(kw in mapped.lower() for kw in COOP_BANK_KEYWORDS):
        return True
    return False


def _is_scheduled_bank(bank_name: str, ifsc: str) -> bool:
    if _is_coop_bank(bank_name, ifsc):
        return False
    prefix = ifsc[:4].upper() if ifsc else ""
    return prefix in SCHEDULED_BANK_IFSC_PREFIXES


def _has_aicte_lien(holder_text: str) -> bool:
    lower = holder_text.lower()
    return any(kw in lower for kw in AICTE_LIEN_KEYWORDS)


# ─────────────────────────────────────────────────────────────────────────────
# PDF OCR + Bounding-Box extraction using PyMuPDF
# ─────────────────────────────────────────────────────────────────────────────
def parse_fdr_fields_from_pdf_text(full_text: str) -> dict[str, Any]:
    """
    Intelligently parses all standard Indian Bank FDR fields directly from extracted PDF text.
    Eliminates hardcoded mock inputs and ensures real document-driven verification.
    """
    from datetime import datetime
    extracted: dict[str, Any] = {}

    # 1. FDR Number
    m = re.search(r'(?:FDR\s*No\.?|FDR\s*/\s*Receipt\s*Number|Receipt\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\-]+)', full_text, re.IGNORECASE)
    if m:
        extracted["fdr_number"] = m.group(1).strip()

    # 2. Bank Name
    m = re.search(r'Issuing\s*Bank\s*[:\-]?\s*([^\n\r]+)', full_text, re.IGNORECASE)
    if m:
        extracted["issuing_bank"] = m.group(1).strip()
    else:
        # Check first lines / known bank headers
        for bank_kw in [
            "STATE BANK OF INDIA", "PUNJAB NATIONAL BANK",
            "NAGPUR NAGRIK SAHAKARI CO-OPERATIVE BANK",
            "HDFC BANK", "ICICI BANK", "CANARA BANK", "BANK OF BARODA",
            "UNION BANK OF INDIA", "AXIS BANK", "KOTAK MAHINDRA BANK"
        ]:
            if bank_kw in full_text.upper():
                extracted["issuing_bank"] = bank_kw.title()
                break

    # 3. IFSC Code
    m = re.search(r'IFSC(?:\s*Code)?\s*[:\-]?\s*([A-Za-z]{4}0[A-Za-z0-9]{6})', full_text, re.IGNORECASE)
    if m:
        extracted["ifsc_code"] = m.group(1).strip().upper()

    # 4. Principal Amount
    m = re.search(r'Principal\s*Amount[^\n]*\n?\s*(?:Rs\.?|INR|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)', full_text, re.IGNORECASE)
    if m:
        try:
            extracted["principal_amount"] = float(m.group(1).replace(",", ""))
        except:
            pass

    # 5. Interest Rate
    m = re.search(r'(?:Annual\s*Interest\s*Rate|Interest\s*Rate|Rate\s*of\s*Interest)[^\n]*\n?\s*([0-9]+(?:\.[0-9]+)?)\s*%', full_text, re.IGNORECASE)
    if m:
        try:
            extracted["interest_rate"] = float(m.group(1))
        except:
            pass

    # 6. Date parser helper
    def parse_dt(s: str) -> str | None:
        s = s.strip()
        for fmt in ["%d-%B-%Y", "%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"]:
            try:
                return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
            except:
                pass
        return None

    m = re.search(r'Issue\s*Date\s*[:\-]?\s*([0-9]{1,2}-[A-Za-z]+-[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}/[0-9]{1,2}/[0-9]{4})', full_text, re.IGNORECASE)
    if m:
        dt = parse_dt(m.group(1))
        if dt:
            extracted["issue_date"] = dt

    m = re.search(r'Maturity\s*Date\s*[:\-]?\s*([0-9]{1,2}-[A-Za-z]+-[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}/[0-9]{1,2}/[0-9]{4})', full_text, re.IGNORECASE)
    if m:
        dt = parse_dt(m.group(1))
        if dt:
            extracted["maturity_date"] = dt

    # 7. Printed Maturity Amount
    m = re.search(r'Maturity\s*Amount[^\n]*\n?\s*(?:Rs\.?|INR|₹)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)', full_text, re.IGNORECASE)
    if m:
        try:
            extracted["printed_maturity_amount"] = float(m.group(1).replace(",", ""))
        except:
            pass

    # 8. Account Holder / Lien Marker
    m = re.search(r'(?:Account\s*Holder[^\n]*:)\s*\n?\s*([^\n\r]+(?:\n[^\n\r]+)?)', full_text, re.IGNORECASE)
    if m:
        extracted["account_holder_text"] = m.group(1).replace("\n", " ").strip()

    return extracted


def extract_pdf_data(pdf_bytes: bytes, render_dpi: int = 150) -> dict[str, Any]:
    """
    Open PDF from bytes, render page-1 to PNG, extract text blocks and
    bounding boxes for key FDR fields.
    Returns dict with keys: full_text, blocks, page_width, page_height, png_bytes
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc[0]

    # Render page to PNG
    mat = fitz.Matrix(render_dpi / 72, render_dpi / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    png_bytes = pix.tobytes("png")

    # Extract raw text
    full_text = page.get_text("text")

    # Extract word-level blocks with bounding boxes
    # Each item: (x0, y0, x1, y1, word, block_no, line_no, word_no)
    words = page.get_text("words")

    # Page dimensions (points) — for normalization to 0-1 scale
    rect = page.rect
    pw, ph = rect.width, rect.height

    doc.close()
    return {
        "full_text": full_text,
        "words": words,
        "page_width_pt": pw,
        "page_height_pt": ph,
        "png_bytes": png_bytes,
        "render_dpi": render_dpi,
    }


def _search_field_bbox(page_data: dict, search_terms: list[str]) -> list[dict]:
    """
    Search for terms using PyMuPDF page.search_for semantics via word-level scan.
    Returns list of bbox dicts: {x0,y0,x1,y1,label,matched_text} in POINT coords.
    """
    words = page_data["words"]
    full_text_lower = page_data["full_text"].lower()
    results = []
    for term in search_terms:
        term_lower = term.lower()
        if term_lower not in full_text_lower:
            continue
        # Approximate: find words that are part of the term
        term_words = term_lower.split()
        for i, w in enumerate(words):
            if w[4].lower() == term_words[0]:
                # check sequential words
                match = True
                matched = [w]
                for j, tw in enumerate(term_words[1:], 1):
                    if i + j < len(words) and words[i + j][4].lower() == tw:
                        matched.append(words[i + j])
                    else:
                        match = False
                        break
                if match:
                    x0 = min(m[0] for m in matched)
                    y0 = min(m[1] for m in matched)
                    x1 = max(m[2] for m in matched)
                    y1 = max(m[3] for m in matched)
                    results.append({
                        "x0": x0, "y0": y0, "x1": x1, "y1": y1,
                        "label": term, "matched_text": " ".join(m[4] for m in matched),
                    })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# Build SVG Bounding-Box overlay list for the frontend Evidence Viewer
# ─────────────────────────────────────────────────────────────────────────────
def _build_bbox_overlay(
    page_data: dict,
    field_results: dict[str, dict],   # field_key → {bbox, status, label, value}
) -> list[dict]:
    """
    Returns list of overlay objects:
    { x0_pct, y0_pct, x1_pct, y1_pct, status ("ok"|"fail"|"warn"), label, value }
    Coordinates normalized 0-1 relative to page size.
    """
    pw = page_data["page_width_pt"]
    ph = page_data["page_height_pt"]
    overlays = []
    for _key, info in field_results.items():
        bbox = info.get("bbox")
        if not bbox:
            continue
        overlays.append({
            "x0_pct": bbox["x0"] / pw,
            "y0_pct": bbox["y0"] / ph,
            "x1_pct": bbox["x1"] / pw,
            "y1_pct": bbox["y1"] / ph,
            "status": info.get("status", "ok"),
            "label": info.get("label", ""),
            "value": info.get("value", ""),
            "tooltip": info.get("tooltip", ""),
        })
    return overlays


# ─────────────────────────────────────────────────────────────────────────────
# ★ MAIN 5-POINT VERIFICATION ENGINE
# ─────────────────────────────────────────────────────────────────────────────
def run_verification_engine(
    pdf_bytes: bytes,
    submitted_data: dict,
    existing_sha256s: list[str],
    existing_fdr_numbers: list[str],
    db_norms: dict[str, float] | None = None,
    math_tolerance: float = MATH_TOLERANCE_INR,
) -> dict[str, Any]:
    """
    Run the full 5-point AICTE APH verification engine.

    submitted_data keys (from upload form or PDF extraction):
        fdr_number, issuing_bank, ifsc_code, account_holder_text,
        principal_amount, interest_rate, issue_date, maturity_date,
        printed_maturity_amount, institution_category

    Returns:
        {
          "pass": bool,
          "trust_status": "AUTO_CHECKED" | "FLAGGED",
          "flags": [...],
          "checks": {...},        # per-check detail
          "file_sha256": str,
          "page_data": {...},     # raw extraction
          "bbox_overlay": [...],  # SVG overlay coords
          "png_bytes": bytes,
          "calculated_maturity_amount": float,
          "math_discrepancy": float,
          "is_joint_aicte": bool,
          "is_scheduled_bank": bool,
        }
    """
    norms = db_norms or CATEGORY_NORMS
    flags: list[dict] = []
    checks: dict[str, dict] = {}
    field_results: dict[str, dict] = {}

    # ── Extract PDF data & Intelligently Parse Fields ─────────────────────────
    page_data = extract_pdf_data(pdf_bytes)
    full_text = page_data["full_text"]
    parsed_fields = parse_fdr_fields_from_pdf_text(full_text)

    # Active data: starts with genuinely parsed PDF text fields, overridden only by non-empty submitted inputs
    active_data = dict(parsed_fields)
    for k, v in submitted_data.items():
        if v is not None and v != "" and v != 0 and v != 0.0:
            active_data[k] = v

    # ── Step 0: SHA-256 ───────────────────────────────────────────────────────
    file_sha256 = sha256_of_bytes(pdf_bytes)

    # ── Step 5 (early): Duplicate Guard ──────────────────────────────────────
    fdr_number = str(active_data.get("fdr_number", "")).strip()
    is_duplicate_sha = file_sha256 in existing_sha256s
    is_duplicate_num = fdr_number.upper() in [n.upper() for n in existing_fdr_numbers]
    dup_pass = not (is_duplicate_sha or is_duplicate_num)
    dup_reason = ""
    if is_duplicate_sha:
        dup_reason = "Identical PDF file already exists in the system (SHA-256 collision)"
        flags.append({"code": "DUPLICATE_INSTRUMENT", "reason": dup_reason, "severity": "BLOCK"})
    elif is_duplicate_num:
        dup_reason = f"FDR number '{fdr_number}' already registered"
        flags.append({"code": "DUPLICATE_INSTRUMENT", "reason": dup_reason, "severity": "BLOCK"})
    checks["duplicate_guard"] = {
        "passed": dup_pass,
        "file_sha256": file_sha256,
        "fdr_number": fdr_number,
        "reason": dup_reason or "Unique instrument — no duplicate found",
    }

    # ── Step 1: Compound Interest Math Check ─────────────────────────────────
    try:
        principal   = float(active_data.get("principal_amount", 0))
        rate        = float(active_data.get("interest_rate", 0))
        issue_dt    = date.fromisoformat(str(active_data.get("issue_date", "2026-01-01")))
        mat_dt      = date.fromisoformat(str(active_data.get("maturity_date", "2027-01-01")))
        printed_amt = float(active_data.get("printed_maturity_amount", 0))

        calc_amt    = calc_quarterly_compound(principal, rate, issue_dt, mat_dt)
        discrepancy = abs(printed_amt - calc_amt)
        math_pass   = discrepancy <= math_tolerance

        if not math_pass:
            reason = (
                f"Printed maturity ₹{printed_amt:,.0f} vs Calculated ₹{calc_amt:,.0f}. "
                f"Discrepancy: ₹{discrepancy:,.0f} exceeds ₹{math_tolerance:.0f} tolerance. "
                f"Formula: A = {principal:,.0f}×(1+{rate}/400)^(4×{(mat_dt-issue_dt).days/365.25:.2f})"
            )
            flags.append({"code": "MATH_TAMPER_SUSPECTED", "reason": reason, "severity": "HIGH"})
        else:
            reason = (
                f"Quarterly compound check PASS. Calculated ₹{calc_amt:,.0f}, "
                f"Printed ₹{printed_amt:,.0f}, Δ=₹{discrepancy:,.0f}"
            )

        checks["math_check"] = {
            "passed": math_pass,
            "principal": principal,
            "rate_pct": rate,
            "issue_date": str(issue_dt),
            "maturity_date": str(mat_dt),
            "tenure_years": round((mat_dt - issue_dt).days / 365.25, 4),
            "formula": f"A = P×(1+r/400)^(4n) = {principal:,.0f}×(1+{rate}/400)^(4×{(mat_dt-issue_dt).days/365.25:.2f})",
            "calculated_maturity_amount": calc_amt,
            "printed_maturity_amount": printed_amt,
            "discrepancy_inr": discrepancy,
            "tolerance_inr": math_tolerance,
            "reason": reason,
        }

        # Bounding box for maturity amount field
        mat_amt_bboxes = _search_field_bbox(page_data, ["Maturity Amount", "Maturity Value", "Amount at Maturity"])
        if not mat_amt_bboxes:
            amt_str = f"{int(printed_amt):,}"
            mat_amt_bboxes = _search_field_bbox(page_data, [amt_str.replace(",", "")])
        if mat_amt_bboxes:
            field_results["maturity_amount"] = {
                "bbox": mat_amt_bboxes[0],
                "status": "ok" if math_pass else "fail",
                "label": "Maturity Amount",
                "value": f"₹{printed_amt:,.0f}",
                "tooltip": reason,
            }
    except Exception as e:
        calc_amt, discrepancy = 0.0, 0.0
        math_pass = False
        checks["math_check"] = {"passed": False, "reason": f"Parse error: {e}"}
        flags.append({"code": "MATH_TAMPER_SUSPECTED", "reason": f"Could not parse amounts: {e}", "severity": "HIGH"})

    # ── Step 2: AICTE Joint-Holder / Lien Check ──────────────────────────────
    holder_text = str(active_data.get("account_holder_text", "")).strip() or full_text
    is_joint = _has_aicte_lien(holder_text)
    if not is_joint:
        lien_reason = (
            "AICTE joint-holder / lien marker NOT found in account holder text. "
            "FDR must state 'Jointly with Member Secretary, AICTE' or equivalent."
        )
        flags.append({"code": "MISSING_AICTE_LIEN", "reason": lien_reason, "severity": "HIGH"})
    else:
        lien_reason = "AICTE joint-holder / lien confirmed in account holder text."

    checks["lien_check"] = {
        "passed": is_joint,
        "account_holder_text": holder_text[:300],
        "holder_text": holder_text[:300],
        "reason": lien_reason,
    }
    holder_bboxes = _search_field_bbox(page_data, ["Account Holder", "In favour of", "Depositor", "Jointly with"])
    if holder_bboxes:
        field_results["account_holder"] = {
            "bbox": holder_bboxes[0],
            "status": "ok" if is_joint else "fail",
            "label": "Account Holder / Lien",
            "value": holder_text[:80],
            "tooltip": lien_reason,
        }

    # ── Step 3: RBI Scheduled Commercial Bank Check ───────────────────────────
    bank_name = str(active_data.get("issuing_bank", "")).strip()
    ifsc_code = str(active_data.get("ifsc_code", "")).strip().upper()
    is_coop   = _is_coop_bank(bank_name, ifsc_code)
    is_sched  = _is_scheduled_bank(bank_name, ifsc_code)

    if is_coop:
        bank_reason = (
            f"'{bank_name}' is a Co-operative Bank. "
            "AICTE APH prohibits FDRs from Co-operative Banks. "
            "Only RBI Scheduled Commercial Banks are permitted."
        )
        flags.append({"code": "PROHIBITED_COOP_BANK", "reason": bank_reason, "severity": "HIGH"})
    elif not is_sched:
        bank_reason = (
            f"'{bank_name}' (IFSC: {ifsc_code}) is not in the RBI Scheduled Commercial Bank registry. "
            "Verify bank eligibility under AICTE APH norms."
        )
        flags.append({"code": "PROHIBITED_COOP_BANK", "reason": bank_reason, "severity": "MEDIUM"})
    else:
        bank_reason = f"'{bank_name}' confirmed as RBI Scheduled Commercial Bank."

    checks["bank_check"] = {
        "passed": is_sched and not is_coop,
        "bank_name": bank_name,
        "ifsc_code": ifsc_code,
        "is_scheduled": is_sched,
        "is_cooperative": is_coop,
        "reason": bank_reason,
    }
    bank_bboxes = _search_field_bbox(page_data, [bank_name, "Issuing Bank", "Bank Name"])
    if bank_bboxes:
        field_results["bank_name"] = {
            "bbox": bank_bboxes[0],
            "status": "fail" if (is_coop or not is_sched) else "ok",
            "label": "Issuing Bank",
            "value": bank_name,
            "tooltip": bank_reason,
        }

    # ── Step 4: Prescribed APH Norm Amount Check ─────────────────────────────
    category = str(active_data.get("institution_category", "ENGINEERING_NEW"))
    required = norms.get(category, CATEGORY_NORMS.get(category, 3_500_000.0))
    principal_ok = principal >= required
    if not principal_ok:
        shortfall = required - principal
        norm_reason = (
            f"Principal ₹{principal:,.0f} is below the required APH norm ₹{required:,.0f} "
            f"for category '{category}'. Shortfall: ₹{shortfall:,.0f}."
        )
        flags.append({"code": "SHORTFALL_IN_PRINCIPAL", "reason": norm_reason, "severity": "HIGH"})
    else:
        norm_reason = (
            f"Principal ₹{principal:,.0f} meets APH norm ₹{required:,.0f} for '{category}'."
        )

    checks["norm_check"] = {
        "passed": principal_ok,
        "institution_category": category,
        "required_amount": required,
        "principal_amount": principal,
        "shortfall": max(0.0, required - principal),
        "reason": norm_reason,
    }
    principal_bboxes = _search_field_bbox(page_data, ["Principal Amount", "Deposit Amount", "Amount"])
    if principal_bboxes:
        field_results["principal_amount"] = {
            "bbox": principal_bboxes[0],
            "status": "ok" if principal_ok else "fail",
            "label": "Principal Amount",
            "value": f"₹{principal:,.0f}",
            "tooltip": norm_reason,
        }

    # ── Determine overall trust status ───────────────────────────────────────
    has_flags = len(flags) > 0
    trust_status = "FLAGGED" if has_flags else "AUTO_CHECKED"
    overall_pass = not has_flags

    # Build SVG overlay
    bbox_overlay = _build_bbox_overlay(page_data, field_results)

    return {
        "pass": overall_pass,
        "trust_status": trust_status,
        "flags": flags,
        "checks": checks,
        "file_sha256": file_sha256,
        "extracted_fields": active_data,
        "page_data": {
            "full_text": full_text,
            "page_width_pt": page_data["page_width_pt"],
            "page_height_pt": page_data["page_height_pt"],
            "render_dpi": page_data["render_dpi"],
        },
        "bbox_overlay": bbox_overlay,
        "png_bytes": page_data["png_bytes"],
        "calculated_maturity_amount": calc_amt,
        "math_discrepancy": discrepancy,
        "is_joint_aicte": is_joint,
        "is_scheduled_bank": is_sched and not is_coop,
    }

