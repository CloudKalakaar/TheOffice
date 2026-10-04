import { getState, pushState, emit, on } from '../store/state.js';
import { createElement, uid, escapeHtml } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { EmployeeCard } from '../components/employee-card.js';
import { TalkSheet } from '../components/talk-sheet.js';
import { ProjectOrchestrator } from '../agents/orchestrator.js';
import { OfficeFloor } from '../components/floor.js';
import { Task } from '../engine/task.js';

export class OfficeScreen {
  constructor() {
    this.container = null;
    this.floor = null;
    this.tickerEl = null;
    this.subscriptions = [];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen office-screen';

    // ── Command Center (Direct Michael) ──
    const commandBar = createElement('div', 'command-center-bar');
    commandBar.innerHTML = `
      <span style="font-size: 16px; cursor: pointer;" title="Michael Scott, Regional Manager">☕</span>
      <input type="text" id="input-michael-directive" placeholder="Direct Michael (e.g. 'Build a Joke App')...">
      <button class="btn btn-primary btn-sm" id="btn-delegate-michael">DELEGATE</button>
    `;
    this.container.appendChild(commandBar);

    const delegateDirective = async () => {
      const input = commandBar.querySelector('#input-michael-directive');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const employees = getState('employees') || [];
      const michael = employees.find(e => (e.role || '').toLowerCase().includes('ceo') || (e.name || '').toLowerCase().includes('michael')) || employees[0];

      if (michael && this.floor) {
        this.floor.showSpeechBubble(michael.id, `"On it! Delegating to the floor!"`);
      }

      const lower = text.toLowerCase();
      const isProject = lower.includes('build') || lower.includes('app') || lower.includes('website') || 
                        lower.includes('create') || lower.includes('game') || lower.includes('tool');

      if (isProject) {
        // Start multi-agent software project
        Toast.show(`Michael dispatched project: "${text}" to engineering!`, 'info');
        try {
          await ProjectOrchestrator.startProject(text);
          this.updateProjectTicker();
        } catch (err) {
          Toast.show(`Project start error: ${err.message}`, 'error');
        }
      } else {
        // Direct task
        const newTask = new Task({
          id: uid('task'),
          title: text,
          description: `Directive from boss: ${text}. Coordinate across engineering and testing.`,
          type: 'feature',
          priority: 'P1',
          status: 'in_progress',
          assigneeId: employees.length > 1 ? employees[1].id : (michael ? michael.id : null),
          createdAt: Date.now()
        });

        pushState('tasks', newTask.toJSON());

        if (michael) {
          if (!michael.terminalLogs) michael.terminalLogs = [];
          michael.terminalLogs.push(`[DIRECTIVE] Received: "${text}"`);
          michael.terminalLogs.push(`[ORCHESTRATOR] Dispatched task ${newTask.id} to engineering.`);
          michael.thought = `Coordinating: "${text}"`;
          michael.status = 'working';
        }

        if (michael && employees.length > 1 && this.floor) {
          this.floor.animateMail(michael.id, employees[1].id);
        }

        Toast.show(`Michael dispatched: "${text}" to the team!`, 'success');
        emit('tick');
      }
    };

    commandBar.querySelector('#btn-delegate-michael').onclick = delegateDirective;
    commandBar.querySelector('#input-michael-directive').onkeypress = (e) => {
      if (e.key === 'Enter') delegateDirective();
    };

    // ── Active Project Ticker Strip ──
    const ticker = createElement('div', 'project-ticker-strip');
    this.container.appendChild(ticker);
    this.tickerEl = ticker;
    this.updateProjectTicker();

    // ── Event Banner Container ──
    const eventBannerContainer = createElement('div', 'event-banner-container');
    this.container.appendChild(eventBannerContainer);
    this.eventBannerContainer = eventBannerContainer;

    // ── Office Floor Canvas Container ──
    const floorContainer = createElement('div', 'office-floor-container');
    this.container.appendChild(floorContainer);

    // Initialize OfficeFloor
    this.floor = new OfficeFloor(floorContainer);
  }

  updateProjectTicker() {
    if (!this.tickerEl) return;
    const projects = getState('projects') || [];
    const active = projects.find(p => p.status === 'in_progress') || projects[0];

    if (!active) {
      this.tickerEl.style.display = 'none';
      return;
    }

    this.tickerEl.style.display = 'flex';
    const isWaiting = active.phase === 'questions' && active.questions?.length > 0;
    const isDelivered = active.status === 'delivered';

    this.tickerEl.innerHTML = `
      <div class="project-ticker-strip__left">
        <span class="project-ticker-strip__pulse" style="background: ${isDelivered ? 'var(--crt-green)' : (isWaiting ? 'var(--maroon)' : 'var(--yellow)')};"></span>
        <span>${isDelivered ? '✅ DELIVERED' : (isWaiting ? '❓ QUESTIONS WAITING' : `🚀 ${active.phase.toUpperCase()}`)}:</span>
        <span style="text-decoration: underline;">"${escapeHtml(active.name)}"</span>
      </div>
      <div style="font-size: 10px; color: var(--maroon); font-weight: bold; flex-shrink: 0;">
        VIEW APP ➔
      </div>
    `;

    this.tickerEl.onclick = () => {
      emit('navigate', 'projects');
    };
  }

