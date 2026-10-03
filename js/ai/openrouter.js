import { AIProvider } from './provider.js';

export class OpenRouterProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
        if (!this.model) this.model = 'meta-llama/llama-3.3-70b-instruct:free';
    }

    async listModels() {
        try {
            const res = await fetch('https://openrouter.ai/api/v1/models');
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => id.includes(':free') || id.startsWith('meta-llama/') || id.startsWith('google/'));
            }
        } catch (e) {
            console.warn('[OpenRouter] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return [
            'meta-llama/llama-3.3-70b-instruct:free', 
            'google/gemini-2.0-flash-exp:free', 
            'deepseek/deepseek-r1:free', 
            'meta-llama/llama-3.1-8b-instruct:free',
            'qwen/qwen-2.5-72b-instruct:free',
            'openai/gpt-4o', 
            'anthropic/claude-3.5-sonnet'
        ];
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'The Office'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        });
    }
}
