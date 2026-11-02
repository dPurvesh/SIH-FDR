# VISHWAS-FDR: Master Project Specification & Execution Blueprint
**Smart India Hackathon (SIH) 2026 | Problem Statement ID: 26265**  
**Title:** Streamline of Security Deposit / FDR Portal  
**Organization:** All India Council for Technical Education (AICTE), Regulation Bureau  
**Theme:** Smart Automation | **Category:** Software  
**Team Name:** OG-7 | **Core Philosophy:** *"Trust Ladder + Never Miss a Deadline"*

---

## STEP 0: INITIAL ONBOARDING PROMPT FOR ANTIGRAVITY (SEND THIS FIRST!)

> **Instruction for User:** Copy the block below and send it to Antigravity along with this `VISHWAS_FDR_MASTER_SPEC.md` file (or paste the whole file into your workspace root as `SPEC.md`). This forces Antigravity to absorb the A-to-Z domain rules, architecture, and workflow *before* writing a single line of code.

```text
You are the Lead Full-Stack Architect for Team OG-7 building "VISHWAS-FDR" for Smart India Hackathon (PS ID: 26265 - AICTE Regulation Bureau: Streamline of Security Deposit/FDR Portal).

I have attached/provided our complete project blueprint (`VISHWAS_FDR_MASTER_SPEC.md`). Before writing any application code, please read this entire specification from A to Z and confirm your understanding of:
1. Our Core Theme ("Trust Ladder + Never Miss a Deadline") and why Institution-claimed data must always be visually separated from Bank-confirmed data.
2. The 5-Point AICTE Entry Verification Engine (Quarterly Compound Interest Math Check with SVG Bounding-Box Evidence Overlay, AICTE Joint-Holder/Lien Check, RBI Scheduled Commercial Bank Check, Prescribed APH Norm Amount Check, and SHA-256 Duplicate Guard).
3. The Authentic AICTE APH Clause 6.46 & Affidavit-6 Exit Gatekeeper (requiring PGRC Cell, Vigilance Cell, and Grants Bureau internal NOC clearances plus strict Maker-Checker separation before releasing any FDR).
4. Our Pragmatic Local Architecture (Next.js + Tailwind + Lucide on Frontend; FastAPI + SQLAlchemy/SQLite + PyMuPDF + ReportLab on Backend; simulated WORM storage; header/state-driven Time Machine Clock Simulator instead of fragile Docker/Celery setups).
5. Our 5-Phase Sequential Execution Plan and 4-Minute Grand Finale Demo Flow.

DO NOT generate the whole codebase right now. First, reply with a structured Architectural Readiness Summary confirming you understand the data models, the 5 verification rules, the Time Machine clock override mechanism, and the Clause 6.46 Maker-Checker flow, and tell me you are ready to execute **Phase 1**.
```

---

## 1. EXECUTIVE SUMMARY & PROBLEM CONTEXT

### 1.1 The AICTE Regulation Bureau Pain Point
Technical institutions across India are required to submit and maintain Security Deposits / Fixed Deposit Receipts (FDRs) with AICTE as part of the approval process under the **AICTE Approval Process Handbook (APH)**. Currently, managing thousands of FDRs across fragmented spreadsheets and physical correspondence leads to:
1. **Manual Verification Bottlenecks:** Scrutiny officers manually read scanned PDFs, verify compound interest math, check if the FDR is jointly pledged to AICTE, and mail physical letters to banks to confirm authenticity.
2. **Unnoticed Tampering & Invalid Instruments:** Doctored maturity amounts, duplicate FDR submissions, or FDRs created in prohibited Co-operative Banks slip through initial filing.
3. **Missed Maturity Deadlines:** FDRs have 8-to-10-year maturity lifecycles. Without automated tracking, FDRs lapse without timely renewal reminders or escalations.
4. **Risky Releases & Audit Gaps:** Releasing an FDR worth ₹15L–₹35L+ requires verifying that no vigilance inquiry, fee-refund dispute, or unutilized grant is pending (**APH Clause 6.46 & Affidavit-6**), alongside a tamper-evident audit trail for CAG/RTI inspections.

