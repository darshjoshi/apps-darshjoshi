"""
Greenhouse ATS Parser
Mimics Greenhouse's structured data extraction with semantic understanding
"""
import re
from typing import Dict, List, Any, Optional
from datetime import datetime


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

    def parse_resume(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Parse resume using Greenhouse's structured extraction logic
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

        # 3. Extract keywords from JD
        jd_keywords = self._extract_keywords(job_description)

        # 4. Semantic keyword matching (Greenhouse accepts synonyms)
        keyword_analysis = self._semantic_keyword_match(resume_text, jd_keywords)
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
        """
        experiences = []

        # Look for company names (usually all caps or title case)
        company_pattern = r'(?:^|\n)([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Corp|Corporation|Ltd|Company)?)\s*(?:\||•|–|-)\s*([^\n]+)'
        companies = re.findall(company_pattern, text, re.MULTILINE)

        # Look for date ranges
        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*(?:to|-|–)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)'
        dates = re.findall(date_pattern, text, re.IGNORECASE)

        # Look for job titles
        title_pattern = r'((?:Senior|Junior|Lead|Principal|Staff|Chief)?\s*(?:Software Engineer|Developer|Manager|Director|Analyst|Designer|Consultant|Architect))'
        titles = re.findall(title_pattern, text, re.IGNORECASE)

        # Structure the experience
        for i in range(min(len(companies), len(dates), len(titles))):
            experiences.append({
                "company": companies[i][0].strip() if i < len(companies) else "Unknown",
                "title": titles[i] if i < len(titles) else "Unknown",
                "duration": f"{dates[i][0]} - {dates[i][1]}" if i < len(dates) else "Unknown"
            })

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

    def _extract_keywords(self, job_description: str) -> List[str]:
        """
        Extract keywords from job description
        """
        keywords = []

        # Extract technical terms and skills
        technical_pattern = r'\b([A-Z][A-Za-z]*(?:[.\+]?[A-Z][A-Za-z]*)*)\b'
        tech_terms = re.findall(technical_pattern, job_description)
        keywords.extend([t for t in tech_terms if len(t) > 2 and len(t) < 30])

        # Extract quoted requirements
        quoted = re.findall(r'"([^"]+)"', job_description)
        keywords.extend(quoted)

        # Extract from requirement phrases
        req_pattern = r'(?:required|must have|experience with|proficiency in)[\s:]+([A-Za-z0-9\s,\+\#\-\.]+?)(?:\.|,|;|\n)'
        requirements = re.findall(req_pattern, job_description, re.IGNORECASE)
        for req in requirements:
            items = re.split(r'[,;]', req)
            keywords.extend([item.strip() for item in items if 3 < len(item.strip()) < 40])

        return list(set(keywords))

    def _semantic_keyword_match(self, resume_text: str, keywords: List[str]) -> Dict[str, List[str]]:
        """
        Greenhouse accepts semantic matches (synonyms)
        """
        matched = []
        missing = []

        resume_lower = resume_text.lower()

        for keyword in keywords:
            keyword_lower = keyword.lower()

            # Check exact match first
            if keyword_lower in resume_lower:
                matched.append(keyword)
                continue

            # Check synonyms
            found_synonym = False
            for base_word, synonyms in self.KEYWORD_SYNONYMS.items():
                if base_word in keyword_lower or keyword_lower in base_word:
                    # Check if any synonym is in resume
                    for synonym in synonyms:
                        if synonym in resume_lower:
                            matched.append(keyword)
                            found_synonym = True
                            break
                    if found_synonym:
                        break

            if not found_synonym:
                # Check partial match (Greenhouse is forgiving)
                if len(keyword_lower) > 4:
                    # Accept partial matches for longer keywords
                    if any(keyword_lower in word or word in keyword_lower for word in resume_lower.split()):
                        matched.append(keyword)
                    else:
                        missing.append(keyword)
                else:
                    missing.append(keyword)

        return {
            "matched": matched,
            "missing": missing
        }

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
