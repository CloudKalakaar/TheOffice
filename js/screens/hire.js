import { getState, setState, mergeState, pushState, emit } from '../store/state.js';
import { saveCompany, saveEmployees } from '../store/db.js';
import { createElement, uid, randomPick, escapeHtml } from '../utils/helpers.js';
import { generateName } from '../utils/names.js';
import { Employee, ROLES, PERSONALITIES } from '../engine/employee.js';
import { Company } from '../engine/company.js';
import { Toast } from '../components/toast.js';
import { getAllApiKeys } from '../utils/crypto.js';
import { normalizeRoleKey } from '../ai/prompts.js';

export class HireScreen {
  constructor() {
    this.container = null;
    this.availableRoles = Object.values(ROLES);
    this.currentRoleIndex = 0;
    this.currentFilter = 'All';
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen hire-screen';

    const header = createElement('div', 'hire-header');
    header.innerHTML = `
      <div style="border-bottom: 2px solid var(--ink); padding-bottom: 6px; margin-bottom: 10px;">
        <span style="font-size: 9px; font-weight: 700; color: var(--maroon); font-family: var(--font-family-mono); letter-spacing: 0.05em;">TEAM ROSTER</span>
        <h2 style="margin: 0; font-family: var(--font-family-display); font-size: 17px; display: flex; justify-content: space-between; align-items: center;">
          RECRUIT AGENTS <span class="badge badge-primary employee-count">0</span>
        </h2>
      </div>

      <div class="quick-start" style="display: flex; gap: 6px; margin-bottom: 10px;">
        <button class="btn btn-sm btn-outline" id="btn-startup">STARTUP (5)</button>
        <button class="btn btn-sm btn-outline" id="btn-small">CORE TEAM (10)</button>
        <button class="btn btn-sm btn-outline" id="btn-full">FULL OFFICE (17)</button>
      </div>

      <div class="department-tabs" style="margin-bottom: 12px;">
        ${['All', 'Executive', 'Management', 'Engineering', 'Design', 'Support'].map(dept => 
          `<button class="tab-btn ${this.currentFilter === dept ? 'active' : ''}" data-dept="${dept}">${dept}</button>`
        ).join('')}
      </div>
    `;
    this.container.appendChild(header);

    const mainArea = createElement('div', 'hire-main-area');
    this.container.appendChild(mainArea);
    this.mainArea = mainArea;

    const bottomSection = createElement('div', 'hire-bottom-section');
    bottomSection.innerHTML = `
      <div style="margin-top: 14px; border-top: 2px solid var(--ink); padding-top: 8px;">
        <h4 style="font-family: var(--font-family-display); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase;">
          HIRED AGENTS ON DECK
        </h4>
        <div class="current-team-list" style="max-height: 180px; overflow-y: auto;"></div>
        <button id="btn-start-working" class="btn btn-primary btn-large btn-block" style="display:none; margin-top: 12px;">
          DISPATCH AGENTS TO FLOOR →
        </button>
      </div>
    `;
    this.container.appendChild(bottomSection);

    this.bindEvents();
    this.renderCard();
    this.updateTeamList();
  }