### 1.2 The VISHWAS-FDR Solution ("Trust Ladder + Never Miss a Deadline")
**VISHWAS-FDR** is an AI-assisted, cryptographically auditable lifecycle portal where:
* Every FDR climbs a visual **Trust Ladder**: `SUBMITTED (Claimed)` $\rightarrow$ `AUTO_CHECKED (OCR + Math Verified)` / `FLAGGED` $\rightarrow$ `BANK_CONFIRMED (Independent Bank Proof)` $\rightarrow$ `OFFICER_APPROVED`.
* An **Evidence Overlay Viewer** renders the uploaded FDR document and draws green/red SVG bounding boxes directly over extracted fields, proving *why* an instrument passed or failed.
* A **Two-Tier Bank Verification Engine** combines simulated CBS/API checks with a **Zero-Login Signed Magic Link** sent to the issuing bank branch manager.
* A **Time Machine Clock Simulator** lets evaluators drag a slider forward in time (`+30`, `+60`, `+90`, `+180` days) to watch reminders fire, statuses flip to `OVERDUE`, and the officer's priority list dynamically re-rank in real time.
* A **Clause 6.46 Maker-Checker Release Workflow** enforces internal clearances (**PGRC + Vigilance + Grants Bureau**) and two-officer sign-off, logged in a **SHA-256 Hash-Chained Forensic Ledger** with 1-click PDF Audit Export.

---

## 2. AUTHENTIC AICTE REGULATORY RULES (100% REAL APH DATA)

To ensure maximum domain credibility with AICTE Regulation Bureau judges, VISHWAS-FDR enforces genuine rules from the **AICTE Approval Process Handbook (APH) 2024–2027**:

### 2.1 Entry Scrutiny Rules (5-Point Automated Verification Engine)
1. **Maturity Compound Interest Math Check:**
   Indian banks calculate FDR maturity using quarterly compounding:
   $$A = P \left(1 + \frac{r}{400}\right)^{4n}$$
   where $P$ is Principal Amount, $r$ is Annual Interest Rate ($\%$), and $n$ is tenure in years (calculated from `issue_date` to `maturity_date`).
   * **Rule:** If $|A_{\text{printed}} - A_{\text{calculated}}| > ₹100$, flag as `MATH_TAMPER_SUSPECTED` and highlight the Maturity Amount bounding box in pulsing RED.
2. **AICTE Joint-Holder / Lien Check:**
   An FDR cannot be held solely in the Institution/Trust's name. It must explicitly state **"Jointly with AICTE"** or **"Lien Marked to Member Secretary, AICTE"**.
   * **Rule:** If missing, flag as `MISSING_AICTE_LIEN`.
3. **RBI Scheduled Commercial Bank Check:**
   Under AICTE APH norms, FDRs must be drawn only from an **RBI Scheduled Commercial Bank** (e.g., SBI, PNB, Canara Bank, Bank of Baroda, HDFC, ICICI). **Co-operative Banks are strictly prohibited.**
   * **Rule:** Cross-verify bank name and IFSC prefix against the Scheduled Bank Registry. Flag any Co-operative Bank as `PROHIBITED_COOP_BANK`.
4. **Prescribed APH Deposit Norm Check:**
   Verify that $P \ge \text{Required Norm Amount}$ for the institution category (configurable in settings; e.g., New Technical Campus / Engineering = ₹35,00,000; Pharmacy / Architecture / MBA = ₹15,00,000; Minority / North-East concessions supported).
   * **Rule:** Flag under-deposited instruments as `SHORTFALL_IN_PRINCIPAL`.
5. **SHA-256 Duplicate & Format Guard:**
   Compute the `SHA-256` hash of the uploaded PDF and normalize the `fdr_number`.
   * **Rule:** Block or flag if the same `fdr_number` or `file_sha256` is submitted across two applications or institutions (`DUPLICATE_INSTRUMENT`).

