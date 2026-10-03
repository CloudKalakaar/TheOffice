// ============================================
// THE OFFICE — Boss Talk Sheet Component
// Direct boss ↔ employee conversation bottom sheet
// ============================================

import { getState, emit } from '../store/state.js';
import { createElement, escapeHtml } from '../utils/helpers.js';
import { EmployeeConversation } from '../agents/conversation.js';

export class TalkSheet {
  static currentEmployee = null;
  static sheetEl = null;

  /**
   * Open the talk sheet for an employee
   * @param {Object} employee 
   */
  static show(employee) {
    TalkSheet.currentEmployee = employee;
    emit('talk-open', { empId: employee.id });

    let overlay = document.getElementById('talk-sheet-overlay');
    if (!overlay) {
      overlay = createElement('div', {
        id: 'talk-sheet-overlay',
        className: 'talk-sheet-overlay',
        style: `
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: var(--z-panel, 200);
          display: flex; align-items: flex-end; justify-content: center; opacity: 0; transition: opacity 0.2s ease;
        `
      });
      document.body.appendChild(overlay);
    }

    const state = getState();
    const tasks = state.tasks || [];
    const projects = state.projects || [];
    const currentTask = tasks.find(t => t.id === employee.currentTaskId);
    const activeProject = projects.find(p => p.status === 'in_progress');

    const brainLabel = employee.provider 
      ? `${employee.provider.toUpperCase()} · ${employee.model || 'auto'}` 
      : 'Auto AI Engine';

    overlay.innerHTML = `
      <div class="talk-sheet-card" style="
        width: 100%; max-width: 440px; background: var(--paper); border: 3px solid var(--ink);
        border-bottom: none; box-shadow: 0 -4px 0 var(--ink); padding: 14px 16px; max-height: 85vh;
        display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.25s cubic-bezier(0.1, 0.9, 0.2, 1);
      ">
        <!-- Drag / Header Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border: 2px solid var(--ink); background: ${employee.avatar?.shirt || '#4472C4'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">
              ${(employee.role || '').toLowerCase().includes('ceo') ? '☕' : '💻'}
            </div>
            <div>
              <div style="font-family: var(--font-family-display); font-size: 14px; font-weight: 700;">${escapeHtml(employee.name)}</div>
              <div style="font-family: var(--font-family-mono); font-size: 10px; color: var(--maroon); font-weight: bold;">
                ${escapeHtml(employee.role)} · <span style="color: var(--ink-dim);">${escapeHtml(brainLabel)}</span>
              </div>
            </div>
          </div>
          <button id="btn-close-talk" class="btn btn-icon" style="background: var(--cream); border: 2px solid var(--ink); font-size: 12px; cursor: pointer; padding: 2px 8px;">✕</button>
        </div>

        <!-- Status Summary Pill -->
        <div style="background: var(--cream); border: 1px solid var(--ink); padding: 6px 10px; font-family: var(--font-family-mono); font-size: 11px; margin-bottom: 10px;">
          <div><strong>CURRENT STATUS:</strong> <span class="badge ${employee.status === 'working' ? 'badge-success' : 'badge-secondary'}">${employee.status.toUpperCase()}</span> ${employee.thought ? `· "${escapeHtml(employee.thought)}"` : ''}</div>
          ${currentTask ? `<div style="margin-top: 4px;"><strong>TASK:</strong> ${escapeHtml(currentTask.title)}</div>` : ''}
          ${activeProject ? `<div style="margin-top: 2px; color: var(--maroon);"><strong>HIVE PROJECT:</strong> ${escapeHtml(activeProject.name)} (${activeProject.phase})</div>` : ''}
        </div>

        <!-- Conversation History Area -->
        <div id="talk-history" style="flex: 1; min-height: 140px; max-height: 240px; overflow-y: auto; padding: 6px 0; display: flex; flex-direction: column; gap: 8px;">
          <!-- Messages will render here -->
        </div>

        <!-- Quick Action Chips -->
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 6px 0; margin-bottom: 8px;">
          <button class="talk-chip btn btn-sm" data-text="Give me a quick status update on what you're doing.">📊 Status update</button>
          <button class="talk-chip btn btn-sm" data-text="What are you currently working on? Any blockers?">🧠 What are you on?</button>
          <button class="talk-chip btn btn-sm" data-text="Take a 10-minute coffee break in the break room.">☕ Take a break</button>
          <button class="talk-chip btn btn-sm" data-text="Can you speed up delivery on your task?">⚡ Speed it up</button>
        </div>

        <!-- Input Bar -->
        <div style="display: flex; gap: 6px;">
          <input type="text" id="input-talk-msg" placeholder="Talk to ${escapeHtml(employee.name.split(' ')[0])} (or 'build a joke app')..." style="flex: 1; font-size: 12px; padding: 6px 8px;">
          <button id="btn-talk-send" class="btn btn-primary" style="font-size: 11px; padding: 6px 12px;">SEND</button>
        </div>
      </div>
    `;

    // Render past history or opening greeting
    const historyContainer = overlay.querySelector('#talk-history');
    const history = employee.conversationHistory || [];
    
    if (history.length === 0) {
      // Opening status greeting from employee
      const initialGreeting = TalkSheet.getInitialGreeting(employee, currentTask, activeProject);
      TalkSheet.appendMessage(historyContainer, employee.name, initialGreeting, false);
    } else {
      history.slice(-6).forEach(msg => {
        TalkSheet.appendMessage(historyContainer, msg.role === 'user' ? 'Boss (You)' : employee.name, msg.content, msg.role === 'user');
      });
    }

    // Attach event listeners
    const cardEl = overlay.querySelector('.talk-sheet-card');
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      cardEl.style.transform = 'translateY(0)';
    });

    const closeSheet = () => {
      overlay.style.opacity = '0';
      cardEl.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        emit('talk-close', { empId: employee.id });
      }, 200);
    };

    overlay.querySelector('#btn-close-talk').onclick = closeSheet;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeSheet();
    };

    const sendMsg = async (text) => {
      if (!text.trim()) return;
      const input = overlay.querySelector('#input-talk-msg');
      input.value = '';
      input.disabled = true;
      const sendBtn = overlay.querySelector('#btn-talk-send');
      sendBtn.disabled = true;

      // Add user message to UI
      TalkSheet.appendMessage(historyContainer, 'Boss (You)', text, true);

      // Add typing indicator
      const typingEl = TalkSheet.appendMessage(historyContainer, employee.name, 'Thinking...', false);

      try {
        const { reply } = await EmployeeConversation.talk(employee, text);
        typingEl.remove();
        TalkSheet.appendMessage(historyContainer, employee.name, reply, false);
      } catch (err) {
        typingEl.remove();
        TalkSheet.appendMessage(historyContainer, employee.name, `Understood, boss!`, false);
      } finally {
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }
    };

    overlay.querySelector('#btn-talk-send').onclick = () => {
      const input = overlay.querySelector('#input-talk-msg');
      sendMsg(input.value);
    };

    overlay.querySelector('#input-talk-msg').onkeypress = (e) => {
      if (e.key === 'Enter') sendMsg(e.target.value);
    };

    overlay.querySelectorAll('.talk-chip').forEach(chip => {
      chip.onclick = () => sendMsg(chip.dataset.text);
    });

    TalkSheet.sheetEl = overlay;
  }

  static appendMessage(container, sender, text, isUser) {
    const bubble = createElement('div', {
      style: `
        align-self: ${isUser ? 'flex-end' : 'flex-start'};
        max-width: 86%;
        background: ${isUser ? 'var(--yellow)' : 'var(--white)'};
        border: 2px solid var(--ink);
        box-shadow: 2px 2px 0 var(--ink);
        padding: 6px 10px;
        font-family: var(--font-family-mono);
        font-size: 11px;
        line-height: 1.4;
      `
    });
    bubble.innerHTML = `
      <div style="font-size: 9px; font-weight: bold; color: ${isUser ? 'var(--ink)' : 'var(--maroon)'}; margin-bottom: 2px;">
        ${escapeHtml(sender)}
      </div>
      <div>${escapeHtml(text)}</div>
    `;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  static getInitialGreeting(emp, currentTask, activeProject) {
    const isMichael = (emp.role || '').toLowerCase().includes('ceo') || (emp.name || '').toLowerCase().includes('michael');
    if (isMichael) {
      if (activeProject) return `Hey boss! Michael Scott here. The floor is working hard on "${activeProject.name}". What do you need?`;
      return `Hey boss! Michael Scott at your service. World's best regional manager. What's the master plan?`;
    }
    if (currentTask) {
      return `Hey boss! Currently working on "${currentTask.title}". Making solid progress! Need an update or have a new directive?`;
    }
    if (activeProject) {
      return `Hey boss! I'm on deck for "${activeProject.name}". Let me know what you need me to work on!`;
    }
    return `Hey boss! Standing by at my desk. What would you like me to tackle?`;
  }
}

export default TalkSheet;
