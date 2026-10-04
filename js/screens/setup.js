import { getState, setState, mergeState, emit } from '../store/state.js';
import { hasSavedGame, saveSetting } from '../store/db.js';
import { createElement, escapeHtml } from '../utils/helpers.js';
import { saveApiKey, loadApiKey } from '../utils/crypto.js';
import { AIRouter } from '../ai/router.js';
import { Toast } from '../components/toast.js';

const PROVIDER_LIST = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    emoji: '🔷', 
    free: true, 
    freeTier: '15 RPM, 1500 RPD (Free)', 
    defaultModel: 'gemini-2.0-flash',
    candidates: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro']
  },
  { 
    id: 'groq', 
    name: 'Groq Cloud', 
    emoji: '🟠', 
    free: true, 
    freeTier: '30 RPM (Fast Free Inference)', 
    defaultModel: 'llama-3.1-8b-instant',
    candidates: [
      'llama-3.1-8b-instant', 
      'llama-3.3-70b-versatile', 
      'llama3-8b-8192', 
      'llama3-70b-8192', 
      'mixtral-8x7b-32768', 
      'gemma2-9b-it', 
      'deepseek-r1-distill-llama-70b', 
      'qwen-2.5-32b'
    ]
  },
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    emoji: '🌐', 
    free: true, 
    freeTier: '20 RPM (Free models)', 
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    candidates: [
      'meta-llama/llama-3.3-70b-instruct:free', 
      'google/gemini-2.0-flash-exp:free', 
      'deepseek/deepseek-r1:free', 
      'meta-llama/llama-3.1-8b-instruct:free', 
      'qwen/qwen-2.5-72b-instruct:free', 
      'openai/gpt-4o-mini'
    ]
  },
  { 
    id: 'huggingface', 
    name: 'HuggingFace', 
    emoji: '🤗', 
    free: true, 
    freeTier: 'Free inference API', 
    defaultModel: 'meta-llama/Llama-3.1-8B-Instruct',
    candidates: [
      'meta-llama/Llama-3.1-8B-Instruct', 
      'mistralai/Mistral-7B-Instruct-v0.3', 
      'Qwen/Qwen2.5-72B-Instruct'
    ]
  },
  { 
    id: 'openai', 
    name: 'OpenAI', 
    emoji: '🟢', 
    free: false, 
    freeTier: null, 
    defaultModel: 'gpt-4o-mini',
    candidates: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    emoji: '🟤', 
    free: false, 
    freeTier: null, 
    defaultModel: 'claude-3-5-sonnet-20241022',
    candidates: [
      'claude-3-5-sonnet-20241022', 
      'claude-3-5-haiku-20241022', 
      'claude-3-haiku-20240307', 
      'claude-3-opus-20240229'
    ]
  },
  { 
    id: 'grok', 
    name: 'xAI Grok', 
    emoji: '⚡', 
    free: false, 
    freeTier: null, 
    defaultModel: 'grok-2',
    candidates: ['grok-2', 'grok-2-mini', 'grok-beta', 'grok-3', 'grok-3-mini']
  }
];

export class SetupScreen {
  constructor() {
    this.container = null;
    this.step = getState().setup?.step || 0;
    this.companyName = 'The Office';
    this.projectName = 'TaskMaster Pro';
    this.projectDesc = 'A modern project management tool for high-performing teams.';
    this.connectedProviders = 0;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen setup-screen active';

    // Step dots in neo-brutalist ink squares
    const wizardTop = createElement('div', 'wizard-steps');
    wizardTop.style.cssText = 'display: flex; gap: 8px; justify-content: center; margin-bottom: 14px;';
    for (let i = 0; i < 4; i++) {
      const dot = createElement('div', {
        style: `width: 14px; height: 14px; border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); background: ${i === this.step ? 'var(--yellow)' : (i < this.step ? 'var(--mint)' : 'var(--white)')};`
      });
      wizardTop.appendChild(dot);
    }
    this.container.appendChild(wizardTop);

    const content = createElement('div', 'setup-content');
    this.container.appendChild(content);

    if (this.step === 0) this.renderStep0(content);
    else if (this.step === 1) this.renderStep1(content);
    else if (this.step === 2) this.renderStep2(content);
    else if (this.step === 3) this.renderStep3(content);
  }

