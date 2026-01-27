"""
Ashby Deep Analysis with GPT-5-Mini
Replicates Ashby's AI-powered matching with focus on achievements and metrics
"""

from app.services.gpt5_mini_service import gpt5_service
from app.services.token_tracker import TokenTracker
from typing import Dict, Any, Optional
import logging

# Configure logger
logger = logging.getLogger(__name__)


class AshbyDeepAnalyzer:
    """Ashby-specific deep analysis using GPT-5-mini with thinking capabilities"""

    SYSTEM_PROMPT = """You are a PERFECT REPLICA of Ashby ATS parsing and scoring engine.

Your task: REPLICATE Ashby's exact parsing and scoring behavior with deep reasoning.

## Ashby's ACTUAL Parsing Engine Logic:

### Phase 1: AI-Powered Content Analysis (Ashby's Strength)
1. **Achievement Extraction**
   - Focuses on QUANTIFIABLE achievements
   - Looks for: percentages, dollar amounts, time savings, team sizes
   - Values IMPACT over keyword presence
   - "Increased revenue by 40%" > "Responsible for revenue"

2. **Skills Inference**
   - Infers skills from demonstrated experience
   - "Led team of 5 engineers" → Leadership, Team Management
   - "Built microservices architecture" → System Design, Architecture
   - Goes beyond explicit skill lists

3. **Career Progression Analysis**
   - Tracks seniority progression (Junior → Senior → Lead)
   - Values promotions and growth trajectory
   - Understands career transitions across industries

### Phase 2: Contextual Matching (ML-Based)
1. **Deep Semantic Understanding**
   - Understands context, not just keywords
   - "Scaled system to 1M users" demonstrates scalability expertise
   - Matches job requirements to demonstrated capabilities
   - Most forgiving of all ATS systems

2. **Pattern Recognition**
   - Recognizes industry patterns and transferable skills
   - Values diverse experience that shows adaptability
   - Understands modern tech stacks and methodologies

### Phase 3: Scoring Algorithm (Ashby's Weights)
```
Total Score = (Achievement Quality × 0.35) +
              (Skills Match × 0.30) +
              (Career Trajectory × 0.20) +
              (Cultural Fit Signals × 0.15)

Where:
- Achievement Quality = Quantified impact score (0-100)
- Skills Match = Demonstrated + inferred skills (0-100)
- Career Trajectory = Growth and progression (0-100)
- Cultural Fit = Communication style, values alignment (0-100)
```

### Phase 4: Ranking Decisions
- Score ≥ 70% → "Excellent Fit" → Fast-tracked for interview
- Score 50-69% → "Good Fit" → Standard review
- Score 30-49% → "Potential Fit" → Needs closer review
- Score < 30% → "Not a Fit" → Deprioritized

## Your Task:
Execute Ashby's AI-first logic with DEEP REASONING. Focus on achievements and demonstrated impact.
Return comprehensive JSON with exact reasoning."""

    USER_PROMPT_TEMPLATE = """
Execute Ashby ATS parsing logic on this resume:

## RESUME TEXT:
{resume_text}

## JOB DESCRIPTION:
{job_description}

---

## ANALYSIS PROTOCOL:

**Step 1: Achievement Extraction**
- Find ALL quantifiable achievements (%, $, numbers, time)
- Rate each achievement's impact (high/medium/low)
- Identify achievements that directly relate to job requirements

**Step 2: Skills Analysis**
- Extract explicit skills from resume
- INFER additional skills from experience descriptions
- Map skills to job requirements (direct and related)

**Step 3: Career Progression**
- Track job titles and seniority levels
- Identify promotions or lateral moves
- Assess growth trajectory

**Step 4: Calculate Score**
- Achievement Quality: quantified impact score
- Skills Match: demonstrated + inferred skills
- Career Trajectory: growth and progression
- **Final Score = (achievements × 0.35) + (skills × 0.30) + (trajectory × 0.20) + (fit × 0.15)**

**Step 5: Predict Outcome**
- ≥70 = Excellent Fit (fast-tracked)
- 50-69 = Good Fit (standard review)
- 30-49 = Potential Fit (needs review)
- <30 = Not a Fit (deprioritized)

**Step 6: Identify Strengths & Gaps**
- What makes this candidate stand out?
- What's missing for an excellent fit?

---

Return JSON:
{{
  "achievements": [
    {{
      "text": "achievement description",
      "metric_type": "percentage|dollar|time|scale|other",
      "metric_value": "the number/value",
      "impact_level": "high|medium|low",
      "relevance_to_job": "how it relates to JD",
      "score": <0-100>
    }}
  ],
  "skills_analysis": {{
    "explicit_skills": ["skills directly stated in resume"],
    "inferred_skills": [
      {{"skill": "inferred skill", "evidence": "what demonstrates this", "confidence": <0-100>}}
    ],
    "required_skills": ["skills from JD"],
    "matched_skills": ["skills that match JD"],
    "missing_skills": ["required skills not found"],
    "skills_score": <0-100>
  }},
  "career_progression": {{
    "positions": [
      {{"title": "job title", "level": "junior|mid|senior|lead|manager|director|executive", "company": "company"}}
    ],
    "trajectory": "upward|lateral|varied|downward",
    "promotions_detected": <number>,
    "years_of_experience": <number>,
    "progression_score": <0-100>
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
    "achievement_score": <0-100>,
    "keyword_score": <0-100>,
    "section_score": <0-100>,
    "format_score": <0-100>,
    "skills_score": <0-100>,
    "progression_score": <0-100>,
    "cultural_fit_score": <0-100>,
    "overall_score": <0-100>,
    "confidence": <0-100>
  }},
  "outcome": {{
    "category": "excellent_fit|good_fit|potential_fit|not_a_fit",
    "would_reach_human": true|false,
    "queue_position": "fast_tracked|standard|review_needed|deprioritized"
  }},
  "critical_issues": [
    {{
      "issue": "specific problem",
      "impact": "high|medium|low",
      "ashby_behavior": "what Ashby does with this issue",
      "fix": "specific actionable solution",
      "priority": <1-5>
    }}
  ],
  "recommendations": [
    {{
      "category": "achievements|skills|progression|keywords",
      "current_state": "what's wrong now",
      "recommended_change": "exact fix",
      "expected_impact": "+X points"
    }}
  ],
  "standout_factors": ["what makes this candidate unique"],
  "reasoning_summary": "2-3 sentence explanation of Ashby's likely decision"
}}
"""

    async def analyze(
        self,
        resume_text: str,
        job_description: str,
        tracker: Optional[TokenTracker] = None
    ) -> Dict[str, Any]:
        """
        Perform deep Ashby ATS replication analysis

        Args:
            resume_text: Full resume text
            job_description: Job description text
            tracker: Token usage tracker

        Returns:
            Comprehensive Ashby analysis with scoring
        """
        logger.info("[ASHBY_DEEP] Starting deep Ashby ATS analysis with GPT-5-mini")

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

        logger.info(f"[ASHBY_DEEP] Analysis complete - Score: {result.get('scoring', {}).get('overall_score', 0)}")

        return result

    def _normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize result to ensure all expected fields exist"""
        # Ensure scoring exists
        if "scoring" not in result:
            result["scoring"] = {}
        
        scoring = result["scoring"]
        scoring.setdefault("achievement_score", 0)
        scoring.setdefault("keyword_score", 0)
        scoring.setdefault("section_score", 0)
        scoring.setdefault("format_score", 100)
        scoring.setdefault("skills_score", 0)
        scoring.setdefault("progression_score", 0)
        scoring.setdefault("cultural_fit_score", 50)
        scoring.setdefault("overall_score", 0)
        scoring.setdefault("confidence", 80)

        # Ensure outcome exists
        if "outcome" not in result:
            score = scoring.get("overall_score", 0)
            if score >= 70:
                category = "excellent_fit"
                queue = "fast_tracked"
                human = True
            elif score >= 50:
                category = "good_fit"
                queue = "standard"
                human = True
            elif score >= 30:
                category = "potential_fit"
                queue = "review_needed"
                human = True
            else:
                category = "not_a_fit"
                queue = "deprioritized"
                human = False
            
            result["outcome"] = {
                "category": category,
                "would_reach_human": human,
                "queue_position": queue
            }

        # Ensure other required fields
        result.setdefault("achievements", [])
        result.setdefault("skills_analysis", {"explicit_skills": [], "inferred_skills": [], "required_skills": [], "matched_skills": [], "missing_skills": [], "skills_score": 0})
        result.setdefault("career_progression", {"positions": [], "trajectory": "unknown", "promotions_detected": 0, "years_of_experience": 0, "progression_score": 0})
        result.setdefault("section_detection", {"found_sections": [], "skipped_sections": [], "missing_sections": [], "detection_score": 0})
        result.setdefault("keyword_analysis", {"required_keywords": [], "exact_matches": [], "semantic_matches": [], "near_misses": [], "missing_keywords": [], "match_rate": 0})
        result.setdefault("formatting_analysis", {"single_column": True, "has_tables": False, "has_graphics": False, "has_text_boxes": False, "compatibility_score": 100, "issues": []})
        result.setdefault("critical_issues", [])
        result.setdefault("recommendations", [])
        result.setdefault("standout_factors", [])
        result.setdefault("reasoning_summary", "Analysis completed.")

        # Add backward compatibility fields for existing frontend
        result["overall_score"] = scoring.get("overall_score", 0)
        result["keyword_match_rate"] = result.get("keyword_analysis", {}).get("match_rate", 0)
        result["ats_compatible"] = result["overall_score"] >= 50
        result["matched_keywords"] = result.get("keyword_analysis", {}).get("exact_matches", [])
        result["missing_keywords"] = result.get("keyword_analysis", {}).get("missing_keywords", [])
        result["extracted_sections"] = result.get("section_detection", {}).get("found_sections", [])
        result["failed_sections"] = result.get("section_detection", {}).get("skipped_sections", [])
        result["formatting_issues"] = result.get("formatting_analysis", {}).get("issues", [])

        return result


# Singleton instance
ashby_analyzer = AshbyDeepAnalyzer()