### 2.2 Exit Scrutiny Rules (APH Clause 6.46 & Affidavit-6 Release Gatekeeper)
Under **Clause 6.46 of the AICTE APH 2024–27** and official **Affidavit-6 ("For the Release of Security Deposit")**, an FDR can only be released after maturity if:
1. **Mandatory Document Uploads:** Institution uploads signed **Affidavit-6** (containing the 11 legal declarations) and the **Letter of Approval (LoA) / Latest Extension of Approval (EoA)**.
2. **3-Cell Internal AICTE NOC Clearances:**
   * **PGRC (Public Grievance Redressal Cell) Clearance:** Confirms no pending student fee-refund cases, faculty salary arrears, or ragging/harassment complaints (Affidavit-6 Items 8 & 9).
   * **Vigilance Cell Clearance:** Confirms no CBI/vigilance inquiry, court case, or "No-Admission" punitive action is pending (Affidavit-6 Items 1, 5 & 6).
   * **Grants Bureau Clearance:** Confirms no unutilized AICTE grants or financial embezzlement/defalcation cases exist (Affidavit-6 Items 10 & 11).
3. **Maker-Checker Two-Officer Approval:**
   * **Maker (`Scrutiny Officer`):** Reviews the 3 internal cell clearances and clicks **"Recommend Release"** (or **"Recommend Encashment/Forfeiture"** if the college violated norms).
   * **Checker (`Director, Regulation Bureau`):** A *different* officer reviews the recommendation and clicks **"Approve Release & Generate Official NOC PDF"**.

---

## 3. PRAGMATIC TECH STACK & SYSTEM ARCHITECTURE

Designed to match the submitted SIH PPT 100% while remaining lightweight, fast, and zero-crash on a local laptop during the live demo:

* **Monorepo Structure:**
  * `/backend`: Python 3.10+, **FastAPI**, **SQLAlchemy** (with local **SQLite** `vishwas_fdr.db` so zero database server setup is needed), **PyMuPDF (`fitz`)** for PDF-to-PNG rendering and exact text/bounding-box extraction, **ReportLab** for generating synthetic test FDR PDFs and exporting official Audit/NOC PDFs.
  * `/frontend`: **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide React Icons**.
* **Storage & WORM Simulation:**
  * Uploaded PDFs are saved in `/backend/worm_storage/` named by their `SHA-256` digest and locked (`os.chmod` read-only) with metadata verification, simulating MinIO WORM Object Lock without Docker overhead.
* **Time Machine Simulation Engine:**
  * Global state in backend (`simulation_state.current_date`, defaulting to `2026-11-01`). Dragging the frontend Time Machine slider (`Day 0` to `+180 Days`) calls `POST /api/simulation/set-date`, which recalculates `days_to_maturity` for every FDR in $<50\text{ms}$, fires reminder events (`T-90`, `T-60`, `T-30`, `T-7`, `OVERDUE`), logs escalations into the SHA-256 hash chain, and re-sorts the Priority Queue.

---

## 4. COMPLETE DATABASE SCHEMA (`models.py`)

### 4.1 `Institution` Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Integer (PK)` | Unique ID |
| `aishe_code` | `String` | e.g., `C-45102` (AICTE/AISHE Permanent ID) |
| `name` | `String` | e.g., `Visvesvaraya Institute of Technology, Nagpur` |
| `state` | `String` | e.g., `Maharashtra`, `Karnataka`, `Tamil Nadu`, `Uttar Pradesh`, `Delhi`, `Gujarat` |
| `category` | `String` | `ENGINEERING_NEW`, `PHARMACY`, `MBA_MCA`, `ARCHITECTURE` |
| `required_fdr_amount` | `Float` | Prescribed APH norm (e.g., `3500000.0` or `1500000.0`) |
| `pgrc_clearance` | `Boolean` | Default `True` (set `False` on 1 seeded college to demo blocked release) |
| `vigilance_clearance` | `Boolean` | Default `True` |
| `grants_clearance` | `Boolean` | Default `True` |

