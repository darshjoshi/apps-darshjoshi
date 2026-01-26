"""
ATS Analyzer Service
Coordinates resume parsing with REAL ATS logic replication
"""
import logging
from app.services.resume_parser import parse_resume_pdf, validate_pdf_size
from app.services.openai_service import generate_recommendations
from app.services.ats_parsers import WorkdayParser, GreenhouseParser, AshbyParser
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

    logger.info(f"[ATS_ANALYZER] ========== Starting ATS Analysis ==========")
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

    # Step 2: Run appropriate ATS parser (ACTUAL LOGIC REPLICATION)
    ats_system_lower = ats_system.lower()
    logger.info(f"[ATS_ANALYZER] STEP 2: Running {ats_system_lower.upper()} parser...")

    try:
        if ats_system_lower == "workday":
            # Workday: Strict exact matching, standard headings only
            logger.info("[ATS_ANALYZER] Using Workday parser (strict exact matching)")
            parser = WorkdayParser()
            parsing_results = await parser.parse_resume(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Workday parsing complete")

        elif ats_system_lower == "greenhouse":
            # Greenhouse: Structured data extraction with semantic understanding
            logger.info("[ATS_ANALYZER] Using Greenhouse parser (semantic understanding)")
            parser = GreenhouseParser()
            parsing_results = await parser.parse_resume(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Greenhouse parsing complete")

        elif ats_system_lower == "ashby":
            # Ashby: AI-powered with focus on achievements and metrics
            logger.info("[ATS_ANALYZER] Using Ashby parser (AI-powered metrics focus)")
            parser = AshbyParser()
            parsing_results = await parser.parse_resume(resume_text, job_description, tracker)
            logger.info("[ATS_ANALYZER] ✓ Ashby parsing complete")

        elif ats_system_lower == "lever":
            # Lever: Complex NLP - use OpenAI for this (too complex to replicate)
            logger.info("[ATS_ANALYZER] Using Lever parser (OpenAI-based NLP)")
            from app.services.openai_service import analyze_resume_with_openai
            raw_lever_results = await analyze_resume_with_openai(
                resume_text=resume_text,
                job_description=job_description.strip(),
                ats_system="lever",
                tracker=tracker
            )
            
            # Flatten the structure to match what Step 4 expects
            # Step 4 expects keys like 'matched_keywords', 'extracted_sections' to be at the top level
            parsing_results = {
                "overall_score": raw_lever_results.get("overall_score", 0),
                "keyword_match_rate": raw_lever_results.get("keyword_match_rate", 0),
                "ats_compatible": raw_lever_results.get("ats_compatible", False),
                "recommendations": raw_lever_results.get("recommendations", []),
                "ats_specific_tips": raw_lever_results.get("ats_specific_tips", []),
                # Unwrap nested objects
                **raw_lever_results.get("parsing_results", {}),
                **raw_lever_results.get("keyword_analysis", {})
            }
            logger.info("[ATS_ANALYZER] ✓ Lever parsing complete")
        else:
            raise ValueError(f"Unknown ATS system: {ats_system}")

    except Exception as e:
        logger.error(f"[ATS_ANALYZER] ✗ ATS parsing failed: {str(e)}")
        raise Exception(f"ATS parsing failed: {str(e)}")

    logger.info(f"[ATS_ANALYZER] Parsing results - Score: {parsing_results.get('overall_score', 0)}, Keywords matched: {len(parsing_results.get('matched_keywords', []))}")

    # Step 3: Generate recommendations using OpenAI (only for recommendations, not parsing)
    # For Lever, we already have full results from OpenAI, so skip this
    if ats_system_lower != "lever":
        logger.info("[ATS_ANALYZER] STEP 3: Generating AI recommendations...")
        try:
            recommendations_and_tips = await generate_recommendations(
                parsing_results=parsing_results,
                ats_system=ats_system_lower,
                resume_text=resume_text,
                job_description=job_description,
                tracker=tracker
            )
            logger.info(f"[ATS_ANALYZER] ✓ Generated {len(recommendations_and_tips.get('recommendations', []))} recommendations")

            # Merge recommendations into results
            parsing_results["recommendations"] = recommendations_and_tips.get("recommendations", [])
            parsing_results["ats_specific_tips"] = recommendations_and_tips.get("ats_specific_tips", [])

        except Exception as e:
            # If recommendation generation fails, continue with just parsing results
            logger.warning(f"[ATS_ANALYZER] ⚠ Recommendation generation failed: {str(e)}")
            parsing_results["recommendations"] = []
            parsing_results["ats_specific_tips"] = []
    else:
        logger.info("[ATS_ANALYZER] STEP 3: Skipped (Lever already has recommendations)")

    # Step 4: Structure final results in expected format
    logger.info("[ATS_ANALYZER] STEP 4: Structuring final results...")
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
        },
        "usage": tracker.to_dict()  # Include token usage and cost
    }

    logger.info(f"[ATS_ANALYZER] ========== Analysis Complete ==========")
    logger.info(f"[ATS_ANALYZER] Final Score: {analysis_result['overall_score']}/100")
    logger.info(f"[ATS_ANALYZER] Keyword Match Rate: {analysis_result['keyword_match_rate']}%")
    logger.info(f"[ATS_ANALYZER] ATS Compatible: {analysis_result['ats_compatible']}")
    logger.info(f"[ATS_ANALYZER] 💰 Token Usage: {tracker.prompt_tokens} input, {tracker.completion_tokens} output = ${tracker.cost_usd:.4f}")

    return analysis_result

