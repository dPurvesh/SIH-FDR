import requests
import json
import sys
from pathlib import Path

BASE_BACKEND = "http://localhost:8000"
BASE_FRONTEND = "http://localhost:3000"

results = []

def test(name, condition, details=""):
    status = "PASS" if condition else "FAIL"
    results.append({"name": name, "status": status, "details": details})
    print(f"[{status}] {name}" + (f" -> {details}" if details else ""))
    return condition

def run_tests():
    print("=" * 80)
    print("VISHWAS-FDR END-TO-END DEEP VERIFICATION SUITE")
    print("=" * 80)

    # 1. Backend Ping & Dashboard
    try:
        r = requests.get(f"{BASE_BACKEND}/api/dashboard")
        test("1.1 GET /api/dashboard responds 200", r.status_code == 200)
        data = r.json()
        kpis = data.get("kpis", {})
        test("1.2 Dashboard KPIs contain total_corpus_cr & total_fdrs", 
             kpis.get("total_corpus_cr", 0) > 0 and kpis.get("total_fdrs", 0) > 0,
             f"Corpus: {kpis.get('total_corpus_cr')} Cr, Total FDRs: {kpis.get('total_fdrs')}")
        test("1.3 Trust ladder breakdown contains all 5 stages",
             all(stage in kpis.get("trust_ladder_breakdown", {}) for stage in ["SUBMITTED", "AUTO_CHECKED", "FLAGGED", "BANK_CONFIRMED", "OFFICER_APPROVED"]))
        test("1.4 Priority list is populated", len(data.get("priority_list", [])) > 0)
        test("1.5 State heatmap contains states", len(data.get("state_heatmap", [])) > 0)
    except Exception as e:
        test("1.1 Dashboard API", False, str(e))

    # 2. Master Repository CSV Export
    try:
        r = requests.get(f"{BASE_BACKEND}/api/fdrs/export-csv")
        test("2.1 GET /api/fdrs/export-csv responds 200", r.status_code == 200)
        test("2.2 CSV content type and headers", "text/csv" in r.headers.get("Content-Type", "") and "AISHE Code" in r.text)
        test("2.3 CSV rows populated", len(r.text.strip().split("\n")) > 5, f"{len(r.text.strip().splitlines())} lines")
    except Exception as e:
        test("2.1 CSV Export", False, str(e))

    # 3. Real-Time RBI IFSC Validation
    try:
        # SBI
        r = requests.get(f"{BASE_BACKEND}/api/banks/ifsc-lookup/SBIN0004321")
        test("3.1 IFSC SBIN0004321 recognized as Scheduled Bank", 
             r.status_code == 200 and (r.json().get("is_scheduled_bank") == True or r.json().get("is_scheduled_commercial_bank") == True),
             r.json().get("bank_name"))
        # PNB
        r = requests.get(f"{BASE_BACKEND}/api/banks/ifsc-lookup/PUNB0112200")
        test("3.2 IFSC PUNB0112200 recognized as Scheduled Bank", 
             r.status_code == 200 and (r.json().get("is_scheduled_bank") == True or r.json().get("is_scheduled_commercial_bank") == True),
             r.json().get("bank_name"))
        # Co-operative Bank
        r = requests.get(f"{BASE_BACKEND}/api/banks/ifsc-lookup/NNSB0000101")
        test("3.3 Co-operative Bank NNSB0000101 prohibited and flagged", 
             r.status_code == 200 and (r.json().get("is_scheduled_bank") == False or r.json().get("is_scheduled_commercial_bank") == False),
             r.json().get("message")[:60] + "...")
    except Exception as e:
        test("3.1 IFSC Validation", False, str(e))

    # 4. 5-Point Verification Engine & Dynamic Sample Testing
    sample_dir = Path("sample_fdrs")
    sbi_pdf = sample_dir / "1_SBI_Genuine_FDR.pdf"
    pnb_pdf = sample_dir / "2_PNB_Tampered_Math_FDR.pdf"
    coop_pdf = sample_dir / "3_CoopBank_Invalid_FDR.pdf"

    # Test Sample SBI (Genuine)
    try:
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/test-sample/1_SBI_Genuine_FDR.pdf")
        test("4.1 Test sample 1_SBI_Genuine_FDR.pdf uploaded", r.status_code == 200)
        data = r.json()
        fdr_sbi_id = data.get("fdr_id")
        test("4.2 SBI Genuine FDR auto-checked without flags", 
             data.get("trust_status") in ("AUTO_CHECKED", "BANK_CONFIRMED") and len(data.get("flags", [])) == 0,
             f"Trust Status: {data.get('trust_status')}")
    except Exception as e:
        test("4.1 SBI Sample Test", False, str(e))

    # Test Sample PNB (Tampered Math Discrepancy)
    try:
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/test-sample/2_PNB_Tampered_Math_FDR.pdf")
        test("4.3 Test sample 2_PNB_Tampered_Math_FDR.pdf processed", r.status_code == 200)
        data = r.json()
        fdr_pnb_id = data.get("fdr_id")
        flag_codes = [f.get("code") for f in data.get("flags", [])]
        test("4.4 PNB Math tampering caught by Quarterly Compounding engine",
             ("MATH_TAMPER_SUSPECTED" in flag_codes or "MATH_DISCREPANCY" in flag_codes) and data.get("trust_status") == "FLAGGED",
             f"Discrepancy: Rs. {data.get('math_discrepancy')} | Flags: {flag_codes}")
    except Exception as e:
        test("4.3 PNB Sample Test", False, str(e))

    # Test Sample Co-op Bank (Prohibited Bank + Missing AICTE Joint Lien)
    try:
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/test-sample/3_CoopBank_Invalid_FDR.pdf")
        test("4.5 Test sample 3_CoopBank_Invalid_FDR.pdf processed", r.status_code == 200)
        data = r.json()
        fdr_coop_id = data.get("fdr_id")
        flag_codes = [f.get("code") for f in data.get("flags", [])]
        test("4.6 Co-op Bank & Missing Joint Lien both caught and flagged",
             ("PROHIBITED_COOP_BANK" in flag_codes or "NON_SCHEDULED_BANK" in flag_codes) and 
             ("MISSING_AICTE_LIEN" in flag_codes or not data.get("is_joint_aicte")),
             f"Flags: {flag_codes}")
    except Exception as e:
        test("4.5 Co-op Bank Sample Test", False, str(e))

    # 5. Duplicate Guard
    try:
        # Uploading the exact same PDF bytes under a different/new FDR number triggers duplicate check
        with open(sbi_pdf, "rb") as f:
            pdf_bytes = f.read()
        files = {"file": ("sbi_duplicate_attempt.pdf", pdf_bytes, "application/pdf")}
        form_data = {
            "institution_id": 2,
            "fdr_number": "DUP-ATTEMPT-NEW-NUM-007",
            "issuing_bank": "State Bank of India",
            "ifsc_code": "SBIN0004321",
            "principal_amount": 3500000.0,
            "interest_rate": 7.0,
            "issue_date": "2026-11-01",
            "maturity_date": "2027-01-15",
            "printed_maturity_amount": 3550229.91,
        }
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/upload", files=files, data=form_data)
        dup_data = r.json()
        flag_codes = [f.get("code") for f in dup_data.get("flags", [])]
        test("5.1 SHA-256 Duplicate Instrument Guard catches duplicate file bytes",
             ("DUPLICATE_INSTRUMENT" in flag_codes or "DUPLICATE_FDR" in flag_codes) and dup_data.get("trust_status") == "FLAGGED",
             f"Flags: {flag_codes}")
    except Exception as e:
        test("5.1 Duplicate Guard", False, str(e))

    # 6. Two-Tier Bank Verification
    # Tier 1: Instant CBS API Check
    try:
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/simulate-cbs")
        test("6.1 Tier 1: CBS API simulation responds 200", r.status_code == 200)
        data = r.json()
        test("6.2 CBS API elevates trust status to BANK_CONFIRMED", 
             data.get("trust_status") == "BANK_CONFIRMED",
             f"Status: {data.get('trust_status')}")
    except Exception as e:
        test("6.1 CBS API Simulation", False, str(e))

    # Tier 2: Signed Magic Link Generation & Confirmation
    try:
        # Request token
        r = requests.post(f"{BASE_BACKEND}/api/fdrs/{fdr_pnb_id}/request-bank-verification")
        test("6.3 Tier 2: Generate Signed Bank Verification Magic Link", r.status_code == 200)
        token_data = r.json()
        token = token_data.get("token")
        test("6.4 Valid token returned in payload", bool(token), f"Token: {token[:16]}...")

        # Access Bank Verify Endpoint
        r_bv = requests.get(f"{BASE_BACKEND}/api/bank-verify/{token}")
        test("6.5 Bank Branch Manager view loads token particulars",
             r_bv.status_code == 200 and r_bv.json().get("fdr_id") == fdr_pnb_id)

        # Confirm via Token
        r_conf = requests.post(
            f"{BASE_BACKEND}/api/bank-verify/{token}/confirm",
            json={"action": "CONFIRM", "manager_name": "Chief Manager PNB", "remarks": "CBS verified."}
        )
        test("6.6 Branch Manager attestation confirms instrument in CBS",
             r_conf.status_code == 200 and r_conf.json().get("trust_status") == "BANK_CONFIRMED")
    except Exception as e:
        test("6.3 Signed Bank Magic Link", False, str(e))

    # 7. Scrutiny Observation & Rectification Flow
    try:
        # Flag observation
        r = requests.post(
            f"{BASE_BACKEND}/api/fdrs/{fdr_coop_id}/flag-observation",
            json={"officer_name": "Sh. R.K. Verma", "observation_notes": "Please furnish FDR from an RBI Scheduled Commercial Bank."}
        )
        test("7.1 Scrutiny Officer flags observation remark", r.status_code == 200)
        data = r.json()
        test("7.2 Clarification requested flag marked on instrument",
             data.get("clarification_requested") == True,
             f"Remarks: {data.get('scrutiny_remarks')}")
    except Exception as e:
        test("7.1 Scrutiny Observation", False, str(e))

    # 8. Time Machine Simulation & Automated Escalation
    try:
        # Fast forward +75 days (SBI FDR matures on 2027-01-15)
        r = requests.post(f"{BASE_BACKEND}/api/simulation/set-date", json={"days_offset": 75})
        test("8.1 Time Machine fast forwards +75 days", r.status_code == 200)
        sim_data = r.json()
        test("8.2 Simulated date set correctly", 
             sim_data.get("simulated_date") == "2027-01-15" or sim_data.get("new_date") == "2027-01-15",
             f"New date: {sim_data.get('new_date')}")
        test("8.3 Overdue escalation triggers senior executive notifications",
             len(sim_data.get("escalations", [])) > 0 or sim_data.get("overdue_count", 0) > 0,
             f"Overdue count: {sim_data.get('overdue_count')} | Escalations: {len(sim_data.get('escalations', []))}")

        # Reset Time Machine to Day 0
        r_reset = requests.post(f"{BASE_BACKEND}/api/simulation/set-date", json={"days_offset": 0})
        test("8.4 Time Machine resets cleanly to Day 0 (2026-11-01)", 
             r_reset.status_code == 200 and (r_reset.json().get("simulated_date") == "2026-11-01" or r_reset.json().get("new_date") == "2026-11-01"))
    except Exception as e:
        test("8.1 Time Machine Simulation", False, str(e))

    # 9. Clause 6.46 Gatekeeper & Maker-Checker Separation of Duties
    try:
        fdr_rec = requests.get(f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}").json()
        inst_id = fdr_rec.get("institution_id")

        # Test Blocked when PGRC clearance is False
        requests.post(f"{BASE_BACKEND}/api/institutions/{inst_id}/toggle-clearance", json={"cell": "pgrc", "status": False})
        r_blocked = requests.post(
            f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/maker-recommend",
            json={"recommendation": "RECOMMEND_RELEASE", "maker_name": "Maker Officer", "remarks": "Release test"}
        )
        test("9.1 Clause 6.46 blocks Maker recommendation if PGRC clearance missing",
             r_blocked.status_code == 400 and "PGRC" in r_blocked.json().get("detail", ""))

        # Restore PGRC clearance
        requests.post(f"{BASE_BACKEND}/api/institutions/{inst_id}/toggle-clearance", json={"cell": "pgrc", "status": True})
        requests.post(f"{BASE_BACKEND}/api/institutions/{inst_id}/toggle-clearance", json={"cell": "vigilance", "status": True})
        requests.post(f"{BASE_BACKEND}/api/institutions/{inst_id}/toggle-clearance", json={"cell": "grants", "status": True})

        # Now Maker recommends successfully
        r_maker = requests.post(
            f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/maker-recommend",
            json={"recommendation": "RECOMMEND_RELEASE", "maker_name": "Sh. R.K. Verma (Maker)", "remarks": "All 3 NOCs verified."}
        )
        test("9.2 Maker successfully recommends release when all 3 NOCs granted",
             r_maker.status_code == 200 and r_maker.json().get("lifecycle_status") == "RELEASE_RECOMMENDED")

        # Enforce Maker != Checker separation of powers
        r_same_checker = requests.post(
            f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/checker-approve",
            json={"checker_name": "Sh. R.K. Verma (Maker)", "remarks": "Attempting self-approval"}
        )
        test("9.3 Strict Maker != Checker separation enforced (Self-approval rejected with 400)",
             r_same_checker.status_code == 400 and "Separation of duties" in r_same_checker.json().get("detail", ""))

        # Valid distinct Checker approves
        r_checker = requests.post(
            f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/checker-approve",
            json={"checker_name": "Dr. A. Mehta (Director, Regulation Bureau)", "remarks": "Final statutory discharge approved."}
        )
        test("9.4 Independent Checker (Director) grants final regulatory approval",
             r_checker.status_code == 200 and r_checker.json().get("lifecycle_status") == "RELEASED")

        # Download Official AICTE Discharge Order PDF
        r_discharge_pdf = requests.get(f"{BASE_BACKEND}/api/fdrs/{fdr_sbi_id}/export-discharge-pdf")
        test("9.5 1-Click AICTE Discharge Order & Relinquishment of Lien PDF generated",
             r_discharge_pdf.status_code == 200 and len(r_discharge_pdf.content) > 3000,
             f"PDF Size: {len(r_discharge_pdf.content)} bytes")
    except Exception as e:
        test("9.1 Clause 6.46 Gatekeeper", False, str(e))

    # 10. Forensic SHA-256 Audit Ledger & Certificate
    try:
        r_verify = requests.get(f"{BASE_BACKEND}/api/audit/verify")
        test("10.1 GET /api/audit/verify recomputes and validates full hash chain", r_verify.status_code == 200)
        v_data = r_verify.json()
        test("10.2 Entire SHA-256 hash chain is 100% mathematically valid",
             v_data.get("valid") == True,
             f"Blocks validated: {v_data.get('verified_blocks')}/{v_data.get('total_blocks')}")

        r_audit_pdf = requests.get(f"{BASE_BACKEND}/api/audit/export-pdf")
        test("10.3 1-Click Forensic SHA-256 Compliance Audit Certificate PDF generated",
             r_audit_pdf.status_code == 200 and len(r_audit_pdf.content) > 3000,
             f"PDF Size: {len(r_audit_pdf.content)} bytes")
    except Exception as e:
        test("10.1 Audit Ledger", False, str(e))

    # 11. Settings & Policy Configuration
    try:
        r_settings = requests.get(f"{BASE_BACKEND}/api/settings")
        test("11.1 GET /api/settings returns statutory policy norms", r_settings.status_code == 200)
        s_data = r_settings.json()

        # Update settings
        r_update = requests.put(
            f"{BASE_BACKEND}/api/settings",
            json={
                "reminder_days": "[90, 60, 30, 7]",
                "math_tolerance_inr": "100",
                "norm_engineering": "3500000",
                "norm_pharmacy": "1500000",
                "norm_mba_mca": "1500000",
                "norm_architecture": "1500000",
            }
        )
        test("11.2 PUT /api/settings successfully updates regulatory parameters", r_update.status_code == 200)
    except Exception as e:
        test("11.1 Settings API", False, str(e))

    # 12. Frontend Production Route Accessibility
    frontend_routes = [
        "/",
        "/dashboard",
        "/submissions/new",
        "/my-deposits",
        "/scrutiny",
        f"/scrutiny/{fdr_sbi_id}",
        "/lifecycle",
        "/audit",
        "/settings",
        f"/bank-verify/{token}" if 'token' in locals() else "/bank-verify/demo-token"
    ]

    for route in frontend_routes:
        try:
            r_fe = requests.get(f"{BASE_FRONTEND}{route}", timeout=4)
            test(f"12. Route {route} responds 200 OK", r_fe.status_code == 200)
        except Exception as e:
            test(f"12. Route {route}", False, str(e))

    print("=" * 80)
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r["status"] == "PASS")
    failed_tests = total_tests - passed_tests
    print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} TESTS PASSED ({failed_tests} FAILED)")
    print("=" * 80)

    if failed_tests > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
