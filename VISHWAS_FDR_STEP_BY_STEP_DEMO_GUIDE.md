# VISHWAS-FDR | Live Demonstration & Feature Testing Manual
## Step-by-Step Jury Presentation & Verification Playbook
**Smart India Hackathon 2026** | **Problem Statement ID**: 26265  
**Ministry / Organization**: AICTE (All India Council for Technical Education)  
**Department**: Regulation Bureau | **Team**: OG-7  
**Core Philosophy**: *"Trust Ladder + Never Miss a Deadline"*

---

## 1. Pre-Demo Setup & Environment Sanity Check

### 1.1 Launching the Full System
Ensure both backend and frontend servers are actively running. You can launch both with a single double-click:
```cmd
.\start_all.bat
```

Or verify manually via command line:
1. **Backend API**: `http://localhost:8000` (FastAPI with Uvicorn)
2. **Frontend UI**: `http://localhost:3000` (Next.js 14 App Router)
3. **Swagger API Docs**: `http://localhost:8000/docs`

### 1.2 Automated 50-Point Deep Health Check
Run the automated test suite to ensure all database records, crypto chains, and PDF engines are operational:
```bash
cd backend
python -u test_e2e_all_features.py
```
> **Expected Output**: `VERIFICATION SUMMARY: 50/50 TESTS PASSED (0 FAILED)`

### 1.3 Recommended Browser Screen Arrangement
- **Left 70% of screen**: Browser Window 1 at `http://localhost:3000` (VISHWAS-FDR Portal).
- **Right 30% of screen**: Browser Window 2 at `http://localhost:8000/docs` (Live OpenAPI Interactive Docs).

---

## 2. Step-by-Step Feature Walkthrough (The Grand Finale Sequence)

---

### FEATURE 1: Government of India UX4G 3.0 & GIGW Accessibility
**Goal**: Demonstrate authentic regulatory portal design conforming to MeitY UX4G 3.0 standards.

1. **Open** `http://localhost:3000/`.
2. **Examine the Top GIGW Utility Ribbon**:
   - Point out the **Indian National Tricolor Accent Strip** (`#FF9933` / `#FFFFFF` / `#138808`).
   - Point out the **Deep Gov Navy Ribbon** (`#0B1F3A`) with the official National Emblem (Ashoka Stambh) and text: `भारत सरकार | Government of India | Ministry of Education`.
3. **Test Accessibility Controls**:
   - Click the **`A+`** button in the top right: Notice all text across the page smoothly scales up for visual accessibility.
   - Click **`A`** to reset to standard font scaling.
   - Click the **Contrast Toggle Button** (Half-circle icon): The portal switches to High-Contrast Accessible Mode. Click again to return to default.
   - Click the **Language Selector** (`English` / `हिंदी`): Demonstrates bilingual readiness.
4. **Test the Live Multi-Role Switcher**:
   - In the top banner, click the **Role Selector Pill** (currently showing `Scrutiny Officer (Maker)`).
   - Notice you can seamlessly switch between:
     - `Institution Portal` (College view)
     - `Scrutiny Officer (Maker)` (Verification workstation view)
     - `Director Regulation Bureau (Checker)` (Approval authority view)
     - `Bank Branch Manager` (CBS attestation view)
   - *Key Pitch Point*: Explain to judges that this enables immediate simulation of real-world multi-stakeholder approval without complex logout/login rituals.

---

### FEATURE 2: Executive Dashboard, KPIs & Master CSV Export
**Goal**: Show centralized deposit monitoring across all AICTE technical campuses in India.

1. **Navigate to** `/dashboard` (or click `Executive Overview` in the left sidebar).
2. **Inspect the 4 UX4G KPI Cards**:
   - **Total Deposit Corpus Managed**: Displays total statutory collateral in Crores (e.g., `₹2.70 Cr`).
   - **Bank-Confirmed Instruments**: Count of instruments verified against Core Banking records.
   - **Flagged / Tampered Cases**: Defective or doctored instruments currently blocked.
   - **Approaching Maturity / Overdue**: Instruments requiring immediate renewal action.
3. **Inspect the 4-Stage Trust Ladder Legend**:
   - Point out the 4 progressive milestones:
     - `Stage 1: Submitted [Claimed]`
     - `Stage 2: Auto-Checked [OCR + Math]`
     - `Stage 3: Bank-Confirmed [Signed Link]`
     - `Stage 4: Officer-Approved [Locked]`
