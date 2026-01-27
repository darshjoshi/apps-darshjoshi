"""
Pydantic Schemas for Resume PDF Generation
Request and response models for the generate-pdf endpoint
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal


# Resume Content Models (Output from GPT-5-mini)

class ContactInfo(BaseModel):
    """Contact information for resume header"""
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    location: str = Field(..., description="City, State or City, Country")
    linkedin: Optional[str] = Field(None, description="LinkedIn URL or profile name")


class ExperienceEntry(BaseModel):
    """Single work experience entry"""
    company: str = Field(..., description="Company name")
    title: str = Field(..., description="Job title")
    location: Optional[str] = Field(None, description="Job location")
    start_date: str = Field(..., description="Start date (e.g., Jan 2020)")
    end_date: str = Field(..., description="End date (e.g., Present)")
    bullets: List[str] = Field(default_factory=list, description="Achievement bullets")


class EducationEntry(BaseModel):
    """Single education entry"""
    institution: str = Field(..., description="School or university name")
    degree: str = Field(..., description="Degree and major")
    location: Optional[str] = Field(None, description="School location")
    graduation_date: Optional[str] = Field(None, description="Graduation date")
    gpa: Optional[str] = Field(None, description="GPA if notable")


class Skills(BaseModel):
    """Skills categorized by type"""
    technical: List[str] = Field(default_factory=list, description="Technical skills")
    tools: List[str] = Field(default_factory=list, description="Tools and technologies")
    soft: List[str] = Field(default_factory=list, description="Soft skills and other")


class StructuredResume(BaseModel):
    """
    Structured resume data for template rendering
    This is the output format from GPT-5-mini
    """
    contact: ContactInfo = Field(..., description="Contact information")
    summary: Optional[str] = Field(None, description="Professional summary (2-3 sentences)")
    experience: List[ExperienceEntry] = Field(default_factory=list, description="Work experience")
    education: List[EducationEntry] = Field(default_factory=list, description="Education entries")
    skills: Skills = Field(default_factory=Skills, description="Skills by category")


# API Request/Response Models

class GeneratePDFRequest(BaseModel):
    """Request model for PDF generation"""

    ats_system: Literal["workday", "greenhouse", "ashby"] = Field(
        ...,
        description="Target ATS system for optimization"
    )
    resume_text: str = Field(
        ...,
        min_length=100,
        description="Extracted text from original resume PDF"
    )
    job_description: str = Field(
        ...,
        min_length=50,
        max_length=50000,
        description="Job description text (50 to 50,000 characters)"
    )
    analysis_result: Dict[str, Any] = Field(
        ...,
        description="Full analysis data from /analyze endpoint"
    )


class GeneratePDFResponse(BaseModel):
    """Response wrapper for PDF generation (PDF returned as stream, not in JSON)"""
    message: str = Field(..., description="Response message")
    filename: str = Field(..., description="Suggested filename for download")
