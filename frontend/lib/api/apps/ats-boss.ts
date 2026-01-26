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
  ats_system: 'workday' | 'greenhouse' | 'lever' | 'ashby';
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

export interface AnalysisResult {
  overall_score: number;
  keyword_match_rate: number;
  ats_compatible: boolean;
  parsing_results: ParsingResults;
  keyword_analysis: KeywordAnalysis;
  recommendations: Recommendation[];
  ats_specific_tips: string[];
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
