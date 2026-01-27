"""
Resume Generator Service
Orchestrates PDF generation using GPT-4o-mini for content restructuring
and ReportLab for rendering.
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional

from app.services.openai_service import client as openai_client
from app.services.pdf_builder import pdf_builder
from app.services.token_tracker import TokenTracker
from app.schemas.resume_schemas import StructuredResume

# Configure logger
logger = logging.getLogger(__name__)


class ResumeGenerator:
    """Service for generating ATS-optimized PDF resumes"""

    def _get_system_prompt(self, ats_system: str) -> str:
        """
        Get the system prompt based on ATS system

        Args:
            ats_system: Target ATS system (workday, greenhouse, ashby)

        Returns:
            System prompt string
        """
        base_prompt = """You are an expert resume optimization specialist. Your task is to restructure resume content to MAXIMIZE the ATS score while preserving ALL factual information.

You will receive:
1. The original resume text
2. The target job description
3. A DETAILED ATS ANALYSIS with scoring breakdown, keyword gaps, and specific issues

Your goal is to FIX every issue identified in the analysis to achieve the HIGHEST possible score.

CRITICAL RULES:
1. PRESERVE all factual content exactly - job titles, companies, dates, education, skills
2. NEVER fabricate or add information that isn't in the original resume
3. NEVER invent numbers, metrics, percentages, dollar amounts, team sizes, or timeframes. If the original resume says "managed a team", you CANNOT write "managed a team of 8" unless "8" appears in the original. Only use metrics that already exist in the resume text.
4. NEVER add skills to the skills section that are not mentioned or clearly demonstrated in the original resume. A missing JD keyword can only be added if the resume already shows that exact experience.
5. The summary MUST only reference experience, skills, and achievements that appear in the original resume. Do not claim expertise or accomplishments not supported by the resume content.
6. FIX every critical issue identified in the analysis
7. INCORPORATE missing keywords by rephrasing EXISTING bullet points to use JD terminology - not by adding new claims. Example: if resume says "managed projects" and JD says "project management", rephrase to include "project management". Do NOT add "project management" if the candidate never managed projects.
8. USE the exact phrasing from the job description ONLY when the candidate demonstrably has that experience in the original resume
9. RESTRUCTURE bullet points to highlight existing metrics and achievements relevant to the JD
10. Output ONLY valid JSON matching the specified schema

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

ATS-SPECIFIC OPTIMIZATION (Workday):

HOW WORKDAY SCORES (you must optimize for EACH component):
- 70% KEYWORD MATCH: Workday uses EXACT string matching (case-insensitive). "Project Manager" ≠ "Project Lead" ≠ "PM". You MUST use the EXACT phrases from the job description.
- 20% SECTION COMPLETENESS: Workday ONLY recognizes these headings: "Work Experience", "Experience", "Employment History", "Skills", "Technical Skills", "Core Competencies", "Education", "Academic Background", "Contact Information", "Contact". Any other heading = section SKIPPED by parser.
- 10% FORMAT COMPATIBILITY: Single column only. No tables, text boxes, or graphics.

KEYWORD OPTIMIZATION RULES:
- Use the EXACT keyword phrases from the job description - NOT synonyms
- If the JD says "project management", use "project management" not "managed projects"
- If the JD says "SQL", write "SQL" not "database querying"
- Place high-impact keywords in BOTH the summary AND experience bullets
- Missing keywords should ONLY be woven into bullet points where the original resume already describes that experience in different words. If the candidate does not have the experience, do NOT add the keyword.
- Near-misses identified in the analysis are your biggest opportunity - these are cases where the candidate HAS the experience but used different phrasing. Convert them to exact JD matches.

STRUCTURE RULES:
- Ensure ALL standard sections are present (Summary, Work Experience, Education, Skills)
- Format dates as: "Jan 2020 - Present"
- Skills must be comma-separated plain text lists
- Every bullet on its own line
- Avoid special characters that might confuse OCR""",

            "greenhouse": """

ATS-SPECIFIC OPTIMIZATION (Greenhouse):