### 4.2 `FDRRecord` Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Integer (PK)` | Unique Instrument ID |
| `institution_id` | `Integer (FK)` | Links to `Institution.id` |
| `fdr_number` | `String` | Extracted/Submitted FDR Receipt Number |
| `issuing_bank` | `String` | e.g., `State Bank of India`, `Punjab National Bank`, `Nagpur Nagrik Sahakari Bank (Co-op)` |
| `ifsc_code` | `String` | e.g., `SBIN0004321` |
| `branch_email` | `String` | Official branch email for Signed Magic Link |
| `is_scheduled_bank` | `Boolean` | `True` for RBI Scheduled Banks, `False` for Co-op Banks |
| `account_holder_text` | `String` | Extracted holder text (checked for `"Jointly with AICTE"`) |
| `is_joint_aicte` | `Boolean` | `True` if AICTE lien/joint-holder verified |
| `principal_amount` | `Float` | Principal ($P$) in INR |
| `interest_rate` | `Float` | Annual interest rate ($r\%$) |
| `issue_date` | `String (ISO)` | `YYYY-MM-DD` |
| `maturity_date` | `String (ISO)` | `YYYY-MM-DD` |
| `printed_maturity_amount` | `Float` | Maturity amount read from the document |
| `calculated_maturity_amount`| `Float` | Compound interest math result $A = P(1+r/400)^{4n}$ |
| `math_discrepancy` | `Float` | `abs(printed - calculated)` |
| `trust_status` | `String` | `SUBMITTED`, `AUTO_CHECKED`, `FLAGGED`, `BANK_CONFIRMED`, `OFFICER_APPROVED` |
| `lifecycle_status` | `String` | `ACTIVE`, `EXPIRING_SOON`, `OVERDUE`, `RENEWAL_SUBMITTED`, `RELEASE_REQUESTED`, `RELEASE_RECOMMENDED`, `RELEASED`, `ENCASHED` |
| `flags_json` | `Text (JSON)` | List of discrepancy codes + human-readable explanations |
| `bbox_json` | `Text (JSON)` | Normalized `[x0, y0, x1, y1, status, label]` coordinates for UI overlay |
| `file_sha256` | `String` | Cryptographic hash of the uploaded PDF |
| `rendered_image_path` | `String` | Path/URL to rendered PNG of page 1 for Evidence Viewer |
| `bank_verify_token` | `String` | Signed token for `/bank-verify/[token]` |
| `bank_confirmed_at` | `String (ISO)` | Timestamp when Bank Branch Manager confirmed |
| `affidavit_6_uploaded` | `Boolean` | Required for Clause 6.46 Release |
| `maker_officer` | `String` | Name/ID of Scrutiny Officer who recommended release |
| `checker_officer` | `String` | Name/ID of Director who approved final release |
| `replaced_by_fdr_id` | `Integer` | Links old FDR to renewed FDR for full renewal history |

### 4.3 `AuditLog` Table (Forensic Hash Chain)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Integer (PK)` | Block Number |
| `timestamp` | `String (ISO)` | UTC/IST Timestamp (or Simulated Date timestamp) |
| `actor_role` | `String` | `INSTITUTION`, `SYSTEM_AI`, `SCRUTINY_MAKER`, `DIRECTOR_CHECKER`, `BANK_MANAGER` |
| `actor_name` | `String` | e.g., `Sh. R.K. Verma (Scrutiny Officer)` |
| `action` | `String` | e.g., `FDR_UPLOADED`, `TAMPER_FLAGGED`, `BANK_CONFIRMED_LINK`, `TIME_MACHINE_ESCALATION`, `RELEASE_RECOMMENDED`, `RELEASE_APPROVED` |
| `fdr_id` | `Integer` | Target FDR ID |
| `details` | `String` | Human-readable summary of the event |
| `prev_hash` | `String` | 64-char SHA-256 hex of previous row (`"0"*64` for genesis block) |
| `curr_hash` | `String` | `SHA256(f"{prev_hash}|{timestamp}|{actor_role}|{action}|{fdr_id}|{details}")` |