4. **Test the Master Repository Table & 1-Click CSV Export**:
   - Use the **Search Bar**: Type `SBI` or `Visvesvaraya` $\rightarrow$ table filters in real-time.
   - Filter by State or Lifecycle (`All`, `Active`, `Expiring`, `Overdue`).
   - Click the **"Export CSV"** button (top right of table):
     - A file named `AICTE_Regulation_Bureau_FDR_Repository_2026-11-01.csv` instantly downloads.
     - Open it to show the jury all 19 columns: AISHE Code, Institution Name, State, FDR Number, Principal, Interest Rate, Calculated Compounding Value, Discrepancy, AICTE Joint Lien, Scheduled Bank Status, and Days Remaining.
5. **Test the National State Risk Heatmap**:
   - In the table header, click the **"National State Risk Heatmap"** tab.
   - An interactive risk breakdown by state appears (Maharashtra, Karnataka, Tamil Nadu).
   - Point out how the system flags high-risk states with multiple expiring or defective instruments.

---

### FEATURE 3: 3-Step Institution Submission Wizard & Live IFSC Lookup
**Goal**: Demonstrate how colleges submit statutory deposits with instant validation against RBI registries.

1. **Navigate to** `/submissions/new` (or click `Submit New FDR` in the left sidebar).
2. **Step 1: Real-Time RBI Scheduled Bank Lookup**:
   - Locate the **Branch IFSC Code** input.
   - Type: `SBIN0004321` $\rightarrow$ Green badge appears: `✔ State Bank of India • Eligible RBI Scheduled Commercial Bank`.
   - Now clear it and type: `NNSB0000101` $\rightarrow$ Instantly turns RED:
     > `✖ Prohibited: 'Nagpur Nagrik Sahakari Co-op Bank' is a Co-operative Bank. AICTE APH regulations strictly prohibit FDRs from Co-operative Banks.`
   - Re-type `SBIN0004321` to proceed.
3. **Step 2: Category Norm Auto-Calculation**:
   - In the **Discipline Category** dropdown, select `Engineering & Technology (New Campus)`.
   - Notice the system automatically sets the **Mandatory Minimum Principal** to `₹35,00,000` under APH Appendix 6.
   - Switch to `Pharmacy (B.Pharm / M.Pharm)` $\rightarrow$ Minimum principal dynamically changes to `₹15,00,000`.
   - Switch back to `Engineering & Technology`.
4. **Step 3: Document Upload & Math Preview**:
   - Point out the **Statutory Compound Interest Formula Box**:
     $$A = P \times \left(1 + \frac{r}{400}\right)^{4 \times n}$$
   - Shows live calculation: ₹35,00,000 at 7.0% for 75 days $\rightarrow$ Calculated maturity: `₹35,50,229.91`.
   - Notice the quick test buttons at the bottom: **"Load SBI Genuine FDR"**, **"Load PNB Tampered FDR"**, and **"Load Co-op Bank Invalid FDR"**.

---

### FEATURE 4: The 3 "Killer" Sample FDRs in the Scrutiny Workstation
**Goal**: The core demonstration that proves real mathematical OCR verification and defect detection.

#### Case A: Test Sample 1 — Genuine SBI FDR (`1_SBI_Genuine_FDR.pdf`)
1. On `/submissions/new`, click the blue pill: **"Load Preset: SBI Genuine FDR"**.
2. Click **"Submit & Run AICTE Verification"**.
3. The system parses the document in under 500ms and opens the **Scrutiny Workstation** (`/scrutiny/1`).
4. **Left Pane (PyMuPDF SVG Bounding Box Evidence Viewer)**:
   - Notice green bounding boxes drawn directly over the certificate text:
     - `FDR Number: SBI-FDR-2026-9901`
     - `Principal: Rs. 35,00,000`
     - `Interest Rate: 7.0%`
     - `Maturity Value: Rs. 35,50,230`
   - Test zoom controls: Click `+` and `-` to scale the document; click `Fit` to reset.
