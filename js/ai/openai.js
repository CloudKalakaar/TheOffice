import { AIProvider } from './provider.js';

export class OpenAIProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
        if (!this.model) this.model = 'gpt-4o-mini';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => id.startsWith('gpt-'))
                    .sort();
            }
        } catch (e) {
            console.warn('[OpenAI] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_completion_tokens: options.maxTokens ?? 1024
        };

        if (options.topP) body.top_p = options.topP;

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
            throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
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
