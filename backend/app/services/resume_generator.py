"""
Resume Generator Service
Orchestrates PDF generation using GPT-5-mini for content restructuring and Typst for rendering
"""

import json
import logging
from typing import Dict, Any, Optional

from app.services.gpt5_mini_service import gpt5_service
from app.services.typst_compiler import typst_compiler, TypstCompilationError
from app.services.resume_templates import get_template
from app.services.token_tracker import TokenTracker
from app.schemas.resume_schemas import StructuredResume

# Configure logger
logger = logging.getLogger(__name__)


class ResumeGenerator:
    """Service for generating ATS-optimized PDF resumes"""

    def _get_system_prompt(self, ats_system: str) -> str:
        """
        Get the system prompt for GPT-5-mini based on ATS system

        Args:
            ats_system: Target ATS system (workday, greenhouse, ashby)

        Returns:
            System prompt string
        """
        base_prompt = """You are an expert resume formatting specialist. Your task is to restructure resume content for optimal ATS parsing while preserving ALL factual information.

CRITICAL RULES:
1. PRESERVE all factual content exactly - job titles, companies, dates, education, skills
2. NEVER fabricate or add information that isn't in the original resume
3. DO restructure content for better ATS parsing
4. DO naturally incorporate missing keywords where they genuinely apply
5. DO fix formatting issues identified in the analysis
6. Output ONLY valid JSON matching the specified schema

OUTPUT JSON SCHEMA:
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or null"
  },
  "summary": "string or null (2-3 sentences, keyword-rich)",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "location": "string or null",
      "start_date": "string (e.g., Jan 2020)",
      "end_date": "string (e.g., Present)",
      "bullets": ["string", "..."] (achievement-focused, metrics where possible)
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "location": "string or null",
      "graduation_date": "string or null",
      "gpa": "string or null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"]
  }
}"""

        ats_specific = {
            "workday": """
ATS-SPECIFIC REQUIREMENTS (Workday):
- Use EXACT keyword matches from the job description - no synonyms
- Standard section headings ONLY: Contact, Summary, Work Experience, Education, Skills
- Format dates as: "Jan 2020 - Present"
- Keep formatting extremely simple - single column, no complex structures
- Skills should be comma-separated lists
- Every bullet should be on its own line
- Avoid special characters that might confuse OCR""",

            "greenhouse": """
ATS-SPECIFIC REQUIREMENTS (Greenhouse):
- Semantic matching is supported - use industry-standard terminology
- Structure data for clear field extraction
- Format dates consistently as: "Jan 2020 – Dec 2023"
- Contact info should be clearly separated for parsing
- Skills can be grouped by category
- Include LinkedIn if available
- Focus on clear data structure over visual design""",

            "ashby": """
ATS-SPECIFIC REQUIREMENTS (Ashby):
- Achievement-focused content with quantified metrics prominently displayed
- Context-aware keyword placement - show skills in action
- Clear career progression should be visible
- Include both explicit skills AND skills demonstrated through experience
- Metrics format: "Increased X by Y% resulting in Z"
- Professional summary should tell a career story
- Modern, clean formatting is acceptable"""
        }

        return base_prompt + ats_specific.get(ats_system.lower(), "")

    def _build_user_prompt(
        self,
        resume_text: str,
        job_description: str,
        analysis_result: Dict[str, Any],
        ats_system: str
    ) -> str:
        """
        Build the user prompt with resume, JD, and analysis data

        Args:
            resume_text: Original resume text
            job_description: Target job description
            analysis_result: Analysis from the /analyze endpoint
            ats_system: Target ATS system

        Returns:
            User prompt string
        """
        # Extract key analysis data
        missing_keywords = analysis_result.get("keyword_analysis", {}).get("missing_keywords", [])
        critical_issues = analysis_result.get("critical_issues", [])
        recommendations = analysis_result.get("recommendations", [])

        # Format critical issues
        issues_text = ""
        if critical_issues:
            issues_list = [f"- {issue.get('issue', '')}: {issue.get('fix', '')}"
                         for issue in critical_issues[:5]]
            issues_text = "\n".join(issues_list)

        # Format recommendations
        recs_text = ""
        if recommendations:
            recs_list = [f"- {rec.get('recommended_change', rec.get('suggestion', ''))}"
                        for rec in recommendations[:5]]
            recs_text = "\n".join(recs_list)

        return f"""ORIGINAL RESUME:
---
{resume_text}
---

JOB DESCRIPTION:
---
{job_description}
---

ANALYSIS RESULTS:

Missing Keywords to Incorporate (where genuinely applicable):
{', '.join(missing_keywords[:15]) if missing_keywords else 'None identified'}

Critical Issues to Fix:
{issues_text if issues_text else 'None identified'}

Key Recommendations:
{recs_text if recs_text else 'None identified'}

TARGET ATS SYSTEM: {ats_system.upper()}

Please restructure this resume into the JSON format specified in the system prompt.
Preserve all factual information while optimizing for {ats_system.upper()} ATS parsing.
Naturally incorporate missing keywords ONLY where they genuinely apply to the candidate's experience."""

    def _structured_to_typst_data(self, data: StructuredResume) -> Dict[str, Any]:
        """
        Convert StructuredResume to dict for Typst template

        Args:
            data: Structured resume data

        Returns:
            Dictionary for Typst template variables
        """
        return {
            "name": data.contact.name,
            "email": data.contact.email,
            "phone": data.contact.phone,
            "location": data.contact.location,
            "linkedin": data.contact.linkedin,
            "summary": data.summary,
            "experience": [
                {
                    "company": exp.company,
                    "title": exp.title,
                    "location": exp.location,
                    "start_date": exp.start_date,
                    "end_date": exp.end_date,
                    "bullets": exp.bullets
                }
                for exp in data.experience
            ],
            "education": [
                {
                    "institution": edu.institution,
                    "degree": edu.degree,
                    "location": edu.location,
                    "graduation_date": edu.graduation_date,
                    "gpa": edu.gpa
                }
                for edu in data.education
            ],
            "skills": {
                "technical": data.skills.technical,
                "tools": data.skills.tools,
                "soft": data.skills.soft
            }
        }

    async def generate_optimized_resume(
        self,
        resume_text: str,
        job_description: str,
        analysis_result: Dict[str, Any],
        ats_system: str,
        tracker: Optional[TokenTracker] = None
    ) -> bytes:
        """
        Generate an ATS-optimized PDF resume

        Args:
            resume_text: Extracted text from original resume PDF
            job_description: Target job description
            analysis_result: Analysis from the /analyze endpoint
            ats_system: Target ATS system (workday, greenhouse, ashby)
            tracker: Optional token tracker

        Returns:
            PDF file as bytes

        Raises:
            ValueError: If inputs are invalid
            Exception: If generation fails
        """
        logger.info(f"[RESUME_GEN] Starting PDF generation for {ats_system.upper()}")

        if tracker is None:
            tracker = TokenTracker()

        # Step 1: Call GPT-5-mini to restructure resume
        logger.info("[RESUME_GEN] Step 1: Calling GPT-5-mini for content restructuring")

        system_prompt = self._get_system_prompt(ats_system)
        user_prompt = self._build_user_prompt(
            resume_text, job_description, analysis_result, ats_system
        )

        try:
            gpt_response = await gpt5_service.deep_ats_analysis(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                tracker=tracker
            )

            # Remove metadata key if present
            gpt_response.pop("_analysis_metadata", None)

            # Validate response structure
            structured_resume = StructuredResume(**gpt_response)
            logger.info("[RESUME_GEN] ✓ Resume structured successfully")

        except Exception as e:
            logger.error(f"[RESUME_GEN] ✗ GPT-5-mini restructuring failed: {str(e)}")
            raise Exception(f"Resume restructuring failed: {str(e)}")

        # Step 2: Load ATS-specific template
        logger.info(f"[RESUME_GEN] Step 2: Loading {ats_system} template")

        try:
            template = get_template(ats_system)
            logger.info("[RESUME_GEN] ✓ Template loaded")
        except Exception as e:
            logger.error(f"[RESUME_GEN] ✗ Template loading failed: {str(e)}")
            raise Exception(f"Template loading failed: {str(e)}")

        # Step 3: Compile Typst to PDF
        logger.info("[RESUME_GEN] Step 3: Compiling Typst to PDF")

        try:
            typst_data = self._structured_to_typst_data(structured_resume)
            pdf_bytes = typst_compiler.compile_template_with_data(template, typst_data)
            logger.info(f"[RESUME_GEN] ✓ PDF generated successfully ({len(pdf_bytes)} bytes)")
        except TypstCompilationError as e:
            logger.error(f"[RESUME_GEN] ✗ Typst compilation failed: {str(e)}")
            raise Exception(f"PDF compilation failed: {str(e)}")

        logger.info(f"[RESUME_GEN] PDF generation complete for {ats_system.upper()}")
        logger.info(f"[RESUME_GEN] 💰 Token usage: {tracker.prompt_tokens} input, {tracker.completion_tokens} output = ${tracker.cost_usd:.4f}")

        return pdf_bytes


# Singleton instance
resume_generator = ResumeGenerator()
