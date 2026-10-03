import { getState, resetState, emit, on } from '../store/state.js';
import { clearAll } from '../store/db.js';
import { createElement, formatNumber, escapeHtml } from '../utils/helpers.js';
import { Modal } from '../components/modal.js';

export class DashboardScreen {
  constructor() {
    this.container = null;
    this.subscriptions = [];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen dashboard-screen layout-padded';

    const state = getState();
    const company = state.company || { name: 'Dunder Mifflin Tech' };
    const employees = state.employees || [];
    const tasks = state.tasks || [];
    const game = state.game || { sprintNumber: 1, eventsLog: [], apiCalls: 0, tokensUsed: 0 };

    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const header = createElement('div', 'dashboard-header');
    header.innerHTML = `
      <div style="margin-bottom: 12px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
        <span style="font-size: 9px; font-weight: bold; color: var(--maroon); font-family: var(--font-family-mono); letter-spacing: 0.05em;">EXECUTIVE LEDGER</span>
        <h2 style="margin: 0; font-family: var(--font-family-display); font-size: 18px; letter-spacing: -0.02em;">${escapeHtml(company.name)}</h2>
      </div>
    `;
    this.container.appendChild(header);

    const statsGrid = createElement('div', 'stats-grid');
    statsGrid.style.display = 'grid';
    statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    statsGrid.style.gap = '10px';
    statsGrid.style.marginBottom = '16px';

    statsGrid.innerHTML = `
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">👥</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${employees.length}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">ACTIVE AGENTS</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">✅</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${doneTasks}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">TICKETS DONE</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">📈</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${progress}%</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">SPRINT #${game.sprintNumber || game.sprint || 1}</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">⚡</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${formatNumber(game.apiCalls || 0)}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">API DISPATCHES</div>
      </div>
    `;
    this.container.appendChild(statsGrid);

    const productivitySection = createElement('div', 'card');
    productivitySection.style.marginBottom = '16px';
    productivitySection.innerHTML = `
      <h3 style="margin: 0 0 10px; font-family: var(--font-family-display); font-size: 13px; border-bottom: 2px solid var(--ink); padding-bottom: 4px;">
        TEAM PRODUCTIVITY & VITALS
      </h3>
    `;
    
    const sortedEmp = [...employees].sort((a, b) => (b.productivity || 50) - (a.productivity || 50));
    const empList = createElement('div', 'emp-prod-list');
    
    if (sortedEmp.length === 0) {
      empList.innerHTML = '<p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No employees hired yet.</p>';
    } else {
      sortedEmp.forEach(emp => {
        const prod = emp.productivity || 50;
        let mood = '😊';
        if (prod < 40) mood = '😟';
        else if (prod < 70) mood = '😐';

        const row = createElement('div', 'prod-row');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.marginBottom = '8px';
        row.style.fontFamily = 'var(--font-family-mono)';
        row.innerHTML = `
          <div style="font-size: 14px;">${emp.avatar?.shirt ? '💻' : '👤'}</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 11px;">
              ${escapeHtml(emp.name)} <span style="font-weight: normal; color: var(--ink-dim);">(${escapeHtml(emp.role)})</span>
            </div>
            <div style="background: var(--cream); height: 6px; border: 1px solid var(--ink); margin-top: 3px;">
              <div style="background: ${prod > 70 ? 'var(--mint)' : 'var(--yellow)'}; width: ${prod}%; height: 100%;"></div>
            </div>
          </div>
          <span style="font-size: 14px;">${mood}</span>
        `;
        empList.appendChild(row);
      });
    }
    productivitySection.appendChild(empList);
    this.container.appendChild(productivitySection);

    // Recent Office Events
    const eventsSection = createElement('div', 'card');
    eventsSection.style.marginBottom = '16px';
    eventsSection.innerHTML = `
      <h3 style="margin: 0 0 10px; font-family: var(--font-family-display); font-size: 13px; border-bottom: 2px solid var(--ink); padding-bottom: 4px;">
        OFFICE TIMELINE & INCIDENTS
      </h3>
    `;
    const eventsList = createElement('div', 'events-timeline');
    
    const recentEvents = (game.eventsLog || []).slice(-6).reverse();
    if (recentEvents.length === 0) {
      eventsList.innerHTML = '<p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No incidents reported.</p>';
    } else {
      recentEvents.forEach(ev => {
        const item = createElement('div', 'timeline-item');
        item.style.padding = '4px 0';
        item.style.borderBottom = '1px solid var(--cream-2)';
        item.style.fontFamily = 'var(--font-family-mono)';
        item.style.fontSize = '11px';
        item.innerHTML = `
          <span>${ev.emoji || '📌'}</span> 
          <span>${escapeHtml(ev.description || ev.name)}</span>
        `;
        eventsList.appendChild(item);
      });
    }
    eventsSection.appendChild(eventsList);
    this.container.appendChild(eventsSection);

    // Reset Button
    const resetBtn = createElement('button', 'btn btn-danger btn-block', 'RESET OFFICE & LEDGER');
    resetBtn.onclick = () => {
      Modal.confirm({
        title: 'DANGER ZONE',
        message: 'Are you sure you want to reset the office? All active agents, sprint tickets, and company metrics will be wiped clean. Saved API keys will remain securely stored.'
      }).then(async confirmed => {
        if (confirmed) {
          await clearAll();
          resetState();
          emit('navigate', 'setup');
        }
      });
    };
    this.container.appendChild(resetBtn);
  }

  onEnter() {
    this.subscriptions.push(on('state-change', () => {
      this.render(this.container);
    }));
  }

  onLeave() {
    this.subscriptions.forEach(u => u());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.container) this.container.innerHTML = '';
  }
}

export default DashboardScreen;
