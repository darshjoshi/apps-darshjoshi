"""
Resume Parser Service
Handles PDF parsing using pdfplumber
"""

import pdfplumber
import base64
import io
from typing import Optional


async def parse_resume_pdf(base64_pdf: str) -> str:
    """
    Parse PDF resume and extract text

    Args:
        base64_pdf: Base64 encoded PDF file content

    Returns:
        Extracted text from PDF

    Raises:
        ValueError: If PDF is invalid or cannot be parsed
    """
    try:
        # Decode base64 to bytes
        pdf_bytes = base64.b64decode(base64_pdf)

        # Create BytesIO object from bytes
        pdf_file = io.BytesIO(pdf_bytes)

        # Extract text from all pages
        text_content = []

        with pdfplumber.open(pdf_file) as pdf:
            # Check if PDF has pages
            if len(pdf.pages) == 0:
                raise ValueError("PDF file is empty or has no pages")

            # Extract text from each page
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()

                if page_text:
                    # Add page separator for multi-page resumes
                    if page_num > 1:
                        text_content.append(f"\n\n--- Page {page_num} ---\n\n")
                    text_content.append(page_text)

        # Join all text
        full_text = "".join(text_content)

        # Validate extracted text
        if not full_text or len(full_text.strip()) < 50:
            raise ValueError(
                "Could not extract meaningful text from PDF. "
                "The file might be image-based or corrupted."
            )

        return full_text.strip()

    except base64.binascii.Error:
        raise ValueError("Invalid base64 encoding")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def validate_pdf_size(base64_pdf: str, max_size_mb: float = 5.0) -> bool:
    """
    Validate PDF file size

    Args:
        base64_pdf: Base64 encoded PDF
        max_size_mb: Maximum allowed size in MB

    Returns:
        True if valid, False otherwise
    """
    try:
        # Calculate size: base64 is ~1.33x original size
        base64_size = len(base64_pdf)
        original_size_mb = (base64_size * 0.75) / (1024 * 1024)

        return original_size_mb <= max_size_mb
    except:
        return False
