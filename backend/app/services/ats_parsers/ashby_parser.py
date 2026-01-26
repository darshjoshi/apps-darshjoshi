"""
Ashby ATS Parser
Mimics Ashby's AI-powered matching with criteria-based evaluation
"""
import re
import json
import logging
from typing import Dict, List, Any, Tuple, Optional
from openai import OpenAI
from app.config import settings
from app.services.token_tracker import TokenTracker
from .keyword_extractor import keyword_extractor

# Configure logger
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None


class AshbyParser:
    """
    Replicates Ashby's resume parsing behavior:
    - AI-friendly content analysis
    - Focus on quantifiable achievements and metrics
    - Pattern recognition across industries
    - Context-aware skill matching
    - Career progression analysis
    """

    async def parse_resume(self, resume_text: str, job_description: str, tracker: Optional[TokenTracker] = None) -> Dict[str, Any]:
        """
        Parse resume using Ashby's AI-powered logic
        
        Args:
            tracker: Optional TokenTracker to record API usage
        """
        results = {
            "extracted_sections": [],
            "failed_sections": [],
            "formatting_issues": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "keyword_match_rate": 0,
            "overall_score": 0,
            "ats_compatible": False,
            "achievements": [],
            "career_progression": {}
        }

        # 1. Extract quantifiable achievements (Ashby's focus)
        results["achievements"] = self._extract_achievements(resume_text)

        # 2. Analyze career progression
        results["career_progression"] = self._analyze_career_progression(resume_text)

        # 3. Check formatting (Ashby is very forgiving)
        results["formatting_issues"] = self._check_formatting(resume_text)

        # 4. Extract keywords with context (LLM-based)
        jd_keywords = await self._extract_contextual_keywords(job_description, tracker)

        # 5. AI-style semantic matching
        logger.info("[ASHBY] Performing AI-powered semantic matching...")
        keyword_analysis = await self._ai_keyword_match(resume_text, jd_keywords, tracker)
        results["matched_keywords"] = keyword_analysis["matched"]
        results["missing_keywords"] = keyword_analysis["missing"]

        # 6. Calculate scores
        results["keyword_match_rate"] = self._calculate_keyword_rate(
            keyword_analysis["matched"],
            jd_keywords
        )

        results["overall_score"] = self._calculate_overall_score(
            results["keyword_match_rate"],
            len(results["achievements"]),
            results["career_progression"]
        )

        results["ats_compatible"] = results["overall_score"] >= 40

        # Detect sections
        results["extracted_sections"] = self._detect_sections(resume_text)

        return results

    def _extract_achievements(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract quantifiable achievements - Ashby's key focus
        Looks for patterns like: "increased by X%", "reduced X by Y", "$X revenue"
        """
        achievements = []

        # Patterns for quantifiable achievements
        patterns = [
            # Percentage improvements
            (r'(increased|improved|boosted|grew|enhanced)\s+([^.]+?)\s+by\s+(\d+)%', 'percentage_increase'),
            (r'(reduced|decreased|cut|lowered)\s+([^.]+?)\s+by\s+(\d+)%', 'percentage_decrease'),

            # Dollar amounts
            (r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:M|million|K|thousand|B|billion)?', 'dollar_amount'),

            # Time improvements
            (r'(reduced|decreased|cut)\s+([^.]+?)\s+(?:by|from)\s+(\d+)\s*(hours?|days?|weeks?|months?)', 'time_reduction'),

            # Scale/Size metrics
            (r'(?:managed|led|oversaw)\s+(?:team of|project of|budget of)?\s*(\d+)', 'scale'),

            # Performance metrics
            (r'achieved\s+(\d+)%\s+([^.]+)', 'achievement'),

            # User/Customer metrics
            (r'(\d+(?:,\d{3})*)\s*(?:\+)?\s*(?:users|customers|clients)', 'users'),
        ]

        for pattern, metric_type in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                achievements.append({
                    "type": metric_type,
                    "text": str(match),
                    "context": self._extract_context(text, str(match))
                })

        return achievements

    def _extract_context(self, text: str, match: str, window: int = 100) -> str:
        """
        Extract surrounding context for a match
        """
        idx = text.find(str(match))
        if idx == -1:
            return ""

        start = max(0, idx - window)
        end = min(len(text), idx + len(str(match)) + window)

        return text[start:end].strip()

    def _analyze_career_progression(self, text: str) -> Dict[str, Any]:
        """
        Analyze career progression - Ashby looks for growth patterns
        """
        progression = {
            "has_progression": False,
            "levels": [],
            "promotions": 0,
            "career_trajectory": "unknown"
        }

        # Look for seniority levels
        seniority_keywords = {
            "junior": 1,
            "associate": 2,
            "mid-level": 3,
            "senior": 4,
            "staff": 5,
            "principal": 6,
            "lead": 6,
            "manager": 6,
            "director": 7,
            "vp": 8,
            "head": 8,
            "chief": 9,
            "c-level": 9
        }

        text_lower = text.lower()
        found_levels = []

        for keyword, level in seniority_keywords.items():
            if keyword in text_lower:
                found_levels.append((keyword, level))

        if found_levels:
            # Sort by level
            found_levels.sort(key=lambda x: x[1])
            progression["levels"] = [level[0] for level in found_levels]

            # Check for progression
            if len(found_levels) > 1:
                if found_levels[-1][1] > found_levels[0][1]:
                    progression["has_progression"] = True
                    progression["promotions"] = len(set([l[1] for l in found_levels])) - 1
                    progression["career_trajectory"] = "upward"
                elif found_levels[-1][1] == found_levels[0][1]:
                    progression["career_trajectory"] = "lateral"
                else:
                    progression["career_trajectory"] = "varied"

        return progression

    def _check_formatting(self, text: str) -> List[str]:
        """
        Ashby is very forgiving with formatting (modern AI approach)
        """
        issues = []

        # Only flag major issues
        if len(text.strip()) < 200:
            issues.append("Resume appears very short - may be incomplete extraction")

        # Check for completely garbled text
        special_char_ratio = sum(1 for c in text if not c.isalnum() and c not in ' \n.,;:-()[]"\'') / max(len(text), 1)
        if special_char_ratio > 0.30:
            issues.append("Significant text extraction issues detected")

        return issues

    async def _extract_contextual_keywords(self, job_description: str, tracker: Optional[TokenTracker] = None) -> List[str]:
        """
        Extract keywords with understanding of context and importance using LLM
        """
        return await keyword_extractor.extract_keywords_llm(job_description, tracker)

    async def _ai_keyword_match(self, resume_text: str, keywords: List[str], tracker: Optional[TokenTracker] = None) -> Dict[str, List[str]]:
        """
        Ashby uses AI-first matching with focus on:
        - Quantifiable achievements
        - Context understanding
        - Skills inference
        """
        if not client or not keywords:
            logger.warning("[ASHBY] OpenAI not available, falling back to basic matching")
            return self._basic_match(resume_text, keywords)
        
        # Get achievements for context
        achievements = self._extract_achievements(resume_text)
        progression = self._analyze_career_progression(resume_text)
        
        prompt = f"""Analyze this resume with Ashby's AI-powered approach.

RESUME TEXT:
{resume_text[:4000]}

QUANTIFIABLE ACHIEVEMENTS FOUND:
{json.dumps(achievements[:10])}

CAREER PROGRESSION:
{json.dumps(progression)}

JOB REQUIREMENTS/KEYWORDS:
{json.dumps(keywords)}

Ashby's AI evaluation approach:
1. Focus on DEMONSTRATED skills with evidence
2. Value quantifiable achievements (%, $, metrics)
3. Consider career progression and growth
4. Infer related skills (e.g., "led team" implies leadership)

For each requirement, determine if the resume provides EVIDENCE of this skill.

Return JSON:
{{
    "matched": ["requirements with evidence in resume"],
    "missing": ["requirements without clear evidence"],
    "analysis": "brief reasoning focusing on achievements"
}}

Be thorough - look for demonstrated impact, not just keyword presence."""

        try:
            logger.info(f"[ASHBY] Calling OpenAI for AI-powered matching of {len(keywords)} requirements...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are Ashby's AI analyzer. Focus on quantifiable achievements and demonstrated skills. Infer related skills when there's clear evidence."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1500
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Track token usage
            if tracker:
                tracker.add_from_response(response)
            
            matched = result.get("matched", [])
            missing = result.get("missing", [])
            
            logger.info(f"[ASHBY] AI matching complete: {len(matched)} matched, {len(missing)} missing")
            
            return {"matched": matched, "missing": missing}
            
        except Exception as e:
            logger.error(f"[ASHBY] AI matching failed: {str(e)}")
            return self._basic_match(resume_text, keywords)
    
    def _basic_match(self, resume_text: str, keywords: List[str]) -> Dict[str, List[str]]:
        """Fallback basic matching"""
        matched, missing = [], []
        resume_lower = resume_text.lower()
        for kw in keywords:
            if kw.lower() in resume_lower:
                matched.append(kw)
            else:
                missing.append(kw)
        return {"matched": matched, "missing": missing}

    def _detect_sections(self, text: str) -> List[str]:
        """
        Detect sections - Ashby is flexible
        """
        sections = []

        common_sections = [
            "experience", "work", "employment", "professional",
            "education", "academic", "university",
            "skills", "technical", "competencies",
            "projects", "portfolio",
            "certifications", "licenses",
            "achievements", "awards"
        ]

        text_lower = text.lower()

        for section in common_sections:
            if section in text_lower:
                sections.append(section.title())

        return list(set(sections))

    def _calculate_keyword_rate(self, matched: List[str], all_keywords: List[str]) -> int:
        """
        Calculate keyword match percentage
        """
        if not all_keywords:
            return 0
        return int((len(matched) / len(all_keywords)) * 100)

    def _calculate_overall_score(self, keyword_rate: int, num_achievements: int, career_progression: Dict) -> int:
        """
        Ashby weighs achievements and growth heavily
        """
        score = keyword_rate

        # Big bonus for quantifiable achievements (Ashby loves metrics)
        achievement_bonus = min(30, num_achievements * 3)
        score += achievement_bonus

        # Bonus for career progression
        if career_progression.get("has_progression"):
            score += 15

        # Bonus for promotions
        score += min(10, career_progression.get("promotions", 0) * 5)

        return max(0, min(100, score))