  openEmployeeTalk(emp) {
    if (!emp) return;
    TalkSheet.show(emp);
  }

  openBlackboardModal() {
    const sprintNumber = getState('game.sprintNumber') || 1;
    const tasks = getState('tasks') || [];
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review');
    const done = tasks.filter(t => t.status === 'done');
    const company = getState('company') || { name: 'The Office', projectName: 'Current Sprint' };

    const content = createElement('div');
    content.innerHTML = `
      <div class="blackboard-card" style="margin-bottom: 12px;">
        <div class="blackboard-card__title">📌 SPRINT #${sprintNumber} OBJECTIVES</div>
        <p style="font-size: 12px; margin: 4px 0 10px; color: #FFFDF7;">
          <strong>Target Project:</strong> ${escapeHtml(company.projectName || 'Main Application')}
        </p>
        <div style="font-size: 11px; color: #DDD;">
          <div>✅ Completed: <strong>${done.length}</strong> tickets</div>
          <div>⚡ In Flight: <strong>${inProgress.length}</strong> tickets</div>
          <div>📋 Total Backlog: <strong>${tasks.length}</strong> items</div>
        </div>
      </div>

      <div style="background: var(--white); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 10px;">
        <h4 style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 8px; border-bottom: 1px dashed var(--ink); padding-bottom: 4px;">
          ACTIVE HIVE TICKETS
        </h4>
        ${inProgress.length ? inProgress.map(t => `
          <div style="font-family: var(--font-family-mono); font-size: 11px; padding: 4px 0; border-bottom: 1px solid var(--cream-2);">
            <span class="badge ${t.priority === 'P0' ? 'badge-error' : 'badge-primary'}">${t.priority || 'P2'}</span>
            <strong>${escapeHtml(t.title)}</strong>
          </div>
        `).join('') : '<div style="font-family: var(--font-family-mono); font-size: 11px; color: var(--ink-dim);">No active tasks in flight. Use "Command Center" to assign one!</div>'}
      </div>
    `;

    Modal.show({
      title: 'SHARED HIVE BLACKBOARD',
      contentElement: content,
      buttons: [
        { text: 'CLOSE', class: 'btn btn-primary', onClick: () => Modal.hide() }
      ]
    });
  }

  showEventBanner(eventInfo) {
    if (!this.eventBannerContainer) return;
    const banner = createElement('div', 'event-banner');
    banner.innerHTML = `
      <span class="event-emoji" style="font-size: 1.3rem; margin-right: 8px;">${eventInfo.emoji || '🔔'}</span>
      <span class="event-desc" style="flex: 1; font-weight: 600;">${eventInfo.description || eventInfo.name}</span>
      <button class="btn btn-icon dismiss-btn" style="background: var(--white); border: 1px solid var(--ink); font-size: 11px; cursor: pointer;">✕</button>
    `;
    
    this.eventBannerContainer.appendChild(banner);

    const closeBanner = () => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-6px)';
      banner.style.transition = 'all 0.2s ease';
      setTimeout(() => banner.remove(), 200);
    };

    const dismissBtn = banner.querySelector('.dismiss-btn');
    if (dismissBtn) dismissBtn.onclick = closeBanner;
    setTimeout(closeBanner, 6000);
  }

  onEnter() {
    if (this.floor) {
      this.floor.render(getState('employees'), getState('company'));
    }
    this.updateProjectTicker();
    
    emit('game-start');

    this.subscriptions.push(on('tick', () => {
      if (this.floor) this.floor.update();
      this.updateProjectTicker();
    }));

    this.subscriptions.push(on('project-updated', () => {
      this.updateProjectTicker();
    }));

    this.subscriptions.push(on('random-event', (eventInfo) => {
      this.showEventBanner(eventInfo);
    }));

    this.subscriptions.push(on('employee-talk', (emp) => {
      this.openEmployeeTalk(emp);
    }));

    this.subscriptions.push(on('employee-select', (empId) => {
      const emp = (getState('employees') || []).find(e => e.id === empId);
      if (emp) this.openEmployeeTalk(emp);
    }));

    this.subscriptions.push(on('blackboard-select', () => {
      this.openBlackboardModal();
    }));
  }

  onLeave() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.floor) {
      this.floor.destroy();
    }
    if (this.container) this.container.innerHTML = '';
  }
}

export default OfficeScreen;
