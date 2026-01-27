"""
Typst Compiler Service
Compiles Typst source code to PDF bytes
"""

import typst
import logging
from typing import Optional
from pathlib import Path
import tempfile
import os

# Configure logger
logger = logging.getLogger(__name__)


class TypstCompiler:
    """Service for compiling Typst source code to PDF"""

    def compile_to_pdf(self, typst_source: str) -> bytes:
        """
        Compile Typst source code to PDF bytes

        Args:
            typst_source: Typst markup source code

        Returns:
            PDF file as bytes

        Raises:
            TypstCompilationError: If compilation fails
        """
        logger.info("[TYPST] Starting PDF compilation")
        logger.debug(f"[TYPST] Source length: {len(typst_source)} chars")

        # Create a temporary file for the Typst source
        # The typst-py package requires a file path, not raw text
        temp_file = None
        try:
            temp_file = tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.typ',
                delete=False,
                encoding='utf-8'
            )
            temp_file.write(typst_source)
            temp_file.close()

            # Compile the temporary file
            pdf_bytes = typst.compile(temp_file.name)

            logger.info(f"[TYPST] Compilation successful - {len(pdf_bytes)} bytes")
            return pdf_bytes

        except Exception as e:
            logger.error(f"[TYPST] Compilation failed: {str(e)}")
            raise TypstCompilationError(f"Typst compilation failed: {str(e)}")
        finally:
            # Clean up the temporary file
            if temp_file and os.path.exists(temp_file.name):
                os.unlink(temp_file.name)

    def compile_template_with_data(
        self,
        template: str,
        data: dict
    ) -> bytes:
        """
        Compile a Typst template with data substitution

        Args:
            template: Typst template with placeholders
            data: Dictionary of data to substitute

        Returns:
            PDF file as bytes
        """
        # Generate Typst data definition from dict
        typst_data = self._dict_to_typst_data(data)

        # Prepend data definition to template
        full_source = f"{typst_data}\n\n{template}"

        return self.compile_to_pdf(full_source)

    def _dict_to_typst_data(self, data: dict) -> str:
        """
        Convert Python dict to Typst data definitions

        Args:
            data: Python dictionary

        Returns:
            Typst variable definitions as string
        """
        lines = []
        for key, value in data.items():
            typst_value = self._python_to_typst_value(value)
            lines.append(f"#let {key} = {typst_value}")
        return "\n".join(lines)

    def _python_to_typst_value(self, value, is_top_level: bool = False) -> str:
        """
        Convert Python value to Typst value representation

        Args:
            value: Python value (str, int, float, list, dict, bool, None)
            is_top_level: Whether this is a top-level variable assignment

        Returns:
            Typst value as string
        """
        if value is None:
            return "none"
        elif isinstance(value, bool):
            return "true" if value else "false"
        elif isinstance(value, str):
            # Escape special characters and wrap in quotes
            escaped = value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n")
            return f'"{escaped}"'
        elif isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, list):
            if len(value) == 0:
                return "()"
            items = [self._python_to_typst_value(item) for item in value]
            # For arrays, each item needs to be on its own line for clarity
            # and we need trailing comma for single-item arrays
            if len(items) == 1:
                return f"({items[0]},)"
            return f"({', '.join(items)},)"
        elif isinstance(value, dict):
            if len(value) == 0:
                return "(:)"
            items = [f"{k}: {self._python_to_typst_value(v)}" for k, v in value.items()]
            return f"({', '.join(items)})"
        else:
            return f'"{str(value)}"'


class TypstCompilationError(Exception):
    """Custom exception for Typst compilation failures"""
    pass


# Singleton instance
typst_compiler = TypstCompiler()
