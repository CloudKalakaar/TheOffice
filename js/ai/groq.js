import { AIProvider } from './provider.js';

export class GroqProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1/chat/completions';
        if (!this.model) this.model = 'llama-3.1-8b-instant';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => !id.includes('whisper') && !id.includes('tts') && !id.includes('guard'));
            }
        } catch (e) {
            console.warn('[Groq] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return [
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'llama3-8b-8192',
            'llama3-70b-8192',
            'mixtral-8x7b-32768',
            'gemma2-9b-it',
            'deepseek-r1-distill-llama-70b',
            'qwen-2.5-32b'
        ];
    }

    static get FREE_TIER_INFO() {
        return { rpm: 30, rpd: 14400 };
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
            throw new Error(`Groq API Error: ${response.status} ${errorText}`);
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
