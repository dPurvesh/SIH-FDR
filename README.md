# VISHWAS-FDR
## AICTE Fixed Deposit Receipt Security & Lifecycle Management Portal
**Smart India Hackathon 2026** | **Problem Statement ID**: 26265  
**Ministry / Organization**: AICTE (All India Council for Technical Education)  
**Department**: Regulation Bureau  
**Theme**: Smart Automation  
**Team**: OG-7 | **Core Philosophy**: *"Trust Ladder + Never Miss a Deadline"*

---

## 🏛️ Executive Summary

Under the **AICTE Approval Process Handbook (APH 2024–2027)**, technical and higher education institutions in India pledge over **₹2,500 Crores in Fixed Deposit Receipts (FDRs)** with the Member Secretary, AICTE as statutory security deposits to establish or renew campuses.

Historically, this paper-heavy workflow was vulnerable to:
1. **Padded or doctored interest compounding values** that did not match RBI quarterly compounding norms.
2. **Prohibited deposits** issued by non-scheduled co-operative banks in direct violation of APH Chapter I regulations.
3. **Missing joint lien markings**, allowing rogue trusts to encash deposits without AICTE knowledge.
4. **Maturity oversights**, causing security deposits to expire unnoticed without renewal notices.
5. **High-risk release disputes**, where institutions claimed ₹35 Lakh / ₹15 Lakh refunds despite unresolved student fee disputes (PGRC) or active CBI/Vigilance investigations.

**VISHWAS-FDR** solves this end-to-end with a production-grade Government of India enterprise portal modeled strictly on [aicte.gov.in](https://aicte.gov.in) and **MeitY's UX4G 3.0 / GIGW** guidelines.

---

## 🚀 Key Architectural Innovations

### 1. The 4-Stage Trust Ladder
```
[1. SUBMITTED] ──▶ [2. AUTO_CHECKED] ──▶ [3. BANK_CONFIRMED] ──▶ [4. OFFICER_APPROVED]
  Institution      5-Point PyMuPDF OCR   Two-Tier CBS Link/API    Director Regulation Bureau
  WORM Deposit      Math Engine & Lien     Zero-Login Bank Mgr      Clause 6.46 Discharge NOC
```

### 2. 5-Point AICTE APH Entry Verification Engine
- **Point 1 (Quarterly Compounding Math)**: Validates printed values against Indian Banking quarterly compounding formula $A = P(1 + r/400)^{4n}$ with a ₹100 variance tolerance. Highlights discrepancies with interactive SVG bounding boxes.
- **Point 2 (AICTE Joint Lien Check)**: Enforces mandatory tripartite holding in favour of *Member Secretary, AICTE*.
- **Point 3 (RBI Scheduled Commercial Bank Registry)**: Cross-references IFSC prefixes against the central RBI registry (prohibits co-operative banks instantly).
- **Point 4 (Prescribed Norm Check)**: Auto-checks discipline-specific minimum principal (₹35 Lakhs for Engineering, ₹15 Lakhs for Pharmacy/MBA/MCA/Architecture).
- **Point 5 (SHA-256 Duplicate Instrument Guard)**: Intercepts duplicate collateral pledges across technical campuses.

### 3. Two-Tier Bank Verification
- **Tier 1 (Instant CBS API Simulation)**: Immediate Core Banking query simulation for nationalized banks (SBI, PNB, Canara, BoB).
- **Tier 2 (Zero-Login Signed Bank Magic Link)**: HMAC-SHA256 signed verification links dispatched directly to branch managers requiring zero portal logins or IT setup.

### 4. Time Machine Simulation & Reminder Ladder
- Interactive temporal simulation slider ($0$ to $+180$ days).
- Evaluates $T-90$, $T-60$, $T-30$, and $T-7$ day milestone notices.
- Automatically transitions matured instruments to `OVERDUE` and dispatches executive escalations to the Bureau Director.

### 5. Clause 6.46 Maker-Checker Gatekeeper
- Enforces statutory tripartite clearances before deposit release:
  1. **PGRC Cell NOC** (Zero pending student fee refund complaints or faculty salary disputes).
  2. **Vigilance Cell NOC** (Zero criminal, CBI, or CVC inquiries against trust management).
  3. **Grants Bureau NOC** (Zero unutilized AICTE development grant funds outstanding).
- Strict separation of duties (`Maker != Checker`) enforced at code level.
- Generates 1-click official **AICTE Relinquishment of Lien & Discharge Order PDFs**.

### 6. WORM Forensic SHA-256 Audit Ledger
- Immutable cryptographic hash chain where every event is hashed with the previous block ($H_n = \text{SHA256}(H_{n-1} + \text{data})$).
- Live 1-click **Chain Integrity Verifier** proving zero tampering for CAG and RTI inquiries.

---

## 💻 Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (`vishwas_fdr.db`), PyMuPDF (`fitz`), ReportLab (PDF Generation).
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, MeitY UX4G 3.0 Design Tokens.
- **Verification Engine**: Exact RBI Quarterly Compounding Math, Fuzzy OCR Regex Normalizer, SHA-256 Hash Chain.

---

## ⚡ Quick Start (1-Click Run)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Run via Batch Script (Windows)
Double-click `start_all.bat` or run in terminal:
```bash
.\start_all.bat
```

### Manual Execution

#### 1. Backend Server
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

#### 2. Frontend Command Center
```bash
cd frontend
npm install
npm run dev
```
Portal available at: `http://localhost:3000`

---

## 🧪 Comprehensive Verification Suite
To execute the automated 50-point end-to-end verification test suite:
```bash
cd backend
python -u test_e2e_all_features.py
```
**Verification Result**: `50/50 Tests Passed (100% Success Rate)`.

---

## 👥 Team OG-7 | SIH 2026
Built with dedication for the **AICTE Regulation Bureau**, Ministry of Education, Government of India.

