import { escapeHtml } from '../utils/helpers.js';
import { getState, setState, emit } from '../store/state.js';

export class EmployeeCard {
  static show(employee, currentTask) {
    const panel = document.getElementById('slide-panel');
    const header = document.getElementById('panel-header');
    const bodyContainer = document.getElementById('panel-body');
    const backdrop = document.getElementById('panel-backdrop');

    if (!panel || !header || !bodyContainer || !backdrop) return;

    panel.style.background = 'var(--paper)';
    panel.style.borderTop = '3px solid var(--ink)';
    panel.style.boxShadow = '0 -6px 0 rgba(27,27,27,0.15)';

    const isMichael = (employee.role || '').toLowerCase().includes('ceo') || (employee.name || '').toLowerCase().includes('michael');
    const providerName = employee.provider || 'gemini';

    // Terminal Titlebar
    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; gap: 5px;">
            <span style="width: 10px; height: 10px; background: #FF5F56; border: 1px solid var(--ink); display: inline-block;"></span>
            <span style="width: 10px; height: 10px; background: #FFBD2E; border: 1px solid var(--ink); display: inline-block;"></span>
            <span style="width: 10px; height: 10px; background: #27C93F; border: 1px solid var(--ink); display: inline-block;"></span>
          </div>
          <span style="font-family: var(--font-family-mono); font-size: 11px; font-weight: 700; color: var(--ink); margin-left: 6px;">
            ${isMichael ? "👑 MICHAEL'S COMMAND TERMINAL" : `AGENT TERMINAL: ${escapeHtml(employee.name.toUpperCase())}`}
          </span>
        </div>
        <button id="btn-close-terminal" style="background: var(--white); border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); cursor: pointer; padding: 2px 6px; font-weight: bold;">✕</button>
      </div>
    `;

    header.querySelector('#btn-close-terminal').onclick = () => EmployeeCard.hide();

    // Default logs if empty
    const logs = employee.terminalLogs && employee.terminalLogs.length ? employee.terminalLogs : [
      `[09:00:00] Agent ${employee.name} (${employee.role}) booted.`,
      `[09:00:01] Model Engine: ${providerName.toUpperCase()}`,
      `[09:00:02] Hive connection: OK. Mailbox synced.`,
      `[09:00:05] Status: ${employee.status.toUpperCase()}. Thought: "${employee.thought || 'Awaiting orders...'}"`
    ];

    if (currentTask) {
      logs.push(`[ACTIVE TASK] "${currentTask.title}" (${currentTask.priority || 'P2'})`);
    }

    bodyContainer.innerHTML = `
      <!-- Agent Meta Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; background: var(--cream); border: 2px solid var(--ink); padding: 8px; box-shadow: 2px 2px 0 var(--ink);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border: 2px solid var(--ink); background: ${employee.avatar?.shirt || '#1B1B1B'}; box-shadow: 2px 2px 0 var(--ink); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            ${isMichael ? '☕' : '💻'}
          </div>
          <div>
            <div style="font-weight: 700; font-family: var(--font-family-mono); font-size: 13px;">${escapeHtml(employee.name)}</div>
            <div style="font-size: 11px; color: var(--ink-dim); font-family: var(--font-family-mono);">${escapeHtml(employee.role)} · ${escapeHtml(employee.department)}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
          <span class="badge ${employee.status === 'working' ? 'badge-success' : 'badge-primary'}">${employee.status || 'idle'}</span>
          <span style="font-size: 10px; font-family: var(--font-family-mono); color: var(--ink-faint);">${providerName}</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <button class="tab-btn active" id="tab-terminal-btn">CRT TERMINAL</button>
        <button class="tab-btn" id="tab-mailbox-btn">MAILBOX (${(employee.mailbox?.inbox?.length || 0)})</button>
        <button class="tab-btn" id="tab-vitals-btn">STATS & VITALS</button>
      </div>

      <!-- View 1: CRT Terminal -->
      <div id="view-terminal" class="crt-terminal" style="margin-bottom: 12px;">
        <div class="crt-terminal__titlebar">
          <span>bash - 80x24</span>
          <span style="color: #666;">PID ${Math.floor(Math.random() * 8000 + 1000)}</span>
        </div>
        <div class="crt-terminal__screen" id="terminal-screen" style="max-height: 180px; min-height: 140px; font-size: 11px;">
          ${logs.map(log => `<div>${escapeHtml(log)}</div>`).join('')}
          <div style="margin-top: 6px; color: var(--yellow);">
            <span>${employee.name.toLowerCase().replace(/\s+/g, '')}@the-office:~$ </span>
            <span class="crt-terminal__cursor"></span>
          </div>
        </div>
      </div>

      <!-- Prompt Input for Agent -->
      <div id="agent-command-box" style="display: flex; gap: 6px; margin-bottom: 12px;">
        <input type="text" id="agent-direct-prompt" placeholder="Instruct ${employee.name.split(' ')[0]}..." style="flex: 1; font-size: 12px; padding: 8px;">
        <button class="btn btn-primary" id="btn-send-agent-prompt" style="padding: 0 12px;">RUN</button>
      </div>

      <!-- View 2: Mailbox (Hidden by default) -->
      <div id="view-mailbox" style="display: none; margin-bottom: 12px;">
        <div style="background: var(--white); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 10px;">
          <h4 style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 8px 0; border-bottom: 1px dashed var(--ink); padding-bottom: 4px;">INBOX (NOTES & COMMISSIONS)</h4>
          ${(employee.mailbox?.inbox && employee.mailbox.inbox.length) ? employee.mailbox.inbox.map(m => `
            <div style="border-bottom: 1px solid var(--cream-2); padding: 4px 0; font-size: 11px; font-family: var(--font-family-mono);">
              <strong>${escapeHtml(m.from)}</strong>: ${escapeHtml(m.subject)}
              <div style="color: var(--ink-dim);">${escapeHtml(m.content)}</div>
            </div>
          `).join('') : '<div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No new messages in mailbox.</div>'}
        </div>
      </div>

      <!-- View 3: Vitals & Mood (Hidden by default) -->
      <div id="view-vitals" style="display: none; margin-bottom: 12px;">
        <div class="card" style="padding: 12px;">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-family-mono); margin-bottom: 3px;">
              <span>PRODUCTIVITY</span><span>${employee.productivity || 100}%</span>
            </div>
            <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
              <div style="width: ${employee.productivity || 100}%; background: var(--mint); height: 100%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-family-mono); margin-bottom: 3px;">
              <span>MOOD</span><span>${employee.mood || 100}%</span>
            </div>
            <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
              <div style="width: ${employee.mood || 100}%; background: ${(employee.mood || 100) > 50 ? 'var(--yellow)' : 'var(--maroon)'}; height: 100%;"></div>
            </div>
          </div>
          <div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">
            <strong>Personality:</strong> ${escapeHtml(employee.personality || 'enthusiastic')}
          </div>
        </div>
      </div>
    `;

    // Tab Switching
    const tabTerm = bodyContainer.querySelector('#tab-terminal-btn');
    const tabMail = bodyContainer.querySelector('#tab-mailbox-btn');
    const tabVit = bodyContainer.querySelector('#tab-vitals-btn');
    const viewTerm = bodyContainer.querySelector('#view-terminal');
    const viewMail = bodyContainer.querySelector('#view-mailbox');
    const viewVit = bodyContainer.querySelector('#view-vitals');
    const cmdBox = bodyContainer.querySelector('#agent-command-box');

    const switchTab = (activeTab, activeView) => {
      [tabTerm, tabMail, tabVit].forEach(t => t.classList.remove('active'));
      [viewTerm, viewMail, viewVit].forEach(v => v.style.display = 'none');
      activeTab.classList.add('active');
      activeView.style.display = 'block';
      cmdBox.style.display = activeView === viewTerm ? 'flex' : 'none';
    };

    tabTerm.onclick = () => switchTab(tabTerm, viewTerm);
    tabMail.onclick = () => switchTab(tabMail, viewMail);
    tabVit.onclick = () => switchTab(tabVit, viewVit);

    // Direct Agent Command Input Handler
    const runBtn = bodyContainer.querySelector('#btn-send-agent-prompt');
    const promptInput = bodyContainer.querySelector('#agent-direct-prompt');

    const sendDirective = () => {
      const text = promptInput.value.trim();
      if (!text) return;
      promptInput.value = '';

      const time = new Date().toLocaleTimeString();
      const screen = bodyContainer.querySelector('#terminal-screen');
      if (screen) {
        const line = document.createElement('div');
        line.innerHTML = `<span style="color: var(--yellow);">${time} [USER DIRECTIVE]:</span> ${escapeHtml(text)}`;
        screen.appendChild(line);

        const ack = document.createElement('div');
        ack.innerHTML = `<span style="color: var(--mint);">${time} [${employee.name.split(' ')[0]}]:</span> Received directive. Executing via ${providerName}...`;
        screen.appendChild(ack);

        screen.scrollTop = screen.scrollHeight;
      }

      // Add to employee logs in state
      if (!employee.terminalLogs) employee.terminalLogs = [];
      employee.terminalLogs.push(`[USER] ${text}`);
      employee.terminalLogs.push(`[EXEC] Executing: "${text}"`);
      employee.thought = `Working on: ${text}`;
      employee.status = 'working';
      emit('tick');
    };

    runBtn.onclick = sendDirective;
    promptInput.onkeypress = (e) => { if (e.key === 'Enter') sendDirective(); };

    backdrop.style.display = 'block';
    panel.style.transform = 'translateY(0)';
    
    const closeHandler = () => {
      EmployeeCard.hide();
      backdrop.removeEventListener('click', closeHandler);
    };
    
    backdrop.addEventListener('click', closeHandler);
    EmployeeCard._closeHandler = closeHandler;
  }

  static hide() {
    const panel = document.getElementById('slide-panel');
    const backdrop = document.getElementById('panel-backdrop');
    if (panel) panel.style.transform = 'translateY(100%)';
    if (backdrop) {
      backdrop.style.display = 'none';
      if (EmployeeCard._closeHandler) {
        backdrop.removeEventListener('click', EmployeeCard._closeHandler);
        EmployeeCard._closeHandler = null;
      }
    }
  }
}

export default EmployeeCard;
