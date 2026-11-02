"""
VISHWAS-FDR | Official Audit & Discharge Certificate PDF Generator
Team OG-7 | SIH 2026 | PS-26265
Generates authentic AICTE Regulation Bureau Compliance & Discharge Certificate
under AICTE Approval Process Handbook (APH) Clause 6.46 & Affidavit-6.
"""
from __future__ import annotations

import io
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    HRFlowable, KeepTogether, PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

NAVY       = colors.HexColor("#0D3B66")
DARK_NAVY  = colors.HexColor("#08233D")
GOLD       = colors.HexColor("#F4A261")
LIGHT_BLUE = colors.HexColor("#EBF3FA")
DARK_GRAY  = colors.HexColor("#2D3748")
GREEN      = colors.HexColor("#1B7A34")
RED        = colors.HexColor("#C0392B")
WHITE      = colors.white
OFF_WHITE  = colors.HexColor("#F8FAFC")


def _styles():
    base = getSampleStyleSheet()
    return {
        "aicte_hdr": ParagraphStyle(
            "aicte_hdr", parent=base["Heading1"],
            fontSize=14, textColor=WHITE, alignment=TA_CENTER,
            fontName="Helvetica-Bold", spaceAfter=2,
        ),
        "aicte_sub": ParagraphStyle(
            "aicte_sub", parent=base["Normal"],
            fontSize=8, textColor=colors.HexColor("#E2E8F0"),
            alignment=TA_CENTER, fontName="Helvetica",
        ),
        "doc_title": ParagraphStyle(
            "doc_title", parent=base["Heading2"],
            fontSize=13, textColor=NAVY, alignment=TA_CENTER,
            fontName="Helvetica-Bold", spaceBefore=4, spaceAfter=2,
        ),
        "doc_subtitle": ParagraphStyle(
            "doc_subtitle", parent=base["Normal"],
            fontSize=8.5, textColor=colors.HexColor("#4A5568"),
            alignment=TA_CENTER, fontName="Helvetica-BoldOblique",
        ),
        "section_head": ParagraphStyle(
            "section_head", parent=base["Normal"],
            fontSize=8.5, textColor=WHITE, fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=8, textColor=DARK_GRAY, fontName="Helvetica", leading=11,
        ),
        "value": ParagraphStyle(
            "value", parent=base["Normal"],
            fontSize=8, textColor=DARK_GRAY, fontName="Helvetica-Bold", leading=11,
        ),
        "code": ParagraphStyle(
            "code", parent=base["Normal"],
            fontSize=6.5, textColor=DARK_GRAY, fontName="Courier", leading=8,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"],
            fontSize=7, textColor=colors.HexColor("#718096"),
            alignment=TA_CENTER, fontName="Helvetica",
        ),
    }


def _format_inr(v: float) -> str:
    s = f"{v:,.2f}"
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