HOW GREENHOUSE SCORES (you must optimize for EACH component):
- 50% KEYWORD RELEVANCE: Greenhouse uses SEMANTIC matching - it understands synonyms and related terms. But EXACT matches still score higher than semantic ones. Use JD terminology when possible.
- 30% STRUCTURED DATA QUALITY: Greenhouse extracts structured fields (company, title, dates, degree, skills). Clean, parseable data = higher score. Dates must be consistent, titles clear, skills categorized.
- 20% EXPERIENCE ALIGNMENT: Years of experience and seniority level must match JD requirements.

KEYWORD OPTIMIZATION RULES:
- Prefer exact JD terminology (scores higher than synonyms even with semantic matching)
- Industry-standard terms are recognized as equivalents (SQL ≈ PostgreSQL ≈ MySQL)
- Context matters: "5 years Python" matches "Python developer since 2019"
- Include both explicit skill mentions AND skills demonstrated through experience bullets

STRUCTURED DATA RULES:
- Dates must be consistently formatted: "Jan 2020 – Dec 2023"
- Job titles should be clear and standard (no creative titles)
- Education should include: Institution, Degree type, Field of study, Graduation date
- Contact info must be clearly separated and parseable
- Skills grouped by category (technical, tools, soft skills)
- Include LinkedIn URL if available in original resume""",

            "ashby": """

ATS-SPECIFIC OPTIMIZATION (Ashby):

HOW ASHBY SCORES (you must optimize for EACH component):
- 35% ACHIEVEMENT QUALITY: Ashby's AI focuses on QUANTIFIABLE impact. "Increased revenue by 40%" >>> "Responsible for revenue". Every bullet should have a metric if possible.
- 30% SKILLS MATCH: Ashby infers skills from context. "Led team of 5 engineers" = Leadership + Team Management. Include BOTH explicit skills AND demonstrated skills.
- 20% CAREER TRAJECTORY: Ashby values growth progression. Clear seniority progression, promotions, expanding scope of responsibility.
- 15% CULTURAL FIT SIGNALS: Communication style, collaboration, initiative.

ACHIEVEMENT OPTIMIZATION RULES:
- Preserve ALL existing metrics and numbers exactly as they appear in the original resume
- Rewrite bullet points to LEAD with existing metrics (e.g., move "increased revenue by 40%" to the start of the bullet)
- Use the "Verb + what + metric + result" format ONLY when the metric already exists in the original resume
- NEVER invent numbers, percentages, dollar amounts, team sizes, or timeframes that are not in the original resume
- If a bullet has no metric, improve the action verb and specificity using only information present in the original resume
- Lead with the STRONGEST existing achievements for each role
- Achievements matching JD requirements should be most prominent

SKILLS OPTIMIZATION RULES:
- In the skills section: list skills that are ALREADY mentioned or demonstrated in the original resume
- In experience bullets: DEMONSTRATE skills in action using the candidate's actual experience (rephrase existing bullets, do not add new claims)
- Inferred skills from the analysis can be added to the skills section ONLY if the original resume contains clear evidence of that skill in practice
- For missing skills: do NOT add them unless the original resume shows related experience. It is better to omit a skill than to fabricate it.

