import { getState, mergeState, pushState, on } from '../store/state.js';
import { createElement, uid, escapeHtml } from '../utils/helpers.js';
import { renderTaskCard } from '../components/task-card.js';
import { Modal } from '../components/modal.js';
import { Task } from '../engine/task.js';

export class TasksScreen {
  constructor() {
    this.container = null;
    this.subscriptions = [];
    this.columns = [
      { id: 'backlog', title: 'BACKLOG', statuses: ['backlog', 'assigned'] },
      { id: 'in_progress', title: 'IN PROGRESS', statuses: ['in_progress'] },
      { id: 'in_review', title: 'IN REVIEW', statuses: ['in_review'] },
      { id: 'done', title: 'DONE', statuses: ['done'] }
    ];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen tasks-screen';

    const sprint = getState().game?.sprintNumber || getState().game?.sprint || 1;
    const tasks = getState().tasks || [];
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const header = createElement('div', 'tasks-header');
    header.innerHTML = `
      <div class="card" style="padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 9px; font-weight: 700; color: var(--maroon); letter-spacing: 0.05em;">HIVE SPRINT</span>
          <h3 style="margin: 0; font-family: var(--font-family-display); font-size: 15px; letter-spacing: -0.02em;">SPRINT #${sprint}</h3>
        </div>
        <div style="width: 140px;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; font-family: var(--font-family-mono); margin-bottom: 2px;">
            <span>DELIVERED</span><span>${progress}%</span>
          </div>
          <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
            <div style="width: ${progress}%; background: var(--yellow); height: 100%;"></div>
          </div>
        </div>
      </div>
    `;
    this.container.appendChild(header);

    const fab = createElement('button', 'btn btn-primary btn-block', '+ NEW SPRINT TICKET');
    fab.style.marginBottom = '12px';
    fab.onclick = () => this.openNewTaskModal();
    this.container.appendChild(fab);

    const kanban = createElement('div', 'kanban-board');
    
    const employees = getState().employees || [];
    this.columns.forEach(col => {
      const colTasks = tasks.filter(t => col.statuses.includes(t.status));
      const colEl = createElement('div', 'kanban-column');
      colEl.dataset.id = col.id;
      colEl.innerHTML = `
        <div class="column-header">
          <h3>${col.title} <span class="badge ${col.id === 'done' ? 'badge-success' : 'badge-primary'}">${colTasks.length}</span></h3>
        </div>
        <div class="column-content" data-col="${col.id}"></div>
      `;
      
      const contentEl = colEl.querySelector('.column-content');
      colTasks.forEach(taskData => {
        const card = renderTaskCard(taskData, employees);
        card.onclick = () => this.openTaskDetail(taskData.id);
        contentEl.appendChild(card);
      });

      kanban.appendChild(colEl);
    });

    this.container.appendChild(kanban);
  }

  openTaskDetail(taskId) {
    const task = (getState('tasks') || []).find(t => t.id === taskId);
    if (!task) return;
    
    const assignee = (getState('employees') || []).find(e => e.id === task.assigneeId);
    
    const content = createElement('div', 'task-detail-content');
    content.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; gap: 6px;">
        <span class="badge badge-secondary">${escapeHtml(task.type || 'feature')}</span>
        <span class="badge ${task.priority === 'P0' ? 'badge-error' : 'badge-primary'}">${task.priority || 'P2'}</span>
        <span class="badge ${task.status === 'done' ? 'badge-success' : 'badge-secondary'}">${task.status}</span>
      </div>
      <p style="font-family: var(--font-family-mono); font-size: 12px; color: var(--ink-dim); line-height: 1.4; margin-bottom: 12px;">
        ${escapeHtml(task.description || 'No description provided.')}
      </p>
      
      <div style="background: var(--cream); border: 1px solid var(--ink); padding: 8px; font-family: var(--font-family-mono); font-size: 11px; margin-bottom: 12px;">
        <strong>ASSIGNEE:</strong> ${assignee ? `${escapeHtml(assignee.name)} (${escapeHtml(assignee.role)})` : 'Unassigned'}
      </div>
      
      ${task.output ? `
        <div class="crt-terminal" style="margin-top: 10px;">
          <div class="crt-terminal__titlebar">
            <span>DELIVERABLE OUTPUT · ${escapeHtml(task.type || 'code')}</span>
          </div>
          <div class="crt-terminal__screen" style="max-height: 160px; font-size: 11px;">
            <pre style="margin: 0; white-space: pre-wrap;"><code>${escapeHtml(task.output)}</code></pre>
          </div>
        </div>
      ` : ''}
    `;

    Modal.show({
      title: task.title,
      contentElement: content,
      buttons: [{ text: 'CLOSE', class: 'btn btn-primary', onClick: () => Modal.hide() }]
    });
  }

  openNewTaskModal() {
    const content = createElement('div', 'new-task-form');
    content.innerHTML = `
      <div class="form-group">
        <label>Ticket Title</label>
        <input type="text" id="nt-title" placeholder="e.g. Implement OAuth Flow">
      </div>
      <div class="form-group">
        <label>Description & Scope</label>
        <textarea id="nt-desc" rows="3" placeholder="Define acceptance criteria..."></textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="nt-type">
          <option value="feature">Feature</option>
          <option value="bug">Bug Fix</option>
          <option value="design">Design / UI</option>
          <option value="test">Testing / QA</option>
          <option value="devops">DevOps / Deploy</option>
        </select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="nt-priority">
          <option value="P0">P0 (Critical Blocker)</option>
          <option value="P1">P1 (High)</option>
          <option value="P2" selected>P2 (Normal)</option>
          <option value="P3">P3 (Nice to Have)</option>
        </select>
      </div>
    `;

    Modal.show({
      title: 'CREATE SPRINT TICKET',
      contentElement: content,
      buttons: [
        { text: 'CANCEL', class: 'btn btn-secondary', onClick: () => Modal.hide() },
        { 
          text: 'CREATE TICKET', 
          class: 'btn btn-primary', 
          onClick: () => {
            const title = content.querySelector('#nt-title').value.trim();
            const desc = content.querySelector('#nt-desc').value.trim();
            if (!title) return;
            
            const task = new Task({
              id: uid('task'),
              title,
              description: desc,
              type: content.querySelector('#nt-type').value,
              priority: content.querySelector('#nt-priority').value,
              status: 'backlog',
              createdAt: Date.now()
            });

            pushState('tasks', task.toJSON());
            Modal.hide();
            this.render(this.container);
          }
        }
      ]
    });
  }

  onEnter() {
    this.subscriptions.push(on('state-change', (path) => {
      if (path === 'tasks' || path.startsWith('tasks.')) {
        this.render(this.container);
      }
    }));
    this.subscriptions.push(on('tick', () => {
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

export default TasksScreen;
