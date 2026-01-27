"""
ATS Boss API Routes
Endpoints for resume analysis and ATS optimization
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.dependencies import verify_api_key
from app.schemas.ats_schemas import (
    AnalyzeRequest,
    ATSBossResponse,
    AnalysisResponse,
    HealthCheckResponse
)
from app.schemas.resume_schemas import GeneratePDFRequest
from app.services.ats_analyzer import analyze_resume
from app.services.resume_generator import resume_generator
from app.services.token_tracker import TokenTracker
from typing import Dict, Any
import io

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
    - **ats_system**: ATS to mimic (workday, greenhouse, ashby)
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


@router.post("/generate-pdf")
async def generate_optimized_pdf(request: GeneratePDFRequest):
    """
    Generate an ATS-optimized PDF resume

    Takes analysis results and generates a new PDF
    formatted specifically for the target ATS system.

    Parameters:
    - **ats_system**: Target ATS to optimize for (workday, greenhouse, ashby)
    - **resume_text**: Extracted text from original resume PDF
    - **job_description**: Full job description text
    - **analysis_result**: Full analysis data from /analyze endpoint

    Returns:
    - PDF file as streaming response
    """

    try:
        # Create token tracker for this request
        tracker = TokenTracker()

        # Generate the optimized PDF
        pdf_bytes = await resume_generator.generate_optimized_resume(
            resume_text=request.resume_text,
            job_description=request.job_description,
            analysis_result=request.analysis_result,
            ats_system=request.ats_system,
            tracker=tracker
        )

        # Create filename
        filename = f"resume_optimized_{request.ats_system}.pdf"

        # Return as streaming response
        # Use 'inline' disposition so browsers can preview the PDF
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes))
            }
        )

    except ValueError as e:
        # Input validation errors
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # Other errors (OpenAI API, Typst compilation, etc.)
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )
