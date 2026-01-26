"""
ATS Analyzer Service
Coordinates resume parsing and OpenAI analysis
"""

from app.services.resume_parser import parse_resume_pdf, validate_pdf_size
from app.services.openai_service import analyze_resume_with_openai
from typing import Dict, Any


async def analyze_resume(
    base64_pdf: str,
    job_description: str,
    ats_system: str
) -> Dict[str, Any]:
    """
    Complete resume analysis workflow

    Args:
        base64_pdf: Base64 encoded PDF resume
        job_description: Job description text
        ats_system: ATS system to mimic (workday, greenhouse, lever, ashby)

    Returns:
        Complete analysis results

    Raises:
        ValueError: If inputs are invalid
        Exception: If analysis fails
    """

    # Validate inputs
    if not base64_pdf:
        raise ValueError("Resume PDF is required")

    if not job_description or len(job_description.strip()) < 50:
        raise ValueError("Job description must be at least 50 characters")

    if ats_system.lower() not in ["workday", "greenhouse", "lever", "ashby"]:
        raise ValueError("Invalid ATS system. Must be: workday, greenhouse, lever, or ashby")

    # Validate PDF size (max 5MB)
    if not validate_pdf_size(base64_pdf, max_size_mb=5.0):
        raise ValueError("PDF file too large. Maximum size is 5MB")

    # Step 1: Parse PDF resume
    try:
        resume_text = await parse_resume_pdf(base64_pdf)
    except Exception as e:
        raise ValueError(f"Resume parsing failed: {str(e)}")

    # Step 2: Analyze with OpenAI
    try:
        analysis_result = await analyze_resume_with_openai(
            resume_text=resume_text,
            job_description=job_description.strip(),
            ats_system=ats_system.lower()
        )
    except Exception as e:
        raise Exception(f"Analysis failed: {str(e)}")

    # Step 3: Enhance results with metadata
    analysis_result["meta"] = {
        "ats_system": ats_system.lower(),
        "resume_length": len(resume_text),
        "jd_length": len(job_description)
    }

    return analysis_result