### 4.4 `SystemConfig` Table (Rules as Settings)
* Stores editable parameters: `reminder_days` (`[90, 60, 30, 7]`), `math_tolerance_inr` (`100.0`), `norm_engineering` (`3500000`), `norm_pharmacy` (`1500000`), `simulated_date` (`2026-11-01`).

---

## 5. STEP-BY-STEP PHASE PROMPTS FOR ANTIGRAVITY

Execute these **one by one** in Antigravity after completing Step 0.

### PHASE 1: Backend Core, 5-Point Verification Engine & Synthetic PDF Generator
**Prompt to give Antigravity:**
```text
Let's execute **Phase 1** of `VISHWAS_FDR_MASTER_SPEC.md`.
1. Create the `/backend` directory with FastAPI, SQLAlchemy (SQLite `vishwas_fdr.db`), PyMuPDF (`fitz`), and ReportLab (`requirements.txt` + `main.py` + `models.py` + `verification.py` + `generate_demo_pdfs.py`).
2. Implement `generate_demo_pdfs.py` using ReportLab to generate 3 realistic, downloadable Indian Bank FDR PDFs in `/backend/sample_fdrs/` and automatically run it on startup:
   - `1_SBI_Genuine_FDR.pdf`: State Bank of India (IFSC: SBIN0004321), FDR No: `SBI-FDR-2026-9901`, Institution: `Visvesvaraya Institute of Technology, Nagpur`, Holder: `Jointly with Member Secretary, AICTE`, Principal: `Rs. 35,00,000`, Interest Rate: `7.0%`, Issue Date: `2026-11-01`, Maturity Date: `2027-01-15` (so when we drag the Time Machine +75 days in the demo, it matures and turns Overdue!), Printed Maturity Amount: exact compound interest match.
   - `2_PNB_Tampered_Math_FDR.pdf`: Punjab National Bank (IFSC: PUNB0112200), FDR No: `PNB-FDR-2026-7742`, Institution: `Apex College of Pharmacy, Pune`, Holder: `Jointly with Member Secretary, AICTE`, Principal: `Rs. 15,00,000`, Interest Rate: `6.8%`, Issue Date: `2026-11-01`, Maturity Date: `2031-11-01` (5 years), Printed Maturity Amount: `Rs. 26,50,000` (Doctored! Calculated quarterly compounding is ~Rs. 21,01,424 -> Discrepancy of +Rs. 5,48,576).
   - `3_CoopBank_Invalid_FDR.pdf`: `Nagpur Nagrik Sahakari Co-operative Bank` (IFSC: NNSB0000101), FDR No: `COOP-2026-1102`, Holder: `Apex Engineering Trust Only` (Missing AICTE Joint Lien + Prohibited Co-op Bank).
3. Seed 8 realistic institutions across 6 Indian states (Maharashtra, Karnataka, Tamil Nadu, Uttar Pradesh, Delhi, Gujarat) with pre-populated active, expiring, and overdue FDRs so our dashboard, Priority List, and State Risk Heatmap look rich immediately on boot.
4. Build the FastAPI endpoints:
   - `GET /api/dashboard`: Returns KPIs, Priority-ranked FDR list, State Risk Heatmap aggregation, and current `simulated_date`.
   - `POST /api/fdrs/upload`: Accepts a PDF upload, calculates SHA-256, renders page 1 to a PNG via PyMuPDF (`dpi=150`), extracts text and exact bounding-box coordinates (`fitz.Page.search_for`), runs the 5-Point AICTE Verification Engine, saves to WORM storage, appends a SHA-256 block to `AuditLog`, and returns the full scrutiny result.
   - `GET /api/sample-pdfs/{filename}`: Allows downloading the 3 demo PDFs right from the UI for easy testing.
```

---

