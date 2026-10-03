/**
 * Base AI Provider class
 */
export class AIProvider {
    /**
     * @param {string} name 
     * @param {Object} config 
     * @param {string} config.apiKey
     * @param {string} config.model
     * @param {string} [config.baseUrl]
     * @param {Object} [config.options]
     */
    constructor(name, config) {
        this.name = name;
        this.apiKey = config.apiKey;
        this.model = config.model;
        this.baseUrl = config.baseUrl || '';
        this.options = config.options || {};
    }

    /**
     * Chat with the model
     * @param {Array<{role: string, content: string}>} messages 
     * @param {Object} [options] 
     * @returns {Promise<Object>}
     */
    async chat(messages, options) {
        throw new Error('chat() must be implemented by subclass');
    }

    /**
     * Normalize the response format
     * @param {Object} rawResponse 
     * @returns {{content: string, usage: {promptTokens: number, completionTokens: number, totalTokens: number}, model: string, provider: string}}
     */
    normalizeResponse(rawResponse) {
        return {
            content: rawResponse.content || '',
            usage: {
                promptTokens: rawResponse.usage?.promptTokens || 0,
                completionTokens: rawResponse.usage?.completionTokens || 0,
                totalTokens: rawResponse.usage?.totalTokens || 0
            },
            model: this.model,
            provider: this.name
        };
    }

    /**
     * Fetch available models from provider API
     * @returns {Promise<string[]>}
     */
    async listModels() {
        return [];
    }

    /**
     * Test the API connection
     * @returns {Promise<{success: boolean, message: string, latencyMs: number}>}
     */
    async testConnection() {
        return this.testAndFindWorkingModel([this.model, ...this.getModels()]);
    }

    /**
     * Test models until finding one that is active and accessible on this API key
     * @param {string[]} [candidates]
     * @returns {Promise<{success: boolean, workingModel: string, message: string, availableModels: string[], latencyMs: number}>}
     */
    async testAndFindWorkingModel(candidates = []) {
        const start = performance.now();
        let available = [];
        try {
            available = await this.listModels();
        } catch (e) {
            // listModels fallback
        }

        const toProbe = Array.from(new Set([
            this.model,
            ...candidates,
            ...available,
            ...this.getModels()
        ])).filter(Boolean).slice(0, 10);

        let lastError = null;

        for (const candidate of toProbe) {
            try {
                this.model = candidate;
                await this.chat([{ role: 'user', content: 'Ping' }], { maxTokens: 10 });
                const latencyMs = Math.round(performance.now() - start);
                return {
                    success: true,
                    workingModel: candidate,
                    message: `Connected successfully with ${candidate}`,
                    availableModels: available.length > 0 ? available : toProbe,
                    latencyMs
                };
            } catch (err) {
                lastError = err;
                const errStr = String(err.message || err).toLowerCase();
                // If invalid API key / unauthorized, no need to probe other models
                if (errStr.includes('401') || errStr.includes('invalid api key') || errStr.includes('unauthorized') || errStr.includes('authentication')) {
                    break;
                }
            }
        }

        const latencyMs = Math.round(performance.now() - start);
        return {
            success: false,
            workingModel: this.model,
            message: lastError?.message || 'Connection failed: no working models found',
            availableModels: available,
            latencyMs
        };
    }

    /**
     * Get available models
     * @returns {string[]}
     */
    getModels() {
        return [];
    }

    /**
     * Factory method
     * @param {string} type 
     * @param {Object} config 
     * @returns {AIProvider}
     */
    static createProvider(type, config) {
        throw new Error('createProvider should be overridden or implemented by router');
    }
}