  bindEvents() {
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.dept;
        this.currentRoleIndex = 0;
        this.renderCard();
      };
    });

    this.container.querySelector('#btn-startup').onclick = () => {
      this.autoHire(['CEO', 'ProductManager', 'TechLead', 'Developer', 'Tester']);
    };
    this.container.querySelector('#btn-small').onclick = () => {
      this.autoHire([
        'CEO', 'CTO', 'ProductManager', 'ProgramManager', 
        'TechLead', 'SeniorDeveloper', 'Developer', 'Designer', 'QALead', 'DevOpsEngineer'
      ]);
    };
    this.container.querySelector('#btn-full').onclick = () => {
      this.autoHire(Object.keys(ROLES));
    };

    const btnStart = this.container.querySelector('#btn-start-working');
    if (btnStart) {
      btnStart.onclick = () => this.startWorking();
    }
  }

  getFilteredRoles() {
    if (this.currentFilter === 'All') return this.availableRoles;
    return this.availableRoles.filter(r => r.department === this.currentFilter);
  }

  renderCard() {
    const roles = this.getFilteredRoles();
    this.mainArea.innerHTML = '';

    if (roles.length === 0 || this.currentRoleIndex >= roles.length) {
      this.mainArea.innerHTML = `
        <div class="empty-state" style="padding: 20px; text-align: center; border: 2px dashed var(--ink); background: var(--cream);">
          <p style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 10px;">All roles in this department viewed!</p>
          <button class="btn btn-sm btn-outline" id="btn-restart-roles">RESET CANDIDATES</button>
        </div>
      `;
      const restartBtn = this.mainArea.querySelector('#btn-restart-roles');
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.currentRoleIndex = 0;
          this.renderCard();
        };
      }
      return;
    }

    const role = roles[this.currentRoleIndex];
    const card = createElement('div', 'candidate-card');
    card.style.border = '2px solid var(--ink)';
    card.style.boxShadow = '4px 4px 0 var(--ink)';
    card.style.background = 'var(--white)';
    card.style.padding = '12px';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <span class="badge badge-primary">${escapeHtml(role.department)}</span>
        <span style="font-family: var(--font-family-mono); font-size: 11px; font-weight: bold; color: var(--maroon);">
          $${role.baseSalary}/yr
        </span>
      </div>

      <h3 style="font-family: var(--font-family-display); font-size: 16px; margin: 0 0 4px;">${escapeHtml(role.title)}</h3>
      <p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim); margin: 0 0 10px; line-height: 1.4;">
        ${escapeHtml(role.description)}
      </p>

      <div style="background: var(--cream); border: 1px solid var(--ink); padding: 8px; font-size: 10px; font-family: var(--font-family-mono); margin-bottom: 12px;">
        <div><strong>SPEED:</strong> ${'⚡'.repeat(Math.round(role.stats.speed / 20))} (${role.stats.speed})</div>
        <div><strong>QUALITY:</strong> ${'★'.repeat(Math.round(role.stats.quality / 20))} (${role.stats.quality})</div>
        <div><strong>AUTONOMY:</strong> ${'🧠'.repeat(Math.round(role.stats.autonomy / 20))} (${role.stats.autonomy})</div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-block btn-skip">PASS (NEXT)</button>
        <button class="btn btn-primary btn-block btn-hire">RECRUIT AGENT</button>
      </div>
    `;

    card.querySelector('.btn-skip').onclick = () => {
      this.currentRoleIndex++;
      this.renderCard();
    };

    card.querySelector('.btn-hire').onclick = () => {
      this.hireRole(role);
      this.currentRoleIndex++;
      this.renderCard();
    };

    this.mainArea.appendChild(card);
  }

  hireRole(roleDef) {
    const nameGen = generateName();
    const name = nameGen.fullName || `${nameGen.firstName} ${nameGen.lastName}`;
    const avatar = Employee.generateAvatar ? Employee.generateAvatar() : { hair: '#4a4a4a', skin: '#FFDBAC', shirt: '#4472C4' };
    const personality = randomPick(PERSONALITIES) || { id: 'enthusiastic', name: 'Enthusiastic' };
    
    // Assign provider round-robin from available connected keys
    const availableKeys = getAllApiKeys();
    const connectedProviders = Object.keys(availableKeys);
    const existingEmployees = getState('employees') || [];
    const provider = connectedProviders.length > 0 
      ? connectedProviders[existingEmployees.length % connectedProviders.length] 
      : 'groq';

    const emp = new Employee({
      id: uid('emp'),
      name,
      avatar,
      role: roleDef.title,
      department: roleDef.department,
      personality: personality.id,
      provider
    });

    pushState('employees', emp.toJSON());
    Toast.show(`Hired ${name} (${roleDef.title})!`, 'success');
    this.updateTeamList();
  }

  autoHire(roleKeys) {
    roleKeys.forEach(key => {
      const roleDef = ROLES[key] || this.availableRoles.find(r => r.title.toLowerCase() === key.toLowerCase() || r.title === key);
      if (roleDef) {
        this.hireRole(roleDef);
      }
    });
  }

  updateTeamList() {
    const employees = getState().employees || [];
    const countEl = this.container.querySelector('.employee-count');
    if (countEl) countEl.textContent = employees.length;
    
    const list = this.container.querySelector('.current-team-list');
    if (!list) return;

    if (employees.length === 0) {
      list.innerHTML = '<div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim); padding: 8px 0;">No agents recruited yet. Use quick-start or hire above!</div>';
    } else {
      list.innerHTML = employees.map(emp => {
        const shirt = emp.avatar?.shirt || '#4472C4';
        const brain = emp.provider ? emp.provider.toUpperCase() : 'AUTO';
        return `
          <div style="display: flex; align-items: center; gap: 8px; padding: 6px 4px; border-bottom: 1px solid var(--cream-2); font-family: var(--font-family-mono);">
            <div style="width: 24px; height: 24px; border: 1px solid var(--ink); background: ${shirt}; box-shadow: 1px 1px 0 var(--ink); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
              ${(emp.role || '').toLowerCase().includes('ceo') ? '☕' : '💻'}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(emp.name)}</div>
              <div style="font-size: 10px; color: var(--ink-dim);">
                ${escapeHtml(emp.role)} · <span class="badge badge-secondary" style="font-size: 8px; padding: 1px 4px;">${brain}</span>
              </div>
            </div>
            <button class="btn btn-icon btn-fire" data-id="${emp.id}" style="color: var(--maroon); border: none; background: transparent; font-size: 14px; cursor: pointer; padding: 2px;">✕</button>
          </div>
        `;
      }).join('');
    }

    list.querySelectorAll('.btn-fire').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const state = getState();
        const filtered = (state.employees || []).filter(emp => emp.id !== id);
        setState('employees', filtered);
        this.updateTeamList();
      };
    });

    const btnStart = this.container.querySelector('#btn-start-working');
    if (btnStart) {
      if (employees.length >= 3) {
        btnStart.style.display = 'block';
      } else {
        btnStart.style.display = 'none';
      }
    }
  }

  async startWorking() {
    const state = getState();
    const company = new Company({
      name: state.company?.name || 'The Office',
      projectName: state.company?.projectName || 'TaskMaster Pro',
      projectDescription: state.company?.projectDescription || 'Autonomous software development.'
    });
    
    // Save to DB
    await saveCompany(company.toJSON());
    await saveEmployees(state.employees);

    emit('navigate', 'office');
    emit('game-initialized');
  }

  onEnter() {
    this.updateTeamList();
  }

  onLeave() {}

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}

export default HireScreen;
