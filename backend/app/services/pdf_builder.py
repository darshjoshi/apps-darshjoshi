"""
PDF Builder Service
Generates ATS-optimized single-page resume PDFs using ReportLab.
Each ATS system (Workday, Greenhouse, Ashby) has tailored styling
while sharing the same structural layout.
"""

import logging
from io import BytesIO
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import black, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepInFrame,
)

from app.schemas.resume_schemas import StructuredResume

logger = logging.getLogger(__name__)

# Page dimensions
PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN_X = 0.5 * inch
MARGIN_Y = 0.4 * inch
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_X
CONTENT_HEIGHT = PAGE_HEIGHT - 2 * MARGIN_Y


# ---------------------------------------------------------------------------
# Style factories per ATS
# ---------------------------------------------------------------------------

def _workday_styles() -> Dict[str, ParagraphStyle]:
    """Workday: clean, minimal, standard headings, no frills."""
    return {
        "name": ParagraphStyle(
            "WD_Name", fontName="Helvetica-Bold", fontSize=14,
            alignment=TA_CENTER, leading=16, spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "WD_Contact", fontName="Helvetica", fontSize=9,
            alignment=TA_CENTER, leading=11, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "WD_Section", fontName="Helvetica-Bold", fontSize=10,
            leading=12, spaceBefore=6, spaceAfter=1,
        ),
        "body": ParagraphStyle(
            "WD_Body", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
        "jobtitle": ParagraphStyle(
            "WD_JobTitle", fontName="Helvetica-Bold", fontSize=9.5,
            leading=11,
        ),
        "date": ParagraphStyle(
            "WD_Date", fontName="Helvetica", fontSize=9,
            alignment=TA_RIGHT, leading=11,
        ),
        "subtitle": ParagraphStyle(
            "WD_Subtitle", fontName="Helvetica-Oblique", fontSize=9,
            leading=11,
        ),
        "bullet": ParagraphStyle(
            "WD_Bullet", fontName="Helvetica", fontSize=9,
            leading=11, leftIndent=8, spaceAfter=1,
            bulletFontName="Helvetica", bulletFontSize=9,
        ),
        "skills_label": ParagraphStyle(
            "WD_SkillsLabel", fontName="Helvetica-Bold", fontSize=9,
            leading=11,
        ),
        "skills_body": ParagraphStyle(
            "WD_SkillsBody", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
    }


def _greenhouse_styles() -> Dict[str, ParagraphStyle]:
    """Greenhouse: structured, slightly softer with dark gray headings."""
    dark = HexColor("#333333")
    return {
        "name": ParagraphStyle(
            "GH_Name", fontName="Helvetica-Bold", fontSize=15,
            alignment=TA_CENTER, leading=17, spaceAfter=3,
        ),
        "contact": ParagraphStyle(
            "GH_Contact", fontName="Helvetica", fontSize=9,
            alignment=TA_CENTER, leading=11, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "GH_Section", fontName="Helvetica-Bold", fontSize=10,
            leading=12, textColor=dark, spaceBefore=6, spaceAfter=1,
        ),
        "body": ParagraphStyle(
            "GH_Body", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
        "jobtitle": ParagraphStyle(
            "GH_JobTitle", fontName="Helvetica-Bold", fontSize=9.5,
            leading=11,
        ),
        "date": ParagraphStyle(
            "GH_Date", fontName="Helvetica", fontSize=9,
            alignment=TA_RIGHT, leading=11,
        ),
        "subtitle": ParagraphStyle(
            "GH_Subtitle", fontName="Helvetica-Oblique", fontSize=9,
            leading=11,
        ),
        "bullet": ParagraphStyle(
            "GH_Bullet", fontName="Helvetica", fontSize=9,
            leading=11, leftIndent=8, spaceAfter=1,
        ),
        "skills_label": ParagraphStyle(
            "GH_SkillsLabel", fontName="Helvetica-Bold", fontSize=9,
            leading=11,
        ),
        "skills_body": ParagraphStyle(
            "GH_SkillsBody", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
    }


def _ashby_styles() -> Dict[str, ParagraphStyle]:
    """Ashby: achievement-focused, subtle accent color, modern."""
    dark = HexColor("#333333")
    mid = HexColor("#444444")
    return {
        "name": ParagraphStyle(
            "AS_Name", fontName="Helvetica-Bold", fontSize=16,
            alignment=TA_LEFT, leading=18, spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "AS_Contact", fontName="Helvetica", fontSize=9,
            alignment=TA_LEFT, textColor=mid, leading=11, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "AS_Section", fontName="Helvetica-Bold", fontSize=10,
            leading=12, spaceBefore=6, spaceAfter=2,
        ),
        "body": ParagraphStyle(
            "AS_Body", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
        "jobtitle": ParagraphStyle(
            "AS_JobTitle", fontName="Helvetica-Bold", fontSize=9.5,
            leading=11,
        ),
        "date": ParagraphStyle(
            "AS_Date", fontName="Helvetica", fontSize=9,
            alignment=TA_RIGHT, leading=11,
        ),
        "subtitle": ParagraphStyle(
            "AS_Subtitle", fontName="Helvetica", fontSize=9,
            leading=11, textColor=mid,
        ),
        "bullet": ParagraphStyle(
            "AS_Bullet", fontName="Helvetica", fontSize=9,
            leading=11, leftIndent=8, spaceAfter=1,
        ),
        "skills_label": ParagraphStyle(
            "AS_SkillsLabel", fontName="Helvetica-Bold", fontSize=9,
            leading=11,
        ),
        "skills_body": ParagraphStyle(
            "AS_SkillsBody", fontName="Helvetica", fontSize=9,
            leading=11, spaceAfter=1,
        ),
    }


_STYLE_FACTORIES = {
    "workday": _workday_styles,
    "greenhouse": _greenhouse_styles,
    "ashby": _ashby_styles,
}


# ---------------------------------------------------------------------------
# Section builders (shared structure, styles vary)
# ---------------------------------------------------------------------------

def _section_header(title: str, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Return flowables for a section heading with a horizontal rule."""
    stroke_color = HexColor("#333333") if ats in ("greenhouse", "ashby") else black
    stroke_width = 0.8 if ats == "greenhouse" else 0.5
    return [
        Paragraph(title, s["section"]),
        HRFlowable(width="100%", thickness=stroke_width, color=stroke_color,
                    spaceAfter=2, spaceBefore=0),
    ]


def _build_contact(data: StructuredResume, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Build contact / header section."""
    items: list = []

    name_text = data.contact.name.upper() if ats == "ashby" else data.contact.name
    items.append(Paragraph(name_text, s["name"]))

    parts = [data.contact.email, data.contact.phone, data.contact.location]
    if data.contact.linkedin:
        parts.append(data.contact.linkedin)
    sep = " &bull; " if ats == "ashby" else "  |  "
    items.append(Paragraph(sep.join(parts), s["contact"]))

    # Divider after header for Ashby
    if ats == "ashby":
        items.append(HRFlowable(width="100%", thickness=1.5, color=black,
                                spaceAfter=4, spaceBefore=4))
    else:
        items.append(Spacer(1, 6))

    return items


def _build_summary(data: StructuredResume, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Build professional summary section."""
    if not data.summary:
        return []
    title = "PROFESSIONAL SUMMARY" if ats == "ashby" else "SUMMARY" if ats == "workday" else "Professional Summary"
    items = _section_header(title, s, ats)
    items.append(Paragraph(data.summary, s["body"]))
    return items


def _build_experience(data: StructuredResume, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Build work experience section."""
    if not data.experience:
        return []

    title_map = {
        "workday": "WORK EXPERIENCE",
        "greenhouse": "Experience",
        "ashby": "PROFESSIONAL EXPERIENCE",
    }
    items = _section_header(title_map.get(ats, "WORK EXPERIENCE"), s, ats)

    bullet_char = "\u25b8" if ats == "ashby" else "\u2022"  # ▸ vs •

    for exp in data.experience:
        # Title + company line  |  date
        loc = f", {exp.location}" if exp.location else ""
        left_text = f"<b>{exp.title}</b> &mdash; <i>{exp.company}</i>{loc}"
        right_text = f"{exp.start_date} &ndash; {exp.end_date}"

        row = Table(
            [[Paragraph(left_text, s["jobtitle"]),
              Paragraph(right_text, s["date"])]],
            colWidths=[CONTENT_WIDTH * 0.72, CONTENT_WIDTH * 0.28],
        )
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        items.append(row)

        for bullet in exp.bullets:
            items.append(Paragraph(f"{bullet_char}  {bullet}", s["bullet"]))

        items.append(Spacer(1, 3))

    return items


def _build_education(data: StructuredResume, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Build education section."""
    if not data.education:
        return []

    title = "EDUCATION" if ats in ("workday", "ashby") else "Education"
    items = _section_header(title, s, ats)

    for edu in data.education:
        loc = f", {edu.location}" if edu.location else ""
        gpa = f" | GPA: {edu.gpa}" if edu.gpa else ""
        left_text = f"<b>{edu.degree}</b> &mdash; <i>{edu.institution}</i>{loc}{gpa}"
        right_text = edu.graduation_date or ""

        row = Table(
            [[Paragraph(left_text, s["jobtitle"]),
              Paragraph(right_text, s["date"])]],
            colWidths=[CONTENT_WIDTH * 0.78, CONTENT_WIDTH * 0.22],
        )
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ]))
        items.append(row)

    return items


def _build_skills(data: StructuredResume, s: Dict[str, ParagraphStyle], ats: str) -> list:
    """Build skills section."""
    skills = data.skills
    has_any = skills.technical or skills.tools or skills.soft
    if not has_any:
        return []

    title_map = {
        "workday": "SKILLS",
        "greenhouse": "Skills",
        "ashby": "CORE COMPETENCIES",
    }
    items = _section_header(title_map.get(ats, "SKILLS"), s, ats)

    sep = " &bull; " if ats == "ashby" else ", "

    groups = []
    if skills.technical:
        label = "Technical"
        groups.append((label, sep.join(skills.technical)))
    if skills.tools:
        label = "Tools" if ats != "greenhouse" else "Tools &amp; Technologies"
        groups.append((label, sep.join(skills.tools)))
    if skills.soft:
        label = "Leadership" if ats == "ashby" else "Additional" if ats == "greenhouse" else "Other"
        groups.append((label, sep.join(skills.soft)))

    for label, text in groups:
        items.append(Paragraph(f"<b>{label}:</b>  {text}", s["skills_body"]))

    return items


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class PDFBuilder:
    """Builds ATS-optimized single-page resume PDFs."""

    def build(self, resume: StructuredResume, ats_system: str) -> bytes:
        """
        Generate a one-page PDF resume.

        Args:
            resume: Structured resume data from GPT-5-mini.
            ats_system: Target ATS (workday / greenhouse / ashby).

        Returns:
            PDF file as bytes.
        """
        ats = ats_system.lower()
        if ats not in _STYLE_FACTORIES:
            raise ValueError(f"Unknown ATS system: {ats_system}")

        styles = _STYLE_FACTORIES[ats]()

        logger.info(f"[PDF_BUILDER] Building PDF for {ats.upper()}")

        # Assemble all flowables
        story: List = []
        story += _build_contact(resume, styles, ats)
        story += _build_summary(resume, styles, ats)
        story += _build_experience(resume, styles, ats)
        story += _build_education(resume, styles, ats)
        story += _build_skills(resume, styles, ats)

        # Wrap in KeepInFrame to guarantee single page.
        # If content overflows, it auto-shrinks to fit.
        frame = KeepInFrame(
            CONTENT_WIDTH,
            CONTENT_HEIGHT,
            story,
            mode="shrink",
        )

        buf = BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=letter,
            topMargin=MARGIN_Y,
            bottomMargin=MARGIN_Y,
            leftMargin=MARGIN_X,
            rightMargin=MARGIN_X,
            title="ATS-Optimized Resume",
            author=resume.contact.name,
        )
        doc.build([frame])

        pdf_bytes = buf.getvalue()
        logger.info(f"[PDF_BUILDER] PDF built: {len(pdf_bytes)} bytes")
        return pdf_bytes


# Singleton
pdf_builder = PDFBuilder()
