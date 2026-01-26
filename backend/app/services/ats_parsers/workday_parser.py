"""
Workday ATS Parser
Mimics Workday's strict parsing logic
"""
import re
from typing import Dict, List, Any
from .keyword_extractor import keyword_extractor


class WorkdayParser:
    """
    Replicates Workday's resume parsing behavior:
    - EXACT keyword matching only (no synonyms)
    - Standard section headings only
    - Single-column layout detection
    - Strict formatting rules
    """

    # Workday only recognizes these EXACT headings
    STANDARD_HEADINGS = [
        "work experience",
        "professional experience",
        "employment history",
        "skills",
        "technical skills",
        "core competencies",
        "education",
        "academic background",
        "contact information",
        "summary",
        "professional summary"
    ]

    def parse_resume(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Parse resume using Workday's strict logic

        Returns:
            Dictionary with parsing results, not LLM analysis
        """
        results = {
            "extracted_sections": [],
            "failed_sections": [],
            "formatting_issues": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "keyword_match_rate": 0,
            "overall_score": 0,
            "ats_compatible": False
        }

        # 1. Extract sections (Workday is very strict)
        sections = self._extract_sections(resume_text)
        results["extracted_sections"] = sections["found"]
        results["failed_sections"] = sections["failed"]

        # 2. Check formatting issues
        results["formatting_issues"] = self._check_formatting(resume_text)

        # 3. Extract keywords from job description
        jd_keywords = self._extract_keywords(job_description)

        # 4. Exact keyword matching (Workday does NOT use synonyms)
        keyword_analysis = self._exact_keyword_match(resume_text, jd_keywords)
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
            len(results["failed_sections"])
        )

        results["ats_compatible"] = results["overall_score"] >= 60

        return results

    def _extract_sections(self, text: str) -> Dict[str, List[str]]:
        """
        Extract sections - Workday only recognizes standard headings
        """
        text_lower = text.lower()
        lines = text.split('\n')

        found_sections = []
        failed_sections = []

        # Check for standard headings
        for heading in self.STANDARD_HEADINGS:
            if heading in text_lower:
                found_sections.append(heading.title())

        # Detect non-standard headings (these would be SKIPPED by Workday)
        potential_headings = []
        for line in lines:
            line_stripped = line.strip()
            # Looks like a heading (short, possibly all caps, followed by content)
            if (len(line_stripped) < 50 and
                len(line_stripped) > 0 and
                not line_stripped[0].isdigit() and
                (line_stripped.isupper() or line_stripped.istitle())):
                potential_headings.append(line_stripped)

        # Any heading not in standard list would fail
        for heading in potential_headings:
            if heading.lower() not in self.STANDARD_HEADINGS:
                # Common non-standard headings that would fail
                if any(word in heading.lower() for word in ['career', 'journey', 'highlights', 'about', 'profile']):
                    failed_sections.append(heading)

        return {
            "found": list(set(found_sections)),
            "failed": list(set(failed_sections))
        }

    def _check_formatting(self, text: str) -> List[str]:
        """
        Detect formatting issues that break Workday's parser
        """
        issues = []

        # Check for tables (Workday can't parse tables)
        if '|' in text or '\t\t' in text:
            issues.append("Table or multi-column format detected - Workday cannot parse tables")

        # Check for excessive special characters (formatting artifacts)
        special_char_ratio = sum(1 for c in text if not c.isalnum() and c not in ' \n.,;:-') / max(len(text), 1)
        if special_char_ratio > 0.15:
            issues.append("Excessive special characters detected - likely from graphics or complex formatting")

        # Check for very short lines (indicates columns or poor extraction)
        lines = text.split('\n')
        short_lines = sum(1 for line in lines if 0 < len(line.strip()) < 20)
        if short_lines > len(lines) * 0.3:
            issues.append("Multi-column layout detected - Workday prefers single-column")

        # Check for URL-like patterns (graphics/images often leave artifacts)
        if re.search(r'http[s]?://|www\.', text):
            # URLs are fine, but image URLs or broken links are issues
            if text.count('http') > 5:
                issues.append("Multiple URLs detected - may indicate image artifacts")

        return issues

    def _extract_keywords(self, job_description: str) -> List[str]:
        """
        Extract important keywords from job description using shared extractor
        Focuses on: skills, technologies, tools, certifications, requirements
        """
        return keyword_extractor.extract_keywords(job_description)

    def _exact_keyword_match(self, resume_text: str, keywords: List[str]) -> Dict[str, List[str]]:
        """
        Workday uses EXACT matching - "SQL" != "database" != "SQL Server"
        """
        matched = []
        missing = []

        resume_lower = resume_text.lower()

        for keyword in keywords:
            # Exact match only (case-insensitive but exact)
            if keyword.lower() in resume_lower:
                matched.append(keyword)
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

    def _calculate_overall_score(self, keyword_rate: int, formatting_issues: int, failed_sections: int) -> int:
        """
        Calculate overall ATS compatibility score for Workday
        """
        score = keyword_rate

        # Deduct for formatting issues (Workday is strict)
        score -= (formatting_issues * 15)

        # Deduct for failed sections (major issue)
        score -= (failed_sections * 20)

        # Ensure score is between 0-100
        return max(0, min(100, score))
