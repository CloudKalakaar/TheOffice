/**
 * @module engine/workflow
 */

/**
 * Workflow class to orchestrate task flows through the company hierarchy.
 */
export class Workflow {
  /**
   * Returns array of steps a task goes through based on its type
   * @param {string} taskType 
   * @returns {Array<string>} roles in order
   */
  static getTaskFlow(taskType) {
    switch (taskType) {
      case 'feature':
        return ['product_manager', 'tech_lead', 'developer', 'tester', 'devops_engineer'];
      case 'bug':
        return ['tester', 'tech_lead', 'developer', 'tester'];
      case 'design':
        return ['product_manager', 'uiux_lead', 'designer', 'product_manager'];
      case 'test':
        return ['qa_lead', 'tester'];
      case 'docs':
        return ['product_manager', 'technical_writer', 'tech_lead'];
      case 'devops':
        return ['cto', 'devops_engineer', 'tech_lead'];
      default:
        return ['product_manager', 'developer'];
    }
  }

  /**
   * Determines the next employee and action for a task
   * @param {Object} task 
   * @param {Array<Object>} employees 
   * @returns {Object|null} { nextRole, action }
   */
  static getNextStep(task, employees) {
    const flow = Workflow.getTaskFlow(task.type);
    
    // Simplistic progression based on status
    if (task.status === 'backlog') {
      return { nextRole: flow[0], action: 'assign' };
    }
    
    if (task.status === 'in_progress') {
      // It's being worked on. We need a worker.
      // In a real flow we might track step index. We'll approximate by assignee's role.
      return null; // Next step is completion
    }

    if (task.status === 'in_review') {
      const assignee = employees.find(e => e.id === task.assigneeId);
      if (!assignee) return { nextRole: flow[flow.length - 1], action: 'review' };
      
      const currentRoleIndex = flow.indexOf(assignee.role);
      const nextRole = flow[currentRoleIndex + 1];
      
      if (nextRole) {
        return { nextRole, action: 'review' };
      }
      return { action: 'done' };
    }

    return null;
  }

  /**
   * Builds the messages array for an AI call
   * @param {Object} employee 
   * @param {Object} task 
   * @param {Object} context 
   * @returns {Array<Object>}
   */
  static buildAIMessages(employee, task, context = {}) {
    const systemPrompt = `You are playing the role of a ${employee.role} in a software company.
Your personality is: ${employee.personality}.
Company context: ${JSON.stringify(context.company || {})}
Reply concisely in character to the task.`;

    const userPrompt = `Task Title: ${task.title}
Task Description: ${task.description}
Current Output: ${task.output || 'None'}
Feedback: ${task.feedback || 'None'}

Please perform your step of the task and provide the output or feedback.`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }

  /**
   * Extracts structured output from AI response
   * @param {string} response 
   * @param {string} taskType 
   * @returns {Object}
   */
  static parseAIResponse(response, taskType) {
    // Basic extraction, assume JSON might be enclosed or plain text
    return {
      text: response,
      extracted: response.length > 0 ? response.substring(0, 200) : "Completed"
    };
  }
}
