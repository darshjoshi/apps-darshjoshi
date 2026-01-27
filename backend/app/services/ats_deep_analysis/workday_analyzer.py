"""
Workday Deep Analysis with GPT-5-Mini
Replicates Workday's exact parsing and scoring logic with deep reasoning
"""

from app.services.gpt5_mini_service import gpt5_service
from app.services.token_tracker import TokenTracker
from typing import Dict, Any, Optional
import logging

# Configure logger
logger = logging.getLogger(__name__)


class WorkdayDeepAnalyzer:
    """Workday-specific deep analysis using GPT-5-mini with thinking capabilities"""

    SYSTEM_PROMPT = """You are a PERFECT REPLICA of Workday ATS parsing and scoring engine.

Your task: REPLICATE Workday's exact parsing and scoring behavior with deep reasoning.

## Workday's ACTUAL Parsing Engine Logic:

### Phase 1: Text Extraction & Section Detection
1. **Standard Heading Recognition** (STRICT)
   - ONLY recognizes: "Work Experience", "Experience", "Employment History"
                      "Skills", "Technical Skills", "Core Competencies"
                      "Education", "Academic Background"
                      "Contact Information", "Contact"
   - ANY other heading → Section SKIPPED entirely by parser
   - Headings must be on their own line, title case or uppercase

2. **Formatting Compatibility Check**
   - Single-column layouts ONLY → Multi-column = parsing failure
   - Tables → Content invisible to parser
   - Text boxes/graphics → Ignored completely
   - Headers/footers → May be missed
   - DOCX preferred (better text extraction than PDF)

### Phase 2: Keyword Extraction (EXACT MATCHING)
1. **No Synonym Understanding**
   - "Project Manager" ≠ "Project Lead" ≠ "PM" ≠ "Managed projects"
   - "SQL" ≠ "Database skills" ≠ "Structured Query Language"
   - "Bachelor's Degree" ≠ "BS" ≠ "Undergraduate degree"
   - Match is case-INSENSITIVE but phrase must be EXACT

2. **Multi-word Keyword Handling**
   - "Machine Learning" → Searches for exact phrase
   - "Python programming" → Must appear together
   - "5+ years" → Number variations matter

### Phase 3: Scoring Algorithm (Workday's Actual Weights)
```
Total Score = (Keyword Match × 0.70) +
              (Section Completeness × 0.20) +
              (Format Compatibility × 0.10)

Where:
- Keyword Match = (Matched Keywords / Required Keywords) × 100
- Section Completeness = (Found Sections / Expected Sections) × 100
- Format Compatibility = Binary (100 if clean, 0 if tables/columns)
```

### Phase 4: Ranking Decisions
- Score ≥ 80% → "Highly Compatible" → Top of recruiter queue
- Score 60-79% → "Compatible" → Middle of queue
- Score 40-59% → "Borderline" → Bottom of queue
- Score < 40% → "Incompatible" → Auto-rejected (never seen by human)

## Your Task:
Execute Workday's logic step-by-step with DEEP REASONING. Be BRUTALLY honest about failures.
Return comprehensive JSON with exact reasoning."""

    USER_PROMPT_TEMPLATE = """
Execute Workday ATS parsing logic on this resume:

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{job_description}

---

## ANALYSIS PROTOCOL:

**Step 1: Section Detection**
- Scan resume for standard headings ONLY
- Flag any non-standard headings that would be skipped
- List exactly which sections Workday would find vs miss

**Step 2: Keyword Extraction**
- Extract ALL required keywords from job description (include multi-word phrases)
- For EACH keyword, search resume for EXACT match (case-insensitive)
- Document near-misses (why they failed)

**Step 3: Formatting Analysis**
- Detect multi-column layouts
- Identify tables, text boxes, graphics
- Check if format would break Workday's parser

**Step 4: Calculate Score**
- Keyword Match Rate: (matched / total) × 100
- Section Completeness: (found / expected) × 100
- Format Compatibility: 100 or 0
- **Final Score = (keywords × 0.7) + (sections × 0.2) + (format × 0.1)**

**Step 5: Predict Outcome**
- ≥80 = Highly Compatible (top of queue)
- 60-79 = Compatible (middle)
- 40-59 = Borderline (bottom)
- <40 = Auto-rejected

**Step 6: Identify Critical Blockers**
- What are the 3-5 issues preventing a higher score?
- Prioritize by impact (high/medium/low)

---

**CRITICAL FORMATTING RULES:**
- ALL score values MUST be INTEGERS (whole numbers) between 0-100
- NEVER use decimals like 50.45 or 36.36 - always round to nearest integer
- Examples: Use 50, not 50.45; use 36, not 36.36; use 75, not 75.0

---

Return JSON:
{{
  "section_detection": {{
    "found_sections": ["list with exact headings found"],
    "skipped_sections": ["non-standard headings that would be ignored"],
    "missing_sections": ["expected sections not found"],
    "detection_score": <0-100>
  }},
  "keyword_analysis": {{
    "required_keywords": ["all keywords from JD"],
    "exact_matches": ["keywords found in resume"],
    "near_misses": [
      {{"required": "exact phrase needed", "found": "what resume has", "reason": "why it failed"}}
    ],
    "missing_keywords": ["critical keywords absent"],
    "match_rate": <0-100>
  }},
  "formatting_analysis": {{
    "single_column": true|false,
    "has_tables": true|false,
    "has_graphics": true|false,
    "has_text_boxes": true|false,
    "compatibility_score": <0 or 100>,
    "issues": ["specific formatting problems"]
  }},
  "scoring": {{
    "keyword_score": <0-100>,
    "section_score": <0-100>,
    "format_score": <0 or 100>,
    "overall_score": <0-100>,
    "confidence": <0-100>
  }},
  "outcome": {{
    "category": "highly_compatible|compatible|borderline|auto_rejected",
    "would_reach_human": true|false,
    "queue_position": "top|middle|bottom|none"
  }},
  "critical_issues": [
    {{
      "issue": "specific problem",
      "impact": "high|medium|low",
      "workday_behavior": "what Workday does with this issue",
      "fix": "specific actionable solution",
      "priority": <1-5>
    }}
  ],
  "recommendations": [
    {{
      "category": "keywords|formatting|structure",
      "current_state": "what's wrong now",
      "recommended_change": "exact fix",
      "expected_impact": "+X points"
    }}
  ],
  "reasoning_summary": "2-3 sentence explanation of Workday's likely decision"
}}
"""

    async def analyze(
        self,
        resume_text: str,
        job_description: str,
        tracker: Optional[TokenTracker] = None
    ) -> Dict[str, Any]:
        """
        Perform deep Workday ATS replication analysis

        Args:
            resume_text: Full resume text
            job_description: Job description text
            tracker: Token usage tracker

        Returns:
            Comprehensive Workday analysis with scoring
        """
        logger.info("[WORKDAY_DEEP] Starting deep Workday ATS analysis with GPT-5-mini")

        # GPT-5-mini has 400K context, so we can include full text
        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            resume_text=resume_text,  # Full resume (no truncation!)
            job_description=job_description  # Full JD
        )

        # Use GPT-5-mini for maximum reasoning
        result = await gpt5_service.deep_ats_analysis(
            system_prompt=self.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            tracker=tracker
        )

        # Ensure backward compatibility with existing result structure
        result = self._normalize_result(result)

        logger.info(f"[WORKDAY_DEEP] Analysis complete - Score: {result.get('scoring', {}).get('overall_score', 0)}")

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
        scoring.setdefault("overall_score", 0)
        scoring.setdefault("confidence", 80)

        # Ensure outcome exists
        if "outcome" not in result:
            score = scoring.get("overall_score", 0)
            if score >= 80:
                category = "highly_compatible"
                queue = "top"
                human = True
            elif score >= 60:
                category = "compatible"
                queue = "middle"
                human = True
            elif score >= 40:
                category = "borderline"
                queue = "bottom"
                human = True
            else:
                category = "auto_rejected"
                queue = "none"
                human = False
            
            result["outcome"] = {
                "category": category,
                "would_reach_human": human,
                "queue_position": queue
            }

        # Ensure other required fields
        result.setdefault("section_detection", {"found_sections": [], "skipped_sections": [], "missing_sections": [], "detection_score": 0})
        result.setdefault("keyword_analysis", {"required_keywords": [], "exact_matches": [], "near_misses": [], "missing_keywords": [], "match_rate": 0})
        result.setdefault("formatting_analysis", {"single_column": True, "has_tables": False, "has_graphics": False, "has_text_boxes": False, "compatibility_score": 100, "issues": []})
        result.setdefault("critical_issues", [])
        result.setdefault("recommendations", [])
        result.setdefault("reasoning_summary", "Analysis completed.")

        # Add backward compatibility fields for existing frontend
        result["overall_score"] = scoring.get("overall_score", 0)
        result["keyword_match_rate"] = result.get("keyword_analysis", {}).get("match_rate", 0)
        result["ats_compatible"] = result["overall_score"] >= 60
        result["matched_keywords"] = result.get("keyword_analysis", {}).get("exact_matches", [])
        result["missing_keywords"] = result.get("keyword_analysis", {}).get("missing_keywords", [])
        result["extracted_sections"] = result.get("section_detection", {}).get("found_sections", [])
        result["failed_sections"] = result.get("section_detection", {}).get("skipped_sections", [])
        result["formatting_issues"] = result.get("formatting_analysis", {}).get("issues", [])

        return result


# Singleton instance
workday_analyzer = WorkdayDeepAnalyzer()
