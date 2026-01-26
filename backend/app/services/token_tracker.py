"""
Token Tracker for OpenAI API Usage
Aggregates token usage across multiple API calls and calculates cost
"""
from dataclasses import dataclass, field
from typing import Optional


# GPT-4o-mini pricing (as of Jan 2025)
# https://openai.com/pricing
GPT4O_MINI_INPUT_PRICE_PER_MILLION = 0.15   # $0.15 per 1M input tokens
GPT4O_MINI_OUTPUT_PRICE_PER_MILLION = 0.60  # $0.60 per 1M output tokens


@dataclass
class TokenTracker:
    """
    Tracks token usage across multiple OpenAI API calls.
    Thread-safe for single request context.
    """
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model: str = "gpt-4o-mini"
    
    def add_usage(self, prompt_tokens: int, completion_tokens: int) -> None:
        """Add token counts from an API call."""
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens
    
    def add_from_response(self, response) -> None:
        """
        Extract and add token usage from an OpenAI API response.
        
        Args:
            response: OpenAI ChatCompletion response object
        """
        if hasattr(response, 'usage') and response.usage:
            self.prompt_tokens += response.usage.prompt_tokens
            self.completion_tokens += response.usage.completion_tokens
    
    @property
    def total_tokens(self) -> int:
        """Total tokens used."""
        return self.prompt_tokens + self.completion_tokens
    
    @property
    def cost_usd(self) -> float:
        """Calculate total cost in USD."""
        input_cost = (self.prompt_tokens / 1_000_000) * GPT4O_MINI_INPUT_PRICE_PER_MILLION
        output_cost = (self.completion_tokens / 1_000_000) * GPT4O_MINI_OUTPUT_PRICE_PER_MILLION
        return round(input_cost + output_cost, 6)
    
    def to_dict(self) -> dict:
        """Return usage data as dictionary for API response."""
        return {
            "input_tokens": self.prompt_tokens,
            "output_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": self.cost_usd,
            "model": self.model
        }
