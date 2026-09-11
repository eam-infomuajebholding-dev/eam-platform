export type TruthState =
  | 'LIVE'
  | 'STALE'
  | 'PARTIAL'
  | 'ESTIMATED'
  | 'NOT_AVAILABLE'
  | 'NOT_YET_OPERATIONAL'
  | 'BLOCKED'
  | 'UNKNOWN';

export type AttentionSeverity = 'NORMAL' | 'FYI' | 'WATCH' | 'ACTION' | 'DECISION' | 'CRITICAL';

export interface MetricValue {
  metric_id: string;
  label_ar: string;
  value?: number | string | null;
  truth_state?: TruthState;
  source: string;
  drill_down_path?: string | null;
  context?: string | null;
}

export interface JourneyMetricRow {
  journey_type: string;
  label_ar: string;
  classification: 'REAL_CREDENTIAL_FREE' | 'NOT_IMPLEMENTED' | 'PLACEHOLDER';
  active_count: number;
  completed_count: number;
  service_request_count: number;
}

export interface AttentionItem {
  id: string;
  title_ar: string;
  why_ar: string;
  severity: AttentionSeverity;
  domain: string;
  source: string;
  drill_down_path?: string | null;
  truth_state?: TruthState;
}

export interface PlatformHealthDomain {
  domain: string;
  label_ar: string;
  status: 'healthy' | 'degraded' | 'unavailable' | 'unknown';
  detail_ar?: string | null;
}

export interface CommercialReadinessItem {
  item_id: string;
  label_ar: string;
  status: TruthState;
  blocker?: string | null;
}

export interface RecentServiceRequestRow {
  id: number;
  reference_code: string;
  journey_type: string;
  status: string;
  created_at?: string | null;
}

export interface ScorecardItem {
  domain: string;
  label_ar: string;
  current_value: number | string;
  target_value?: number | string | null;
  status?: TruthState;
  evidence?: string | null;
}

export interface OperatingPulseItem {
  domain: string;
  label_ar: string;
  metric_id: string;
  value?: number | string | null;
  truth_state?: TruthState;
  source: string;
  drill_down_path?: string | null;
}

export interface ChangeItem {
  metric_id: string;
  label_ar: string;
  baseline: number | string;
  current: number | string;
  direction: 'up' | 'down' | 'flat' | 'unknown';
  significance?: string;
  domain: string;
  evidence?: string | null;
}

export interface RiskItem {
  risk_id: string;
  title_ar: string;
  domain: string;
  severity: AttentionSeverity;
  urgency: string;
  affected_capability: string;
  evidence: string;
  status?: TruthState;
  mitigation?: string | null;
  decision_required?: boolean;
}

export interface ControlAssuranceItem {
  control_id: string;
  label_ar: string;
  verification: 'TEST_VERIFIED' | 'RUNTIME_VERIFIED' | 'PARTIAL' | 'NOT_VERIFIED';
  source: string;
  limitations?: string | null;
}

export interface CommercialFunnelStage {
  stage_id: string;
  label_ar: string;
  status: TruthState;
  detail_ar?: string | null;
}

export interface CommandCenterOverview {
  generated_at: string;
  real_journey_count: number;
  service_request_status_counts: Record<string, number>;
  service_request_journey_counts: Record<string, number>;
  journey_status_counts: Record<string, number>;
  journey_metrics: JourneyMetricRow[];
  lead_counts: Record<string, number>;
  attention_items: AttentionItem[];
  platform_health: PlatformHealthDomain[];
  commercial_readiness: CommercialReadinessItem[];
  executive_kpis: MetricValue[];
  recent_service_requests: RecentServiceRequestRow[];
  financial_pulse: MetricValue[];
  strategic_scorecard?: ScorecardItem[];
  operating_pulse?: OperatingPulseItem[];
  what_changed?: ChangeItem[];
  comparison_period_label?: string;
  risk_items?: RiskItem[];
  control_assurance?: ControlAssuranceItem[];
  commercial_funnel?: CommercialFunnelStage[];
}

export interface ExecutiveBrief {
  generated_at: string;
  facts: string[];
  recommendations: string[];
  decisions_needed: string[];
  watch_next: string[];
  what_changed?: string[];
  what_matters?: string[];
  why?: string[];
  limitations?: string[];
  ai_enhanced: boolean;
  ai_assistance: 'RULE_ASSISTED' | 'AI_ASSISTED' | 'UNAVAILABLE';
  assistant_message?: string | null;
}

export interface EvidenceResponse {
  metric_id: string;
  label_ar: string;
  description_ar: string;
  source: string;
  formula: string;
  owner_domain: string;
  period?: string | null;
  freshness?: string | null;
  truth_state?: TruthState;
  last_successful_calculation?: string | null;
  limitations?: string[];
  drill_down_path?: string | null;
  trace_id?: string | null;
}

export type CommandSearchResultType =
  | 'JOURNEY'
  | 'SERVICE_REQUEST'
  | 'METRIC'
  | 'RISK'
  | 'DECISION_ITEM'
  | 'CAPABILITY'
  | 'COMMAND_CENTER_VIEW';

export interface CommandSearchResult {
  result_type: CommandSearchResultType;
  id: string;
  label_ar: string;
  description_ar?: string | null;
  navigation_path?: string | null;
  truth_state?: TruthState;
}

export interface CommandSearchResponse {
  query: string;
  mode: 'SEARCH' | 'ASK' | 'NAVIGATE' | 'INVESTIGATE';
  results: CommandSearchResult[];
  ai_answer?: string | null;
  limitations?: string[];
}
