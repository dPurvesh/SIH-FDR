import urllib.request, json, warnings
warnings.filterwarnings("ignore")

base = "http://localhost:8000"

# Health
r = urllib.request.urlopen(base + "/health")
h = json.loads(r.read())
print("HEALTH:", h)

# Dashboard
r = urllib.request.urlopen(base + "/api/dashboard")
d = json.loads(r.read())
kpis = d["kpis"]
print("\n--- DASHBOARD KPIs ---")
print("  Total Corpus INR:", "{:,.0f}".format(kpis["total_corpus_inr"]))
print("  Total Corpus Cr:", kpis["total_corpus_cr"])
print("  Total FDRs:", kpis["total_fdrs"])
print("  Bank Confirmed:", kpis["bank_confirmed_instruments"])
print("  Flagged:", kpis["flagged_tampered_cases"])
print("  Overdue:", kpis["overdue_count"])
print("  Expiring Soon:", kpis["expiring_soon_count"])
print("\n--- TRUST LADDER ---")
for k, v in kpis["trust_ladder_breakdown"].items():
    print("  " + k + ": " + str(v))
print("\n--- TOP 3 PRIORITY (Officer Queue) ---")
for fdr in d["priority_list"][:3]:
    print("  #" + str(fdr["id"]) + " " + fdr["fdr_number"] + " | " + fdr["trust_status"] + " | " + fdr["lifecycle_status"] + " | Days: " + str(fdr["days_to_maturity"]) + " | Urgency: " + str(fdr["urgency_score"]))
print("\n--- STATE HEATMAP (Top 3) ---")
for s in d["state_heatmap"][:3]:
    print("  " + s["state"] + ": Corpus " + "{:,.0f}".format(s["total_corpus_inr"]) + " | Risk: " + str(s["risk_score"]))

# Sample PDFs
r = urllib.request.urlopen(base + "/api/sample-pdfs")
sp = json.loads(r.read())
print("\n--- SAMPLE PDFs ---")
for s in sp["samples"]:
    print("  " + s["filename"] + ": " + s["expected_result"])

print("\nALL ENDPOINTS VERIFIED OK!")

