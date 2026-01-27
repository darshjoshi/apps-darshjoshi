'use client';

import type { UsageInfo } from '@/lib/api/apps/ats-boss';

interface CostDisplayProps {
    usage?: UsageInfo;
}

export function CostDisplay({ usage }: CostDisplayProps) {
    if (!usage) return null;

    // Format numbers with commas
    const formatNumber = (num: number) => num.toLocaleString();

    // Format cost with appropriate decimal places
    const formatCost = (cost: number) => {
        if (cost < 0.01) {
            return `$${cost.toFixed(4)}`;
        }
        return `$${cost.toFixed(2)}`;
    };

    // Pool of witty messages - randomly selected each render
    const wittyMessages = [
        // Cheap comparisons
        "Cheaper than a single grain of fancy artisanal rice! 🍚",
        "Less than the interest on a penny for 5 seconds! 💰",
        "Costs less than the electricity to read this sentence! ⚡",
        "That's like 0.0001 cups of overpriced coffee! ☕",
        "Basically the change you'd find in your couch cushions! 🛋️",
        "Less than a single Bitcoin satoshi... which is also worthless! 🪙",
        "Cheaper than the air freshener in a taxi! 🚕",
        "Half the cost of a single sprinkle on a fancy donut! 🍩",

        // Bot/AI humor
        "Worth every fraction of a penny to help you beat the bots! 🤖",
        "A small price to pay for ATS domination! 💪",
        "Skynet would charge way more for this. You're welcome! 🦾",
        "The robots work cheap. For now. 👀",
        "AI labor: no unions, no breaks, just vibes ✨",

        // Self-deprecating/meta
        "Darsh's wallet felt that one... barely. 👛",
        "This is why I can't afford fancy cheese. Worth it! 🧀",
        "RIP to these tokens. They served with honor. 🪦",
        "Gone but not forgotten. Unlike my budget. 💸",
        "My accountant is crying, but in a good way! 📊",

        // Encouragement
        "An investment in your future career! 📈",
        "Pennies well spent on your path to employment! 🎯",
        "The ROI on landing your dream job? Priceless! 💎",
        "Consider this a micro-investment in world domination! 🌍",

        // Absurd comparisons
        "Approximately 0.00003 Taylor Swift concert tickets! 🎤",
        "Equal to roughly 0.0001 avocado toasts in a hip café! 🥑",
        "That's like 12 milliseconds of NYC parking! 🚗",
        "About 0.00002% of a Costco shopping trip! 🛒",
        "Roughly what it costs to blink, adjusted for inflation! 👁️",
    ];

    // Pick a random message (using Math.random for variety)
    const randomMessage = wittyMessages[Math.floor(Math.random() * wittyMessages.length)];

    return (
        <div className="border-2 border-black bg-gradient-to-r from-green-50 to-emerald-50 p-6 mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💸</span>
                <h3 className="text-lg font-bold font-mono">THE DAMAGE REPORT</h3>
            </div>

            {/* Transparency message */}
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                This is a <span className="font-bold">public project</span>. In the spirit of transparency,
                here&apos;s exactly what this analysis cost Darsh:
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border-2 border-black bg-white p-3">
                    <div className="text-xs font-mono text-gray-500 uppercase">Model</div>
                    <div className="text-sm font-bold font-mono">{usage.model}</div>
                </div>
                <div className="border-2 border-black bg-white p-3">
                    <div className="text-xs font-mono text-gray-500 uppercase">Total Tokens</div>
                    <div className="text-sm font-bold font-mono">{formatNumber(usage.total_tokens)}</div>
                </div>
                <div className="border-2 border-black bg-white p-3">
                    <div className="text-xs font-mono text-gray-500 uppercase">Input Tokens</div>
                    <div className="text-sm font-mono">{formatNumber(usage.input_tokens)}</div>
                </div>
                <div className="border-2 border-black bg-white p-3">
                    <div className="text-xs font-mono text-gray-500 uppercase">Output Tokens</div>
                    <div className="text-sm font-mono">{formatNumber(usage.output_tokens)}</div>
                </div>
            </div>

            {/* Reasoning tokens breakdown (GPT-5-mini only) */}
            {usage.reasoning_tokens && usage.reasoning_tokens > 0 && (
                <div className="border-2 border-blue-600 bg-blue-50 p-4 mb-4">
                    <div className="text-xs font-mono font-bold text-blue-900 uppercase mb-2">🧠 GPT-5-Mini Deep Reasoning</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2 border border-blue-300">
                            <div className="text-xs font-mono text-gray-600">Reasoning (Thinking)</div>
                            <div className="text-lg font-bold font-mono text-blue-700">{formatNumber(usage.reasoning_tokens)}</div>
                        </div>
                        <div className="bg-white p-2 border border-blue-300">
                            <div className="text-xs font-mono text-gray-600">Actual Output</div>
                            <div className="text-lg font-bold font-mono text-green-700">{formatNumber(usage.actual_output_tokens || (usage.output_tokens - usage.reasoning_tokens))}</div>
                        </div>
                    </div>
                    <div className="text-xs font-mono text-gray-600 mt-2 italic">
                        GPT-5-mini spent {Math.round((usage.reasoning_tokens / usage.output_tokens) * 100)}% of output tokens on deep reasoning before generating the final analysis.
                    </div>
                </div>
            )}

            {/* Total cost highlight */}
            <div className="border-2 border-black bg-black text-white p-4 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-mono uppercase">Total Cost</span>
                    <span className="text-2xl font-bold font-mono">{formatCost(usage.cost_usd)}</span>
                </div>
            </div>

            {/* Witty footer */}
            <p className="text-sm font-mono text-gray-600 italic text-center">
                {randomMessage}
            </p>
        </div>
    );
}