5. **Right Pane (5-Point Statutory Checklist)**:
   - Point 1: **Quarterly Compounding Math Check**: `PASS` (Calculated: ₹35,50,229.91 vs Printed: ₹35,50,229.91 $\rightarrow$ $\Delta = ₹0.00$).
   - Point 2: **AICTE Joint Lien Check**: `PASS` (*"Jointly with Member Secretary, AICTE"* extracted).
   - Point 3: **RBI Scheduled Bank Check**: `PASS` (*State Bank of India*).
   - Point 4: **Discipline Norm Check**: `PASS` (*₹35,00,000 >= ₹35,00,000 threshold*).
   - Point 5: **SHA-256 Duplicate Guard**: `PASS` (*Unique cryptographic hash*).
6. Notice the Trust Ladder status is automatically elevated to **`AUTO_CHECKED`**.

#### Case B: Test Sample 2 — PNB Doctored Math FDR (`2_PNB_Tampered_Math_FDR.pdf`)
1. Navigate back to `/submissions/new`.
2. Click the orange pill: **"Load Preset: PNB Tampered Math FDR"**.
3. Click **"Submit & Run AICTE Verification"**.
4. The system opens Scrutiny Workstation (`/scrutiny/2`):
   - **Look at the Left Pane**: A prominent **RED bounding box** is drawn around the Printed Maturity Amount (`Rs. 26,50,000`).
   - **Look at the Right Pane (Point 1 Math Check)**:
     - Printed on Certificate: `₹26,50,000.00`
     - Statutorily Calculated (Quarterly Compounding at 6.8% for 5 years): `₹21,01,310.71`
     - **Mathematical Discrepancy Caught**: **`+₹5,48,689.29`**!
   - Highlight the alert to the jury:
     > *"The institution doctored the maturity value by nearly ₹5.5 Lakhs to fake compliance. VISHWAS-FDR caught this instantly on upload."*
   - Notice the Trust Ladder status is automatically locked at **`FLAGGED`** with defect code `MATH_TAMPER_SUSPECTED`.

#### Case C: Test Sample 3 — Co-operative Bank Invalid FDR (`3_CoopBank_Invalid_FDR.pdf`)
1. Navigate back to `/submissions/new`.
2. Click the red pill: **"Load Preset: Co-op Bank Invalid FDR"**.
3. Click **"Submit & Run AICTE Verification"**.
4. The system opens Scrutiny Workstation (`/scrutiny/3`):
   - **Check 2 (AICTE Joint Lien)**: `FAIL` $\rightarrow$ Account holder extracted as *"Apex Engineering Trust Only"*. Missing mandatory *"Member Secretary, AICTE"*.
   - **Check 3 (RBI Scheduled Bank)**: `FAIL` $\rightarrow$ *Nagpur Nagrik Sahakari Co-operative Bank* flagged under code `PROHIBITED_COOP_BANK`.
   - Trust status is **`FLAGGED`**.

#### Case D: SHA-256 Duplicate Collateral Interception
1. In the Scrutiny Workstation or submission form, attempt to re-upload the same `1_SBI_Genuine_FDR.pdf` document under a new FDR number.
2. The system calculates the SHA-256 digest of the raw bytes, matches it against existing WORM vault records, and flags **`DUPLICATE_INSTRUMENT`**.
3. *Key Pitch Point*: Prevents unscrupulous trusts from pledging the same deposit across multiple colleges.

---

### FEATURE 5: Two-Tier Bank Verification
**Goal**: Demonstrate how issuing bank branches attest to instrument authenticity without complex IT integration.

#### Tier 1: Instant CBS API Simulation
1. Open the genuine SBI FDR (`/scrutiny/1`).
2. Click the button: **"Simulate Instant CBS API Check"**.
3. A progress indicator appears as the system queries the simulated Core Banking Gateway.
4. Response returns with simulated CBS reference: `CBS-TXN-SBI-9901-OK`.
5. The Trust Ladder badge immediately updates from `AUTO_CHECKED` to **`BANK_CONFIRMED`**.

#### Tier 2: Zero-Login Signed Bank Magic Link
1. Switch your active role in the top header to **`Bank Branch Manager`**.
2. On any instrument, click **"Generate Signed Bank Magic Link"**.
3. A dialog appears displaying the cryptographically signed link:
   `/bank-verify/TdwXSTGISpQOg8Y8Z2WH_t5eNrhuSijC`