### PHASE 2: Frontend Command Center, Role Switcher & Evidence Overlay Viewer
**Prompt to give Antigravity:**
```text
Now let's execute **Phase 2** of `VISHWAS_FDR_MASTER_SPEC.md` in `/frontend` (Next.js, TypeScript, Tailwind CSS, Lucide Icons):
1. **Top Command Bar (Sticky Navbar)**:
   - Official AICTE Regulation Bureau branding ("VISHWAS-FDR | Security Deposit & Lifecycle Portal").
   - **Live Role Switcher Pill**: Switch seamlessly between `Institution Portal`, `Scrutiny Officer (Maker)`, `Director Regulation Bureau (Checker)`, and `Bank Branch Manager` without logging out.
   - **Time Machine Slider**: Interactive slider (`Day 0` to `+180 Days`) displaying the active Simulated Date and a quick "+60 Days" / "+90 Days" jump button.
2. **Main Dashboard & Officer Priority Queue**:
   - 4 KPI Cards: Total Deposit Corpus Managed (₹ Cr), Bank-Confirmed Instruments, Flagged / Tampered Cases, Approaching Maturity / Overdue.
   - **Trust Ladder Visual Legend**: Shows the 4 progression stages (`Submitted [Claimed]` -> `Auto-Checked [OCR+Math]` -> `Bank-Confirmed [Signed Link]` -> `Officer-Approved [Locked]`).
   - **Smart Priority List Table**: Automatically ranks Overdue, Tampered/Flagged, and Release-Pending cases at the top. Clicking any row opens the **Split-Screen Scrutiny & Lifecycle Drawer/Modal**.
3. **Upload & Split-Screen Evidence Overlay Viewer**:
   - Include quick buttons to test-upload `1_SBI_Genuine_FDR.pdf`, `2_PNB_Tampered_Math_FDR.pdf`, or `3_CoopBank_Invalid_FDR.pdf` (plus drag-and-drop file upload).
   - **Left Pane (Document Evidence Overlay)**: Renders the PNG of the uploaded FDR with scaled SVG bounding boxes (`<rect>`) over the extracted fields. Valid fields glow green; tampered Maturity Amount or Co-op Bank/Missing Lien fields pulse bright RED with hover tooltips.
   - **Right Pane (5-Point AICTE Scrutiny Card)**: Displays the Trust Ladder badge and clear Pass/Fail cards for:
     1) Quarterly Compound Interest Math Check (showing the formula `A = P(1 + r/400)^(4n)`, Printed vs. Calculated, and exact ₹ variance).
     2) AICTE Joint-Holder / Lien Check.
     3) RBI Scheduled Commercial Bank Check.
     4) Prescribed APH Norm Amount Check.
     5) SHA-256 Duplicate & Format Guard.
```

---

### PHASE 3: Two-Tier Bank Verification & Signed Confirmation Magic Link
**Prompt to give Antigravity:**
```text
Now let's execute **Phase 3** of `VISHWAS_FDR_MASTER_SPEC.md`: Independent Bank Verification.
1. Backend Endpoints:
   - `POST /api/fdrs/{id}/request-bank-verification`: Generates a cryptographically signed verification token, logs `BANK_LINK_DISPATCHED` in the SHA-256 audit log, and returns the magic link `/bank-verify/{token}`.
   - `GET /api/bank-verify/{token}` & `POST /api/bank-verify/{token}/confirm`: Validates the token, allows the Bank Branch Manager to confirm or reject the instrument, upgrades `trust_status` from `AUTO_CHECKED` to `BANK_CONFIRMED` (or `FLAGGED` if rejected by bank), and logs `BANK_CONFIRMED_AUTHENTICITY` into the SHA-256 hash chain.
2. Frontend UI:
   - Inside the Scrutiny Modal (and when switched to the `Bank Branch Manager` role), add a **"Generate & Open Signed Bank Magic Link"** button alongside a **"Simulate Instant CBS API Check"** button.
   - Build a clean, official **Zero-Login Bank Branch Manager Verification View** (accessible via modal or `/bank-verify/[token]`) showing the Bank Name, IFSC, Institution Name, FDR Number, Principal, Maturity Amount, and "Joint Holder: Member Secretary, AICTE", with a 1-click **"Digitally Confirm FDR & Lien Authenticity"** button that immediately elevates the Trust Ladder badge to `BANK_CONFIRMED`.
```