  renderStep0(container) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px 16px; margin: 0 auto; max-width: 380px;">
        <div style="display: inline-block; padding: 3px 8px; background: var(--maroon); color: var(--paper); font-size: 10px; font-weight: bold; border: 1px solid var(--ink); margin-bottom: 12px; box-shadow: 2px 2px 0 var(--ink);">
          THE OFFICE · AI SOFTWARE COMPANY
        </div>
        <div style="font-size: 48px; margin-bottom: 8px;">☕🏢</div>
        <h1 style="font-family: var(--font-family-display); font-size: 24px; margin: 0 0 6px 0; letter-spacing: -0.03em;">THE OFFICE</h1>
        <div style="font-size: 11px; color: var(--maroon); font-weight: bold; margin-bottom: 12px;">MULTI-AGENT SOFTWARE SIMULATOR</div>
        <p style="font-size: 12px; color: var(--ink-dim); line-height: 1.5; margin-bottom: 20px;">
          "The world's best agents. The world's funniest office." Coordinate an office of AI bots working at desks on your phone.
        </p>
        <button id="btn-start" class="btn btn-primary btn-large btn-block">START YOUR OFFICE →</button>
      </div>
    `;

    // Only add Continue if saved game exists
    hasSavedGame().then(saved => {
      if (saved) {
        const contBtn = createElement('button', 'btn btn-secondary mt-2 btn-block', 'CONTINUE SAVED OFFICE');
        contBtn.style.marginTop = '10px';
        contBtn.onclick = () => {
          emit('navigate', 'office');
        };
        const box = container.querySelector('.card');
        if (box) box.appendChild(contBtn);
      }
    }).catch(() => {});

    container.querySelector('#btn-start').onclick = () => this.nextStep();
  }

  renderStep1(container) {
    container.innerHTML = `
      <div class="card" style="padding: 16px; max-width: 380px; margin: 0 auto;">
        <h3 style="margin-top: 0; font-family: var(--font-family-display); font-size: 15px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
          01 / COMPANY SETUP
        </h3>
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" id="company-name" value="${escapeHtml(this.companyName)}">
        </div>
        <div class="form-group">
          <label>Target Project</label>
          <input type="text" id="project-name" value="${escapeHtml(this.projectName)}">
        </div>
        <div class="form-group">
          <label>Project Vision & Spec</label>
          <textarea id="project-desc" rows="3">${escapeHtml(this.projectDesc)}</textarea>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button id="btn-back" class="btn btn-secondary" style="flex: 1;">BACK</button>
          <button id="btn-next" class="btn btn-primary" style="flex: 1;">NEXT →</button>
        </div>
      </div>
    `;

    container.querySelector('#company-name').onchange = (e) => this.companyName = e.target.value;
    container.querySelector('#project-name').onchange = (e) => this.projectName = e.target.value;
    container.querySelector('#project-desc').onchange = (e) => this.projectDesc = e.target.value;

    container.querySelector('#btn-back').onclick = () => { this.step--; this.render(this.container); };
    container.querySelector('#btn-next').onclick = () => this.nextStep();
  }

  async renderStep2(container) {
    let html = `
      <div style="max-width: 380px; margin: 0 auto;">
        <h3 style="margin-top: 0; font-family: var(--font-family-display); font-size: 15px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
          02 / CONNECT AI PROVIDERS
        </h3>
        <div style="background: var(--mint); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
          ⚡ <strong>Auto-detecting Models:</strong> Enter an API key and click TEST. The app auto-probes and selects an active working model!
        </div>
        <div class="provider-list">
    `;

    html += PROVIDER_LIST.map(p => {
      const savedModel = localStorage.getItem('provider_model_' + p.id) || p.defaultModel;
      const modelOptions = p.candidates.map(m => 
        `<option value="${escapeHtml(m)}"${m === savedModel ? ' selected' : ''}>${escapeHtml(m)}</option>`
      ).join('');

      return `
        <div class="provider-card" data-id="${p.id}">
          <div class="provider-card__header">
            <span class="provider-card__name">${p.emoji} ${p.name}</span>
            ${p.free ? '<span class="badge badge-success">FREE TIER</span>' : '<span class="badge badge-secondary">PAID API</span>'}
          </div>
          <div style="font-size: 10px; color: var(--ink-dim); margin-bottom: 6px;">${p.freeTier || 'Pay-per-token API'}</div>
          <div class="form-group" style="margin-bottom: 6px;">
            <div style="display: flex; gap: 4px;">
              <input type="password" class="api-key-input" placeholder="Enter API Key" data-id="${p.id}" style="font-size: 11px;">
              <button class="btn btn-icon toggle-visibility" data-id="${p.id}" style="padding: 0 8px;">👁️</button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
            <select class="model-select" data-id="${p.id}" style="font-size: 10px; padding: 4px 6px; flex: 1;">
              ${modelOptions}
            </select>
            <button class="btn btn-secondary btn-sm btn-test" data-id="${p.id}">TEST</button>
          </div>
          <div class="status-indicator" data-id="${p.id}" style="font-size: 10px; margin-top: 4px; font-weight: bold;"></div>
        </div>
      `;
    }).join('');

    html += `
        </div>
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button id="btn-back" class="btn btn-secondary" style="flex: 1;">BACK</button>
          <button id="btn-next" class="btn btn-primary" style="flex: 1;">BUILD TEAM →</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach events
    container.querySelectorAll('.toggle-visibility').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const input = container.querySelector(`.api-key-input[data-id="${id}"]`);
        input.type = input.type === 'password' ? 'text' : 'password';
      };
    });

    container.querySelectorAll('.model-select').forEach(sel => {
      sel.onchange = (e) => {
        const id = e.target.dataset.id;
        localStorage.setItem('provider_model_' + id, e.target.value);
        saveSetting('provider_model_' + id, e.target.value).catch(() => {});
      };
    });

    container.querySelectorAll('.btn-test').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        const p = PROVIDER_LIST.find(x => x.id === id);
        const input = container.querySelector(`.api-key-input[data-id="${id}"]`);
        const select = container.querySelector(`.model-select[data-id="${id}"]`);
        const selectedModel = select ? select.value : p.defaultModel;
        const apiKey = input.value.trim();
        const status = container.querySelector(`.status-indicator[data-id="${id}"]`);

        if (!apiKey) {
          Toast.show('Please enter an API key', 'error');
          return;
        }

        status.textContent = 'Auto-detecting working model...';
        status.style.color = 'var(--ink)';
        btn.disabled = true;

        try {
          const provider = AIRouter.createProvider(id, { apiKey, model: selectedModel });
          const candidates = Array.from(new Set([selectedModel, ...(p.candidates || [])]));
          const res = await provider.testAndFindWorkingModel(candidates);

          if (res.success) {
            const workingModel = res.workingModel;
            const allAvailable = Array.from(new Set([
              workingModel,
              ...(res.availableModels || []),
              ...(p.candidates || [])
            ])).filter(Boolean);

            if (select) {
              select.innerHTML = allAvailable.map(m => 
                `<option value="${escapeHtml(m)}"${m === workingModel ? ' selected' : ''}>${escapeHtml(m)}</option>`
              ).join('');
              select.value = workingModel;
            }

            status.textContent = `✅ Connected (${workingModel})`;
            status.style.color = 'var(--status-working)';
            saveApiKey(id, apiKey);
            localStorage.setItem('provider_model_' + id, workingModel);
            saveSetting('provider_model_' + id, workingModel).catch(() => {});
            this.connectedProviders++;
            Toast.show(`Connected to ${p.name} (${workingModel})!`, 'success');
          } else {
            status.textContent = '❌ Failed';
            status.style.color = 'var(--maroon)';
            Toast.show(res.message || 'Connection failed', 'error');
          }
        } catch (err) {
          status.textContent = '❌ Error';
          status.style.color = 'var(--maroon)';
          Toast.show(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      };
    });

    // Load existing keys
    for (const p of PROVIDER_LIST) {
      const key = loadApiKey(p.id);
      if (key) {
        container.querySelector(`.api-key-input[data-id="${p.id}"]`).value = key;
        const savedModel = localStorage.getItem('provider_model_' + p.id);
        const status = container.querySelector(`.status-indicator[data-id="${p.id}"]`);
        if (status && savedModel) {
          status.textContent = `Saved (${savedModel})`;
          status.style.color = 'var(--ink-dim)';
        }
      }
    }

    container.querySelector('#btn-back').onclick = () => { this.step--; this.render(this.container); };
    container.querySelector('#btn-next').onclick = () => this.nextStep();
  }

  renderStep3(container) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px 16px; margin: 0 auto; max-width: 380px;">
        <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
        <h2 style="font-family: var(--font-family-display); font-size: 18px; margin: 0 0 10px 0;">COMPANY READY!</h2>
        <div style="background: var(--cream); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 12px; margin-bottom: 16px; text-align: left; font-size: 12px;">
          <div><strong>COMPANY:</strong> ${escapeHtml(this.companyName)}</div>
          <div><strong>PROJECT:</strong> ${escapeHtml(this.projectName)}</div>
          <div><strong>ORCHESTRATOR:</strong> Michael Scott (CEO)</div>
        </div>
        <button id="btn-enter" class="btn btn-primary btn-large btn-block">ENTER THE OFFICE →</button>
      </div>
    `;

    container.querySelector('#btn-enter').onclick = () => {
      mergeState('company', {
        name: this.companyName,
        projectName: this.projectName,
        projectDescription: this.projectDesc
      });
      mergeState('setup', { step: 4, completed: true });
      emit('navigate', 'hire');
    };
  }

  nextStep() {
    this.step++;
    mergeState('setup', { step: this.step });
    this.render(this.container);
  }

  onEnter() {}
  onLeave() {}

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}

export default SetupScreen;