4. Click **"Open Bank Manager View"** (or open the link in a new incognito window).
5. **Examine the Zero-Login Bank Portal**:
   - Completely standalone view (bypasses portal sidebar).
   - Displays official issuing bank header: *State Bank of India • Core Banking System Portal*.
   - Shows the mandatory AICTE joint lien clause and instrument particulars.
   - Shows the digital attestation text:
     > *"I hereby confirm that Fixed Deposit Receipt #SBI-FDR-2026-9901 for ₹35,00,000 is authentic, genuine, unencumbered, and held under tripartite lien in favour of Member Secretary, AICTE."*
6. Click **"Digitally Confirm FDR & AICTE Lien Authenticity"**:
   - The page displays a green confirmation badge.
   - The confirmation is permanently recorded into the SHA-256 audit log.
7. *(Optional)*: Click **"Dispute / Reject FDR"** $\rightarrow$ opens formal rejection reason modal, marking the instrument as disputed in Council records.

---

### FEATURE 6: Scrutiny Observation & Institution Rectification
**Goal**: Show the interactive feedback loop between AICTE Scrutiny Officers and technical colleges.

1. Switch active role to **`Scrutiny Officer (Maker)`**.
2. Open the flagged Co-op Bank instrument (`/scrutiny/3`).
3. Click the button: **"Record Scrutiny Observation"**.
4. In the drawer, enter:
   > *"Defect noted: Deposit issued by an unauthorized Co-operative Bank. Please furnish replacement FDR from an RBI Scheduled Commercial Bank with Member Secretary AICTE as joint holder."*
5. Click **"Dispatch Observation to College"** $\rightarrow$ sets `clarification_requested: true`.
6. Now switch active role to **`Institution Portal`** and navigate to `/my-deposits`:
   - A prominent **Red Observation Alert Banner** appears at the top of the portfolio:
     `⚠ Action Required: Scrutiny Officer Remark Received for FDR #COOP-2026-1102`.
   - The institution can click **"Rectify / Upload Replacement FDR"** to submit a replacement document, which links to `parent_fdr_id` without breaking audit history.

---

### FEATURE 7: The Time Machine Simulator & Proactive Escalations *(The Crowd-Pleaser)*
**Goal**: Prove that the automated reminder ladder and overdue detection work live in front of the jury.

1. Look at the top navigation bar: Find the **Time Machine Clock Pill** (showing `Simulated: 2026-11-01 (Day 0)`).
2. Click the Clock Pill to open the **Timeline Simulator Popover**.
3. Say to the jury:
   > *"Respected Jury, our genuine SBI FDR matures on January 15, 2027 (exactly 75 days from Day 0). Watch what happens when we fast-forward system time."*
4. Click the button: **"+60 Days (T-15 Urgent)"**:
   - The clock advances to `2026-12-31`.
   - The genuine SBI FDR now has only 15 days remaining.
   - Notice the status updates to **`EXPIRING_SOON`** with a yellow warning pill.
5. Now click the red button: **"+75 Days (SBI Overdue Trigger)"**:
   - The clock advances to `2027-01-15`.
   - Watch the screen:
     - The genuine SBI FDR maturity date has arrived $\rightarrow$ status immediately flips to **`OVERDUE`** with a pulsing red badge!
     - In the Officer Priority Queue, its Urgency Score jumps to the very top.
     - Look at the top right **Notification Bell**: a red badge `2` appears.
6. Click the **Notification Bell** to open the Escalations Drawer:
   - Shows the automated alert:
     > `🚨 OVERDUE ESCALATION: FDR SBI-FDR-2026-9901 (Visvesvaraya Institute of Technology) is OVERDUE. Urgent escalation dispatched to Director, Regulation Bureau via SMS & Email.`
7. Click **"Reset to Day 0 (2026-11-01)"** to restore normal timeline operation.

---

### FEATURE 8: Clause 6.46 Maker-Checker Gatekeeper & Legal Discharge NOC PDF
**Goal**: Demonstrate strict legal compliance with AICTE Approval Process Handbook refund protocols.

