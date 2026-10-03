import { GeminiProvider } from './gemini.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GrokProvider } from './grok.js';
import { GroqProvider } from './groq.js';
import { OpenRouterProvider } from './openrouter.js';
import { HuggingFaceProvider } from './huggingface.js';

export class AIRouter {
    constructor() {
        this.providers = new Map();
    }

    /**
    /**
     * Factory method to create a provider instance
     * @param {string} type
     * @param {Object} config
     * @returns {AIProvider}
     */
    static createProvider(type, config) {
        const name = config.name || type;
        switch (type.toLowerCase()) {
            case 'gemini': return new GeminiProvider(name, config);
            case 'openai': return new OpenAIProvider(name, config);
            case 'anthropic': return new AnthropicProvider(name, config);
            case 'grok': return new GrokProvider(name, config);
            case 'groq': return new GroqProvider(name, config);
            case 'openrouter': return new OpenRouterProvider(name, config);
            case 'huggingface': return new HuggingFaceProvider(name, config);
            default: throw new Error(`Unknown provider type: ${type}`);
        }
    }

    /**
     * @param {string} type 
     * @param {Object} config 
     */
    addProvider(type, config) {
        const provider = AIRouter.createProvider(type, config);
        this.providers.set(provider.name, provider);
        return provider;
    }

    removeProvider(name) {
        return this.providers.delete(name);
    }

    getProvider(name) {
        return this.providers.get(name);
    }

    getProviders() {
        return Array.from(this.providers.values());
    }

    getActiveProviderCount() {
        return this.providers.size;
    }

    /**
     * @param {Array<{role: string, content: string}>} messages 
     * @param {Object|string} [options] 
     */
    async route(messages, options = {}) {
        if (this.providers.size === 0) {
            throw new Error('No AI providers configured. Go to Settings or Setup to connect an API key.');
        }

        const opts = typeof options === 'string' ? { preferredProvider: options } : (options || {});

        let targetProvider;
        const pref = opts.preferredProvider || opts.provider;
        if (pref && this.providers.has(pref)) {
            targetProvider = this.providers.get(pref);
        } else {
            targetProvider = this.providers.values().next().value;
        }

        const origModel = targetProvider.model;
        if (opts.model) {
            targetProvider.model = opts.model;
        }

        try {
            const res = await targetProvider.chat(messages, opts);
            targetProvider.model = origModel;
            return res;
        } catch (error) {
            targetProvider.model = origModel;
            console.warn(`Provider ${targetProvider.name} failed, attempting fallback`, error);
            
            for (const [name, fallbackProvider] of this.providers) {
                if (name === targetProvider.name) continue;
                try {
                    return await fallbackProvider.chat(messages, opts);
                } catch (e) {
                    console.warn(`Fallback provider ${name} failed`, e);
                }
            }
            throw error;
        }
    }

    async testAll() {
        const results = [];
        for (const [name, provider] of this.providers) {
            const res = await provider.testConnection();
            results.push({ name, ...res });
        }
        return results;
    }
}
