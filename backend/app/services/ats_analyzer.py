"""
ATS Analyzer Service
Coordinates resume parsing with REAL ATS logic replication
Now uses GPT-5-mini for deep reasoning-based analysis
"""
import logging
from app.services.resume_parser import parse_resume_pdf, validate_pdf_size
from app.services.openai_service import generate_recommendations
from app.services.ats_parsers import WorkdayParser, GreenhouseParser, AshbyParser
from app.services.ats_deep_analysis import workday_analyzer, greenhouse_analyzer, ashby_analyzer
from app.services.token_tracker import TokenTracker
from typing import Dict, Any

# Configure logger
logger = logging.getLogger(__name__)


async def analyze_resume(
    base64_pdf: str,
    job_description: str,
    ats_system: str
) -> Dict[str, Any]:
    """
    Complete resume analysis workflow using GPT-5-mini deep reasoning

    Flow:
    1. Parse PDF to extract text
    2. Run GPT-5-mini deep ATS analyzer (Workday/Greenhouse/Ashby) - thinking-enabled
    4. Return comprehensive results with reasoning

    Args:
        base64_pdf: Base64 encoded PDF resume
        job_description: Job description text
        ats_system: ATS system to mimic (workday, greenhouse, ashby)

    Returns:
        Complete analysis results with deep reasoning + recommendations

    Raises:
        ValueError: If inputs are invalid
        Exception: If analysis fails
    """

    # Validate inputs
    if not base64_pdf:
        raise ValueError("Resume PDF is required")

    if not job_description or len(job_description.strip()) < 50:
        raise ValueError("Job description must be at least 50 characters")

    if ats_system.lower() not in ["workday", "greenhouse", "ashby"]:
        raise ValueError("Invalid ATS system. Must be: workday, greenhouse, or ashby")

    logger.info(f"[ATS_ANALYZER] ========== Starting Deep ATS Analysis (GPT-5-mini) ==========")
    logger.info(f"[ATS_ANALYZER] ATS System: {ats_system.upper()}")
    logger.info(f"[ATS_ANALYZER] Job Description Length: {len(job_description)} chars")

    # Create token tracker to aggregate usage across all OpenAI calls
    tracker = TokenTracker()

    # Validate PDF size (max 5MB)
    if not validate_pdf_size(base64_pdf, max_size_mb=5.0):
        raise ValueError("PDF file too large. Maximum size is 5MB")

    # Step 1: Parse PDF resume to extract text
    logger.info("[ATS_ANALYZER] STEP 1: Parsing PDF resume...")
    try:
        resume_text = await parse_resume_pdf(base64_pdf)
        logger.info(f"[ATS_ANALYZER] ✓ Resume parsed successfully ({len(resume_text)} chars extracted)")
    except Exception as e:
        logger.error(f"[ATS_ANALYZER] ✗ Resume parsing failed: {str(e)}")
        raise ValueError(f"Resume parsing failed: {str(e)}")

    # Step 2: Run GPT-5-mini deep ATS analyzer (THINKING-ENABLED)
    ats_system_lower = ats_system.lower()
    logger.info(f"[ATS_ANALYZER] STEP 2: Running {ats_system_lower.upper()} deep analyzer (GPT-5-mini)...")

    try:
        if ats_system_lower == "workday":
            # Workday: Deep reasoning with strict exact matching logic
            logger.info("[ATS_ANALYZER] Using Workday deep analyzer (GPT-5-mini thinking)")
            parsing_results = await workday_analyzer.analyze(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Workday deep analysis complete")

        elif ats_system_lower == "greenhouse":
            # Greenhouse: Deep reasoning with structured data extraction
            logger.info("[ATS_ANALYZER] Using Greenhouse deep analyzer (GPT-5-mini thinking)")
            parsing_results = await greenhouse_analyzer.analyze(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Greenhouse deep analysis complete")

        elif ats_system_lower == "ashby":
            # Ashby: Deep reasoning with AI-powered achievement focus
            logger.info("[ATS_ANALYZER] Using Ashby deep analyzer (GPT-5-mini thinking)")
            parsing_results = await ashby_analyzer.analyze(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Ashby deep analysis complete")

        else:
            raise ValueError(f"Unknown ATS system: {ats_system}")

    except Exception as e:
        logger.error(f"[ATS_ANALYZER] ✗ ATS analysis failed: {str(e)}")
        raise Exception(f"ATS analysis failed: {str(e)}")

    logger.info(f"[ATS_ANALYZER] Analysis results - Score: {parsing_results.get('overall_score', 0)}, Keywords matched: {len(parsing_results.get('matched_keywords', []))}")

    # Step 3: Recommendations included in deep analysis
    logger.info("[ATS_ANALYZER] STEP 3: Recommendations included in deep analysis")

    # Step 4: Structure final results in expected format
    logger.info("[ATS_ANALYZER] STEP 4: Structuring final results...")
    
    # Get scoring data (deep analyzers have richer scoring)
    scoring = parsing_results.get("scoring", {})
    
    analysis_result = {
        "overall_score": parsing_results.get("overall_score", scoring.get("overall_score", 0)),
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

        # NEW: Deep analysis data from GPT-5-mini
        "scoring": scoring,
        "outcome": parsing_results.get("outcome", {}),
        "critical_issues": parsing_results.get("critical_issues", []),
        "section_detection": parsing_results.get("section_detection", {}),
        "formatting_analysis": parsing_results.get("formatting_analysis", {}),
        "reasoning_summary": parsing_results.get("reasoning_summary", ""),
        
        # ATS-specific deep data
        "structured_data": parsing_results.get("structured_data", {}),  # Greenhouse
        "achievements": parsing_results.get("achievements", []),  # Ashby
        "skills_analysis": parsing_results.get("skills_analysis", {}),  # Ashby
        "career_progression": parsing_results.get("career_progression", {}),  # Ashby
        "standout_factors": parsing_results.get("standout_factors", []),  # Ashby
        
        "meta": {
            "ats_system": ats_system_lower,
            "resume_length": len(resume_text),
            "jd_length": len(job_description),
            "resume_text": resume_text,  # Include for PDF generation
            "parsing_method": "gpt5_mini_deep",
            "analysis_model": "gpt-5-mini"
        },
        "usage": tracker.to_dict(),  # Include token usage and cost
        "_analysis_metadata": parsing_results.get("_analysis_metadata", {})
    }

    logger.info(f"[ATS_ANALYZER] ========== Deep Analysis Complete ==========")
    logger.info(f"[ATS_ANALYZER] Final Score: {analysis_result['overall_score']}/100")
    logger.info(f"[ATS_ANALYZER] Keyword Match Rate: {analysis_result['keyword_match_rate']}%")
    logger.info(f"[ATS_ANALYZER] ATS Compatible: {analysis_result['ats_compatible']}")
    logger.info(f"[ATS_ANALYZER] 💰 Token Usage: {tracker.prompt_tokens} input, {tracker.completion_tokens} output = ${tracker.cost_usd:.4f}")

    return analysis_result
