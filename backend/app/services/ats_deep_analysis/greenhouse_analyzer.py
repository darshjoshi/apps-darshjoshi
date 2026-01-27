"""
Greenhouse Deep Analysis with GPT-5-Mini
Replicates Greenhouse's structured data extraction with semantic understanding
"""

from app.services.gpt5_mini_service import gpt5_service
from app.services.token_tracker import TokenTracker
from typing import Dict, Any, Optional
import logging

# Configure logger
logger = logging.getLogger(__name__)


class GreenhouseDeepAnalyzer:
    """Greenhouse-specific deep analysis using GPT-5-mini with thinking capabilities"""

    SYSTEM_PROMPT = """You are a PERFECT REPLICA of Greenhouse ATS parsing and scoring engine.

Your task: REPLICATE Greenhouse's exact parsing and scoring behavior with deep reasoning.

## Greenhouse's ACTUAL Parsing Engine Logic:

### Phase 1: Structured Data Extraction (Greenhouse's Strength)
1. **Work Experience Extraction**
   - Extracts: Company name, Job title, Start/End dates, Location
   - Maps to structured database fields
   - Understands various date formats (Jan 2020, 01/2020, 2020)
   - Handles "Present" or "Current" for ongoing roles

2. **Education Extraction**
   - Extracts: Institution, Degree type, Field of study, Graduation date
   - Recognizes degree abbreviations (BS, MS, MBA, PhD)
   - Maps to standardized education levels

3. **Skills Extraction**
   - Parses skills sections into individual skills
   - Handles comma-separated, bullet-pointed, and paragraph formats
   - Creates searchable skill tags

### Phase 2: Semantic Keyword Matching (ML-Based)
1. **Synonym Understanding** (More forgiving than Workday)
   - "managed team" ≈ "led team" ≈ "supervised team"
   - "SQL" ≈ "PostgreSQL" ≈ "MySQL" (database skills)
   - "communication" ≈ "presented to stakeholders"
   - But exact matches still prioritized in scoring

2. **Context-Aware Matching**
   - Understands skill context from job descriptions
   - "5 years Python" matches "Python developer since 2019"
   - Infers related skills from demonstrated experience

### Phase 3: Scoring Algorithm (Greenhouse's Weights)
```
Total Score = (Keyword Relevance × 0.50) +
              (Structured Data Quality × 0.30) +
              (Experience Alignment × 0.20)

Where:
- Keyword Relevance = Semantic match score (0-100)
- Structured Data Quality = How well data maps to fields (0-100)
- Experience Alignment = Years/level match (0-100)
```

### Phase 4: Ranking Decisions
- Score ≥ 75% → "Strong Match" → Prioritized for review
- Score 55-74% → "Good Match" → Standard review queue
- Score 35-54% → "Partial Match" → Lower priority
- Score < 35% → "Weak Match" → May be filtered out

## Your Task:
Execute Greenhouse's logic step-by-step with DEEP REASONING. Focus on structured data quality.
Return comprehensive JSON with exact reasoning."""

    USER_PROMPT_TEMPLATE = """
Execute Greenhouse ATS parsing logic on this resume:

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{job_description}

---

## ANALYSIS PROTOCOL:

**Step 1: Structured Data Extraction**
- Extract work experience with dates, titles, companies
- Extract education with degrees, institutions, dates
- Extract skills into categorized lists
- Identify contact information

**Step 2: Keyword Analysis**
- Extract required keywords from job description
- Perform semantic matching (not just exact)
- Identify related skills that demonstrate competency
- Note near-matches and why they count/don't count

**Step 3: Data Quality Assessment**
- How well does resume data map to Greenhouse fields?
- Are dates parseable? Are titles clear?
- Is the structure ATS-friendly?

**Step 4: Calculate Score**
- Keyword Relevance: semantic match percentage
- Structured Data Quality: field mapping score
- Experience Alignment: years/level match
- **Final Score = (keywords × 0.5) + (data × 0.3) + (experience × 0.2)**

**Step 5: Predict Outcome**
- ≥75 = Strong Match (prioritized)
- 55-74 = Good Match (standard queue)
- 35-54 = Partial Match (lower priority)
- <35 = Weak Match (may be filtered)

**Step 6: Identify Improvement Areas**
- What structured data is missing or unclear?
- Which keywords need better representation?

---

**CRITICAL FORMATTING RULES:**
- ALL score values MUST be INTEGERS (whole numbers) between 0-100
- NEVER use decimals like 50.45 or 36.36 - always round to nearest integer
- Examples: Use 50, not 50.45; use 36, not 36.36; use 75, not 75.0

---

Return JSON:
{{
  "structured_data": {{
    "work_experience": [
      {{"company": "name", "title": "title", "dates": "start - end", "extracted_successfully": true|false}}
    ],
    "education": [
      {{"institution": "name", "degree": "type", "field": "field", "date": "year", "extracted_successfully": true|false}}
    ],
    "skills": ["list of extracted skills"],
    "contact": {{"email": "email", "phone": "phone", "linkedin": "url"}},
    "extraction_quality": <0-100>
  }},
  "section_detection": {{
    "found_sections": ["list with exact headings found"],
    "skipped_sections": ["non-standard headings"],
    "missing_sections": ["expected sections not found"],
    "detection_score": <0-100>
  }},
  "keyword_analysis": {{
    "required_keywords": ["all keywords from JD"],
    "exact_matches": ["keywords found exactly"],
    "semantic_matches": [
      {{"required": "JD keyword", "found": "resume equivalent", "confidence": <0-100>}}
    ],
    "near_misses": [
      {{"required": "exact phrase needed", "found": "what resume has", "reason": "why partial match"}}
    ],
    "missing_keywords": ["keywords not found at all"],
    "match_rate": <0-100>
  }},
  "formatting_analysis": {{
    "single_column": true|false,
    "has_tables": true|false,
    "has_graphics": true|false,
    "has_text_boxes": true|false,
    "compatibility_score": <0-100>,
    "issues": ["specific formatting problems"]
  }},
  "scoring": {{
    "keyword_score": <0-100>,
    "section_score": <0-100>,
    "format_score": <0-100>,
    "data_quality_score": <0-100>,
    "experience_alignment_score": <0-100>,
    "overall_score": <0-100>,
    "confidence": <0-100>
  }},
  "outcome": {{
    "category": "strong_match|good_match|partial_match|weak_match",
    "would_reach_human": true|false,
    "queue_position": "prioritized|standard|lower|filtered"
  }},
  "critical_issues": [
    {{
      "issue": "specific problem",
      "impact": "high|medium|low",
      "greenhouse_behavior": "what Greenhouse does with this issue",
      "fix": "specific actionable solution",
      "priority": <1-5>
    }}
  ],
  "recommendations": [
    {{
      "category": "keywords|formatting|structure|data_quality",
      "current_state": "what's wrong now",
      "recommended_change": "exact fix",
      "expected_impact": "+X points"
    }}
  ],
  "reasoning_summary": "2-3 sentence explanation of Greenhouse's likely decision"
}}
"""

    async def analyze(
        self,
        resume_text: str,
        job_description: str,
        tracker: Optional[TokenTracker] = None
    ) -> Dict[str, Any]:
        """
        Perform deep Greenhouse ATS replication analysis

        Args:
            resume_text: Full resume text
            job_description: Job description text
            tracker: Token usage tracker

        Returns:
            Comprehensive Greenhouse analysis with scoring
        """
        logger.info("[GREENHOUSE_DEEP] Starting deep Greenhouse ATS analysis with GPT-5-mini")

        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            resume_text=resume_text,
            job_description=job_description
        )

        result = await gpt5_service.deep_ats_analysis(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            tracker=tracker
        )

        result = self._normalize_result(result)

        logger.info(f"[GREENHOUSE_DEEP] Analysis complete - Score: {result.get('scoring', {}).get('overall_score', 0)}")

        return result

    def _normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize result to ensure all expected fields exist"""
        # Ensure scoring exists
        if "scoring" not in result:
            result["scoring"] = {}
        
        scoring = result["scoring"]
        scoring.setdefault("keyword_score", 0)
        scoring.setdefault("section_score", 0)
        scoring.setdefault("format_score", 100)
        scoring.setdefault("data_quality_score", 0)
        scoring.setdefault("experience_alignment_score", 0)
        scoring.setdefault("overall_score", 0)
        scoring.setdefault("confidence", 80)

        # Ensure outcome exists
        if "outcome" not in result:
            score = scoring.get("overall_score", 0)
            if score >= 75:
                category = "strong_match"
                queue = "prioritized"
                human = True
            elif score >= 55:
                category = "good_match"
                queue = "standard"
                human = True
            elif score >= 35:
                category = "partial_match"
                queue = "lower"
                human = True
            else:
                category = "weak_match"
                queue = "filtered"
                human = False
            
            result["outcome"] = {
                "category": category,
                "would_reach_human": human,
                "queue_position": queue
            }

        # Ensure other required fields
        result.setdefault("structured_data", {"work_experience": [], "education": [], "skills": [], "contact": {}, "extraction_quality": 0})
        result.setdefault("section_detection", {"found_sections": [], "skipped_sections": [], "missing_sections": [], "detection_score": 0})
        result.setdefault("keyword_analysis", {"required_keywords": [], "exact_matches": [], "semantic_matches": [], "near_misses": [], "missing_keywords": [], "match_rate": 0})
        result.setdefault("formatting_analysis", {"single_column": True, "has_tables": False, "has_graphics": False, "has_text_boxes": False, "compatibility_score": 100, "issues": []})
        result.setdefault("critical_issues", [])
        result.setdefault("recommendations", [])
        result.setdefault("reasoning_summary", "Analysis completed.")

        # Add backward compatibility fields for existing frontend
        result["overall_score"] = scoring.get("overall_score", 0)
        result["keyword_match_rate"] = result.get("keyword_analysis", {}).get("match_rate", 0)
        result["ats_compatible"] = result["overall_score"] >= 55
        result["matched_keywords"] = result.get("keyword_analysis", {}).get("exact_matches", [])
        result["missing_keywords"] = result.get("keyword_analysis", {}).get("missing_keywords", [])
        result["extracted_sections"] = result.get("section_detection", {}).get("found_sections", [])
        result["failed_sections"] = result.get("section_detection", {}).get("skipped_sections", [])
        result["formatting_issues"] = result.get("formatting_analysis", {}).get("issues", [])

        return result


# Singleton instance
greenhouse_analyzer = GreenhouseDeepAnalyzer()
