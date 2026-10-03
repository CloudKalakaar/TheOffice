import { AIProvider } from './provider.js';

export class AnthropicProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1/messages';
        if (!this.model) this.model = 'claude-3-5-sonnet-20241022';
    }

    getModels() {
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-haiku-20240307',
            'claude-3-opus-20240229'
        ];
    }

    async chat(messages, options = {}) {
        let systemPrompt = '';
        const filteredMessages = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
            } else {
                filteredMessages.push(msg);
            }
        }

        const body = {
            model: this.model,
            messages: filteredMessages,
            max_tokens: options.maxTokens || 1024,
            temperature: options.temperature ?? 0.7
        };

        if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Anthropic API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.input_tokens || 0,
                completionTokens: usage.output_tokens || 0,
                totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0)
            }
        });
    }
}
