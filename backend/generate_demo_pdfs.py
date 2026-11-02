"""
VISHWAS-FDR | Synthetic FDR PDF Generator
Team OG-7 | SIH 2026 | PS-26265

Generates 3 realistic Indian Bank FDR PDFs for demo / testing:
  1_SBI_Genuine_FDR.pdf       → All checks PASS
  2_PNB_Tampered_Math_FDR.pdf → MATH_TAMPER_SUSPECTED
  3_CoopBank_Invalid_FDR.pdf  → PROHIBITED_COOP_BANK + MISSING_AICTE_LIEN
"""
from __future__ import annotations

import os
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

OUTPUT_DIR = Path(__file__).parent / "sample_fdrs"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Colour palette ──────────────────────────────────────────────────────────
NAVY       = colors.HexColor("#0D3B66")
GOLD       = colors.HexColor("#F4A261")
LIGHT_BLUE = colors.HexColor("#E8F4FD")
DARK_GRAY  = colors.HexColor("#333333")
GREEN      = colors.HexColor("#1B7A34")
RED        = colors.HexColor("#C0392B")
WHITE      = colors.white
OFF_WHITE  = colors.HexColor("#F9F9F9")


def _styles():
    base = getSampleStyleSheet()
    styles = {
        "bank_name": ParagraphStyle(
            "bank_name", parent=base["Heading1"],
            fontSize=18, textColor=WHITE, alignment=TA_CENTER,
            fontName="Helvetica-Bold", spaceAfter=2,
        ),
        "bank_tagline": ParagraphStyle(
            "bank_tagline", parent=base["Normal"],
            fontSize=8, textColor=colors.HexColor("#DDDDDD"),
            alignment=TA_CENTER, fontName="Helvetica",
        ),
        "doc_title": ParagraphStyle(
            "doc_title", parent=base["Heading2"],
            fontSize=14, textColor=NAVY, alignment=TA_CENTER,
            fontName="Helvetica-Bold", spaceBefore=6, spaceAfter=4,
        ),
        "fdr_no": ParagraphStyle(
            "fdr_no", parent=base["Normal"],
            fontSize=10, textColor=DARK_GRAY, alignment=TA_CENTER,
            fontName="Helvetica-BoldOblique",
        ),
        "section_head": ParagraphStyle(
            "section_head", parent=base["Normal"],
            fontSize=9, textColor=WHITE, fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=9, textColor=DARK_GRAY, fontName="Helvetica", leading=14,
        ),
        "value": ParagraphStyle(
            "value", parent=base["Normal"],
            fontSize=9, textColor=DARK_GRAY, fontName="Helvetica-Bold", leading=14,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"],
            fontSize=7.5, textColor=colors.HexColor("#555555"),
            alignment=TA_CENTER, fontName="Helvetica",
        ),
        "watermark": ParagraphStyle(
            "watermark", parent=base["Normal"],
            fontSize=7, textColor=colors.HexColor("#888888"),
            alignment=TA_CENTER, fontName="Helvetica-Oblique",
        ),
    }
    return styles


def _header_table(bank_name: str, bank_tagline: str, ifsc: str,
                  branch: str, styles: dict):
    """Dark navy header block with bank identity."""
    data = [
        [Paragraph(bank_name, styles["bank_name"])],
        [Paragraph(bank_tagline, styles["bank_tagline"])],
        [Paragraph(f"Branch: {branch}  |  IFSC: {ifsc}  |  An RBI Scheduled Commercial Bank",
                   styles["bank_tagline"])],
    ]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
    ]))
    return t


def _section_bar(label: str, styles: dict):
    data = [[Paragraph(f"  ▌  {label}", styles["section_head"])]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 4),
    ]))
    return t