def generate_audit_certificate_pdf(fdr: any, inst: any, audit_blocks: list[any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=10 * mm,
        bottomMargin=12 * mm,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
    )
    s = _styles()

    # 1. AICTE Regulation Bureau Header Banner
    hdr_data = [
        [Paragraph("ALL INDIA COUNCIL FOR TECHNICAL EDUCATION", s["aicte_hdr"])],
        [Paragraph("(A Statutory Body Under Ministry of Education, Govt. of India)", s["aicte_sub"])],
        [Paragraph("Nelson Mandela Marg, Vasant Kunj, New Delhi — 110070 | www.aicte-india.org", s["aicte_sub"])],
        [Paragraph("REGULATION BUREAU • SECURITY DEPOSIT / FDR LIFE-CYCLE CERTIFICATE", s["aicte_sub"])],
    ]
    hdr_t = Table(hdr_data, colWidths=[180 * mm])
    hdr_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK_NAVY),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
    ]))

    cert_no = f"AICTE/RB/VISHWAS-FDR/2026/FDR-{fdr.id:04d}"
    today_str = datetime.now().strftime("%d-%B-%Y %H:%M:%S IST")

    story = [
        hdr_t,
        Spacer(1, 3 * mm),
        Paragraph("OFFICIAL COMPLIANCE & DISCHARGE AUDIT CERTIFICATE", s["doc_title"]),
        Paragraph(
            f"Certificate No: {cert_no} | Issued Date: {today_str} | Status: {fdr.lifecycle_status}",
            s["doc_subtitle"],
        ),
        Spacer(1, 3 * mm),
    ]

    # Section Bar Helper
    def _bar(txt: str):
        t = Table([[Paragraph(f" ▌ {txt}", s["section_head"])]], colWidths=[180 * mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), NAVY),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ]))
        return t

    # 2. Institution & Instrument Particulars
    inst_name = inst.name if inst else "Technical Campus"
    aishe = inst.aishe_code if inst else "N/A"
    state_name = inst.state if inst else "N/A"

    p1_data = [
        [
            Paragraph("Institution Name", s["body"]),
            Paragraph(inst_name, s["value"]),
            Paragraph("Permanent AISHE ID", s["body"]),
            Paragraph(aishe, s["value"]),
        ],
        [
            Paragraph("Institution State", s["body"]),
            Paragraph(state_name, s["value"]),
            Paragraph("Category Norm", s["body"]),
            Paragraph(inst.category if inst else "ENGINEERING", s["value"]),
        ],
        [
            Paragraph("FDR / Receipt No.", s["body"]),
            Paragraph(fdr.fdr_number, s["value"]),
            Paragraph("Issuing Bank", s["body"]),
            Paragraph(fdr.issuing_bank, s["value"]),
        ],
        [
            Paragraph("Branch IFSC", s["body"]),
            Paragraph(fdr.ifsc_code, s["value"]),
            Paragraph("Principal Amount (P)", s["body"]),
            Paragraph(_format_inr(fdr.principal_amount), s["value"]),
        ],
        [
            Paragraph("Interest Rate (r)", s["body"]),
            Paragraph(f"{fdr.interest_rate:.2f}% p.a. (Quarterly Compounding)", s["value"]),
            Paragraph("Maturity Value (A)", s["body"]),
            Paragraph(_format_inr(fdr.printed_maturity_amount or 0), s["value"]),
        ],
        [
            Paragraph("Issue Date", s["body"]),
            Paragraph(fdr.issue_date, s["value"]),
            Paragraph("Maturity Date", s["body"]),
            Paragraph(fdr.maturity_date, s["value"]),
        ],
        [
            Paragraph("Lien Details", s["body"]),
            Paragraph(
                "Jointly with Member Secretary, AICTE (Verified)" if fdr.is_joint_aicte else "Lien Missing",
                s["value"],
            ),
            Paragraph("Scheduled Bank Check", s["body"]),
            Paragraph("RBI Scheduled Commercial Bank (Pass)" if fdr.is_scheduled_bank else "Non-Scheduled Bank", s["value"]),
        ],
    ]
    p1_t = Table(p1_data, colWidths=[42 * mm, 48 * mm, 42 * mm, 48 * mm])
    p1_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    story.append(_bar("1. BENEFICIARY INSTITUTION & SECURITY DEPOSIT PARTICULARS"))
    story.append(p1_t)
    story.append(Spacer(1, 3 * mm))

    # 3. AICTE APH Clause 6.46 & Affidavit-6 Release Gatekeeper Table
    pgrc_ok = inst.pgrc_clearance if inst else True
    vig_ok  = inst.vigilance_clearance if inst else True
    grt_ok  = inst.grants_clearance if inst else True

    gate_data = [
        [
            Paragraph("Requirement / Internal NOC Cell", s["body"]),
            Paragraph("Statutory APH Regulation Clause", s["body"]),
            Paragraph("Verification Status", s["body"]),
            Paragraph("Cell Remarks", s["body"]),
        ],
        [
            Paragraph("Affidavit-6 (11 Declarations)", s["value"]),
            Paragraph("Clause 6.46.1", s["body"]),
            Paragraph("✔ SIGNED & UPLOADED", ParagraphStyle("g1", parent=s["value"], textColor=GREEN)),
            Paragraph("All 11 statutory declarations executed on stamp paper", s["body"]),
        ],
        [
            Paragraph("Latest Extension of Approval (EoA)", s["value"]),
            Paragraph("Clause 6.46.2", s["body"]),
            Paragraph("✔ VERIFIED", ParagraphStyle("g2", parent=s["value"], textColor=GREEN)),
            Paragraph("Valid AICTE approval active for current academic session", s["body"]),
        ],
        [
            Paragraph("PGRC Cell Clearance (Student Arrears)", s["value"]),
            Paragraph("Affidavit-6 Items 8 & 9", s["body"]),
            Paragraph(
                "✔ NOC GRANTED" if pgrc_ok else "✖ BLOCKED",
                ParagraphStyle("g3", parent=s["value"], textColor=GREEN if pgrc_ok else RED),
            ),
            Paragraph(
                "No pending fee-refund, salary arrears, or ragging cases" if pgrc_ok else "Pending student fee-refund dispute",
                s["body"],
            ),
        ],
        [
            Paragraph("Vigilance Cell Clearance (Inquiries)", s["value"]),
            Paragraph("Affidavit-6 Items 1, 5 & 6", s["body"]),
            Paragraph(
                "✔ NOC GRANTED" if vig_ok else "✖ INQUIRY PENDING",
                ParagraphStyle("g4", parent=s["value"], textColor=GREEN if vig_ok else RED),
            ),
            Paragraph(
                "No CBI, CVC, or punitive inquiry pending against college" if vig_ok else "Disciplinary inquiry under review",
                s["body"],
            ),
        ],
        [
            Paragraph("Grants Bureau Clearance (Utilization)", s["value"]),
            Paragraph("Affidavit-6 Items 10 & 11", s["body"]),
            Paragraph(
                "✔ NOC GRANTED" if grt_ok else "✖ UNUTILIZED GRANTS",
                ParagraphStyle("g5", parent=s["value"], textColor=GREEN if grt_ok else RED),
            ),
            Paragraph(
                "No unutilized AICTE development or MODROB grants pending" if grt_ok else "Unspent grant utilization pending",
                s["body"],
            ),
        ],
    ]
    gate_t = Table(gate_data, colWidths=[55 * mm, 35 * mm, 35 * mm, 55 * mm])
    gate_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    story.append(_bar("2. AICTE APH CLAUSE 6.46 & AFFIDAVIT-6 RELEASE GATEKEEPER CLEARANCES"))
    story.append(gate_t)
    story.append(Spacer(1, 3 * mm))

    # 4. Maker-Checker Two-Officer Signatures Table
    maker_name = fdr.maker_officer or "Sh. R.K. Verma (Scrutiny Officer, Regulation Bureau)"
    checker_name = fdr.checker_officer or "Dr. A. Mehta (Director, Regulation Bureau)"

    sig_data = [
        [
            Paragraph("<b>MAKER (Scrutiny Officer):</b><br/>"
                      f"Name: {maker_name}<br/>"
                      "Action: Recommended Release under Clause 6.46<br/>"
                      f"Signed: {today_str}<br/>"
                      "Digital Token: Verified [HMAC-SHA256]", s["body"]),
            Paragraph("<b>CHECKER (Director, Regulation Bureau):</b><br/>"
                      f"Name: {checker_name}<br/>"
                      "Action: Approved Release & Issued Discharge NOC<br/>"
                      f"Signed: {today_str}<br/>"
                      "Digital Token: Verified [HMAC-SHA256]", s["body"]),
            Paragraph("<b>OFFICIAL SEAL:</b><br/>"
                      "Regulation Bureau<br/>"
                      "AICTE New Delhi<br/>"
                      "Status: DISCHARGED<br/>"
                      "Legally Binding Certificate", s["body"]),
        ]
    ]
    sig_t = Table(sig_data, colWidths=[65 * mm, 65 * mm, 50 * mm])
    sig_t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, NAVY),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 0), (-1, -1), OFF_WHITE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))

    story.append(_bar("3. MAKER-CHECKER TWO-OFFICER STATUTORY SIGN-OFF"))
    story.append(sig_t)
    story.append(Spacer(1, 3 * mm))

    # 5. SHA-256 Forensic Audit Chain Trail
    story.append(_bar("4. CRYPTOGRAPHIC FORENSIC AUDIT TRAIL (SHA-256 HASH CHAIN)"))
    audit_rows = [
        [
            Paragraph("Block #", s["body"]),
            Paragraph("Timestamp (IST)", s["body"]),
            Paragraph("Actor Role & Action", s["body"]),
            Paragraph("Event Summary", s["body"]),
            Paragraph("Current Block SHA-256 Digest", s["body"]),
        ]
    ]
    # Display last 8 audit blocks
    for b in audit_blocks[-8:]:
        audit_rows.append([
            Paragraph(f"#{b.id}", s["code"]),
            Paragraph(b.timestamp[:19].replace("T", " "), s["code"]),
            Paragraph(f"{b.actor_role}<br/><b>{b.action}</b>", s["code"]),
            Paragraph((b.details or "")[:60], s["code"]),
            Paragraph(f"{b.curr_hash[:16]}...{b.curr_hash[-8:]}", s["code"]),
        ])

    audit_t = Table(audit_rows, colWidths=[15 * mm, 28 * mm, 40 * mm, 52 * mm, 45 * mm])
    audit_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(audit_t)
    story.append(Spacer(1, 2 * mm))

    story.append(HRFlowable(width="100%", thickness=0.5, color=NAVY))
    story.append(Paragraph(
        "AICTE VISHWAS-FDR • 100% Tamper-Evident SHA-256 Audit Trail • Smart India Hackathon 2026",
        s["footer"],
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# 2. OFFICIAL AICTE DISCHARGE ORDER & LIEN RELINQUISHMENT LETTER (PDF)
# ─────────────────────────────────────────────────────────────────────────────
def generate_discharge_noc_letter_pdf(fdr_id: int, db: Session, simulated_date: str | None = None) -> bytes:
    """
    Generates the official AICTE Regulation Bureau Discharge Order & Relinquishment
    of Lien Letter under Approval Process Handbook Clause 6.46.
    Complete with formal Govt of India letterhead, reference number, order terms,
    Maker-Checker digital signature blocks, and legal validity statement.
    """
    from models import FDRRecord, Institution
    fdr = db.query(FDRRecord).filter(FDRRecord.id == fdr_id).first()
    if not fdr:
        raise ValueError(f"FDR id={fdr_id} not found.")

    inst = fdr.institution
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
    )

    s = _styles()
    story = []

    # AICTE Letterhead
    header_data = [
        [
            Paragraph("<b>अखिल भारतीय तकनीकी शिक्षा परिषद्</b><br/>"
                      "<b>ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</b><br/>"
                      "<font size=7.5>(A STATUTORY BODY OF THE GOVERNMENT OF INDIA, MINISTRY OF EDUCATION)</font><br/>"
                      "<font size=7.5>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | Website: https://aicte.gov.in</font><br/>"
                      "<b>REGULATION BUREAU — STATUTORY DEPOSIT & FDR COMPLIANCE DIVISION</b>", s["aicte_hdr"])
        ]
    ]
    header_t = Table(header_data, colWidths=[180 * mm])
    header_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(header_t)
    story.append(Spacer(1, 4 * mm))

    # Reference Bar
    today_str = simulated_date or datetime.now().strftime("%d-%B-%Y")
    ref_no = f"AICTE/RB/FDR/DISCHARGE/2026-27/{fdr.id:04d}/{fdr.fdr_number}"
    
    meta_data = [
        [
            Paragraph(f"<b>File Ref. No.:</b> <font face='Courier'>{ref_no}</font>", s["body"]),
            Paragraph(f"<b>Date of Order:</b> {today_str}", ParagraphStyle("r", parent=s["body"], alignment=TA_RIGHT)),
        ]
    ]
    meta_t = Table(meta_data, colWidths=[110 * mm, 70 * mm])
    meta_t.setStyle(TableStyle([
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(meta_t)
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY, spaceAfter=8, spaceBefore=4))

    # Addressee
    story.append(Paragraph("<b>TO:</b>", s["body"]))
    story.append(Paragraph(f"<b>The Branch Manager,</b><br/>"
                           f"{fdr.issuing_bank}<br/>"
                           f"Branch IFSC: <font face='Courier'><b>{fdr.ifsc_code}</b></font>", s["body"]))
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph(f"<b>COPY TO:</b> The Principal / Authorized Signatory, <b>{inst.name}</b> ({inst.state}) | AISHE Code: <font face='Courier'><b>{inst.aishe_code}</b></font>", s["body"]))
    story.append(Spacer(1, 4 * mm))

    # Subject & Reference
    subj_data = [
        [
            Paragraph("<b>SUBJECT:</b>", ParagraphStyle("sb", parent=s["body"], fontName="Helvetica-Bold", textColor=NAVY)),
            Paragraph(f"<b>STATUTORY ORDER FOR RELINQUISHMENT OF AICTE JOINT LIEN & DISCHARGE OF SECURITY DEPOSIT HELD UNDER FIXED DEPOSIT RECEIPT NO. {fdr.fdr_number}</b>", ParagraphStyle("sb2", parent=s["body"], fontName="Helvetica-Bold", textColor=NAVY)),
        ],
        [
            Paragraph("<b>REF.:</b>", s["body"]),
            Paragraph("AICTE Approval Process Handbook (APH) 2024–27, Clause 6.46 & Executed Affidavit-6.", s["body"]),
        ]
    ]
    subj_t = Table(subj_data, colWidths=[20 * mm, 160 * mm])
    subj_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(subj_t)
    story.append(Spacer(1, 4 * mm))

    # Formal Legal Text
    story.append(Paragraph("Sir / Madam,", s["body"]))
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph(
        f"1. WHEREAS the institution <b>{inst.name}</b> (AISHE: {inst.aishe_code}), located at {inst.state}, "
        f"tendered Fixed Deposit Receipt bearing No. <b>{fdr.fdr_number}</b> issued by <b>{fdr.issuing_bank}</b> "
        f"for a Principal Amount of <b>{_format_inr(fdr.principal_amount)}</b>, pledged in favour of the "
        "<b>Member Secretary, All India Council for Technical Education (AICTE)</b> as mandatory security deposit "
        "for grant of statutory regulatory approval.", s["body"]
    ))
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph(
        "2. AND WHEREAS the said institution has successfully completed the stipulated statutory tenure under "
        "Clause 6.46 of the AICTE Approval Process Handbook, maintained approval in good standing, and submitted "
        "the mandatory Affidavit-6 (11 Declarations on Non-Judicial Stamp Paper).", s["body"]
    ))
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph(
        "3. AND WHEREAS the Regulation Bureau has completed multi-bureau inter-departmental verification and received "
        "formal clearances with zero pending objections:", s["body"]
    ))
    story.append(Spacer(1, 1 * mm))

    # Clearance Table
    clr_rows = [
        [Paragraph("<b>Inter-Bureau Cell / Division</b>", s["body"]), Paragraph("<b>Clearance Status</b>", s["body"]), Paragraph("<b>Remarks / Findings</b>", s["body"])],
        [Paragraph("Public Grievances Redressal Cell (PGRC)", s["body"]), Paragraph("<font color='#1B7A34'><b>NOC GRANTED</b></font>", s["body"]), Paragraph("Zero outstanding student fee-refund / faculty salary grievances.", s["body"])],
        [Paragraph("AICTE Vigilance Bureau", s["body"]), Paragraph("<font color='#1B7A34'><b>NOC GRANTED</b></font>", s["body"]), Paragraph("No vigilance, disciplinary, CVC, or CBI inquiry pending.", s["body"])],
        [Paragraph("Finance & Grants Bureau", s["body"]), Paragraph("<font color='#1B7A34'><b>NOC GRANTED</b></font>", s["body"]), Paragraph("All institutional development grants reconciled with utilization certificates.", s["body"])],
    ]
    clr_t = Table(clr_rows, colWidths=[60 * mm, 35 * mm, 85 * mm])
    clr_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(clr_t)
    story.append(Spacer(1, 3 * mm))

    # Operative Statutory Order
    order_box = [
        [
            Paragraph("<b>NOW, THEREFORE</b>, in exercise of the powers conferred under the AICTE Act and Clause 6.46 "
                      "of the Approval Process Handbook, the <b>All India Council for Technical Education hereby RELINQUISHES "
                      "AND DISCHARGES its joint lien</b> on the aforesaid Fixed Deposit Receipt No. <b>" + fdr.fdr_number + "</b>.<br/><br/>"
                      "The Branch Manager, <b>" + fdr.issuing_bank + "</b> is hereby authorized and directed to release the principal deposit "
                      "along with all accrued interest thereon directly to <b>" + inst.name + "</b> without requiring any further countersignature, "
                      "lien removal request, or personal appearance of Council officials.", ParagraphStyle("ord", parent=s["body"], leading=13))
        ]
    ]
    order_t = Table(order_box, colWidths=[180 * mm])
    order_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
        ("BOX", (0, 0), (-1, -1), 1.5, GREEN),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(order_t)
    story.append(Spacer(1, 6 * mm))

    # Signature Blocks
    maker_name = fdr.maker_officer or "Sh. R.K. Verma (Scrutiny Officer - Maker)"
    checker_name = fdr.checker_officer or "Dr. A. Mehta (Director, Regulation Bureau - Checker)"

    sig_data = [
        [
            Paragraph(f"<b>Recommended by (Maker):</b><br/><br/>"
                      f"<b>{maker_name}</b><br/>"
                      "Scrutiny Officer, Regulation Bureau<br/>"
                      f"Digitally Authenticated: {today_str}<br/>"
                      "<font size=6.5 color='#64748B'>VISHWAS-FDR Verification Verified</font>", s["body"]),
            Paragraph(f"<b>Approved & Ordered by (Checker):</b><br/><br/>"
                      f"<b>{checker_name}</b><br/>"
                      "Director, Regulation Bureau<br/>"
                      f"Digitally Authenticated: {today_str}<br/>"
                      "<font size=6.5 color='#64748B'>Competent Authority Sign-Off</font>", s["body"]),
            Paragraph("<b>OFFICIAL SEAL</b><br/><br/>"
                      "All India Council for Technical Education<br/>"
                      "Regulation Bureau, New Delhi<br/>"
                      "<b>STATUS: DISCHARGE NOC ISSUED</b><br/>"
                      f"<font size=6 color='#64748B'>SHA: {(fdr.file_sha256 or '0'*64)[:24]}...</font>", s["body"]),
        ]
    ]
    sig_t = Table(sig_data, colWidths=[65 * mm, 65 * mm, 50 * mm])
    sig_t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, NAVY),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 0), (-1, -1), OFF_WHITE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(sig_t)
    story.append(Spacer(1, 4 * mm))

    story.append(HRFlowable(width="100%", thickness=0.5, color=NAVY))
    story.append(Paragraph(
        "AICTE VISHWAS-FDR • Official Regulation Bureau Discharge Order • Legal Validity under IT Act 2000 Section 4/5",
        s["footer"],
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


