"""
LLM-Based Keyword Extractor
Extracts meaningful keywords from job descriptions using OpenAI GPT-4o-mini
Falls back to rule-based extraction if LLM fails
"""
import re
import json
import logging
from typing import List, Set, Dict, Any
from openai import OpenAI
from app.config import settings

# Configure logger
logger = logging.getLogger(__name__)

# Initialize OpenAI client (reuse from config)
client = OpenAI(api_key=settings.OPENAI_API_KEY) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None


class KeywordExtractor:
    """
    Extract meaningful keywords from job descriptions
    Primary: LLM-based extraction using GPT-4o-mini
    Fallback: Rule-based extraction with regex patterns
    """

    # Common skill categories (used for fallback)
    TECH_SKILLS = {
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
        'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'asp.net',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'nosql',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'devops',
        'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
        'machine learning', 'deep learning', 'ai', 'ml', 'nlp', 'computer vision',
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
        'rest', 'api', 'graphql', 'microservices', 'serverless',
        'agile', 'scrum', 'kanban', 'waterfall'
    }

    # Stop words to ignore (used for fallback)
    STOP_WORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
        'you', 'your', 'we', 'our', 'they', 'their', 'it', 'its', 'all', 'each',
        'every', 'some', 'any', 'such', 'what', 'which', 'who', 'when', 'where',
        'how', 'why', 'than', 'then', 'so', 'if', 'because', 'while', 'during',
        'before', 'after', 'above', 'below', 'between', 'through', 'into', 'out',
        're', 'looking', 'required', 'qualifications', 'responsibilities'
    }

    async def extract_keywords_llm(self, job_description: str) -> List[str]:
        """
        Extract keywords using OpenAI GPT-4o-mini
        
        Returns:
            List of keywords extracted from the job description
        """
        if not client:
            logger.warning("[KEYWORD_EXTRACTOR] OpenAI client not configured, using fallback extraction")
            return self.extract_keywords_fallback(job_description)
        
        logger.info("[KEYWORD_EXTRACTOR] Starting LLM-based keyword extraction")
        logger.debug(f"[KEYWORD_EXTRACTOR] Job description length: {len(job_description)} chars")
        
        prompt = f"""Analyze this job description and extract ALL important keywords that a resume should contain to pass ATS screening.

Job Description:
{job_description}

Extract and return a JSON object with the following categories:
{{
    "technical_skills": ["list of programming languages, frameworks, databases, tools, technologies"],
    "soft_skills": ["list of soft skills like communication, leadership, teamwork"],
    "certifications": ["list of certifications like AWS, PMP, CISSP, CPA"],
    "experience_requirements": ["list like '5+ years Python', '3 years project management'"],
    "industry_terms": ["list of domain-specific terms, methodologies, processes"],
    "tools_platforms": ["list of specific tools, platforms, software mentioned"]
}}

Rules:
1. Extract EXACT terms as they appear in the job description
2. Include acronyms AND full names if both are important (e.g., "PMP" and "Project Management Professional")
3. Include version numbers if specified (e.g., "Python 3", "React 18")
4. Be comprehensive - include all matchable keywords
5. Don't include generic words like "experience" or "skills" alone
"""

        try:
            logger.info("[KEYWORD_EXTRACTOR] Calling OpenAI GPT-4o-mini for keyword extraction...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert ATS keyword extractor. Extract all important keywords from job descriptions that resumes should match. Be thorough and precise."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,  # Lower temperature for more consistent extraction
                max_tokens=1000
            )
            logger.info("[KEYWORD_EXTRACTOR] OpenAI response received successfully")

            result = json.loads(response.choices[0].message.content)
            logger.debug(f"[KEYWORD_EXTRACTOR] Parsed response categories: {list(result.keys())}")
            
            # Flatten all categories into a single list of unique keywords
            all_keywords = []
            for category in ['technical_skills', 'soft_skills', 'certifications', 
                           'experience_requirements', 'industry_terms', 'tools_platforms']:
                keywords = result.get(category, [])
                if isinstance(keywords, list):
                    all_keywords.extend(keywords)
            
            # Remove duplicates while preserving order
            seen = set()
            unique_keywords = []
            for kw in all_keywords:
                kw_lower = kw.lower().strip()
                if kw_lower not in seen and len(kw.strip()) > 1:
                    seen.add(kw_lower)
                    unique_keywords.append(kw.strip())
            
            logger.info(f"[KEYWORD_EXTRACTOR] Extracted {len(unique_keywords)} unique keywords via LLM")
            logger.debug(f"[KEYWORD_EXTRACTOR] Keywords: {unique_keywords[:10]}..." if len(unique_keywords) > 10 else f"[KEYWORD_EXTRACTOR] Keywords: {unique_keywords}")
            return unique_keywords[:50]  # Limit to 50 keywords

        except Exception as e:
            logger.error(f"[KEYWORD_EXTRACTOR] LLM extraction failed: {str(e)}")
            logger.info("[KEYWORD_EXTRACTOR] Falling back to rule-based extraction")
            return self.extract_keywords_fallback(job_description)

    def extract_keywords(self, job_description: str) -> List[str]:
        """
        Synchronous wrapper - uses fallback for backward compatibility
        For async extraction, use extract_keywords_llm() directly
        """
        return self.extract_keywords_fallback(job_description)

    def extract_keywords_fallback(self, job_description: str) -> List[str]:
        """
        Fallback: Extract keywords using rule-based patterns
        Used when LLM is unavailable or fails
        
        Returns:
            List of actual skills/keywords (not sentence fragments)
        """
        keywords = set()

        # 1. Extract technical skills (case-insensitive matching with known skills)
        jd_lower = job_description.lower()
        for skill in self.TECH_SKILLS:
            if skill in jd_lower:
                keywords.add(skill.title())

        # 2. Extract degree requirements
        degree_pattern = r'(Bachelor(?:\'?s)?|Master(?:\'?s)?|PhD|Ph\.D\.|Doctorate)\s+(?:degree\s+)?(?:in\s+)?([A-Z][A-Za-z\s]+)?'
        degrees = re.findall(degree_pattern, job_description, re.IGNORECASE)
        for degree, field in degrees:
            if field.strip():
                keywords.add(f"{degree}'s degree in {field.strip()}")
            else:
                keywords.add(f"{degree}'s degree")

        # 3. Extract certifications
        cert_pattern = r'(AWS|Azure|GCP|PMP|CISSP|Security\+|Network\+|CCNA|CPA|CFA|Six Sigma)\s*(?:Certified|Certification)?'
        certs = re.findall(cert_pattern, job_description, re.IGNORECASE)
        keywords.update([cert.strip() for cert in certs if cert.strip()])

        # 4. Extract years of experience requirements
        exp_pattern = r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp\.?)\s+(?:in|with)?\s+([A-Z][A-Za-z\s/\-]+)'
        exp_matches = re.findall(exp_pattern, job_description, re.IGNORECASE)
        for years, skill in exp_matches:
            skill_cleaned = skill.strip().rstrip(',;.')
            if skill_cleaned and len(skill_cleaned) < 50:
                keywords.add(f"{years}+ years {skill_cleaned}")

        # 5. Extract specific tools and frameworks (capitalized or with special chars)
        tool_pattern = r'\b([A-Z][A-Za-z]*(?:\.[A-Z][A-Za-z]*|[A-Z]+)?(?:\s+[A-Z][A-Za-z]+)?)\b'
        tools = re.findall(tool_pattern, job_description)
        for tool in tools:
            # Filter out common English words and sentence starters
            if (len(tool) > 2 and
                tool.lower() not in self.STOP_WORDS and
                not tool.lower().startswith(('will', 'must', 'should', 'looking', 'required'))):
                keywords.add(tool)

        # 6. Extract from bullet points/requirements sections
        bullet_pattern = r'[•\-\*]\s*([^\n]+)'
        bullets = re.findall(bullet_pattern, job_description)
        for bullet in bullets:
            # Extract noun phrases from bullets (likely to be skills)
            noun_phrases = self._extract_noun_phrases(bullet)
            keywords.update(noun_phrases)

        # 7. Clean and filter keywords
        cleaned_keywords = []
        for kw in keywords:
            kw_clean = kw.strip().rstrip(',;.')
            # Must be reasonable length
            if 2 < len(kw_clean) < 60:
                # Must not be just a stop word
                if kw_clean.lower() not in self.STOP_WORDS:
                    # Must contain at least one letter
                    if any(c.isalpha() for c in kw_clean):
                        cleaned_keywords.append(kw_clean)

        # Remove duplicates (case-insensitive)
        unique_keywords = []
        seen_lower = set()
        for kw in cleaned_keywords:
            if kw.lower() not in seen_lower:
                unique_keywords.append(kw)
                seen_lower.add(kw.lower())

        return unique_keywords[:50]  # Limit to 50 most relevant

    def _extract_noun_phrases(self, text: str) -> Set[str]:
        """
        Extract noun phrases from text (simple heuristic)
        """
        phrases = set()

        # Look for patterns like "Experience with X" or "Knowledge of X"
        patterns = [
            r'(?:experience with|knowledge of|proficiency in|expertise in)\s+([A-Z][A-Za-z0-9\s\-/,]+?)(?:\.|,|;|\n|$)',
            r'(?:strong|solid|deep)\s+(?:understanding|knowledge)\s+of\s+([A-Z][A-Za-z0-9\s\-/,]+?)(?:\.|,|;|\n|$)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Split by commas and clean
                items = [item.strip() for item in match.split(',')]
                for item in items:
                    if 3 < len(item) < 40 and item[0].isupper():
                        phrases.add(item)

        return phrases


# Singleton instance
keyword_extractor = KeywordExtractor()
