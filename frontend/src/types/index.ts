export type RoleType =
  | "INSTITUTION"
  | "MAKER"
  | "CHECKER"
  | "BANK_MANAGER";

export type TrustStatus =
  | "SUBMITTED"
  | "AUTO_CHECKED"
  | "FLAGGED"
  | "BANK_CONFIRMED"
  | "OFFICER_APPROVED";

export type LifecycleStatus =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "OVERDUE"
  | "RENEWAL_SUBMITTED"
  | "RELEASE_REQUESTED"
  | "RELEASE_RECOMMENDED"
  | "RELEASED"
  | "ENCASHED";

export interface BBoxOverlayItem {
  x0_pct: number;
  y0_pct: number;
  x1_pct: number;
  y1_pct: number;
  status: "ok" | "fail" | "warn";
  label: string;
  value: string;
  tooltip?: string;
}

export interface FlagItem {
  code: string;
  reason: string;
  severity: "HIGH" | "MEDIUM" | "BLOCK";
}

export interface CheckDetail {
  passed: boolean;
  reason?: string;
  [key: string]: any;
}

export interface FDRItem {
  id: number;
  fdr_number: string;
  institution_id: number;
  institution_name: string;
  institution_state: string;
  institution_category: string;
  aishe_code: string;
  issuing_bank: string;
  ifsc_code: string;
  branch_email?: string;
  is_scheduled_bank: boolean;
  account_holder_text?: string;
  is_joint_aicte: boolean;
  principal_amount: number;
  interest_rate: number;
  issue_date: string;
  maturity_date: string;
  printed_maturity_amount: number;
  calculated_maturity_amount: number;
  math_discrepancy: number;
  trust_status: TrustStatus;
  lifecycle_status: LifecycleStatus;
  flags: FlagItem[];
  bbox_overlay: BBoxOverlayItem[];
  file_sha256?: string;
  rendered_image_path?: string;
  bank_verify_token?: string;
  bank_confirmed_at?: string;
  affidavit_6_uploaded?: boolean;
  maker_officer?: string;
  checker_officer?: string;
  replaced_by_fdr_id?: number;
  parent_fdr_id?: number;
  clarification_requested?: boolean;
  scrutiny_remarks?: string;
  days_to_maturity: number;
  urgency_score: number;
  pgrc_clearance: boolean;
  vigilance_clearance: boolean;
  grants_clearance: boolean;
  required_fdr_amount: number;
}

export interface KPIs {
  total_corpus_inr: number;
  total_corpus_cr: number;
  total_fdrs: number;
  bank_confirmed_instruments: number;
  flagged_tampered_cases: number;
  approaching_maturity_overdue: number;
  overdue_count: number;
  expiring_soon_count: number;
  trust_ladder_breakdown: {
    SUBMITTED: number;
    AUTO_CHECKED: number;
    FLAGGED: number;
    BANK_CONFIRMED: number;
    OFFICER_APPROVED: number;
  };
}

export interface StateHeatmapItem {
  state: string;
  total_corpus_inr: number;
  total_corpus_cr: number;
  active_fdrs: number;
  expiring_soon: number;
  overdue_flagged: number;
  institution_count: number;
  risk_score: number;
}

export interface DashboardResponse {
  simulated_date: string;
  kpis: KPIs;
  priority_list: FDRItem[];
  state_heatmap: StateHeatmapItem[];
}

export interface VerificationResult {
  success: boolean;
  fdr_id: number;
  fdr_number?: string;
  trust_status: TrustStatus;
  overall_pass: boolean;
  flags: FlagItem[];
  checks: {
    math_check?: CheckDetail;
    lien_check?: CheckDetail;
    bank_check?: CheckDetail;
    norm_check?: CheckDetail;
    duplicate_guard?: CheckDetail;
  };
  file_sha256: string;
  rendered_image_url: string;
  bbox_overlay: BBoxOverlayItem[];
  calculated_maturity_amount: number;
  math_discrepancy: number;
  is_joint_aicte: boolean;
  is_scheduled_bank: boolean;
  png_base64?: string;
  issuing_bank?: string;
  ifsc_code?: string;
  account_holder_text?: string;
  principal_amount?: number;
  interest_rate?: number;
  issue_date?: string;
  maturity_date?: string;
  printed_maturity_amount?: number;
  institution_name?: string;
  institution_state?: string;
  extracted_fields?: Record<string, any>;
}