def _detail_table(rows: list[tuple[str, str]], styles: dict):
    """Two-column key-value table."""
    data = [[Paragraph(k, styles["body"]), Paragraph(v, styles["value"])]
            for k, v in rows]
    t = Table(data, colWidths=[75 * mm, 95 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (1, 0), (1, -1), OFF_WHITE),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def _lien_box(holder_text: str, styles: dict):
    data = [[Paragraph(
        f"<b>Account Holder / Lien Marker:</b><br/>{holder_text}",
        ParagraphStyle("lien", parent=styles["body"], textColor=GREEN, leading=14),
    )]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E8F5E9")),
        ("BOX", (0, 0), (-1, -1), 1.5, GREEN),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    return t


def _lien_box_red(holder_text: str, styles: dict):
    data = [[Paragraph(
        f"<b>Account Holder / Depositor Name:</b><br/>{holder_text}",
        ParagraphStyle("lien_red", parent=styles["body"], textColor=RED, leading=14),
    )]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FDEDEC")),
        ("BOX", (0, 0), (-1, -1), 1.5, RED),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    return t


def _maturity_highlight(amount: str, note: str, ok: bool, styles: dict):
    clr  = GREEN if ok else RED
    bg   = colors.HexColor("#E8F5E9") if ok else colors.HexColor("#FDEDEC")
    data = [[
        Paragraph(
            f"<b>Maturity Amount (As printed on receipt):</b><br/>"
            f"<font size='16' color='{clr.hexval()}'><b>{amount}</b></font><br/>"
            f"<font size='7.5'>{note}</font>",
            ParagraphStyle("mat", parent=styles["body"], leading=18),
        )
    ]]
    t = Table(data, colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 2, clr),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))
    return t


def _signature_table(styles: dict):
    data = [[
        Paragraph("Authorised Signatory", styles["body"]),
        Paragraph("Branch Manager / Senior Officer", styles["body"]),
        Paragraph("Bank Seal & Date", styles["body"]),
    ]]
    t = Table(data, colWidths=[57*mm, 57*mm, 56*mm])
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#AAAAAA")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",    (0, 0), (-1, -1), 20),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    return t


# ─────────────────────────────────────────────────────────────────────────────
# Helper: quarterly compound
# ─────────────────────────────────────────────────────────────────────────────
def _qcomp(p: float, r: float, issue: date, mat: date) -> float:
    n = (mat - issue).days / 365.25
    return round(p * ((1 + r / 400) ** (4 * n)), 2)


def _inr(v: float) -> str:
    """Format as Indian Rupee string with lakhs notation."""
    s = f"{v:,.2f}"
    # Convert to INR format
    parts = s.split(".")
    integer_part = parts[0].replace(",", "")
    dec = parts[1] if len(parts) > 1 else "00"
    n = integer_part
    if len(n) > 3:
        last3 = n[-3:]
        rest = n[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        groups.insert(0, rest)
        formatted = ",".join(groups) + "," + last3
    else:
        formatted = n
    return f"Rs. {formatted}.{dec}"


# ─────────────────────────────────────────────────────────────────────────────
# FDR 1 — SBI Genuine
# ─────────────────────────────────────────────────────────────────────────────
def generate_sbi_genuine():
    path = OUTPUT_DIR / "1_SBI_Genuine_FDR.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4,
                            topMargin=10*mm, bottomMargin=15*mm,
                            leftMargin=20*mm, rightMargin=20*mm)
    s = _styles()

    issue_dt  = date(2026, 11, 1)
    mat_dt    = date(2027, 1, 15)
    principal = 3_500_000.0
    rate      = 7.0
    calc_amt  = _qcomp(principal, rate, issue_dt, mat_dt)  # exact match

    story = [
        _header_table("STATE BANK OF INDIA",
                      "A Government of India Undertaking | Founded 1955",
                      "SBIN0004321", "Civil Lines Branch, Nagpur - 440001", s),
        Spacer(1, 4*mm),
        Paragraph("FIXED DEPOSIT RECEIPT", s["doc_title"]),
        Paragraph("FDR No: SBI-FDR-2026-9901  |  Receipt Type: Term Deposit",
                  s["fdr_no"]),
        Spacer(1, 3*mm),
        _section_bar("INSTRUMENT DETAILS", s),
        _detail_table([
            ("FDR / Receipt Number",    "SBI-FDR-2026-9901"),
            ("Issuing Bank",            "State Bank of India"),
            ("Branch Name & Code",      "Civil Lines, Nagpur — SBIN0004321"),
            ("Account Number",          "38729401009900"),
            ("Issue Date",              "01-November-2026"),
            ("Maturity Date",           "15-January-2027"),
            ("Tenure",                  "75 Days (approx.)"),
            ("Annual Interest Rate",    "7.00% per annum (Quarterly Compounding)"),
            ("Principal Amount",        _inr(principal)),
            ("Amount in Words",         "Rupees Thirty-Five Lakhs Only"),
        ], s),
        Spacer(1, 3*mm),
        _section_bar("ACCOUNT HOLDER & LIEN DETAILS", s),
        Spacer(1, 2*mm),
        _lien_box(
            "Visvesvaraya Institute of Technology, Nagpur\n"
            "Jointly with Member Secretary, AICTE, Nelson Mandela Marg, New Delhi — 110070\n"
            "Lien Marked to: Member Secretary, AICTE (AISHE Code: C-45102)",
            s,
        ),
        Spacer(1, 3*mm),
        _section_bar("MATURITY AMOUNT", s),
        Spacer(1, 2*mm),
        _maturity_highlight(
            _inr(calc_amt),
            f"Calculated using quarterly compounding: A = {_inr(principal)} × (1 + 7.00/400)^(4 × {(mat_dt-issue_dt).days/365.25:.4f})",
            ok=True, styles=s,
        ),
        Spacer(1, 4*mm),
        _section_bar("DECLARATION & AUTHORISATION", s),
        Spacer(1, 2*mm),
        Paragraph(
            "This Fixed Deposit Receipt is issued subject to the terms and conditions of State Bank of India. "
            "The deposit is non-transferable and the maturity amount will be paid on the date of maturity upon "
            "surrender of this receipt duly signed by the depositor(s) and subject to applicable TDS. "
            "This FDR is pledged as Security Deposit with AICTE as per APH norms.",
            s["body"],
        ),
        Spacer(1, 5*mm),
        _signature_table(s),
        Spacer(1, 4*mm),
        HRFlowable(width="100%", thickness=0.5, color=NAVY),
        Spacer(1, 2*mm),
        Paragraph(
            "AICTE APH Compliance Certificate No: SBI/AICTE/2026/9901 | "
            "Generated for VISHWAS-FDR Portal | SIH 2026 Demo",
            s["footer"],
        ),
        Paragraph(
            "This is a digitally generated specimen FDR for demonstration purposes.",
            s["watermark"],
        ),
    ]
    doc.build(story)
    print(f"[PDF] Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────────────────────────
# FDR 2 — PNB Tampered Math
# ─────────────────────────────────────────────────────────────────────────────
def generate_pnb_tampered():
    path = OUTPUT_DIR / "2_PNB_Tampered_Math_FDR.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4,
                            topMargin=10*mm, bottomMargin=15*mm,
                            leftMargin=20*mm, rightMargin=20*mm)
    s = _styles()

    issue_dt     = date(2026, 11, 1)
    mat_dt       = date(2031, 11, 1)
    principal    = 1_500_000.0
    rate         = 6.8
    calc_amt     = _qcomp(principal, rate, issue_dt, mat_dt)   # ~21,01,424
    doctored_amt = 2_650_000.0   # printed on the receipt — DOCTORED!
    discrepancy  = doctored_amt - calc_amt

    story = [
        _header_table("PUNJAB NATIONAL BANK",
                      "India's International Bank | Est. 1894",
                      "PUNB0112200", "Shivajinagar Branch, Pune — 411005", s),
        Spacer(1, 4*mm),
        Paragraph("FIXED DEPOSIT RECEIPT", s["doc_title"]),
        Paragraph("FDR No: PNB-FDR-2026-7742  |  Receipt Type: Term Deposit",
                  s["fdr_no"]),
        Spacer(1, 3*mm),
        _section_bar("INSTRUMENT DETAILS", s),
        _detail_table([
            ("FDR / Receipt Number",    "PNB-FDR-2026-7742"),
            ("Issuing Bank",            "Punjab National Bank"),
            ("Branch Name & Code",      "Shivajinagar, Pune — PUNB0112200"),
            ("Account Number",          "5099000100277421"),
            ("Issue Date",              "01-November-2026"),
            ("Maturity Date",           "01-November-2031"),
            ("Tenure",                  "5 Years"),
            ("Annual Interest Rate",    "6.80% per annum (Quarterly Compounding)"),
            ("Principal Amount",        _inr(principal)),
            ("Amount in Words",         "Rupees Fifteen Lakhs Only"),
        ], s),
        Spacer(1, 3*mm),
        _section_bar("ACCOUNT HOLDER & LIEN DETAILS", s),
        Spacer(1, 2*mm),
        _lien_box(
            "Apex College of Pharmacy, Pune\n"
            "Jointly with Member Secretary, AICTE, Nelson Mandela Marg, New Delhi — 110070\n"
            "Lien Marked to: Member Secretary, AICTE (AISHE Code: C-77234)",
            s,
        ),
        Spacer(1, 3*mm),
        _section_bar("MATURITY AMOUNT", s),
        Spacer(1, 2*mm),
        _maturity_highlight(
            _inr(doctored_amt),
            f"⚠ NOTE FOR VISHWAS-FDR DEMO: This amount has been DOCTORED. "
            f"True quarterly compound = {_inr(calc_amt)} | "
            f"Discrepancy = +{_inr(discrepancy)} (fraudulently inflated)",
            ok=False, styles=s,
        ),
        Spacer(1, 4*mm),
        _section_bar("DECLARATION & AUTHORISATION", s),
        Spacer(1, 2*mm),
        Paragraph(
            "This Fixed Deposit Receipt is issued subject to the terms and conditions of Punjab National Bank. "
            "The deposit is non-transferable and the maturity amount will be paid on the date of maturity upon "
            "surrender of this receipt duly signed by the depositor(s). "
            "This FDR is pledged as Security Deposit with AICTE as per APH norms.",
            s["body"],
        ),
        Spacer(1, 5*mm),
        _signature_table(s),
        Spacer(1, 4*mm),
        HRFlowable(width="100%", thickness=0.5, color=NAVY),
        Spacer(1, 2*mm),
        Paragraph(
            "⚠ VISHWAS-FDR DEMO: This PDF intentionally contains a doctored Maturity Amount "
            f"(+₹{discrepancy:,.0f} over true compound interest) to demonstrate MATH_TAMPER_SUSPECTED detection.",
            s["footer"],
        ),
    ]
    doc.build(story)
    print(f"[PDF] Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────────────────────────
# FDR 3 — Co-op Bank + Missing Lien
# ─────────────────────────────────────────────────────────────────────────────
def generate_coop_invalid():
    path = OUTPUT_DIR / "3_CoopBank_Invalid_FDR.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4,
                            topMargin=10*mm, bottomMargin=15*mm,
                            leftMargin=20*mm, rightMargin=20*mm)
    s = _styles()

    issue_dt  = date(2026, 11, 1)
    mat_dt    = date(2028, 11, 1)
    principal = 3_500_000.0
    rate      = 8.5
    calc_amt  = _qcomp(principal, rate, issue_dt, mat_dt)

    # Override header style for co-op bank — no AICTE flag
    coop_header_style = ParagraphStyle(
        "coop_h", fontSize=18, textColor=WHITE, alignment=TA_CENTER,
        fontName="Helvetica-Bold", spaceAfter=2,
    )
    coop_tag_style = ParagraphStyle(
        "coop_t", fontSize=8, textColor=colors.HexColor("#DDDDDD"),
        alignment=TA_CENTER, fontName="Helvetica",
    )

    hdr_data = [
        [Paragraph("NAGPUR NAGRIK SAHAKARI CO-OPERATIVE BANK LTD.", coop_header_style)],
        [Paragraph("Reg. No. MH/NSK/1432 | RBI Lic No. ACD/B.136/NAG | IFSC: NNSB0000101",
                   coop_tag_style)],
        [Paragraph("Dharampeth Branch, Nagpur — 440010", coop_tag_style)],
    ]
    hdr_t = Table(hdr_data, colWidths=[170*mm])
    hdr_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#7B1D1D")),  # dark red = danger
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
    ]))

    story = [
        hdr_t,
        Spacer(1, 4*mm),
        Paragraph("FIXED DEPOSIT RECEIPT", s["doc_title"]),
        Paragraph("FDR No: COOP-2026-1102  |  Receipt Type: Term Deposit",
                  s["fdr_no"]),
        Spacer(1, 3*mm),
        _section_bar("INSTRUMENT DETAILS", s),
        _detail_table([
            ("FDR / Receipt Number",    "COOP-2026-1102"),
            ("Issuing Bank",            "Nagpur Nagrik Sahakari Co-operative Bank Ltd."),
            ("Branch Name & Code",      "Dharampeth, Nagpur — NNSB0000101"),
            ("Account Number",          "NNSB-DEP-2026-4401"),
            ("Issue Date",              "01-November-2026"),
            ("Maturity Date",           "01-November-2028"),
            ("Tenure",                  "2 Years"),
            ("Annual Interest Rate",    f"{rate:.2f}% per annum (Quarterly Compounding)"),
            ("Principal Amount",        _inr(principal)),
            ("Amount in Words",         "Rupees Thirty-Five Lakhs Only"),
        ], s),
        Spacer(1, 3*mm),
        _section_bar("ACCOUNT HOLDER DETAILS", s),
        Spacer(1, 2*mm),
        _lien_box_red(
            "Apex Engineering Trust\n"
            "Plot No. 14, Amravati Road, Nagpur — 440033\n"
            "(Note: NO AICTE Joint-Holder or Lien Marker present on this instrument)",
            s,
        ),
        Spacer(1, 3*mm),
        _section_bar("MATURITY AMOUNT", s),
        Spacer(1, 2*mm),
        _maturity_highlight(
            _inr(calc_amt),
            f"Calculated: {_inr(principal)} × (1 + {rate}/400)^(4 × {(mat_dt-issue_dt).days/365.25:.2f}) = {_inr(calc_amt)}",
            ok=True, styles=s,
        ),
        Spacer(1, 4*mm),
        _section_bar("DECLARATION & AUTHORISATION", s),
        Spacer(1, 2*mm),
        Paragraph(
            "This Fixed Deposit Receipt is issued by Nagpur Nagrik Sahakari Co-operative Bank Ltd. "
            "subject to its internal terms and conditions.",
            s["body"],
        ),
        Spacer(1, 5*mm),
        _signature_table(s),
        Spacer(1, 4*mm),
        HRFlowable(width="100%", thickness=0.5, color=RED),
        Spacer(1, 2*mm),
        Paragraph(
            "⚠ VISHWAS-FDR DEMO: This FDR will trigger TWO flags — "
            "(1) PROHIBITED_COOP_BANK: Co-operative banks are disallowed under AICTE APH. "
            "(2) MISSING_AICTE_LIEN: No 'Jointly with AICTE' lien marker present.",
            s["footer"],
        ),
    ]
    doc.build(story)
    print(f"[PDF] Generated: {path}")
    return path


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
def generate_all():
    generate_sbi_genuine()
    generate_pnb_tampered()
    generate_coop_invalid()
    print("[PDF] All 3 sample FDR PDFs generated successfully.")


if __name__ == "__main__":
    generate_all()

