"""
Resume Templates Package
ATS-specific Typst templates for PDF generation
"""

from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent

# Template file paths
WORKDAY_TEMPLATE = TEMPLATES_DIR / "workday.typ"
GREENHOUSE_TEMPLATE = TEMPLATES_DIR / "greenhouse.typ"
ASHBY_TEMPLATE = TEMPLATES_DIR / "ashby.typ"


def get_template(ats_system: str) -> str:
    """
    Load the Typst template for a specific ATS system

    Args:
        ats_system: ATS system name (workday, greenhouse, ashby)

    Returns:
        Template content as string

    Raises:
        ValueError: If ATS system is not supported
    """
    templates = {
        "workday": WORKDAY_TEMPLATE,
        "greenhouse": GREENHOUSE_TEMPLATE,
        "ashby": ASHBY_TEMPLATE,
    }

    ats_lower = ats_system.lower()
    if ats_lower not in templates:
        raise ValueError(f"Unknown ATS system: {ats_system}. Supported: {list(templates.keys())}")

    template_path = templates[ats_lower]
    return template_path.read_text(encoding="utf-8")
