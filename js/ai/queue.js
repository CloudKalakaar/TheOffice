export class AIRequestQueue extends EventTarget {
    constructor() {
        super();
        this.queue = [];
        this.processing = new Set();
        this.completed = 0;
        this.failed = 0;
        this.isProcessing = false;
        
        // Track requests per provider per minute
        this.providerUsage = new Map(); 
    }

    /**
     * @param {Object} request 
     * @param {string} request.id
     * @param {Array} request.messages
     * @param {Object} request.options
     * @param {Object} request.provider
     * @param {number} [request.priority=0]
     * @param {Function} request.resolve
     * @param {Function} request.reject
     */
    enqueue(request) {
        request.priority = request.priority || 0;
        request.retries = 0;
        
        this.queue.push(request);
        // Sort by priority (higher first)
        this.queue.sort((a, b) => b.priority - a.priority);
        
        this.process();
    }

    async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift();
            this.processing.add(request.id);
            this.dispatchEvent(new CustomEvent('request_start', { detail: request }));

            this._executeRequest(request);
        }

        this.isProcessing = false;
        if (this.processing.size === 0) {
            this.dispatchEvent(new Event('queue_empty'));
        }
    }

    async _executeRequest(request) {
        try {
            // Very simple rate limit enforcement (could be improved)
            const providerName = request.provider.name;
            const now = Date.now();
            const usage = this.providerUsage.get(providerName) || [];
            
            // clean up older than 1 minute
            const recentUsage = usage.filter(t => now - t < 60000);
            this.providerUsage.set(providerName, recentUsage);

            // Assume basic limit if not specified, e.g., 15 RPM for free tier
            const rpmLimit = request.provider.constructor.FREE_TIER_INFO?.rpm || 60;

            if (recentUsage.length >= rpmLimit) {
                // Rate limited, requeue with delay
                await new Promise(r => setTimeout(r, 2000));
                throw new Error('Rate limit exceeded (local throttle)');
            }

            recentUsage.push(Date.now());
            this.providerUsage.set(providerName, recentUsage);

            const result = await request.provider.chat(request.messages, request.options);
            
            this.completed++;
            this.processing.delete(request.id);
            this.dispatchEvent(new CustomEvent('request_complete', { detail: { id: request.id, result } }));
            request.resolve(result);

        } catch (error) {
            if (request.retries < 3) {
                request.retries++;
                const delay = Math.pow(2, request.retries) * 1000; // Exponential backoff: 2s, 4s, 8s
                setTimeout(() => {
                    this.processing.delete(request.id);
                    this.queue.push(request);
                    this.queue.sort((a, b) => b.priority - a.priority);
                    this.process();
                }, delay);
            } else {
                this.failed++;
                this.processing.delete(request.id);
                this.dispatchEvent(new CustomEvent('request_error', { detail: { id: request.id, error } }));
                request.reject(error);
            }
        }
    }

    getStats() {
        return {
            pending: this.queue.length,
            processing: this.processing.size,
            completed: this.completed,
            failed: this.failed
        };
    }
}
