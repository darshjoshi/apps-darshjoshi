"""
Greenhouse ATS Parser
Mimics Greenhouse's structured data extraction with semantic understanding
"""
import re
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from openai import OpenAI
from app.config import settings
from app.services.token_tracker import TokenTracker
from .keyword_extractor import keyword_extractor

# Configure logger
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None


class GreenhouseParser:
    """
    Replicates Greenhouse's resume parsing behavior:
    - Structured data extraction (dates, companies, titles, education)
    - Semantic keyword matching (accepts synonyms)
    - Good handling of standard resume formats
    - Extracts quantifiable achievements
    """

    STANDARD_HEADINGS = [
        "work experience", "professional experience", "employment",
        "skills", "technical skills", "competencies",
        "education", "academic background",
        "certifications", "licenses",
        "projects", "achievements"
    ]

    # Greenhouse understands these as synonyms
    KEYWORD_SYNONYMS = {
        "managed": ["led", "supervised", "directed", "coordinated", "oversaw"],
        "developed": ["built", "created", "designed", "implemented", "engineered"],
        "improved": ["optimized", "enhanced", "increased", "boosted", "streamlined"],
        "analyzed": ["evaluated", "assessed", "examined", "investigated"],
        "collaborated": ["worked with", "partnered", "coordinated with", "teamed up"],
    }

    async def parse_resume(self, resume_text: str, job_description: str, tracker: Optional[TokenTracker] = None) -> Dict[str, Any]:
        """
        Parse resume using Greenhouse's structured extraction logic
        
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
            "structured_data": {}
        }

        # 1. Extract structured data (Greenhouse's strength)
        results["structured_data"] = self._extract_structured_data(resume_text)
        results["extracted_sections"] = list(results["structured_data"].keys())

        # 2. Check formatting (Greenhouse is more forgiving than Workday)
        results["formatting_issues"] = self._check_formatting(resume_text)

        # 3. Extract keywords from JD (LLM-based)
        jd_keywords = await self._extract_keywords(job_description, tracker)

        # 4. Semantic keyword matching (Greenhouse uses ML-based matching)
        logger.info("[GREENHOUSE] Performing semantic keyword matching...")
        keyword_analysis = await self._semantic_keyword_match(resume_text, jd_keywords, tracker)
        results["matched_keywords"] = keyword_analysis["matched"]
        results["missing_keywords"] = keyword_analysis["missing"]

        # 5. Calculate scores
        results["keyword_match_rate"] = self._calculate_keyword_rate(
            keyword_analysis["matched"],
            jd_keywords
        )

        results["overall_score"] = self._calculate_overall_score(
            results["keyword_match_rate"],
            len(results["formatting_issues"]),
            results["structured_data"]
        )

        results["ats_compatible"] = results["overall_score"] >= 50

        return results

    def _extract_structured_data(self, text: str) -> Dict[str, Any]:
        """
        Extract structured data - Greenhouse's key strength
        Maps resume data to database fields
        """
        structured = {}

        # Extract work experience with dates, companies, titles
        work_exp = self._extract_work_experience(text)
        if work_exp:
            structured["work_experience"] = work_exp

        # Extract education with degrees, institutions, dates
        education = self._extract_education(text)
        if education:
            structured["education"] = education

        # Extract skills
        skills = self._extract_skills(text)
        if skills:
            structured["skills"] = skills

        # Extract contact info
        contact = self._extract_contact(text)
        if contact:
            structured["contact"] = contact

        return structured

    def _extract_work_experience(self, text: str) -> List[Dict[str, str]]:
        """
        Extract work experience with structure
        Greenhouse looks for: Company, Title, Dates, Achievements
        More flexible matching to catch various resume formats
        """
        experiences = []

        # Look for date ranges (most reliable indicator of work experience)
        date_pattern = r'((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{4}|\d{4})\s*(?:to|–|-|—)\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{4}|\d{4}|Present|Current|Now)'
        dates = re.findall(date_pattern, text, re.IGNORECASE)

        # Look for job titles (expanded list)
        title_pattern = r'((?:Senior|Junior|Lead|Principal|Staff|Chief|Head|VP|Vice President|Assistant|Associate|Executive|Managing)?\s*(?:Software Engineer|Engineer|Developer|Manager|Director|Analyst|Designer|Consultant|Architect|Specialist|Coordinator|Administrator|Officer|Executive|Intern|Trainee|Associate|Partner|President|Founder|Owner|Scientist|Researcher|Accountant|Attorney|Lawyer|Nurse|Teacher|Professor|Instructor))'
        titles = re.findall(title_pattern, text, re.IGNORECASE)

        # If we found dates, we have work experience
        if dates:
            for i, date_pair in enumerate(dates[:5]):  # Limit to 5 experiences
                exp = {"duration": f"{date_pair[0]} - {date_pair[1]}"}
                if i < len(titles):
                    exp["title"] = titles[i].strip()
                else:
                    exp["title"] = "Position"
                experiences.append(exp)
        elif titles:
            # No dates but have titles - still count as experience
            for title in titles[:5]:
                experiences.append({"title": title.strip(), "duration": "Unknown"})

        return experiences

    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """
        Extract education with structure
        """
        education = []

        # Look for degrees
        degree_pattern = r'(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA)\.?\s+(?:of|in)?\s+([A-Za-z\s]+)'
        degrees = re.findall(degree_pattern, text, re.IGNORECASE)

        # Look for universities
        university_pattern = r'(University of [A-Za-z\s]+|[A-Z][A-Za-z\s]+ University|[A-Z][A-Za-z\s]+ College|[A-Z][A-Za-z\s]+ Institute)'
        universities = re.findall(university_pattern, text)

        for i in range(min(len(degrees), len(universities))):
            education.append({
                "degree": f"{degrees[i][0]} {degrees[i][1]}".strip(),
                "institution": universities[i].strip()
            })

        return education

    def _extract_skills(self, text: str) -> List[str]:
        """
        Extract skills section
        """
        skills = []

        # Look for skills section
        skills_section_match = re.search(r'(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)[\s:]*\n((?:[^\n]+\n?)+?)(?:\n\n|[A-Z]{5,})', text, re.IGNORECASE)

        if skills_section_match:
            skills_text = skills_section_match.group(1)
            # Split by common delimiters
            skill_items = re.split(r'[,;•\|]', skills_text)
            skills = [s.strip() for s in skill_items if len(s.strip()) > 2]

        return skills[:20]  # Limit to top 20 skills

    def _extract_contact(self, text: str) -> Dict[str, str]:
        """
        Extract contact information
        """
        contact = {}

        # Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            contact["email"] = email_match.group(0)

        # Phone
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        if phone_match:
            contact["phone"] = phone_match.group(0)

        # LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text, re.IGNORECASE)
        if linkedin_match:
            contact["linkedin"] = linkedin_match.group(0)

        return contact

    def _check_formatting(self, text: str) -> List[str]:
        """
        Greenhouse is more forgiving but still has limits
        """
        issues = []

        # Greenhouse can handle some tables but excessive complexity is an issue
        if text.count('|') > 20:
            issues.append("Complex table structure detected - may affect data extraction")

        # Check for very poor text extraction (lots of special characters)
        special_char_ratio = sum(1 for c in text if not c.isalnum() and c not in ' \n.,;:-()[]') / max(len(text), 1)
        if special_char_ratio > 0.20:
            issues.append("Poor text extraction quality - may be from scanned PDF or images")

        return issues

    async def _extract_keywords(self, job_description: str, tracker: Optional[TokenTracker] = None) -> List[str]:
        """
        Extract keywords from job description using LLM
        """
        return await keyword_extractor.extract_keywords_llm(job_description, tracker)

    async def _semantic_keyword_match(self, resume_text: str, keywords: List[str], tracker: Optional[TokenTracker] = None) -> Dict[str, List[str]]:
        """
        Greenhouse uses ML-based semantic matching against structured data
        Uses OpenAI for semantic understanding
        """
        if not client or not keywords:
            logger.warning("[GREENHOUSE] OpenAI not available, falling back to basic matching")
            return self._basic_keyword_match(resume_text, keywords)
        
        # Get structured data for context
        structured = self._extract_structured_data(resume_text)
        
        prompt = f"""Analyze this resume and determine which job requirements are met.

