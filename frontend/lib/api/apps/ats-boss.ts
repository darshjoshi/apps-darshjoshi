import { BaseAPI } from '../base';
import { APIResponse } from '../types';

// ATS Boss specific types
export interface ATSSystem {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface ATSSystemsResponse {
  systems: ATSSystem[];
}

export interface AnalyzeRequest {
  ats_system: 'workday' | 'greenhouse' | 'ashby';
  resume_file: string; // base64 encoded PDF
  job_description: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  suggestion: string;
}

export interface KeywordAnalysis {
  matched_keywords: string[];
  missing_keywords: string[];
  keyword_density: number;
}

export interface ParsingResults {
  extracted_sections: string[];
  failed_sections: string[];
  formatting_issues: string[];
}

export interface UsageInfo {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  model: string;
  reasoning_tokens?: number;  // GPT-5-mini thinking tokens
  actual_output_tokens?: number;  // Actual output (excluding reasoning)
  breakdown?: Record<string, { tokens: number; cost: number }>;
}

// NEW: Deep analysis types for GPT-5-mini
export interface CriticalIssue {
  issue: string;
  impact: 'high' | 'medium' | 'low';
  workday_behavior?: string;
  greenhouse_behavior?: string;
  ashby_behavior?: string;
  fix: string;
  priority: number;
}

export interface Scoring {
  keyword_score: number;
  section_score: number;
  format_score: number;
  overall_score: number;
  confidence: number;
  // Greenhouse specific
  data_quality_score?: number;
  experience_alignment_score?: number;
  // Ashby specific
  achievement_score?: number;
  skills_score?: number;
  progression_score?: number;
  cultural_fit_score?: number;
}

export interface Outcome {
  category: string;
  would_reach_human: boolean;
  queue_position: string;
}

export interface SectionDetection {
  found_sections: string[];
  skipped_sections: string[];
  missing_sections: string[];
  detection_score: number;
}

export interface FormattingAnalysis {
  single_column: boolean;
  has_tables: boolean;
  has_graphics: boolean;
  has_text_boxes: boolean;
  compatibility_score: number;
  issues: string[];
}

export interface DeepRecommendation {
  category: string;
  current_state: string;
  recommended_change: string;
  expected_impact: string;
}

export interface AnalysisMetadata {
  model: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
}

export interface AnalysisResult {
  overall_score: number;
  keyword_match_rate: number;
  ats_compatible: boolean;
  parsing_results: ParsingResults;
  keyword_analysis: KeywordAnalysis;
  recommendations: Recommendation[] | DeepRecommendation[];
  usage?: UsageInfo;
  
  // NEW: Deep analysis fields from GPT-5-mini
  scoring?: Scoring;
  outcome?: Outcome;
  critical_issues?: CriticalIssue[];
  section_detection?: SectionDetection;
  formatting_analysis?: FormattingAnalysis;
  reasoning_summary?: string;
  
  // ATS-specific deep data
  structured_data?: Record<string, unknown>;  // Greenhouse
  achievements?: Array<{
    text: string;
    metric_type: string;
    metric_value: string;
    impact_level: string;
    relevance_to_job: string;
    score: number;
  }>;  // Ashby
  skills_analysis?: {
    explicit_skills: string[];
    inferred_skills: Array<{ skill: string; evidence: string; confidence: number }>;
    required_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
    skills_score: number;
  };  // Ashby
  career_progression?: {
    positions: Array<{ title: string; level: string; company: string }>;
    trajectory: string;
    promotions_detected: number;
    years_of_experience: number;
    progression_score: number;
  };  // Ashby
  standout_factors?: string[];  // Ashby
  
  meta?: {
    ats_system: string;
    resume_length: number;
    jd_length: number;
    parsing_method: string;
    analysis_model: string;
  };
  _analysis_metadata?: AnalysisMetadata;
}

export interface AnalysisResponse {
  message: string;
  data: AnalysisResult;
}

/**
 * ATS Boss API client
 * Handles resume analysis and ATS system data
 */
class ATSBossAPI extends BaseAPI {
  constructor() {
    super('/ats-boss');
  }

  /**
   * Get health status
   */
  getHealth = () =>
    this.call<APIResponse>('/health', 'GET');

  /**
   * Get list of supported ATS systems
   */
  getATSSystems = () =>
    this.call<{ data: ATSSystemsResponse }>('/ats-systems', 'GET');

  /**
   * Analyze resume against job description
   */
  analyzeResume = (data: AnalyzeRequest) =>
    this.call<AnalysisResponse>('/analyze', 'POST', data);
}

export const atsBossAPI = new ATSBossAPI();
