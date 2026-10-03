import { AIProvider } from './provider.js';

export class GrokProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.x.ai/v1/chat/completions';
        if (!this.model) this.model = 'grok-2';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.x.ai/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || []).map(m => m.id);
            }
        } catch (e) {
            console.warn('[Grok] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['grok-2', 'grok-2-mini', 'grok-beta', 'grok-3', 'grok-3-mini'];
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
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Grok API Error: ${response.status} ${errorText}`);
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