RESUME TEXT:
{resume_text[:4000]}

STRUCTURED DATA EXTRACTED:
- Work Experience: {json.dumps(structured.get('work_experience', []))}
- Education: {json.dumps(structured.get('education', []))}
- Skills: {json.dumps(structured.get('skills', []))}

JOB REQUIREMENTS/KEYWORDS:
{json.dumps(keywords)}

Match each keyword against BOTH the raw resume text AND the structured data.
Greenhouse is moderately forgiving with semantic matches.

Return JSON:
{{
    "matched": ["keywords demonstrated in the resume"],
    "missing": ["keywords NOT found in the resume"],
    "analysis": "brief reasoning"
}}

Be fair but accurate - match based on demonstrated experience, not just word presence."""

        try:
            logger.info(f"[GREENHOUSE] Calling OpenAI for semantic matching of {len(keywords)} keywords...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Greenhouse ATS analyzer. Match job requirements to resume content using semantic understanding and structured data extraction."
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
            
            logger.info(f"[GREENHOUSE] Semantic matching complete: {len(matched)} matched, {len(missing)} missing")
            
            return {"matched": matched, "missing": missing}
            
        except Exception as e:
            logger.error(f"[GREENHOUSE] Semantic matching failed: {str(e)}")
            return self._basic_keyword_match(resume_text, keywords)
    
    def _basic_keyword_match(self, resume_text: str, keywords: List[str]) -> Dict[str, List[str]]:
        """Fallback basic matching"""
        matched, missing = [], []
        resume_lower = resume_text.lower()
        for kw in keywords:
            if kw.lower() in resume_lower:
                matched.append(kw)
            else:
                missing.append(kw)
        return {"matched": matched, "missing": missing}

    def _calculate_keyword_rate(self, matched: List[str], all_keywords: List[str]) -> int:
        """
        Calculate keyword match percentage
        """
        if not all_keywords:
            return 0
        return int((len(matched) / len(all_keywords)) * 100)

    def _calculate_overall_score(self, keyword_rate: int, formatting_issues: int, structured_data: Dict) -> int:
        """
        Greenhouse weighs structured data quality highly
        """
        score = keyword_rate

        # Bonus for good structured data extraction
        if "work_experience" in structured_data and len(structured_data["work_experience"]) > 0:
            score += 10
        if "education" in structured_data and len(structured_data["education"]) > 0:
            score += 5
        if "skills" in structured_data and len(structured_data["skills"]) > 0:
            score += 5

        # Minor deductions for formatting (Greenhouse is forgiving)
        score -= (formatting_issues * 5)

        return max(0, min(100, score))