CAREER STORY RULES:
- Professional summary should synthesize ONLY what is in the original resume - specific roles, skills, and achievements that actually appear in the resume text
- Show clear progression in responsibility and impact based on the actual job titles and dates present
- Highlight promotions and scope expansion ONLY if evident from the original resume"""
        }

        return base_prompt + ats_specific.get(ats_system.lower(), "")

    def _format_scoring(self, scoring: Dict[str, Any], ats_system: str) -> str:
        """Format scoring breakdown based on ATS system weights"""
        system = ats_system.lower()

        if system == "workday":
            return (
                f"  Keyword Match:        {scoring.get('keyword_score', 0)}/100 (Weight: 70%) <- BIGGEST LEVER\n"
                f"  Section Completeness: {scoring.get('section_score', 0)}/100 (Weight: 20%)\n"
                f"  Format Compatibility: {scoring.get('format_score', 100)}/100 (Weight: 10%)\n"
                f"  OVERALL:              {scoring.get('overall_score', 0)}/100"
            )

        elif system == "greenhouse":
            return (
                f"  Keyword Relevance:       {scoring.get('keyword_score', 0)}/100 (Weight: 50%) <- BIGGEST LEVER\n"
                f"  Structured Data Quality: {scoring.get('data_quality_score', 0)}/100 (Weight: 30%)\n"
                f"  Experience Alignment:    {scoring.get('experience_alignment_score', 0)}/100 (Weight: 20%)\n"
                f"  OVERALL:                 {scoring.get('overall_score', 0)}/100"
            )

        elif system == "ashby":
            return (
                f"  Achievement Quality: {scoring.get('achievement_score', 0)}/100 (Weight: 35%) <- BIGGEST LEVER\n"
                f"  Skills Match:        {scoring.get('skills_score', 0)}/100 (Weight: 30%)\n"
                f"  Career Trajectory:   {scoring.get('progression_score', 0)}/100 (Weight: 20%)\n"
                f"  Cultural Fit:        {scoring.get('cultural_fit_score', 50)}/100 (Weight: 15%)\n"
                f"  OVERALL:             {scoring.get('overall_score', 0)}/100"
            )

        return f"  Overall: {scoring.get('overall_score', 0)}/100"

    def _format_ats_specific_data(
        self, analysis_result: Dict[str, Any], ats_system: str
    ) -> str:
        """Format ATS-specific analysis sections for the prompt"""
        system = ats_system.lower()
        if system == "workday":
            return self._format_workday_data(analysis_result)
        elif system == "greenhouse":
            return self._format_greenhouse_data(analysis_result)
        elif system == "ashby":
            return self._format_ashby_data(analysis_result)
        return ""

    def _format_workday_data(self, analysis_result: Dict[str, Any]) -> str:
        """Format Workday-specific analysis data"""
        formatting = analysis_result.get("formatting_analysis", {})
        issues = formatting.get("issues", [])
        compat = formatting.get("compatibility_score", 100)

        text = "\nWORKDAY-SPECIFIC NOTES:"
        if issues:
            text += f"\n  Formatting issues: {'; '.join(issues[:5])}"
        text += f"\n  Format compatibility: {'PASS' if compat == 100 else 'FAIL - needs fixing'}"
        text += "\n  REMEMBER: Workday uses EXACT string matching. Every missing keyword that genuinely applies must use the EXACT JD phrasing."
        return text

    def _format_greenhouse_data(self, analysis_result: Dict[str, Any]) -> str:
        """Format Greenhouse-specific analysis data"""
        structured_data = analysis_result.get("structured_data", {})
        extraction_quality = structured_data.get("extraction_quality", 0)
        semantic_matches = analysis_result.get("keyword_analysis", {}).get(
            "semantic_matches", []
        )

        text = "\nGREENHOUSE-SPECIFIC NOTES:"
        text += f"\n  Data extraction quality: {extraction_quality}/100"

        if semantic_matches:
            sem_lines = []
            for sm in semantic_matches[:8]:
                sem_lines.append(
                    f'    "{sm.get("required", "")}" matched via '
                    f'"{sm.get("found", "")}" (confidence: {sm.get("confidence", 0)}%)'
                )
            text += (
                "\n  Semantic matches (strengthen these with exact JD terms):\n"
                + "\n".join(sem_lines)
            )

        work_exp = structured_data.get("work_experience", [])
        failed = [w for w in work_exp if not w.get("extracted_successfully", True)]
        if failed:
            text += (
                f"\n  WARNING: {len(failed)} work experience entries failed "
                "extraction - fix date/title formatting"
            )

        text += (
            "\n  REMEMBER: Use consistent date formatting (Jan 2020 - Dec 2023) "
            "and clear job titles for optimal field extraction."
        )
        return text

    def _format_ashby_data(self, analysis_result: Dict[str, Any]) -> str:
        """Format Ashby-specific analysis data"""
        achievements = analysis_result.get("achievements", [])
        skills_analysis = analysis_result.get("skills_analysis", {})
        career = analysis_result.get("career_progression", {})
        standout = analysis_result.get("standout_factors", [])

        text = "\nASHBY-SPECIFIC NOTES:"

        if achievements:
            high_impact = [a for a in achievements if a.get("impact_level") == "high"]
            text += (
                f"\n  Achievements found: {len(achievements)} "
                f"({len(high_impact)} high-impact)"
            )
            if high_impact:
                text += "\n  High-impact achievements to PRESERVE and STRENGTHEN:"
                for a in high_impact[:5]:
                    text += f'\n    - "{a.get("text", "")}" (score: {a.get("score", 0)})'
        else:
            text += (
                "\n  WARNING: No quantified achievements detected - "
                "this is the #1 scoring factor (35%)"
            )

        missing_skills = skills_analysis.get("missing_skills", [])
        if missing_skills:
            text += f"\n  Missing skills to address: {', '.join(missing_skills[:10])}"

        inferred = skills_analysis.get("inferred_skills", [])
        if inferred:
            text += (
                "\n  Skills Ashby inferred from experience "
                "(make these EXPLICIT in skills section):"
            )
            for s in inferred[:5]:
                text += f'\n    - {s.get("skill", "")}: {s.get("evidence", "")}'

        text += (
            f"\n  Career trajectory: {career.get('trajectory', 'unknown')} "
            f"(score: {career.get('progression_score', 0)}/100)"
        )

        if standout:
            text += f"\n  Standout factors to emphasize: {', '.join(standout[:3])}"

        text += (
            "\n  REMEMBER: Ashby values QUANTIFIED ACHIEVEMENTS above all. "
            "Restructure existing bullets to lead with metrics already in the resume. "
            "Do NOT invent new metrics or numbers."
        )
        return text

    def _build_user_prompt(
        self,
        resume_text: str,
        job_description: str,
        analysis_result: Dict[str, Any],
        ats_system: str
    ) -> str:
        """
        Build the user prompt with resume, JD, and comprehensive analysis data
        """
        # --- Scoring breakdown ---
        scoring = analysis_result.get("scoring", {})
        overall_score = scoring.get("overall_score", 0)
        outcome = analysis_result.get("outcome", {})
        scoring_text = self._format_scoring(scoring, ats_system)

        # --- Keyword analysis ---
        keyword_analysis = analysis_result.get("keyword_analysis", {})
        required_keywords = keyword_analysis.get("required_keywords", [])
        matched_keywords = keyword_analysis.get("exact_matches", [])
        missing_keywords = keyword_analysis.get("missing_keywords", [])
        near_misses = keyword_analysis.get("near_misses", [])

        near_miss_text = ""
        if near_misses:
            nm_lines = []
            for nm in near_misses[:10]:
                nm_lines.append(
                    f'  - JD requires "{nm.get("required", "")}" -> '
                    f'resume has "{nm.get("found", "")}" ({nm.get("reason", "")})'
                )
            near_miss_text = "\n".join(nm_lines)

        # --- Section detection ---
        section_detection = analysis_result.get("section_detection", {})
        skipped_sections = section_detection.get("skipped_sections", [])
        missing_sections = section_detection.get("missing_sections", [])

        # --- Critical issues sorted by priority ---
        critical_issues = analysis_result.get("critical_issues", [])
        sorted_issues = sorted(
            critical_issues, key=lambda x: x.get("priority", 5)
        )
        issues_text = ""
        if sorted_issues:
            issues_list = []
            for issue in sorted_issues[:8]:
                impact = issue.get("impact", "medium").upper()
                issues_list.append(
                    f"  [{impact}] {issue.get('issue', '')}\n"
                    f"    FIX: {issue.get('fix', '')}"
                )
            issues_text = "\n".join(issues_list)

        # --- Recommendations with expected impact ---
        recommendations = analysis_result.get("recommendations", [])
        recs_text = ""
        if recommendations:
            recs_list = []
            for rec in recommendations[:8]:
                change = rec.get(
                    "recommended_change", rec.get("suggestion", "")
                )
                impact = rec.get("expected_impact", "")
                category = rec.get("category", "")
                line = f"  - [{category}] {change}"
                if impact:
                    line += f" (Expected: {impact})"
                recs_list.append(line)
            recs_text = "\n".join(recs_list)

        # --- Reasoning summary ---
        reasoning = analysis_result.get("reasoning_summary", "")

        # --- ATS-specific analysis data ---
        ats_specific_text = self._format_ats_specific_data(
            analysis_result, ats_system
        )

        return f"""ORIGINAL RESUME:
