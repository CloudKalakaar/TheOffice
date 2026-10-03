import { AIProvider } from './provider.js';

export class HuggingFaceProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api-inference.huggingface.co/models';
        if (!this.model) this.model = 'meta-llama/Llama-3.1-8B-Instruct';
    }

    getModels() {
        return [
            'meta-llama/Llama-3.1-8B-Instruct', 
            'mistralai/Mistral-7B-Instruct-v0.3', 
            'Qwen/Qwen2.5-72B-Instruct'
        ];
    }

    _formatPrompt(messages) {
        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'system') {
                prompt += `System: ${msg.content}\n\n`;
            } else if (msg.role === 'user') {
                prompt += `User: ${msg.content}\n\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n\n`;
            }
        }
        prompt += 'Assistant:';
        return prompt;
    }

    async chat(messages, options = {}) {
        const inputs = this._formatPrompt(messages);
        
        const body = {
            inputs,
            parameters: {
                max_new_tokens: options.maxTokens || 1024,
                temperature: options.temperature ?? 0.7
            }
        };

        const response = await fetch(`${this.baseUrl}/${this.model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HuggingFace API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        let content = '';
        
        if (Array.isArray(data) && data.length > 0) {
            content = data[0].generated_text || '';
            if (content.startsWith(inputs)) {
                content = content.slice(inputs.length).trim();
            }
        }

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
            }
        });
    }
}
