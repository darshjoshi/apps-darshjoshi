"""
PDF Builder Service
Generates professional, LaTeX-quality single-page resume PDFs using ReportLab.
Uses Times-Roman (serif) for body text and Helvetica-Bold for section headers
to achieve a typeset look similar to LaTeX resume templates (Jake's Resume style).

Each ATS system (Workday, Greenhouse, Ashby) has tailored styling
while sharing the same professional layout structure.
"""

import logging
from io import BytesIO
from typing import Dict, List

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import black, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas as _Canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepInFrame,
)
from reportlab.platypus.flowables import _listWrapOn

from app.schemas.resume_schemas import StructuredResume

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Page geometry
# ---------------------------------------------------------------------------
PAGE_WIDTH, PAGE_HEIGHT = letter  # 8.5" x 11"
MARGIN = 0.5 * inch
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN
CONTENT_HEIGHT = PAGE_HEIGHT - 2 * MARGIN

# Colors
BLACK = black
DARK = HexColor("#2d2d2d")
MID = HexColor("#444444")
RULE_GRAY = HexColor("#555555")


# ---------------------------------------------------------------------------
# Style factories  (Times body + Helvetica headers = LaTeX feel)
# ---------------------------------------------------------------------------

def _workday_styles() -> Dict[str, ParagraphStyle]:
    """
    Workday: Conservative, clean, serif body.
    Standard headings, maximum ATS compatibility.
    """
    return {
        "name": ParagraphStyle(
            "WD_Name", fontName="Times-Bold", fontSize=20,
            alignment=TA_CENTER, leading=23, spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "WD_Contact", fontName="Times-Roman", fontSize=9.5,
            alignment=TA_CENTER, leading=12, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "WD_Section", fontName="Helvetica-Bold", fontSize=10.5,
            leading=13, spaceBefore=8, spaceAfter=0,
        ),
        "body": ParagraphStyle(
            "WD_Body", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        "jobtitle": ParagraphStyle(
            "WD_JobTitle", fontName="Times-Bold", fontSize=10.5,
            leading=13,
        ),
        "company": ParagraphStyle(
            "WD_Company", fontName="Times-Italic", fontSize=10,
            leading=12.5,
        ),
        "date": ParagraphStyle(
            "WD_Date", fontName="Times-Roman", fontSize=10,
            alignment=TA_RIGHT, leading=12.5,
        ),
        "location": ParagraphStyle(
            "WD_Location", fontName="Times-Italic", fontSize=10,
            alignment=TA_RIGHT, leading=12.5,
        ),
        "bullet": ParagraphStyle(
            "WD_Bullet", fontName="Times-Roman", fontSize=10,
            leading=12.5, leftIndent=14, bulletIndent=4, spaceAfter=1.5,
        ),
        "skills_body": ParagraphStyle(
            "WD_SkillsBody", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        # Config
        "_rule_color": BLACK,
        "_rule_width": 0.5,
        "_section_caps": True,
        "_name_caps": False,
        "_bullet_char": "\u2022",   # •
        "_contact_sep": "  |  ",
        "_header_divider": False,
    }


def _greenhouse_styles() -> Dict[str, ParagraphStyle]:
    """
    Greenhouse: Structured, serif body, slightly softer dividers.
    Optimized for structured field extraction.
    """
    return {
        "name": ParagraphStyle(
            "GH_Name", fontName="Times-Bold", fontSize=20,
            alignment=TA_CENTER, leading=23, spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "GH_Contact", fontName="Times-Roman", fontSize=9.5,
            alignment=TA_CENTER, leading=12, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "GH_Section", fontName="Helvetica-Bold", fontSize=10.5,
            leading=13, textColor=DARK, spaceBefore=8, spaceAfter=0,
        ),
        "body": ParagraphStyle(
            "GH_Body", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        "jobtitle": ParagraphStyle(
            "GH_JobTitle", fontName="Times-Bold", fontSize=10.5,
            leading=13,
        ),
        "company": ParagraphStyle(
            "GH_Company", fontName="Times-Italic", fontSize=10,
            leading=12.5,
        ),
        "date": ParagraphStyle(
            "GH_Date", fontName="Times-Roman", fontSize=10,
            alignment=TA_RIGHT, leading=12.5,
        ),
        "location": ParagraphStyle(
            "GH_Location", fontName="Times-Italic", fontSize=10,
            alignment=TA_RIGHT, leading=12.5,
        ),
        "bullet": ParagraphStyle(
            "GH_Bullet", fontName="Times-Roman", fontSize=10,
            leading=12.5, leftIndent=14, bulletIndent=4, spaceAfter=1.5,
        ),
        "skills_body": ParagraphStyle(
            "GH_SkillsBody", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        # Config
        "_rule_color": RULE_GRAY,
        "_rule_width": 0.75,
        "_section_caps": False,
        "_name_caps": False,
        "_bullet_char": "\u2022",   # •
        "_contact_sep": "  \u2022  ",  # • separator
        "_header_divider": False,
    }


def _ashby_styles() -> Dict[str, ParagraphStyle]:
    """
    Ashby: Achievement-focused, modern serif, bolder header.
    Context-aware layout with career progression emphasis.
    """
    return {
        "name": ParagraphStyle(
            "AS_Name", fontName="Times-Bold", fontSize=22,
            alignment=TA_LEFT, leading=25, spaceAfter=1,
        ),
        "contact": ParagraphStyle(
            "AS_Contact", fontName="Times-Roman", fontSize=9.5,
            alignment=TA_LEFT, textColor=MID, leading=12, spaceAfter=0,
        ),
        "section": ParagraphStyle(
            "AS_Section", fontName="Helvetica-Bold", fontSize=10.5,
            leading=13, spaceBefore=8, spaceAfter=0,
        ),
        "body": ParagraphStyle(
            "AS_Body", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        "jobtitle": ParagraphStyle(
            "AS_JobTitle", fontName="Times-Bold", fontSize=10.5,
            leading=13,
        ),
        "company": ParagraphStyle(
            "AS_Company", fontName="Times-Italic", fontSize=10,
            leading=12.5, textColor=DARK,
        ),
        "date": ParagraphStyle(
            "AS_Date", fontName="Times-Roman", fontSize=10,
            alignment=TA_RIGHT, leading=12.5,
        ),
        "location": ParagraphStyle(
            "AS_Location", fontName="Times-Italic", fontSize=10,
            alignment=TA_RIGHT, leading=12.5, textColor=MID,
        ),
        "bullet": ParagraphStyle(
            "AS_Bullet", fontName="Times-Roman", fontSize=10,
            leading=12.5, leftIndent=14, bulletIndent=4, spaceAfter=1.5,
        ),
        "skills_body": ParagraphStyle(
            "AS_SkillsBody", fontName="Times-Roman", fontSize=10,
            leading=12.5, spaceAfter=2,
        ),
        # Config
        "_rule_color": BLACK,
        "_rule_width": 0.5,
        "_section_caps": True,
        "_name_caps": True,
        "_bullet_char": "\u25b8",   # ▸
        "_contact_sep": " \u2022 ",
        "_header_divider": True,
    }


_STYLE_FACTORIES = {
    "workday": _workday_styles,
    "greenhouse": _greenhouse_styles,
    "ashby": _ashby_styles,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _cfg(s: dict, key: str):
    """Read a _config value from the styles dict."""
    return s.get(key)


def _zero_pad_table_style():
    """TableStyle that removes all internal padding."""
    return TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ])


# ---------------------------------------------------------------------------
# Height measurement
# ---------------------------------------------------------------------------

def _measure_height(flowables: list, width: float) -> float:
    """Calculate total content height using ReportLab's internal layout engine.

    Uses the same function that KeepInFrame uses internally, so measurements
    are consistent with what the single-page safety net expects.
    """
    buf = BytesIO()
    c = _Canvas(buf, pagesize=letter)
    _, h = _listWrapOn(list(flowables), width, c)
    return h


# ---------------------------------------------------------------------------
# Section builders
# ---------------------------------------------------------------------------

def _section_header(title: str, s: dict) -> list:
    """Section heading with a thin horizontal rule (LaTeX \\titlerule style)."""
    display = title.upper() if _cfg(s, "_section_caps") else title
    return [
        Paragraph(display, s["section"]),
        HRFlowable(
            width="100%",
            thickness=_cfg(s, "_rule_width"),
            color=_cfg(s, "_rule_color"),
            spaceBefore=1,
            spaceAfter=3,
            lineCap="square",
        ),
    ]


def _build_contact(data: StructuredResume, s: dict) -> list:
    """Name + contact line (+ optional thick divider for Ashby)."""
    items: list = []

    name = data.contact.name.upper() if _cfg(s, "_name_caps") else data.contact.name
    items.append(Paragraph(name, s["name"]))

    parts = [p for p in [
        data.contact.email,
        data.contact.phone,
        data.contact.location,
        data.contact.linkedin,
    ] if p]
    sep = _cfg(s, "_contact_sep")
    items.append(Paragraph(sep.join(parts), s["contact"]))

    if _cfg(s, "_header_divider"):
        items.append(HRFlowable(
            width="100%", thickness=1.5, color=BLACK,
            spaceBefore=4, spaceAfter=4, lineCap="square",
        ))
    else:
        items.append(Spacer(1, 6))

    return items


def _build_summary(data: StructuredResume, s: dict, ats: str) -> list:
    """Professional summary section."""
    if not data.summary:
        return []
    title_map = {
        "workday": "Summary",
        "greenhouse": "Professional Summary",
        "ashby": "Professional Summary",
    }
    items = _section_header(title_map.get(ats, "Summary"), s)
    items.append(Paragraph(data.summary, s["body"]))
    return items


def _build_experience(data: StructuredResume, s: dict, ats: str,
                      entry_spacing_extra: float = 0) -> list:
    """
    Work experience with two-row headers (LaTeX resume style):
        Row 1:  Title (bold)                    Date Range
        Row 2:  Company, Location (italic)      Location
    Then bullet points beneath.
    """
    if not data.experience:
        return []

    title_map = {
        "workday": "Work Experience",
        "greenhouse": "Experience",
        "ashby": "Professional Experience",
    }
    items = _section_header(title_map.get(ats, "Work Experience"), s)

    bullet_char = _cfg(s, "_bullet_char")
    ts = _zero_pad_table_style()

    for i, exp in enumerate(data.experience):
        entry: list = []

        # Row 1: Title | Date
        date_text = f"{exp.start_date} \u2013 {exp.end_date}"  # en-dash
        row1 = Table(
            [[Paragraph(f"<b>{exp.title}</b>", s["jobtitle"]),
              Paragraph(date_text, s["date"])]],
            colWidths=[CONTENT_WIDTH * 0.68, CONTENT_WIDTH * 0.32],
            hAlign="LEFT",
        )
        row1.setStyle(ts)
        entry.append(row1)

        # Row 2: Company, Location | Location
        company_text = exp.company
        if exp.location:
            company_text += f", {exp.location}"
        loc_right = exp.location or ""

        row2 = Table(
            [[Paragraph(f"<i>{company_text}</i>", s["company"]),
              Paragraph(f"<i>{loc_right}</i>", s["location"])]],
            colWidths=[CONTENT_WIDTH * 0.68, CONTENT_WIDTH * 0.32],
            hAlign="LEFT",
        )
        row2.setStyle(ts)
        entry.append(row2)

        # Bullets
        for bullet in exp.bullets:
            entry.append(Paragraph(
                f"{bullet_char}  {bullet}", s["bullet"]
            ))

        items.extend(entry)

        # Spacing between job entries (not after the last one)
        if i < len(data.experience) - 1:
            items.append(Spacer(1, 4 + entry_spacing_extra))

    return items


def _build_education(data: StructuredResume, s: dict, ats: str,
                     entry_spacing_extra: float = 0) -> list:
    """
    Education with two-row headers:
        Row 1:  Degree (bold)                   Graduation Date
        Row 2:  Institution (italic)            Location
    """
    if not data.education:
        return []

    title = "Education"
    items = _section_header(title, s)

    ts = _zero_pad_table_style()

    for i, edu in enumerate(data.education):
        entry: list = []

        # Row 1: Degree | Date
        degree_text = edu.degree
        if edu.gpa:
            degree_text += f"  |  GPA: {edu.gpa}"
        grad_date = edu.graduation_date or ""

        row1 = Table(
            [[Paragraph(f"<b>{degree_text}</b>", s["jobtitle"]),
              Paragraph(grad_date, s["date"])]],
            colWidths=[CONTENT_WIDTH * 0.72, CONTENT_WIDTH * 0.28],
            hAlign="LEFT",
        )
        row1.setStyle(ts)
        entry.append(row1)

        # Row 2: Institution | Location
        inst_text = edu.institution
        loc_text = edu.location or ""

        row2 = Table(
            [[Paragraph(f"<i>{inst_text}</i>", s["company"]),
              Paragraph(f"<i>{loc_text}</i>", s["location"])]],
            colWidths=[CONTENT_WIDTH * 0.72, CONTENT_WIDTH * 0.28],
            hAlign="LEFT",
        )
        row2.setStyle(ts)
        entry.append(row2)

        items.extend(entry)

        if i < len(data.education) - 1:
            items.append(Spacer(1, 3 + entry_spacing_extra))

    return items


def _build_skills(data: StructuredResume, s: dict, ats: str) -> list:
    """Skills section with category labels."""
    skills = data.skills
    if not (skills.technical or skills.tools or skills.soft):
        return []

    title_map = {
        "workday": "Skills",
        "greenhouse": "Skills",
        "ashby": "Core Competencies",
    }
    items = _section_header(title_map.get(ats, "Skills"), s)

    sep = ", "

    groups = []
    if skills.technical:
        groups.append(("Technical", sep.join(skills.technical)))
    if skills.tools:
        label = "Tools & Technologies" if ats == "greenhouse" else "Tools"
        groups.append((label, sep.join(skills.tools)))
    if skills.soft:
        label_map = {"ashby": "Leadership", "greenhouse": "Additional", "workday": "Other"}
        groups.append((label_map.get(ats, "Other"), sep.join(skills.soft)))

    for label, text in groups:
        items.append(Paragraph(f"<b>{label}:</b>  {text}", s["skills_body"]))

    return items


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class PDFBuilder:
    """Builds professional, LaTeX-quality single-page resume PDFs."""

    # Style keys whose *leading* can be stretched.
    _LEADING_KEYS = [
        "name", "contact", "section", "body", "jobtitle",
        "company", "date", "location", "bullet", "skills_body",
    ]
    # Style keys whose *spaceAfter* can absorb extra vertical space.
    _AFTER_KEYS = ["bullet", "body", "skills_body"]

    def build(self, resume: StructuredResume, ats_system: str) -> bytes:
        """
        Generate a one-page PDF resume with LaTeX-quality typography.

        Uses a three-pass approach to precisely fill the entire page:
          1. Build with default styles → measure baseline content height.
          2. Scale *leading* (line height) and re-measure so the exact
             contribution of leading is known.
          3. Distribute the remaining space via *spaceAfter* increases on
             body/bullet/skills paragraphs and explicit section/entry gap
             spacers.  KeepInFrame(mode='shrink') acts as a safety net.

        Args:
            resume: Structured resume data.
            ats_system: Target ATS (workday / greenhouse / ashby).

        Returns:
            PDF file as bytes.
        """
        ats = ats_system.lower()
        if ats not in _STYLE_FACTORIES:
            raise ValueError(f"Unknown ATS system: {ats_system}")

        logger.info(f"[PDF_BUILDER] Building LaTeX-quality PDF for {ats.upper()}")

        # ------------------------------------------------------------------
        # Pass 1: default styles → baseline content height
        # ------------------------------------------------------------------
        styles1 = _STYLE_FACTORIES[ats]()
        sections1 = [
            _build_contact(resume, styles1),
            _build_summary(resume, styles1, ats),
            _build_experience(resume, styles1, ats),
            _build_education(resume, styles1, ats),
            _build_skills(resume, styles1, ats),
        ]
        sections1 = [s for s in sections1 if s]
        flat1 = [item for sec in sections1 for item in sec]
        h_default = _measure_height(flat1, CONTENT_WIDTH)
        remaining = CONTENT_HEIGHT - h_default
        ratio = CONTENT_HEIGHT / h_default if h_default > 0 else 1.0

        logger.info(
            f"[PDF_BUILDER] Pass 1  default height: {h_default:.1f}pt, "
            f"available: {CONTENT_HEIGHT:.1f}pt, "
            f"remaining: {remaining:.1f}pt  (ratio {ratio:.3f})"
        )

        # Gap counts (used in passes 2-3)
        n_section_gaps = max(len(sections1) - 1, 0)
        n_exp_gaps = (max(len(resume.experience) - 1, 0)
                      if resume.experience else 0)
        n_edu_gaps = (max(len(resume.education) - 1, 0)
                      if resume.education else 0)
        n_entry_gaps = n_exp_gaps + n_edu_gaps

        section_extra = 0.0
        entry_extra = 0.0

        if remaining <= 5:
            # Content already fills / overflows the page — build as-is.
            styles_final = _STYLE_FACTORIES[ats]()
        else:
            # ----------------------------------------------------------
            # Pass 2: scale leading only → measure the exact contribution
            # ----------------------------------------------------------
            leading_scale = min(1 + (ratio - 1) * 0.6, 1.30)
            styles2 = _STYLE_FACTORIES[ats]()
            for key in self._LEADING_KEYS:
                st = styles2.get(key)
                if isinstance(st, ParagraphStyle):
                    st.leading = st.leading * leading_scale

            sections2 = [
                _build_contact(resume, styles2),
                _build_summary(resume, styles2, ats),
                _build_experience(resume, styles2, ats),
                _build_education(resume, styles2, ats),
                _build_skills(resume, styles2, ats),
            ]
            sections2 = [s for s in sections2 if s]
            flat2 = [item for sec in sections2 for item in sec]
            h_after_leading = _measure_height(flat2, CONTENT_WIDTH)
            remaining2 = CONTENT_HEIGHT - h_after_leading

            logger.info(
                f"[PDF_BUILDER] Pass 2  after leading×{leading_scale:.2f}: "
                f"{h_after_leading:.1f}pt, remaining: {remaining2:.1f}pt"
            )

            # ----------------------------------------------------------
            # Pass 3: distribute remaining2 via spaceAfter + gaps
            # ----------------------------------------------------------
            styles_final = _STYLE_FACTORIES[ats]()
            for key in self._LEADING_KEYS:
                st = styles_final.get(key)
                if isinstance(st, ParagraphStyle):
                    st.leading = st.leading * leading_scale

            # Count items whose spaceAfter will absorb extra space
            n_bullets = (sum(len(e.bullets) for e in resume.experience)
                         if resume.experience else 0)
            n_skill_lines = sum(
                1 for x in [resume.skills.technical,
                             resume.skills.tools,
                             resume.skills.soft] if x
            )
            n_after_items = (n_bullets + n_skill_lines
                             + (1 if resume.summary else 0))

            after_budget = 0.0

            if remaining2 > 0:
                # Budget split: 50 % spaceAfter, 40 % section gaps,
                #                10 % entry gaps.
                # Section gaps get more than entry gaps so they remain
                # visually larger, preserving section hierarchy.
                after_budget = remaining2 * 0.50
                section_budget = remaining2 * 0.40
                entry_budget = remaining2 * 0.10

                # If no items in a category, redistribute its budget
                if n_after_items == 0:
                    section_budget += after_budget
                    after_budget = 0
                if n_entry_gaps == 0:
                    section_budget += entry_budget
                    entry_budget = 0

                # Apply spaceAfter increase
                if n_after_items > 0:
                    extra_after = after_budget / n_after_items
                    for key in self._AFTER_KEYS:
                        st = styles_final.get(key)
                        if isinstance(st, ParagraphStyle):
                            st.spaceAfter = (st.spaceAfter or 0) + extra_after

                section_extra = (section_budget / n_section_gaps
                                 if n_section_gaps > 0 else 0)
                entry_extra = (entry_budget / n_entry_gaps
                               if n_entry_gaps > 0 else 0)

            logger.info(
                f"[PDF_BUILDER] Pass 3  spaceAfter +{after_budget / max(n_after_items,1):.1f}pt "
                f"×{n_after_items} items, "
                f"section_extra={section_extra:.1f}pt, "
                f"entry_extra={entry_extra:.1f}pt"
            )

        # ------------------------------------------------------------------
        # Final build with adjusted styles and spacing
        # ------------------------------------------------------------------
        contact = _build_contact(resume, styles_final)
        summary = _build_summary(resume, styles_final, ats)
        experience = _build_experience(resume, styles_final, ats, entry_extra)
        education = _build_education(resume, styles_final, ats, entry_extra)
        skills = _build_skills(resume, styles_final, ats)

        sections = [s for s in [contact, summary, experience,
                                education, skills] if s]

        story: List = []
        for i, section in enumerate(sections):
            story.extend(section)
            if i < len(sections) - 1 and section_extra > 0:
                story.append(Spacer(1, section_extra))

        # ------------------------------------------------------------------
        # Render — KeepInFrame guarantees a single page
        # ------------------------------------------------------------------
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
            topMargin=MARGIN,
            bottomMargin=MARGIN,
            leftMargin=MARGIN,
            rightMargin=MARGIN,
            title="ATS-Optimized Resume",
            author=resume.contact.name,
        )
        doc.build([frame])

        pdf_bytes = buf.getvalue()
        logger.info(f"[PDF_BUILDER] PDF built: {len(pdf_bytes)} bytes")
        return pdf_bytes


# Singleton
pdf_builder = PDFBuilder()