---
{resume_text}
---

JOB DESCRIPTION:
---
{job_description}
---

====================================================
DETAILED ATS ANALYSIS (Current Score: {overall_score}/100)
====================================================

CURRENT OUTCOME: {outcome.get('category', 'unknown').replace('_', ' ').upper()} (Queue: {outcome.get('queue_position', 'unknown')})
{f'ATS Verdict: {reasoning}' if reasoning else ''}

SCORING BREAKDOWN (optimize each component):
{scoring_text}

KEYWORD ANALYSIS:
  Required keywords from JD ({len(required_keywords)} total):
    {', '.join(required_keywords[:30]) if required_keywords else 'Not available'}

  Already matched ({len(matched_keywords)}):
    {', '.join(matched_keywords[:20]) if matched_keywords else 'None'}

  MISSING keywords - MUST incorporate ({len(missing_keywords)}):
    {', '.join(missing_keywords[:20]) if missing_keywords else 'None'}

  Near-misses - CONVERT to exact matches:
{near_miss_text if near_miss_text else '    None identified'}

SECTION ISSUES:
  Skipped/unrecognized headings: {', '.join(skipped_sections) if skipped_sections else 'None'}
  Missing expected sections: {', '.join(missing_sections) if missing_sections else 'None'}

CRITICAL ISSUES (fix ALL of these):
{issues_text if issues_text else '  None identified'}

