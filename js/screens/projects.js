// ============================================
// THE OFFICE — Projects Screen
// Agent multi-project manager, question answering,
// code viewer, sandboxed live preview, & downloads
// Supports Web, Python scripts, Terraform HCL, and WASM
// ============================================

import { getState, setState, on, emit } from '../store/state.js';
import { createElement, escapeHtml, uid } from '../utils/helpers.js';
import { ProjectOrchestrator } from '../agents/orchestrator.js';
import { ProjectArtifacts } from '../agents/artifacts.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';

export class ProjectsScreen {
  constructor() {
    this.container = null;
    this.subscriptions = [];
    this.selectedProjectId = null;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen projects-screen';

    // Header bar
    const header = createElement('div', {
      style: `
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 12px;
      `
    });

    header.innerHTML = `
      <div>
        <div style="font-family: var(--font-family-mono); font-size: 9px; font-weight: 700; color: var(--maroon); letter-spacing: 0.05em;">AGENT DELIVERABLES</div>
        <h2 style="font-family: var(--font-family-display); font-size: 18px; margin: 0;">PROJECTS & APPS</h2>
      </div>
      <button id="btn-create-project" class="btn btn-primary btn-sm" style="font-size: 11px;">+ NEW PROJECT</button>
    `;
    this.container.appendChild(header);

    // Main content area
    const content = createElement('div', { id: 'projects-content-area', style: 'display: flex; flex-direction: column; gap: 14px;' });
    this.container.appendChild(content);

    // Bind create project button
    header.querySelector('#btn-create-project').onclick = () => {
      this.openNewProjectModal();
    };

    this.renderProjectsList();
  }

