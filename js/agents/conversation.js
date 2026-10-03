// ============================================
// THE OFFICE — Boss ↔ Employee Dialogue & Direct Action
// ============================================

import { getState, setState, emit } from '../store/state.js';
import { AgentBrain } from './brain.js';
import { buildBossChatPrompt } from '../ai/prompts.js';
import { ProjectOrchestrator } from './orchestrator.js';
import { Task } from '../engine/task.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class EmployeeConversation {
  /**
   * Talk directly to an employee as their boss
   * @param {Object} employee 
   * @param {string} userMessage 
   * @returns {Promise<{ reply: string, actionTaken?: string }>}
   */
  static async talk(employee, userMessage) {
    const state = getState();
    const tasks = state.tasks || [];
    const projects = state.projects || [];
    const company = state.company || { name: 'Dunder Mifflin Tech' };

    const currentTask = tasks.find(t => t.id === employee.currentTaskId);
    const activeProject = projects.find(p => p.status === 'in_progress');

    const context = {
      companyName: company.name,
      currentTask,
      activeProject
    };

    const promptText = buildBossChatPrompt(employee, context);

    // Build message array with memory
    const history = employee.conversationHistory || [];
    const messages = [
      { role: 'system', content: promptText },
      ...history.slice(-8),
      { role: 'user', content: userMessage }
    ];

    let reply = '';
    let parsedAction = { action: 'none', actionPayload: {} };

    try {
      const res = await AgentBrain.execute(employee, messages, { temperature: 0.75, maxTokens: 800 });
      parsedAction = AgentBrain.extractJSON(res.content, null);

      if (parsedAction && parsedAction.reply) {
        reply = parsedAction.reply;
      } else {
        reply = res.content || `Yes boss, on it right now!`;
      }
    } catch (err) {
      console.warn('AI Boss talk failed, using personality fallback:', err);
      reply = EmployeeConversation.getPersonalityFallbackReply(employee, userMessage);
    }

    // Save history to employee object
    if (!employee.conversationHistory) employee.conversationHistory = [];
    employee.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply }
    );
    if (employee.conversationHistory.length > 16) {
      employee.conversationHistory = employee.conversationHistory.slice(-16);
    }

    // Execute actions if requested by the dialogue
    let actionTaken = null;
    const action = parsedAction?.action;
    const payload = parsedAction?.actionPayload || {};

    if (action === 'start_project' || (userMessage.toLowerCase().includes('build') && userMessage.toLowerCase().includes('app'))) {
      const req = payload.projectName || payload.directive || userMessage;
      ProjectOrchestrator.startProject(req).catch(() => {});
      actionTaken = `Started project: "${req}"`;
    } else if (action === 'create_task') {
      const newTask = new Task({
        id: uid('task'),
        title: payload.title || userMessage,
        description: payload.description || `Direct assignment from boss: ${userMessage}`,
        type: 'feature',
        priority: 'P1',
        status: 'in_progress',
        assigneeId: employee.id,
        createdAt: Date.now()
      });
      const currentTasks = state.tasks || [];
      setState('tasks', [...currentTasks, newTask.toJSON()]);
      employee.currentTaskId = newTask.id;
      employee.status = 'working';
      actionTaken = `Assigned task: "${newTask.title}"`;
    } else if (action === 'take_break') {
      employee.status = 'break';
      emit('agent-break', { empId: employee.id, seconds: 12 });
      actionTaken = 'Sent on coffee break';
    }

    // Update employee state
    const allEmps = getState('employees') || [];
    const idx = allEmps.findIndex(e => e.id === employee.id);
    if (idx !== -1) {
      allEmps[idx] = employee;
      setState('employees', [...allEmps]);
    }

    if (actionTaken) {
      Toast.show(actionTaken, 'success');
    }

    return { reply, actionTaken };
  }

  /**
   * Fast, funny, in-character fallback when offline / no API key configured
   */
  static getPersonalityFallbackReply(employee, message) {
    const lower = message.toLowerCase();
    const isMichael = (employee.role || '').toLowerCase().includes('ceo') || (employee.name || '').toLowerCase().includes('michael');

    if (isMichael) {
      if (lower.includes('build') || lower.includes('app')) {
        return `I love it! You have no idea how high I can fly. Delegating to engineering immediately. "That's what she said!"`;
      }
      return `Look, as Regional Manager, I need to make sure morale is high. You're doing great, I'm doing great, let's crush this!`;
    }

    switch (employee.personality) {
      case 'deadpan':
        return `It is currently 3:42 PM. As long as this does not delay my 5:00 PM departure, I have logged your request.`;
      case 'perfectionist':
        return `Understood. I will ensure every single requirement is scrutinized and executed strictly in accordance with ISO quality standards.`;
      case 'prankster':
        return `Looking straight at the camera right now. Challenge accepted! Just putting Dwight's stapler back first.`;
      case 'eccentric':
        return `Question: Does this directive advance our Beet farm security protocols? Fact: I shall execute this with martial precision.`;
      case 'sweetheart':
        return `Aw, thanks boss! I brought some M&Ms to the breakroom if you want some while I work on this!`;
      case 'know_it_all':
        return `Actually, I've already evaluated three alternative approaches, but this one will suffice. Commencing execution.`;
      default:
        return `On it, boss! I'm giving this 110% effort right now!`;
    }
  }
}

export default EmployeeConversation;
