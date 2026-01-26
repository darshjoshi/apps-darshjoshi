"""
ATS Analyzer Service
Coordinates resume parsing with REAL ATS logic replication
"""

from app.services.resume_parser import parse_resume_pdf, validate_pdf_size
from app.services.openai_service import generate_recommendations
from app.services.ats_parsers import WorkdayParser, GreenhouseParser, AshbyParser
from typing import Dict, Any


async def analyze_resume(
    base64_pdf: str,
    job_description: str,
    ats_system: str
) -> Dict[str, Any]:
    """
    Complete resume analysis workflow using REAL ATS parsing engines

    Flow:
    1. Parse PDF to extract text
    2. Run appropriate ATS parser (Workday/Greenhouse/Ashby) - actual logic replication
    3. For Lever (complex NLP), use OpenAI
    4. Use OpenAI to generate human-readable recommendations based on parsing results
    5. Return combined results

    Args:
        base64_pdf: Base64 encoded PDF resume
        job_description: Job description text
        ats_system: ATS system to mimic (workday, greenhouse, lever, ashby)

    Returns:
        Complete analysis results with actual parsing data + AI recommendations

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

    # Step 1: Parse PDF resume to extract text
    try:
        resume_text = await parse_resume_pdf(base64_pdf)
    except Exception as e:
        raise ValueError(f"Resume parsing failed: {str(e)}")

    # Step 2: Run appropriate ATS parser (ACTUAL LOGIC REPLICATION)
    ats_system_lower = ats_system.lower()

    try:
        if ats_system_lower == "workday":
            # Workday: Strict exact matching, standard headings only
            parser = WorkdayParser()
            parsing_results = parser.parse_resume(resume_text, job_description)

        elif ats_system_lower == "greenhouse":
            # Greenhouse: Structured data extraction with semantic understanding
            parser = GreenhouseParser()
            parsing_results = parser.parse_resume(resume_text, job_description)

        elif ats_system_lower == "ashby":
            # Ashby: AI-powered with focus on achievements and metrics
            parser = AshbyParser()
            parsing_results = parser.parse_resume(resume_text, job_description)

        elif ats_system_lower == "lever":
            # Lever: Complex NLP - use OpenAI for this (too complex to replicate)
            from app.services.openai_service import analyze_resume_with_openai
            parsing_results = await analyze_resume_with_openai(
                resume_text=resume_text,
                job_description=job_description.strip(),
                ats_system="lever"
            )
        else:
            raise ValueError(f"Unknown ATS system: {ats_system}")

    except Exception as e:
        raise Exception(f"ATS parsing failed: {str(e)}")

    # Step 3: Generate recommendations using OpenAI (only for recommendations, not parsing)
    # For Lever, we already have full results from OpenAI, so skip this
    if ats_system_lower != "lever":
        try:
            recommendations_and_tips = await generate_recommendations(
                parsing_results=parsing_results,
                ats_system=ats_system_lower,
                resume_text=resume_text,
                job_description=job_description
            )

            # Merge recommendations into results
            parsing_results["recommendations"] = recommendations_and_tips.get("recommendations", [])
            parsing_results["ats_specific_tips"] = recommendations_and_tips.get("ats_specific_tips", [])

        except Exception as e:
            # If recommendation generation fails, continue with just parsing results
            print(f"Warning: Recommendation generation failed: {str(e)}")
            parsing_results["recommendations"] = []
            parsing_results["ats_specific_tips"] = []

    # Step 4: Structure final results in expected format
    analysis_result = {
        "overall_score": parsing_results.get("overall_score", 0),
        "keyword_match_rate": parsing_results.get("keyword_match_rate", 0),
        "ats_compatible": parsing_results.get("ats_compatible", False),
        "parsing_results": {
            "extracted_sections": parsing_results.get("extracted_sections", []),
            "failed_sections": parsing_results.get("failed_sections", []),
            "formatting_issues": parsing_results.get("formatting_issues", [])
        },
        "keyword_analysis": {
            "matched_keywords": parsing_results.get("matched_keywords", []),
            "missing_keywords": parsing_results.get("missing_keywords", []),
            "keyword_density": len(parsing_results.get("matched_keywords", [])) / max(len(resume_text.split()), 1)
        },
        "recommendations": parsing_results.get("recommendations", []),
        "ats_specific_tips": parsing_results.get("ats_specific_tips", []),
        "meta": {
            "ats_system": ats_system_lower,
            "resume_length": len(resume_text),
            "jd_length": len(job_description),
            "parsing_method": "real_engine" if ats_system_lower != "lever" else "llm_based"
        }
    }

    return analysis_result
