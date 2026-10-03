/**
 * @module engine/scrum
 */
import { Task } from './task.js';

/**
 * ScrumMaster manages scrum ceremonies.
 */
export class ScrumMaster {
  /**
   * Generates standup summary
   * @param {Array<Object>} employees 
   * @param {Array<Object>} tasks 
   * @param {Object} aiRouter 
   * @returns {Promise<Object>}
   */
  async runStandup(employees, tasks, aiRouter) {
    const messages = [];
    let summaryText = "Standup completed for all team members.\n";
    
    for (const emp of employees) {
      if (emp.status === 'working') {
        summaryText += `- ${emp.name} is working on a task.\n`;
      } else {
        summaryText += `- ${emp.name} is currently ${emp.status}.\n`;
      }
      messages.push({ sender: emp.name, text: `I am ${emp.status} right now.` });
    }

    return {
      messages,
      summary: summaryText
    };
  }

  /**
   * PM + Tech Lead break features into tasks
   * @param {Object} company 
   * @param {Array<Object>} backlogTasks 
   * @param {Object} aiRouter 
   * @returns {Promise<Array<Task>>}
   */
  async runSprintPlanning(company, backlogTasks, aiRouter) {
    const newTasks = [];
    if (!backlogTasks || backlogTasks.length === 0) {
      newTasks.push(Task.create('Setup Infrastructure', 'Initial setup', 'devops', 'P0'));
      newTasks.push(Task.create('Design UI', 'Create main wireframes', 'design', 'P1'));
    }
    return newTasks;
  }

  /**
   * Summarizes sprint
   * @param {Object} company 
   * @param {Array<Object>} completedTasks 
   * @param {Object} aiRouter 
   * @returns {Promise<Object>}
   */
  async runSprintReview(company, completedTasks, aiRouter) {
    return {
      summary: `Sprint ${company.currentSprint} finished with ${completedTasks.length} tasks completed.`,
      metrics: { completedCount: completedTasks.length },
      highlights: ["Great progress on UI design.", "Fixed critical bugs."]
    };
  }

  /**
   * Personality-flavored retro
   * @param {Array<Object>} employees 
   * @param {Object} aiRouter 
   * @returns {Promise<Object>}
   */
  async runRetrospective(employees, aiRouter) {
    return {
      goodPoints: ["Communication was excellent", "Met our deadlines"],
      improvements: ["Need fewer distractions", "Better task descriptions"],
      actionItems: ["Implement strict code reviews", "Schedule focus hours"]
    };
  }

  /**
   * Returns sprint progress
   * @param {Array<Object>} tasks 
   * @param {string|number} sprintId 
   * @returns {Object}
   */
  getSprintProgress(tasks, sprintId) {
    const sprintTasks = tasks.filter(t => t.sprintId === sprintId);
    const total = sprintTasks.length;
    const completed = sprintTasks.filter(t => t.status === 'done').length;
    const inProgress = sprintTasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length;
    const blocked = sprintTasks.filter(t => t.status === 'blocked').length;
    const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, inProgress, blocked, percentComplete };
  }
}
