import { AIProvider } from './provider.js';

export class GeminiProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
        if (!this.model) this.model = 'gemini-2.0-flash';
    }

    async listModels() {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (res.ok) {
                const data = await res.json();
                return (data.models || [])
                    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
            }
        } catch (e) {
            console.warn('[Gemini] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
    }

    static get FREE_TIER_INFO() {
        return { rpm: 15, tpm: 1000000, rpd: 1500 };
    }

    async chat(messages, options = {}) {
        let systemInstruction = null;
        const contents = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction = {
                    parts: [{ text: msg.content }]
                };
            } else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }
        }

        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 1024,
                topP: options.topP ?? 0.95
            }
        };

        if (systemInstruction) {
            body.systemInstruction = systemInstruction;
        }

        const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usageMetadata = data.usageMetadata || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usageMetadata.promptTokenCount || 0,
                completionTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0
            }
        });
    }
}