  renderProjectsList() {
    const content = this.container.querySelector('#projects-content-area');
    if (!content) return;
    content.innerHTML = '';

    const projects = getState('projects') || [];

    if (projects.length === 0) {
      // Empty state with quick starters
      const emptyCard = createElement('div', {
        className: 'project-card',
        style: 'text-align: center; padding: 24px 16px;'
      });

      emptyCard.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
        <h3 style="font-family: var(--font-family-display); font-size: 16px; margin: 0 0 6px;">No Projects Built Yet</h3>
        <p style="font-family: var(--font-family-mono); font-size: 11px; color: var(--ink-dim); max-width: 320px; margin: 0 auto 16px; line-height: 1.4;">
          Direct Michael or your AI agents to build real web applications, Python automation scripts, or Terraform infrastructure. They'll ask requirements, write specs, code the files, and deliver an interactive preview!
        </p>
        <div style="font-family: var(--font-family-mono); font-size: 10px; font-weight: bold; margin-bottom: 8px; color: var(--maroon);">QUICK START TEMPLATES:</div>
        <div style="display: flex; flex-direction: column; gap: 6px; max-width: 340px; margin: 0 auto;">
          <button class="btn btn-outline btn-sm quick-proj" data-req="Build an interactive app that tells hilarious dad jokes with a laugh sound and copy button">
            🎭 Dad Joke Web App
          </button>
          <button class="btn btn-outline btn-sm quick-proj" data-req="Build a Python script that scrapes headlines, analyzes sentiment, and outputs summary JSON">
            🐍 Python Data Script (.py)
          </button>
          <button class="btn btn-outline btn-sm quick-proj" data-req="Build a Terraform script that provisions an AWS VPC, public subnets, and an ECS cluster">
            ☁️ Terraform AWS Infra (.tf)
          </button>
          <button class="btn btn-outline btn-sm quick-proj" data-req="Build an interactive web app with in-browser Python WebAssembly (Pyodide) backend">
            🌐 Web App + Python Backend (WASM)
          </button>
        </div>
      `;

      emptyCard.querySelectorAll('.quick-proj').forEach(btn => {
        btn.onclick = () => {
          this.startNewProject(btn.dataset.req);
        };
      });

      content.appendChild(emptyCard);
      return;
    }

    // Render active/delivered projects
    projects.forEach(proj => {
      const card = this.renderProjectCard(proj);
      content.appendChild(card);
    });
  }

  renderProjectCard(proj) {
    const card = createElement('div', {
      className: 'project-card',
      id: `proj-card-${proj.id}`
    });

    const isDelivered = proj.status === 'delivered';
    const isWaitingQuestions = proj.phase === 'questions' && Array.isArray(proj.questions) && proj.questions.length > 0;
    const badgeClass = isDelivered ? 'badge-success' : (isWaitingQuestions ? 'badge-error' : 'badge-primary');
    const phaseLabel = isDelivered ? 'DELIVERED ✅' : (isWaitingQuestions ? 'NEEDS BOSS INPUT ❓' : `PHASE: ${proj.phase.toUpperCase()}`);

    // Header
    const cardHeader = createElement('div', 'project-card__header');
    cardHeader.innerHTML = `
      <div>
        <span class="badge ${badgeClass}" style="font-size: 9px; margin-bottom: 4px; display: inline-block;">${phaseLabel}</span>
        <h3 style="font-family: var(--font-family-display); font-size: 15px; margin: 0;">${escapeHtml(proj.name)}</h3>
      </div>
      <div style="text-align: right; font-family: var(--font-family-mono); font-size: 9px; color: var(--ink-dim);">
        ${new Date(proj.createdAt).toLocaleDateString()}
      </div>
    `;
    card.appendChild(cardHeader);

    // Requirement description
    const desc = createElement('div', {
      style: 'font-family: var(--font-family-mono); font-size: 11px; color: var(--ink-dim); line-height: 1.4;'
    });
    desc.textContent = `Requirement: "${proj.requirement}"`;
    card.appendChild(desc);

    // Phase stepper
    const phases = ['questions', 'spec', 'planning', 'coding', 'qa', 'delivered'];
    const stepper = createElement('div', 'phase-stepper');
    stepper.innerHTML = phases.map(ph => {
      const idx = phases.indexOf(ph);
      const curIdx = phases.indexOf(proj.phase);
      let cls = 'phase-step';
      if (idx < curIdx || isDelivered) cls += ' phase-step--done';
      else if (idx === curIdx) cls += ' phase-step--active';
      return `<div class="${cls}">${ph.toUpperCase()}</div>`;
    }).join('');
    card.appendChild(stepper);

    // If waiting for boss questions input
    if (isWaitingQuestions) {
      const questionsBox = this.renderQuestionsForm(proj);
      card.appendChild(questionsBox);
    }

    // If code files exist (coding or delivered), render preview & code viewer
    const fileKeys = Object.keys(proj.files || {});
    if (fileKeys.length > 0) {
      const primaryFile = fileKeys.find(f => f.endsWith('.py') || f.endsWith('.tf') || f.endsWith('.html')) || fileKeys[0];

      // Live Preview & Action bar
      const actions = createElement('div', {
        style: 'display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;'
      });

      actions.innerHTML = `
        <button class="btn btn-primary btn-sm btn-open-tab" style="font-size: 10px;">▶ RUN / PREVIEW IN TAB</button>
        <button class="btn btn-outline btn-sm btn-dl-primary" style="font-size: 10px;">💾 DOWNLOAD ${escapeHtml(primaryFile)}</button>
        <button class="btn btn-outline btn-sm btn-dl-zip" style="font-size: 10px;">📦 DOWNLOAD ZIP</button>
      `;

      actions.querySelector('.btn-open-tab').onclick = () => {
        const url = ProjectArtifacts.createPreviewBlobUrl(proj.files);
        window.open(url, '_blank');
      };

      actions.querySelector('.btn-dl-primary').onclick = () => {
        ProjectArtifacts.downloadFile(primaryFile, proj.files[primaryFile]);
      };

      actions.querySelector('.btn-dl-zip').onclick = () => {
        ProjectArtifacts.downloadZip(proj.name.toLowerCase().replace(/\s+/g, '-'), proj.files);
      };

      card.appendChild(actions);

      // Embedded sandboxed preview iframe
      const previewTitle = createElement('div', {
        style: 'font-family: var(--font-family-mono); font-size: 10px; font-weight: bold; margin-top: 6px;'
      });
      previewTitle.textContent = 'INTERACTIVE LIVE PREVIEW / STUDIO:';
      card.appendChild(previewTitle);

      const previewBox = createElement('div', 'preview-container');
      const iframe = createElement('iframe', {
        sandbox: 'allow-scripts allow-modals allow-downloads'
      });
      iframe.srcdoc = ProjectArtifacts.bundleForPreview(proj.files);
      previewBox.appendChild(iframe);
      card.appendChild(previewBox);

      // File Explorer & Code Inspector
      const explorer = createElement('div', {
        style: 'margin-top: 10px; border-top: 1px dashed var(--ink); padding-top: 8px;'
      });
      let currentFile = fileKeys[0];

      explorer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-family: var(--font-family-mono); font-size: 10px; font-weight: bold;">PROJECT SOURCE FILES:</div>
          <button class="btn btn-sm btn-outline btn-copy-code" style="font-size: 9px; padding: 2px 6px;">📋 COPY FILE</button>
        </div>
        <div class="file-tabs" style="display: flex; gap: 4px; overflow-x: auto; margin-bottom: 6px;">
          ${fileKeys.map(k => `<button class="tab-btn ${k === currentFile ? 'active' : ''}" data-file="${k}" style="font-size: 10px; padding: 2px 8px; font-family: var(--font-family-mono); cursor: pointer; border: 1px solid var(--ink);">${escapeHtml(k)}</button>`).join('')}
        </div>
        <pre class="code-viewer-container" style="max-height: 180px; overflow: auto; background: var(--crt-bg); color: var(--white); padding: 8px; font-size: 10px; border: 2px solid var(--ink); white-space: pre-wrap; font-family: var(--font-family-mono);">${escapeHtml(proj.files[currentFile] || '')}</pre>
      `;

      const codePre = explorer.querySelector('.code-viewer-container');
      explorer.querySelectorAll('.file-tabs .tab-btn').forEach(btn => {
        btn.onclick = () => {
          explorer.querySelectorAll('.file-tabs .tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFile = btn.dataset.file;
          codePre.textContent = proj.files[currentFile] || '';
        };
      });

      explorer.querySelector('.btn-copy-code').onclick = () => {
        navigator.clipboard?.writeText(codePre.textContent);
        Toast.show(`Copied ${currentFile} to clipboard!`, 'success');
      };

      card.appendChild(explorer);

      // Request changes box
      const changeBox = createElement('div', {
        style: 'margin-top: 8px; border-top: 1px dashed var(--ink); padding-top: 8px;'
      });
      changeBox.innerHTML = `
        <div style="font-family: var(--font-family-mono); font-size: 10px; font-weight: bold; margin-bottom: 4px;">REQUEST REVISIONS / CHANGES:</div>
        <div style="display: flex; gap: 6px;">
          <input type="text" class="input-change" placeholder="e.g. 'Add dark mode toggle' or 'Add AWS RDS module'..." style="flex: 1; font-size: 11px; padding: 4px 8px;">
          <button class="btn btn-secondary btn-sm btn-send-change" style="font-size: 10px;">SUBMIT TO DEV</button>
        </div>
      `;

      const sendChange = () => {
        const input = changeBox.querySelector('.input-change');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        ProjectOrchestrator.requestChanges(proj.id, text);
        Toast.show(`Revision dispatched to team!`, 'info');
      };

      changeBox.querySelector('.btn-send-change').onclick = sendChange;
      changeBox.querySelector('.input-change').onkeypress = (e) => {
        if (e.key === 'Enter') sendChange();
      };

      card.appendChild(changeBox);
    }

    // Timeline disclosure
    const timelineToggle = createElement('details', {
      style: 'margin-top: 6px; font-family: var(--font-family-mono); font-size: 10px;'
    });
    timelineToggle.innerHTML = `
      <summary style="cursor: pointer; font-weight: bold; color: var(--maroon);">
        📜 AGENT LOG & TIMELINE (${(proj.timeline || []).length} steps)
      </summary>
      <div style="margin-top: 6px; max-height: 140px; overflow-y: auto; background: var(--cream); border: 1px solid var(--ink); padding: 6px 8px; display: flex; flex-direction: column; gap: 4px;">
        ${(proj.timeline || []).slice().reverse().map(t => `
          <div style="border-bottom: 1px solid rgba(27,27,27,0.1); padding-bottom: 3px;">
            <span style="font-weight: bold; color: var(--ink);">${escapeHtml(t.authorName)} (${escapeHtml(t.authorRole)}):</span>
            <span style="color: var(--ink-dim);">${escapeHtml(t.message)}</span>
          </div>
        `).join('')}
      </div>
    `;
    card.appendChild(timelineToggle);

    return card;
  }

  renderQuestionsForm(proj) {
    const box = createElement('div', {
      style: 'background: #FFFDF0; border: 2px solid var(--maroon); padding: 10px; margin-top: 6px;'
    });

    box.innerHTML = `
      <div style="font-family: var(--font-family-mono); font-size: 11px; font-weight: bold; color: var(--maroon); margin-bottom: 8px;">
        ❓ PRODUCT MANAGER QUESTIONS FOR THE BOSS:
      </div>
      <form id="form-questions-${proj.id}" style="display: flex; flex-direction: column; gap: 8px;">
        ${proj.questions.map((q, qIdx) => `
          <div style="background: var(--white); border: 1px solid var(--ink); padding: 6px 8px; font-family: var(--font-family-mono); font-size: 11px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${qIdx + 1}. ${escapeHtml(q.question)}</div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              ${(q.options || []).map((opt, optIdx) => `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 10px;">
                  <input type="radio" name="q_${qIdx}" value="${escapeHtml(opt)}" ${optIdx === 0 ? 'checked' : ''}>
                  <span>${escapeHtml(opt)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <button type="button" class="btn btn-primary btn-sm btn-submit-answers" style="font-size: 11px;">
            ✅ SUBMIT ANSWERS & BUILD
          </button>
          <button type="button" class="btn btn-outline btn-sm btn-team-decide" style="font-size: 11px;">
            🤖 LET TEAM DECIDE (AUTOPILOT)
          </button>
        </div>
      </form>
    `;

    box.querySelector('.btn-submit-answers').onclick = () => {
      const form = box.querySelector(`#form-questions-${proj.id}`);
      const answers = {};
      proj.questions.forEach((q, idx) => {
        const checked = form.querySelector(`input[name="q_${idx}"]:checked`);
        answers[q.question] = checked ? checked.value : (q.defaultOption || q.options[0]);
      });
      ProjectOrchestrator.submitAnswers(proj.id, answers);
      Toast.show(`Answers submitted! Architecture & coding started.`, 'success');
      this.renderProjectsList();
    };

    box.querySelector('.btn-team-decide').onclick = () => {
      const answers = {};
      proj.questions.forEach(q => {
        answers[q.question] = q.defaultOption || q.options[0];
      });
      ProjectOrchestrator.submitAnswers(proj.id, answers);
      Toast.show(`Team decision greenlit! Full build started.`, 'success');
      this.renderProjectsList();
    };

    return box;
  }

  openNewProjectModal() {
    const content = createElement('div');
    content.innerHTML = `
      <div style="font-family: var(--font-family-mono); font-size: 11px; margin-bottom: 12px; line-height: 1.4;">
        Describe what you want your team to build (Web application, Python script, or Terraform infrastructure). The Product Manager will review it, ask clarifying questions, and hand it to engineering.
      </div>
      <div style="margin-bottom: 10px;">
        <label style="font-family: var(--font-family-mono); font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">REQUIREMENTS / PROMPT:</label>
        <textarea id="modal-project-req" rows="4" style="width: 100%; font-size: 12px; font-family: var(--font-family-mono); padding: 8px; border: 2px solid var(--ink);" placeholder="e.g. 'Build a Python script to scrape headlines' or 'Terraform script for AWS VPC' or 'Joke web app'"></textarea>
      </div>
      <label style="display: flex; align-items: center; gap: 8px; font-family: var(--font-family-mono); font-size: 11px; cursor: pointer;">
        <input type="checkbox" id="modal-project-autopilot">
        <span><strong>Autopilot Mode</strong> (Skip questions & start coding immediately)</span>
      </label>
    `;

    Modal.show({
      title: 'LAUNCH NEW SOFTWARE PROJECT',
      contentElement: content,
      buttons: [
        { text: 'CANCEL', class: 'btn btn-outline', onClick: () => Modal.hide() },
        { 
          text: 'START PROJECT', 
          class: 'btn btn-primary', 
          onClick: () => {
            const req = content.querySelector('#modal-project-req').value.trim();
            const autopilot = content.querySelector('#modal-project-autopilot').checked;
            if (!req) return;
            Modal.hide();
            this.startNewProject(req, { autopilot });
          } 
        }
      ]
    });
  }

  async startNewProject(reqText, options = {}) {
    try {
      Toast.show(`Dispatching project: "${reqText.substring(0, 30)}..."`, 'info');
      await ProjectOrchestrator.startProject(reqText, options);
      this.renderProjectsList();
    } catch (err) {
      Toast.show(`Failed to start project: ${err.message}`, 'error');
    }
  }

  onEnter() {
    this.renderProjectsList();

    this.subscriptions.push(on('project-updated', () => {
      this.renderProjectsList();
    }));
  }

  onLeave() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.container) this.container.innerHTML = '';
  }
}

export default ProjectsScreen;