---

### PHASE 4: The Time Machine Escalation Engine & Configurable Rules Drawer
**Prompt to give Antigravity:**
```text
Now let's execute **Phase 4** of `VISHWAS_FDR_MASTER_SPEC.md`: The Time Machine Clock Simulator & Configurable Reminder Ladder.
1. Backend Endpoint (`POST /api/simulation/set-date`):
   - Accepts `days_offset` (0 to 180) and updates `simulated_date = 2026-11-01 + days_offset`.
   - Loops through all active FDRs, computes `days_remaining = maturity_date - simulated_date`, and evaluates against the configurable Reminder Ladder (`[90, 60, 30, 7]` days).
   - Generates live notification payloads (Email/SMS alerts to Institution & Scrutiny Officer for `T-90`, `T-60`, `T-30`, `T-7`).
   - For any FDR where `days_remaining < 0`, flips `lifecycle_status` to `OVERDUE`, boosts its urgency score to #1 on the Officer Priority List, and appends an `OVERDUE_ESCALATED_TO_DIRECTOR` block into the SHA-256 `AuditLog`.
2. Frontend UI:
   - Make the **Time Machine Slider** in the top navbar smooth and responsive, with a live **"Notifications & Escalations Feed"** badge that pops open showing the exact reminders and senior-officer escalations triggered by dragging the slider forward +60 or +90 days.
   - Add a **"Configurable APH Rules & Reminder Settings"** modal (`GET/PUT /api/settings`) where an officer can modify the reminder days (`90/60/30/7`), math tolerance (`₹100`), and prescribed category deposit norms in a form without touching code.
```

---

### PHASE 5: Clause 6.46 Maker-Checker Release, SHA-256 Forensic Ledger & Impact Panel
**Prompt to give Antigravity:**
```text
Now let's execute **Phase 5** of `VISHWAS_FDR_MASTER_SPEC.md` to complete the application:
1. **Renewal & Clause 6.46 Maker-Checker Release Workflow**:
   - Allow an Institution to click **"Submit Renewal FDR"** (linking the new FDR to the old one with full history) or **"Request Clause 6.46 Release/Refund"**.
   - Inside the Release Workflow panel, build the **AICTE APH Clause 6.46 & Affidavit-6 Gatekeeper**:
     - Display status pills for: `Affidavit-6 (11 Declarations) Signed`, `Latest EoA/LoA Verified`, `PGRC Cell NOC (No Fee/Salary Dispute)`, `Vigilance Cell NOC (No Inquiry Pending)`, and `Grants Bureau NOC (No Unutilized Grants)`.
     - Allow toggling PGRC/Vigilance clearance to show how the system automatically blocks release if a college has a pending student fee dispute.
   - **Maker Action**: When active role is `Scrutiny Officer (Maker)`, enable **"Recommend Release"** (sets status to `RELEASE_RECOMMENDED` and records `maker_officer`). Also provide an **"Invoke / Encash FDR (Norm Violation)"** button for defaulting colleges.
   - **Checker Action**: When active role is `Director Regulation Bureau (Checker)`, verify that `Checker != Maker` and enable **"Final Approve & Issue Discharge NOC"** (sets status to `RELEASED` and records `checker_officer`).
2. **Forensic SHA-256 Hash-Chained Audit Log & 1-Click PDF Export**:
   - Build a dedicated **"Forensic Audit Ledger"** tab showing every system event as a linked chain of cryptographic blocks (`Block #`, `Timestamp`, `Actor Role`, `Event`, `Prev SHA-256`, `Curr SHA-256`).
   - Add a **"Verify Hash Chain Integrity"** button (`GET /api/audit/verify`) that recalculates every SHA-256 hash across the ledger and displays a green `"100% Tamper-Evident: All Blocks Cryptographically Verified"` banner.
   - Add a **"1-Click Official Audit & NOC PDF Export"** button (`GET /api/fdrs/{id}/export-audit-pdf`) using ReportLab that downloads a formatted AICTE Regulation Bureau Compliance Certificate containing the institution details, Trust Ladder milestones, Clause 6.46 clearances, Maker-Checker signatures, and the SHA-256 forensic trail.
