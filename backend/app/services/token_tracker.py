"""
Token Tracker for OpenAI API Usage
Aggregates token usage across multiple API calls and calculates cost
Supports multiple models including GPT-4o-mini and GPT-5-mini
"""
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List


# Model pricing (as of Jan 2025)
# https://openai.com/pricing
PRICING = {
    "gpt-4o-mini": {
        "input": 0.15 / 1_000_000,   # $0.15 per 1M input tokens
        "output": 0.60 / 1_000_000,  # $0.60 per 1M output tokens
    },
    "gpt-5-mini": {
        "input": 0.25 / 1_000_000,   # $0.25 per 1M input tokens
        "output": 2.00 / 1_000_000,  # $2.00 per 1M output tokens
        "cached_input": 0.03 / 1_000_000,  # 80% discount with prompt caching
    }
}


@dataclass
class TokenTracker:
    """
    Tracks token usage across multiple OpenAI API calls.
    Supports multiple models with different pricing.
    Thread-safe for single request context.
    """
    prompt_tokens: int = 0
    completion_tokens: int = 0
    reasoning_tokens: int = 0  # GPT-5-mini thinking tokens
    model: str = "gpt-4o-mini"
    calls: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_usage(self, prompt_tokens: int, completion_tokens: int, model_name: str = "gpt-4o-mini") -> None:
        """Add token counts from an API call."""
        self.prompt_tokens += prompt_tokens
        self.completion_tokens += completion_tokens
        self.calls.append({
            "model": model_name,
            "input_tokens": prompt_tokens,
            "output_tokens": completion_tokens,
            "cached_tokens": 0
        })
    
    def add_from_response(self, response, model_name: str = "gpt-4o-mini") -> None:
        """
        Extract and add token usage from an OpenAI API response.

        Args:
            response: OpenAI ChatCompletion response object
            model_name: The model used for this call
        """
        if hasattr(response, 'usage') and response.usage:
            usage = response.usage
            self.prompt_tokens += usage.prompt_tokens
            self.completion_tokens += usage.completion_tokens

            # Check for cached tokens (GPT-5-mini feature)
            cached_tokens = 0
            if hasattr(usage, 'prompt_tokens_details') and usage.prompt_tokens_details:
                cached_tokens = getattr(usage.prompt_tokens_details, 'cached_tokens', 0) or 0

            # Check for reasoning tokens (GPT-5-mini thinking)
            reasoning_tokens = 0
            if hasattr(usage, 'completion_tokens_details') and usage.completion_tokens_details:
                reasoning_tokens = getattr(usage.completion_tokens_details, 'reasoning_tokens', 0) or 0
                self.reasoning_tokens += reasoning_tokens

            self.calls.append({
                "model": model_name,
                "input_tokens": usage.prompt_tokens - cached_tokens,
                "cached_tokens": cached_tokens,
                "output_tokens": usage.completion_tokens,
                "reasoning_tokens": reasoning_tokens,
                "total_tokens": usage.total_tokens
            })
    
    @property
    def total_tokens(self) -> int:
        """Total tokens used."""
        return self.prompt_tokens + self.completion_tokens
    
    @property
    def cost_usd(self) -> float:
        """Calculate total cost in USD across all models."""
        total_cost = 0.0
        
        for call in self.calls:
            model = call.get("model", "gpt-4o-mini")
            pricing = PRICING.get(model, PRICING["gpt-4o-mini"])
            
            input_cost = call.get("input_tokens", 0) * pricing["input"]
            cached_cost = call.get("cached_tokens", 0) * pricing.get("cached_input", pricing["input"])
            output_cost = call.get("output_tokens", 0) * pricing["output"]
            
            total_cost += input_cost + cached_cost + output_cost
        
        # Fallback if no calls tracked (backward compatibility)
        if not self.calls and (self.prompt_tokens > 0 or self.completion_tokens > 0):
            pricing = PRICING.get(self.model, PRICING["gpt-4o-mini"])
            total_cost = (self.prompt_tokens * pricing["input"]) + (self.completion_tokens * pricing["output"])
        
        return round(total_cost, 6)
    
    def get_breakdown(self) -> Dict[str, Any]:
        """Get cost breakdown by model."""
        breakdown = {}
        
        for call in self.calls:
            model = call.get("model", "gpt-4o-mini")
            if model not in breakdown:
                breakdown[model] = {"tokens": 0, "cost": 0.0}
            
            pricing = PRICING.get(model, PRICING["gpt-4o-mini"])
            
            input_cost = call.get("input_tokens", 0) * pricing["input"]
            cached_cost = call.get("cached_tokens", 0) * pricing.get("cached_input", pricing["input"])
            output_cost = call.get("output_tokens", 0) * pricing["output"]
            
            breakdown[model]["tokens"] += call.get("total_tokens", call.get("input_tokens", 0) + call.get("output_tokens", 0))
            breakdown[model]["cost"] += input_cost + cached_cost + output_cost
        
        return breakdown
    
    def to_dict(self) -> dict:
        """Return usage data as dictionary for API response."""
        breakdown = self.get_breakdown()
        primary_model = list(breakdown.keys())[0] if breakdown else self.model

        result = {
            "input_tokens": self.prompt_tokens,
            "output_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": self.cost_usd,
            "model": primary_model,
            "breakdown": breakdown
        }

        # Add reasoning tokens if present (GPT-5-mini)
        if self.reasoning_tokens > 0:
            result["reasoning_tokens"] = self.reasoning_tokens
            result["actual_output_tokens"] = self.completion_tokens - self.reasoning_tokens

        return result
