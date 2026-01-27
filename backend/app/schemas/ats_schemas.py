"""
Pydantic Schemas for ATS Boss API
Request and response models for type validation
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional, Literal, Union


# Request Models

class AnalyzeRequest(BaseModel):
    """Request model for resume analysis"""

    ats_system: Literal["workday", "greenhouse", "ashby"] = Field(
        ...,
        description="ATS system to mimic"
    )
    resume_file: str = Field(
        ...,
        description="Base64 encoded PDF resume"
    )
    job_description: str = Field(
        ...,
        min_length=50,
        description="Job description text (minimum 50 characters)"
    )

    @field_validator("resume_file")
    @classmethod
    def validate_resume_file(cls, v: str) -> str:
        if not v or len(v) < 100:
            raise ValueError("Resume file appears to be empty or invalid")
        return v

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, v: str) -> str:
        if len(v.strip()) < 50:
            raise ValueError("Job description must be at least 50 characters")
        return v.strip()


# Response Models

class ParsingResults(BaseModel):
    """Resume parsing results"""

    extracted_sections: List[str] = Field(
        default_factory=list,
        description="Sections successfully extracted from resume"
    )
    failed_sections: List[str] = Field(
        default_factory=list,
        description="Sections that would fail ATS parsing"
    )
    formatting_issues: List[str] = Field(
        default_factory=list,
        description="Formatting problems detected"
    )


class KeywordAnalysis(BaseModel):
    """Keyword matching analysis"""

    matched_keywords: List[str] = Field(
        default_factory=list,
        description="Keywords from job description found in resume"
    )
    missing_keywords: List[str] = Field(
        default_factory=list,
        description="Critical keywords missing from resume"
    )
    keyword_density: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Ratio of matched to total keywords (0-1)"
    )


class Recommendation(BaseModel):
    """Single recommendation for improvement (old format)"""

    priority: Literal["high", "medium", "low"] = Field(
        ...,
        description="Priority level of the recommendation"
    )
    category: Literal["formatting", "keywords", "structure", "content"] = Field(
        ...,
        description="Category of the issue"
    )
    issue: str = Field(
        ...,
        description="Description of the problem"
    )
    suggestion: str = Field(
        ...,
        description="Specific actionable suggestion to fix the issue"
    )


class DeepRecommendation(BaseModel):
    """Deep recommendation from GPT-5-mini (new format)"""

    category: str = Field(
        ...,
        description="Category of the recommendation"
    )
    current_state: str = Field(
        ...,
        description="Current state of the issue"
    )
    recommended_change: str = Field(
        ...,
        description="Specific change recommended"
    )
    expected_impact: str = Field(
        ...,
        description="Expected impact of the change"
    )


class AnalysisMeta(BaseModel):
    """Metadata about the analysis"""

    ats_system: str = Field(..., description="ATS system used for analysis")
    resume_length: int = Field(..., description="Number of characters in resume")
    jd_length: int = Field(..., description="Number of characters in job description")
    resume_text: Optional[str] = Field(None, description="Extracted resume text for PDF generation")
    parsing_method: Optional[str] = Field(None, description="Method used for parsing")
    analysis_model: Optional[str] = Field(None, description="Model used for analysis")


class UsageInfo(BaseModel):
    """API usage and cost information"""

    input_tokens: int = Field(..., description="Number of input tokens used")
    output_tokens: int = Field(..., description="Number of output tokens generated")
    total_tokens: int = Field(..., description="Total tokens (input + output)")
    cost_usd: float = Field(..., ge=0, description="Cost in USD for this analysis")
    model: str = Field(default="gpt-4o-mini", description="Model used for analysis")


class AnalysisResponse(BaseModel):
    """Complete analysis response"""

    overall_score: Union[int, float] = Field(
        ...,
        ge=0,
        le=100,
        description="Overall ATS compatibility score (0-100)"
    )
    keyword_match_rate: Union[int, float] = Field(
        ...,
        ge=0,
        le=100,
        description="Percentage of job keywords found in resume"
    )
    ats_compatible: bool = Field(
        ...,
        description="Whether resume is likely to pass ATS screening"
    )
    parsing_results: ParsingResults = Field(
        ...,
        description="Resume parsing analysis"
    )
    keyword_analysis: KeywordAnalysis = Field(
        ...,
        description="Keyword matching analysis"
    )
    recommendations: List[Union[Recommendation, DeepRecommendation]] = Field(
        default_factory=list,
        description="List of improvement recommendations (old or new format)"
    )
    meta: Optional[AnalysisMeta] = Field(
        None,
        description="Metadata about the analysis"
    )
    usage: Optional[UsageInfo] = Field(
        None,
        description="Token usage and cost information for this analysis"
    )


# API Response Wrapper

class ATSBossResponse(BaseModel):
    """Standard API response wrapper for ATS Boss"""

    message: str = Field(..., description="Response message")
    data: Optional[AnalysisResponse] = Field(None, description="Analysis data")


class HealthCheckResponse(BaseModel):
    """Health check response"""

    status: str = Field(..., description="Service status")
    app: str = Field(..., description="App name")