3. **Wow Layer (State-Level Risk Heatmap & Executive Impact Panel)**:
   - Build an **"Executive Insights & Impact"** tab featuring:
     - **State-Wise Risk Heatmap**: Visual grid of Indian states showing Total Deposit Corpus, Active FDRs, Expiring Soon, and Overdue/Flagged concentration.
     - **Before vs. After Impact Panel**: Side-by-side comparison metrics (Verification Turnaround: `14–21 Days Manual` -> `<60 Seconds Automated`; Discrepancy Detection: `Manual Eye Check` -> `100% Compound Math + Lien Check`; Missed Maturities: `Frequent` -> `0% via Escalation Ladder`; Release Risk: `Single-Point Manual` -> `Clause 6.46 Maker-Checker + SHA-256 Ledger`).
```

---

## 6. THE 4-MINUTE WINNING DEMO SCRIPT (STAGE CHOREOGRAPHY)

Follow this exact 7-step flow during the Grand Finale judging:

1. **0:00 – 0:45 | Genuine Upload & Trust Ladder Climb:**
   * Click **"Upload Sample 1 (`SBI_Genuine_FDR.pdf`)"**.
   * Show the **Split-Screen Evidence Overlay**: green bounding boxes appear over Principal (`₹35,00,000`), Joint Holder (`Jointly with AICTE`), and Maturity Amount. All 5 AICTE checks pass in 1 second. Badge climbs from `Submitted` $\rightarrow$ `Auto-Checked`.
2. **0:45 – 1:30 | Catching a Doctored FDR (The "Aha!" Moment):**
   * Click **"Upload Sample 2 (`PNB_Tampered_Math_FDR.pdf`)"**.
   * The document viewer pulses a **bright RED bounding box** directly over the printed maturity amount (`₹26,50,000`). Point to the Math Card: *"Quarterly compound interest at 6.8% for 5 years on ₹15L is ₹21,01,424. This receipt was doctored by +₹5.48 Lakhs, and VISHWAS-FDR caught it automatically."* (Also briefly mention Sample 3 catching a prohibited Co-op Bank).
3. **1:30 – 2:05 | Independent Bank Confirmation via Signed Magic Link:**
   * Go back to the clean SBI FDR. Click **"Open Signed Bank Verification Link"**.
   * In the **Bank Branch Manager View**, click **"Digitally Confirm FDR & Lien Authenticity"**. Watch the badge climb to `Bank-Confirmed` (Green) while institution claims and bank proof remain strictly separated.
4. **2:05 – 2:50 | Dragging the Time Machine Slider (+75 Days):**
   * Drag the top navbar **Time Machine Slider** forward `+75 Days`.
   * Live toast notifications fire (`T-60`, `T-30`, `T-7` reminders), the SBI FDR crosses its maturity date, turns bright **RED (`OVERDUE`)**, fires an automatic escalation to the Director, and jumps to **#1 on the Officer Priority List**.
5. **2:50 – 3:30 | Renewal & Clause 6.46 Maker-Checker Release:**
   * Open a matured FDR requesting release. Point to the **APH Clause 6.46 & Affidavit-6 Gatekeeper** (`PGRC ✔ | Vigilance ✔ | Grants Bureau ✔`).
   * As **Scrutiny Officer (Maker)**, click **"Recommend Release"**. Switch the top role pill to **Director Regulation Bureau (Checker)** and click **"Approve & Issue Discharge NOC"**.
6. **3:30 – 4:00 | Forensic Hash-Chain Verification & 1-Click PDF Audit Export:**
   * Open the **Forensic Audit Ledger**, click **"Verify Hash Chain Integrity"** (flashes `100% Tamper-Evident Verified`), click **"Export Official Audit PDF"**, and close on the **State Risk Heatmap & Executive Impact Panel**.