1. Navigate to `/lifecycle` (or click `Maturity & Clause 6.46` in the sidebar).
2. Click the second tab: **"Clause 6.46 Release Gatekeeper"**.
3. Locate the SBI FDR and click **"Open Gatekeeper"**:
   - The **AICTE APH Clause 6.46 Maker-Checker Gatekeeper Modal** opens.
   - Point out the 5 mandatory prerequisites:
     1. `Affidavit-6 (11 Declarations on Rs. 100 Stamp Paper)`: Verified & Sealed.
     2. `Extension of Approval (EoA / LoA)`: Verified in Central Database.
     3. `PGRC Cell NOC (No Student Fee Dispute / Salary Arrears)`: Interactive Toggle.
     4. `Vigilance Cell NOC (No Criminal / CBI / CVC Inquiry)`: Interactive Toggle.
     5. `Grants Bureau NOC (No Unspent AICTE Grants)`: Interactive Toggle.
4. **Demonstrate Statutory Release Blocking**:
   - On Item 3 (PGRC Cell NOC), click the toggle button: **"Click to Block"**.
   - The status turns red: `✖ Dispute Pending (Click to Clear)`.
   - Scroll down and click **"Recommend Release (Maker)"**:
     - System displays a prominent red warning:
       > `Statutory Release Gate Blocked: PGRC Cell NOC missing. Institution has unresolved student fee-refund / faculty salary grievances before the Standing Appellate Committee.`
     - The release is physically prevented by code.
5. **Clear the Dispute**:
   - Click **"Click to Clear"** on PGRC NOC $\rightarrow$ status returns to green `✔ NOC Clear`.
6. **Execute Maker Recommendation**:
   - In the Maker section, verify the Scrutiny Officer name: `Sh. R.K. Verma`.
   - Click **"Recommend Release (Maker)"**.
   - Status updates to **`RELEASE_RECOMMENDED`**.
7. **Test Strict Separation of Duties (`Maker != Checker`)**:
   - In the Checker section (Stage 2), type `Sh. R.K. Verma` into the Director (Checker) Name input.
   - Click **"Final Approve & Issue Discharge NOC"**:
     - System rejects self-approval with HTTP 400 error:
       > `Statutory Violation: Maker and Checker cannot be the same officer. Separation of duties is strictly enforced under AICTE regulations.`
8. **Execute Independent Checker Approval**:
   - Change Checker Name to: `Dr. A. Mehta (Director, Regulation Bureau)`.
   - Click **"Final Approve & Issue Discharge NOC"**:
     - Green success banner appears: `Action Executed Successfully`.
     - Lifecycle status changes to **`RELEASED`** and Trust Status updates to **`OFFICER_APPROVED`**.
9. **Download the Official Legal Discharge Order PDF**:
   - Click the green button: **"Download AICTE Discharge Order (PDF)"**.
   - An official PDF opens in a new tab:
     - Formatted on formal AICTE Regulation Bureau letterhead with Council Emblem.
     - Contains formal Order Reference Number: `AICTE/RB/FDR-REL/2026/0001`.
     - Explicitly cites APH Clause 6.46 and relinquishes Council lien on FDR `SBI-FDR-2026-9901`.
     - Includes certified institutional details, bank instructions, and digital signature blocks of both Scrutiny Officer (Maker) and Bureau Director (Checker).

---

### FEATURE 9: Cryptographic SHA-256 Audit Ledger & Chain Verifier
**Goal**: Prove 100% mathematical tamper-evidence for CAG audit inspections and RTI inquiries.

1. Navigate to `/audit` (or click `Forensic SHA-256 Ledger` in the sidebar).
2. **Inspect the Immutable Audit Table**:
   - Shows over 60 chained cryptographic blocks.
   - Point out the columns: `Block #`, `Timestamp (IST)`, `Actor Role & Name`, `Target Instrument`, `Cryptographic Event Details`, `Prev Hash`, and `Current Block Hash`.
   - Notice every block contains the SHA-256 hash of the preceding block ($H_n = \text{SHA256}(H_{n-1} + \text{data})$).
   - Click the **Copy Icon** next to any hash to copy the full 64-character hexadecimal digest.
3. **Execute 1-Click Cryptographic Chain Verification**:
   - Click the green button at the top: **"Verify Hash Chain Integrity"**.
   - The backend recalculates every SHA-256 digest from Genesis Block (`0*64`) to the latest tip block.
   - A prominent green banner appears:
     > `✔ 100% Tamper-Evident: All Blocks Cryptographically Verified`  
     > `Genesis Hash: 0000000000000000... • Tip Hash: 5e62f0ba19c2... • Blocks Validated: 61/61`
