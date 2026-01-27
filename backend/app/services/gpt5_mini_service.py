"""
GPT-5-Mini Deep Analysis Service
Handles deep ATS reasoning with maximum context and output for thinking-enabled analysis
"""

from openai import OpenAI
from app.config import settings
from app.services.token_tracker import TokenTracker
from typing import Dict, Any, Optional
import json
import logging

# Configure logger
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else None


class GPT5MiniService:
    """Service for deep ATS analysis using GPT-5-mini with thinking/reasoning capabilities"""

    MODEL = "gpt-5-mini"

    # Maximum reasoning configuration
    MAX_TOKENS = 16000  # Balanced: enough for detailed analysis, faster than 64K
    # Note: GPT-5-mini only supports default temperature (1.0)
    # Note: Lower max_tokens = faster analysis (less reasoning time)

    async def deep_ats_analysis(
        self,
        system_prompt: str,
        user_prompt: str,
        tracker: Optional[TokenTracker] = None
    ) -> Dict[str, Any]:
        """
        Perform deep ATS analysis with maximum reasoning

        Args:
            system_prompt: ATS-specific system instructions
            user_prompt: Resume + JD + context
            tracker: Token usage tracker

        Returns:
            Comprehensive ATS analysis with reasoning
        """
        if not client:
            raise ValueError("OpenAI API key not configured")

        logger.info(f"[GPT5_MINI] Starting deep ATS analysis with {self.MODEL}")
        logger.debug(f"[GPT5_MINI] System prompt length: {len(system_prompt)} chars")
        logger.debug(f"[GPT5_MINI] User prompt length: {len(user_prompt)} chars")

        try:
            response = client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=self.MAX_TOKENS  # GPT-5-mini uses max_completion_tokens instead of max_tokens
                # Note: temperature omitted - GPT-5-mini only supports default (1.0)
            )

            # Track token usage
            if tracker:
                tracker.add_from_response(response, model_name=self.MODEL)

            result = json.loads(response.choices[0].message.content)

            # Extract reasoning tokens for logging
            reasoning_tokens = 0
            if hasattr(response.usage, 'completion_tokens_details') and response.usage.completion_tokens_details:
                reasoning_tokens = getattr(response.usage.completion_tokens_details, 'reasoning_tokens', 0) or 0

            # Add metadata
            result["_analysis_metadata"] = {
                "model": self.MODEL,
                "total_tokens": response.usage.total_tokens,
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
                "reasoning_tokens": reasoning_tokens
            }

            if reasoning_tokens > 0:
                actual_output = response.usage.completion_tokens - reasoning_tokens
                logger.info(f"[GPT5_MINI] Analysis complete - {response.usage.total_tokens} tokens used (🧠 {reasoning_tokens} reasoning, ✍️ {actual_output} output)")
            else:
                logger.info(f"[GPT5_MINI] Analysis complete - {response.usage.total_tokens} tokens used")

            return result

        except Exception as e:
            logger.error(f"[GPT5_MINI] Analysis error: {str(e)}")
            raise Exception(f"GPT-5-mini analysis error: {str(e)}")


# Singleton instance
gpt5_service = GPT5MiniService()
