export interface HealthResponse {
  status: string;
  models_ready: boolean;
  data_ready: boolean;
}

export interface ModelMetrics {
  oof_roc_auc: number;
  oof_pr_auc: number;
  oof_precision_50: number;
  holdout_roc_auc: number;
  holdout_pr_auc: number;
  holdout_precision_50: number;
}

export interface MetricsResponse {
  selected_model: string;
  base_rate: number;
  models: Record<string, ModelMetrics>;
}

export interface WatchlistItem {
  rank: number;
  EmployeeNumber: number;
  risk_pct: number;
  reasons: string;
  action: string;
  MonthlyIncome: number;
}

export interface BusinessSummary {
  precision_at_50: number;
  base_rate: number;
  lift: number;
  leavers_caught: number;
  assumed_save_rate: number;
  people_saved_est: number;
  salary_months_assumed: number;
  salary_cost_avoided_est: number;
}

export interface WatchlistResponse {
  summary: BusinessSummary;
  items: WatchlistItem[];
}

export interface EmployeeBasic {
  EmployeeNumber: number;
  risk: number;
}

export interface EmployeeDetails {
  EmployeeNumber: number;
  OverTime: string;
  MonthlyIncome: number;
  BusinessTravel: string;
  JobSatisfaction: number;
}

export interface WhatIfChanges {
  OverTime?: string;
  MonthlyIncome?: number;
  BusinessTravel?: string;
  JobSatisfaction?: number;
}

export interface WhatIfRequest {
  employee_id: number;
  changes: WhatIfChanges;
}

export interface WhatIfResponse {
  prob_before: number;
  prob_after: number;
  delta_pct: number;
}

export interface ExpectedLossItem {
  rank_by_loss: number;
  EmployeeNumber: number;
  risk: number;
  MonthlyIncome: number;
  expected_loss_score: number;
}

export interface ExpectedLossResponse {
  items: ExpectedLossItem[];
  assumptions: {
    months_salary_cost: number;
    disclaimer: string;
  };
  overlap_with_risk_top50: number;
}

export interface ActionDraft {
  employee_id: number;
  status: string;
  to: string;
  subject: string;
  body: string;
  risk_pct: number;
  reasons: string;
  recommended_action: string;
}