4. **Download Official Forensic Audit Compliance Certificate**:
   - Click the button: **"Download Compliance Certificate (PDF)"**.
   - An official ReportLab PDF opens with the complete cryptographic block ledger, tamper-evidence certification, and Bureau seals ready for CAG submission.

---

### FEATURE 10: Dynamic APH Regulatory Policy Settings
**Goal**: Demonstrate that regulatory policies can be adjusted by Bureau leadership without touching code.

1. Navigate to `/settings` (or click `APH Rules & Settings` in the sidebar).
2. **Examine Policy Controls**:
   - **Section 1: Statutory Discipline Norms**: Change Engineering from `₹35,00,000` to `₹40,00,000` or Pharmacy to `₹20,00,000`.
   - **Section 2: Compounding Math Tolerance**: Adjust rounding tolerance from `₹100` to `₹50`.
   - **Section 3: Reminder Ladder Intervals**: Modify intervals (e.g., `90, 60, 30, 15, 7`).
   - **Section 4: Master Timeline Controller**: Shows active simulated date and temporal jump buttons.
3. Click **"Save All Regulatory Policies"**:
   - Settings persist immediately to the SQLite database.
   - An audit block `SYSTEM_CONFIG_UPDATED` is automatically appended to the SHA-256 hash chain.

---

## 3. Quick-Reference Jury Q&A Defense Card

| When the Jury Asks... | Deliver This Winning Answer: |
| :--- | :--- |
| **"How will commercial banks integrate with this?"** | *"We provide a **Two-Tier model**: Tier-1 is an API gateway for nationalized banks with CBS APIs. Tier-2 is our **Zero-Login Signed Bank Magic Link**, which requires **zero bank IT integration**. An HMAC-SHA256 link is emailed to the verified branch email, allowing the Chief Manager to attest to the FDR against their CBS screen on any smartphone or PC in 30 seconds."* |
| **"What if someone tampers with the SQLite database directly?"** | *"Even a rogue database admin **cannot forge the SHA-256 hash chain**. Every block is linked to the previous block's digest. Modifying a single rupee or status breaks the chain downstream. Clicking 'Verify Hash Chain' instantly detects the exact corrupted block ID. This complies with Section 65B of the Indian Evidence Act."* |
| **"How does the OCR handle different bank certificate layouts?"** | *"We use **fuzzy regex dictionary mapping**, not fixed-pixel scraping. Whether an FDR is from SBI, PNB, or Canara Bank, the engine identifies financial tokens (`Principal`, `Maturity`, `IFSC`), strips currency symbols, normalizes date formats, and extracts the exact text rects for bounding box overlay."* |
| **"Why is the Time Machine included in a production portal?"** | *"Because statutory FDR tenures span **5 to 10 years**. In production, a daily cron job checks maturities. However, during council audits or demonstrations, the Time Machine acts as a **stress-testing simulator**, allowing leadership to project forward into next quarter or next year to audit risk exposure on demand."* |
| **"How does this prevent colleges from withdrawing FDRs without AICTE knowing?"** | *"Under RBI Master Circulars, an FDR marked **'Jointly with Member Secretary, AICTE'** cannot be disbursed without written relinquishment from AICTE. Our portal ensures the joint lien is verified upfront, and banks only receive the signed Discharge Order PDF once all 3 cell clearances (PGRC, Vigilance, Grants) are fully verified."* |

---

## 4. Final Demo Checklist Before Taking the Stage

- [ ] Run `python -u test_e2e_all_features.py` inside `backend/` to ensure `50/50 PASS`.
- [ ] Browser Window 1 open at `http://localhost:3000` with zoom set to 100%.
- [ ] Browser Window 2 open at `http://localhost:8000/docs` in case judges ask to see API schemas.
- [ ] Reset Time Machine to **Day 0 (2026-11-01)** before jury approaches.
- [ ] Keep active role set to **`Scrutiny Officer (Maker)`**.
- [ ] Present with calm confidence—Team OG-7 has built a complete, flawless, and winning solution!

