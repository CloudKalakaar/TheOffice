// ============================================
// THE OFFICE — Agent Brain Execution Layer
// ============================================

import { getState, setState } from '../store/state.js';
import { getAIRouter } from '../app.js';
import { buildSystemPrompt, buildBossChatPrompt, normalizeRoleKey } from '../ai/prompts.js';

export class AgentBrain {
  /**
   * Execute an AI prompt on behalf of an employee
   * @param {Object} employee 
   * @param {Array<{role: string, content: string}>} messages 
   * @param {Object} [options]
   * @returns {Promise<{ content: string, usage?: Object, provider?: string, model?: string }>}
   */
  static async execute(employee, messages, options = {}) {
    const router = getAIRouter();
    if (!router || router.getActiveProviderCount() === 0) {
      throw new Error('NO_PROVIDER_CONNECTED');
    }

    const preferredProvider = employee?.provider || options.provider;
    const model = employee?.model || options.model;

    const res = await router.route(messages, {
      preferredProvider,
      model,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048
    });

    // Update global dashboard statistics
    try {
      const dbStats = getState('dashboard') || {};
      const calls = (dbStats.totalApiCalls || 0) + 1;
      const tokens = (dbStats.totalTokensUsed || 0) + (res.usage?.totalTokens || 0);
      setState('dashboard.totalApiCalls', calls);
      setState('dashboard.totalTokensUsed', tokens);
    } catch (e) { /* ignore stats err */ }

    return res;
  }

  /**
   * Parse JSON from AI output with aggressive tolerance for markdown code fences and leading/trailing chatter
   * @param {string} text 
   * @param {*} [fallbackValue=null]
   * @returns {*}
   */
  static extractJSON(text, fallbackValue = null) {
    if (!text || typeof text !== 'string') return fallbackValue;

    // 1. Direct parse attempt
    const trimmed = text.trim();
    try {
      return JSON.parse(trimmed);
    } catch (e) { /* continue */ }

    // 2. Strip ```json ... ``` code fence
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e) { /* continue */ }
    }

    // 3. Find outer-most { ... }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) { /* continue */ }
    }

    // 4. Find outer-most [ ... ]
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      const candidate = text.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) { /* continue */ }
    }

    return fallbackValue;
  }

  /**
   * Extract files from code generation response
   * Looks for === FILE: filename === ... === END FILE === or markdown blocks
   * @param {string} text 
   * @param {string} [defaultFileName='index.html']
   * @returns {Object<string, string>} map of filename -> code string
   */
  static extractFiles(text, defaultFileName = 'index.html') {
    const files = {};
    if (!text || typeof text !== 'string') return files;

    // Pattern 1: === FILE: filename === ... === END FILE ===
    const markerRegex = /===\s*FILE:\s*([^\n\r=]+)\s*===([\s\S]*?)(?:===\s*END\s*FILE\s*===|$)/gi;
    let match;
    let foundWithMarkers = false;

    while ((match = markerRegex.exec(text)) !== null) {
      const fileName = match[1].trim();
      let fileContent = match[2];
      // Strip optional leading/trailing backticks if model wrapped it anyway
      fileContent = fileContent.replace(/^\s*```[a-z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '');
      if (fileName && fileContent.trim()) {
        files[fileName] = fileContent.trim();
        foundWithMarkers = true;
      }
    }

    if (foundWithMarkers && Object.keys(files).length > 0) {
      return files;
    }

    // Pattern 2: Single HTML markdown code block
    const htmlBlock = text.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlBlock && htmlBlock[1].trim()) {
      files['index.html'] = htmlBlock[1].trim();
      return files;
    }

    // Pattern 3: Any generic markdown code block
    const genericBlock = text.match(/```[a-z]*\s*([\s\S]*?)\s*```/i);
    if (genericBlock && genericBlock[1].trim()) {
      files[defaultFileName] = genericBlock[1].trim();
      return files;
    }

    // Pattern 4: If text itself looks like HTML
    if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<div') || text.includes('<script')) {
      files[defaultFileName] = text.trim();
      return files;
    }

    // Fallback: whole text
    files[defaultFileName] = text.trim();
    return files;
  }
}

export default AgentBrain;
