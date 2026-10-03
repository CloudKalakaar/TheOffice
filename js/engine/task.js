/**
 * @module engine/task
 */

/**
 * Task model representing work items.
 */
export class Task {
  /**
   * @param {Object} config 
   */
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.title = config.title || 'Untitled Task';
    this.description = config.description || 'No description provided.';
    this.type = config.type || 'feature'; // 'feature'|'bug'|'design'|'test'|'docs'|'devops'|'research'|'review'
    this.status = config.status || 'backlog'; // 'backlog'|'assigned'|'in_progress'|'in_review'|'done'|'blocked'
    this.priority = config.priority || 'P2'; // 'P0'|'P1'|'P2'|'P3'
    this.assigneeId = config.assigneeId || null;
    this.reviewerId = config.reviewerId || null;
    this.createdBy = config.createdBy || null;
    this.dependencies = config.dependencies || [];
    this.output = config.output || null;
    this.feedback = config.feedback || null;
    this.estimatedHours = config.estimatedHours || 4;
    this.actualHours = config.actualHours || 0;
    this.sprintId = config.sprintId || null;
    
    const now = new Date();
    this.createdAt = config.createdAt ? new Date(config.createdAt) : now;
    this.updatedAt = config.updatedAt ? new Date(config.updatedAt) : now;
    this.completedAt = config.completedAt ? new Date(config.completedAt) : null;
  }

  /**
   * Creates a new task
   * @param {string} title 
   * @param {string} description 
   * @param {string} type 
   * @param {string} priority 
   * @param {string} createdBy 
   * @returns {Task}
   */
  static create(title, description, type = 'feature', priority = 'P2', createdBy = null) {
    return new Task({ title, description, type, priority, createdBy });
  }

  /**
   * Assigns the task to an employee
   * @param {string} employeeId 
   */
  assign(employeeId) {
    this.assigneeId = employeeId;
    this.status = 'assigned';
    this.updatedAt = new Date();
  }

  /**
   * Starts the task
   */
  start() {
    this.status = 'in_progress';
    this.updatedAt = new Date();
  }

  /**
   * Completes the task with given output
   * @param {string} output 
   */
  complete(output) {
    this.output = output;
    this.status = 'in_review';
    this.updatedAt = new Date();
  }

  /**
   * Marks task for review
   * @param {string} reviewerId 
   */
  review(reviewerId) {
    this.reviewerId = reviewerId;
    this.status = 'in_review';
    this.updatedAt = new Date();
  }

  /**
   * Approves the task
   * @param {string} feedback 
   */
  approve(feedback) {
    this.feedback = feedback;
    this.status = 'done';
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Rejects the task back to in_progress
   * @param {string} feedback 
   */
  reject(feedback) {
    this.feedback = feedback;
    this.status = 'in_progress';
    this.updatedAt = new Date();
  }

  /**
   * Blocks the task
   * @param {string} reason 
   */
  block(reason) {
    this.feedback = reason;
    this.status = 'blocked';
    this.updatedAt = new Date();
  }

  /**
   * Unblocks the task
   */
  unblock() {
    this.status = this.assigneeId ? 'in_progress' : 'backlog';
    this.updatedAt = new Date();
  }

  /**
   * Checks if all dependencies are completed
   * @param {Array<Task>} allTasks 
   * @returns {boolean}
   */
  areDependenciesMet(allTasks) {
    if (!this.dependencies || this.dependencies.length === 0) return true;
    for (const depId of this.dependencies) {
      const depTask = allTasks.find(t => t.id === depId);
      if (!depTask || depTask.status !== 'done') {
        return false;
      }
    }
    return true;
  }

  /**
   * Alias for toJSON
   */
  serialize() {
    return this.toJSON();
  }

  /**
   * Converts instance to a plain JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      priority: this.priority,
      assigneeId: this.assigneeId,
      reviewerId: this.reviewerId,
      createdBy: this.createdBy,
      dependencies: this.dependencies,
      output: this.output,
      feedback: this.feedback,
      estimatedHours: this.estimatedHours,
      actualHours: this.actualHours,
      sprintId: this.sprintId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null
    };
  }

  /**
   * Creates a Task instance from JSON
   * @param {Object} data 
   * @returns {Task}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Task(data);
  }
}