RECOMMENDATIONS (implement these changes):
{recs_text if recs_text else '  None identified'}
{ats_specific_text}
====================================================

INSTRUCTIONS:
1. Fix EVERY critical issue listed above
2. Incorporate missing keywords ONLY by rephrasing existing experience to use JD terminology
3. Convert near-misses to exact JD phrasing (the candidate already has the experience, just used different words)
4. Address section detection problems
5. Follow every recommendation
6. Optimize for the scoring weights shown above

ANTI-HALLUCINATION RULES (MANDATORY):
- Every company, job title, date, institution, and degree MUST come from the original resume
- Every number, metric, percentage, and dollar amount MUST come from the original resume
- Every skill in the skills section MUST be mentioned or clearly demonstrated in the original resume
- The summary MUST only claim what the original resume supports
- If a missing keyword cannot be incorporated without fabricating experience, SKIP it
- Output valid JSON matching the schema from the system prompt"""

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
        """
        logger.info(f"[RESUME_GEN] Starting PDF generation for {ats_system.upper()}")

        if tracker is None:
            tracker = TokenTracker()

        # Step 1: Call GPT-4o-mini to restructure resume content (fast model)
        logger.info("[RESUME_GEN] Step 1: Calling GPT-4o-mini for content restructuring")

        if not openai_client:
            raise Exception("OpenAI API key not configured")

        system_prompt = self._get_system_prompt(ats_system)
        user_prompt = self._build_user_prompt(
            resume_text, job_description, analysis_result, ats_system
        )

        try:
            response = await asyncio.to_thread(
                openai_client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=4000,
            )

            # Track token usage
            if tracker:
                tracker.add_from_response(response)

            gpt_response = json.loads(response.choices[0].message.content)

            # Validate response structure
            structured_resume = StructuredResume(**gpt_response)
            logger.info(f"[RESUME_GEN] Step 1 complete: Resume structured ({response.usage.total_tokens} tokens)")

        except Exception as e:
            logger.error(f"[RESUME_GEN] GPT-4o-mini restructuring failed: {str(e)}")
            raise Exception(f"Resume restructuring failed: {str(e)}")

        # Step 2: Build PDF with ReportLab
        logger.info(f"[RESUME_GEN] Step 2: Building PDF with ReportLab ({ats_system})")

        try:
            pdf_bytes = pdf_builder.build(structured_resume, ats_system)
            logger.info(f"[RESUME_GEN] Step 2 complete: PDF built ({len(pdf_bytes)} bytes)")
        except Exception as e:
            logger.error(f"[RESUME_GEN] PDF build failed: {str(e)}")
            raise Exception(f"PDF generation failed: {str(e)}")

        logger.info(f"[RESUME_GEN] PDF generation complete for {ats_system.upper()}")
        logger.info(f"[RESUME_GEN] Token usage: {tracker.prompt_tokens} in, {tracker.completion_tokens} out = ${tracker.cost_usd:.4f}")

        return pdf_bytes


# Singleton instance
resume_generator = ResumeGenerator()
