"""
ATS Boss API Routes
Endpoints for resume analysis and ATS optimization
"""

from fastapi import APIRouter, HTTPException, Depends
from app.dependencies import verify_api_key
from app.schemas.ats_schemas import (
    AnalyzeRequest,
    ATSBossResponse,
    AnalysisResponse,
    HealthCheckResponse
)
from app.services.ats_analyzer import analyze_resume
from typing import Dict, Any

router = APIRouter(
    prefix="/ats-boss",
    tags=["ats-boss"],
    dependencies=[Depends(verify_api_key)]
)


@router.post("/analyze", response_model=ATSBossResponse)
async def analyze_resume_endpoint(request: AnalyzeRequest) -> Dict[str, Any]:
    """
    Analyze resume against job description using selected ATS system

    This endpoint:
    1. Parses the PDF resume
    2. Analyzes it against the job description
    3. Returns ATS compatibility score, keyword analysis, and recommendations

    Parameters:
    - **ats_system**: ATS to mimic (workday, greenhouse, lever, ashby)
    - **resume_file**: Base64 encoded PDF resume
    - **job_description**: Full job description text

    Returns:
    - Comprehensive analysis with scores, recommendations, and ATS-specific tips
    """

    try:
        # Perform analysis
        analysis_result = await analyze_resume(
            base64_pdf=request.resume_file,
            job_description=request.job_description,
            ats_system=request.ats_system
        )

        return {
            "message": "Analysis completed successfully",
            "data": analysis_result
        }

    except ValueError as e:
        # Input validation errors
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # Other errors (OpenAI API, etc.)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint for ATS Boss service

    Returns:
    - Service status and app name
    """
    return {
        "status": "healthy",
        "app": "ats-boss"
    }


@router.get("/ats-systems")
async def get_ats_systems() -> Dict[str, Any]:
    """
    Get list of supported ATS systems with descriptions

    Returns:
    - List of ATS systems with their characteristics
    """
    return {
        "message": "Supported ATS systems",
        "data": {
            "systems": [
                {
                    "id": "workday",
                    "name": "Workday",
                    "description": "Strict exact keyword matching. Prefers DOCX format. Standard headings required.",
                    "characteristics": [
                        "Exact keyword matching (no synonyms)",
                        "Standard section headings only",
                        "Single-column layout preferred",
                        "DOCX preferred over PDF"
                    ]
                },
                {
                    "id": "greenhouse",
                    "name": "Greenhouse",
                    "description": "Strong structured data extraction. Good semantic understanding. 300+ integrations.",
                    "characteristics": [
                        "Semantic matching capability",
                        "Structured data extraction",
                        "Integration-focused",
                        "Handles standard formats well"
                    ]
                },
                {
                    "id": "lever",
                    "name": "Lever",
                    "description": "CRM-style with advanced NLP. Focus on candidate journey and long-term pipeline.",
                    "characteristics": [
                        "Advanced semantic understanding",
                        "Skill inference capability",
                        "Candidate relationship focus",
                        "Career progression analysis"
                    ]
                },
                {
                    "id": "ashby",
                    "name": "Ashby",
                    "description": "Cutting-edge AI matching. Best at understanding context and career transitions.",
                    "characteristics": [
                        "Advanced AI algorithms",
                        "Context understanding",
                        "Pattern recognition",
                        "Quantified achievement focus"
                    ]
                }
            ]
        }
    }
