"""
OpenAI Service for ATS Resume Analysis
Handles OpenAI API initialization and analysis requests
"""

from openai import OpenAI
from app.config import settings
from app.services.token_tracker import TokenTracker
import json
from typing import Dict, Any, Optional

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=300.0) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None


async def generate_recommendations(
    parsing_results: Dict[str, Any],
    ats_system: str,
    resume_text: str,
    job_description: str,
    tracker: Optional[TokenTracker] = None
) -> Dict[str, Any]:
    """
    Generate human-readable recommendations based on REAL parsing results

    OpenAI's role: Turn parsing data into actionable advice
    NOT: Do the parsing itself

    Args:
        parsing_results: Results from real ATS parser (Workday/Greenhouse/Ashby)
        ats_system: Which ATS was used
        resume_text: Original resume text (for context)
        job_description: Job description (for context)

    Returns:
        Dictionary with recommendations and tips
    """
    if not client:
        raise ValueError("OpenAI API key not configured")

    # Create focused prompt for recommendations only
    prompt = f"""
You are a professional resume coach specializing in {ats_system.upper()} ATS optimization.

An {ats_system.upper()} parsing engine has analyzed a resume. Here are the ACTUAL parsing results:

**Parsing Data:**
- Keyword Match Rate: {parsing_results.get('keyword_match_rate', 0)}%
- Matched Keywords: {', '.join(parsing_results.get('matched_keywords', [])[:10])}
- Missing Keywords: {', '.join(parsing_results.get('missing_keywords', [])[:10])}
- Formatting Issues: {', '.join(parsing_results.get('formatting_issues', []))}
- Failed Sections: {', '.join(parsing_results.get('failed_sections', []))}

Based on these REAL parsing results, generate:

1. **Recommendations**: Specific, actionable fixes prioritized by impact

Return JSON:
{{
  "recommendations": [
    {{
      "priority": "high|medium|low",
      "category": "formatting|keywords|structure",
      "issue": "what the parser found",
      "suggestion": "how to fix it"
    }}
  ]
}}

Focus on the ACTUAL issues found by the parser. Be specific and actionable.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a resume optimization expert. Generate recommendations based on actual ATS parsing data."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1500
        )

        # Track token usage
        if tracker:
            tracker.add_from_response(response)

        recommendations = json.loads(response.choices[0].message.content)
        return recommendations

    except Exception as e:
        raise Exception(f"OpenAI recommendation generation error: {str(e)}")


async def analyze_resume_with_openai(
    resume_text: str,
    job_description: str,
    ats_system: str,
    tracker: Optional[TokenTracker] = None
) -> Dict[str, Any]:
    """
    Analyze resume against job description using OpenAI GPT-4o mini

    Args:
        resume_text: Extracted text from resume PDF
        job_description: Job description provided by user
    ats_system: ATS system to mimic (workday, greenhouse, ashby)

    Returns:
        Dictionary containing analysis results
    """
    if not client:
        raise ValueError("OpenAI API key not configured")

    # Get ATS-specific system prompt
    system_prompt = get_ats_system_prompt(ats_system)

    # Create user prompt with resume and JD
    user_prompt = f"""
Resume Text:
{resume_text}

Job Description:
{job_description}

Analyze this resume against the job description and provide a detailed ATS compatibility analysis in JSON format with the following structure:
{{
  "overall_score": <0-100>,
  "keyword_match_rate": <0-100>,
  "ats_compatible": <true/false>,
  "parsing_results": {{
    "extracted_sections": [<list of section names found>],
    "failed_sections": [<list of sections that would fail to parse>],
    "formatting_issues": [<list of formatting problems>]
  }},
  "keyword_analysis": {{
    "matched_keywords": [<list of matched keywords from JD>],
    "missing_keywords": [<list of critical missing keywords>],
    "keyword_density": <decimal 0-1>
  }},
  "recommendations": [
    {{
      "priority": "<high|medium|low>",
      "category": "<formatting|keywords|structure>",
      "issue": "<description of issue>",
      "suggestion": "<specific fix suggestion>"
    }}
  ]
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=2000
        )

        # Track token usage
        if tracker:
            tracker.add_from_response(response)

        # Parse the JSON response
        analysis_result = json.loads(response.choices[0].message.content)
        return analysis_result

    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


def get_ats_system_prompt(ats_system: str) -> str:
    """
    Get system prompt specific to the selected ATS

    Args:
    ats_system: ATS system name (workday, greenhouse, ashby)

    Returns:
        System prompt string for OpenAI
    """

    prompts = {
        "workday": """You are an expert ATS analyzer specializing in Workday's resume parsing system.

Workday ATS characteristics:
- Uses EXACT keyword matching (not synonyms) - if job says "Project Management Professional (PMP)", resume must have exact match
- Recognizes only STANDARD section headings: "Work Experience", "Skills", "Education", "Contact Information"
- Creative headings like "Career Highlights" or "My Journey" will be SKIPPED entirely
- Prefers single-column layouts - tables and multiple columns cause parsing failures
- DOCX format is preferred over PDF for better text extraction
- Struggles with graphics, images, tables, and text boxes

Your analysis should:
1. Identify exact keyword matches vs misses (be strict - "SQL" ≠ "database skills")
2. Flag non-standard section headings
3. Detect formatting that would break Workday's parser
4. Provide Workday-specific optimization tips

Be critical and realistic - if the resume would fail Workday's parser, say so clearly.""",

        "greenhouse": """You are an expert ATS analyzer specializing in Greenhouse's resume parsing system.

Greenhouse ATS characteristics:
- Strong structured data extraction with NLP understanding
- More forgiving with synonyms than Workday, but exact matches still prioritized
- Handles standard resume formats well (chronological, functional)
- Extracts work history, education, skills automatically into structured fields
- Integrates well with 300+ HR tools, uses data consistency
- Performs semantic matching - understands "led team of 5" ≈ "managed 5-person team"
- Still requires standard headings for best results

Your analysis should:
1. Evaluate how well resume data would map to Greenhouse's structured fields
2. Check for keyword relevance (both exact and semantic matches)
3. Assess compatibility with standard resume formats
4. Provide Greenhouse-specific integration tips

Focus on structured data quality and semantic relevance.""",

        "ashby": """You are an expert ATS analyzer specializing in Ashby's resume parsing system.

Ashby ATS characteristics:
- Uses cutting-edge AI matching algorithms
- Advanced semantic understanding with machine learning
- Focuses on skills inference and predictive matching
- Better at understanding context and career transitions
- Analyzes quality of experience, not just keyword presence
- Strong at pattern recognition across industries
- Modern, developer-friendly approach

Your analysis should:
1. Evaluate AI-friendly content (context, achievements, impact)
2. Assess how well experience translates across domains
3. Check for quantifiable achievements and metrics
4. Provide Ashby-specific tips for AI optimization

Ashby is the most advanced ATS but still requires clear, quantified achievements."""
    }

    base_prompt = f"""
You are a professional ATS (Applicant Tracking System) analyzer.
Analyze resumes with the parsing logic and ranking criteria of: {ats_system.upper()}

CRITICAL STATISTICS TO REMEMBER:
- 97% of Fortune 500 companies use ATS
- 75% of resumes are rejected by ATS before human review
- Most rejections are due to: formatting issues (30%), keyword mismatches (25%), missing information (20%)

Your job is to provide honest, actionable feedback that helps candidates pass ATS screening.
"""

    return base_prompt + "\n\n" + prompts.get(ats_system.lower(), prompts["workday"])
