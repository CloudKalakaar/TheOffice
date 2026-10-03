/**
 * @module engine/company
 */
import { getState, setState } from '../store/state.js';

/**
 * Company model representing the simulated software company.
 */
export class Company {
  /**
   * @param {Object} config 
   */
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name || 'Startup Inc.';
    this.founded = config.founded ? new Date(config.founded) : new Date();
    this.budget = config.budget || 1000000;
    this.projectName = config.projectName || 'New Project';
    this.projectDescription = config.projectDescription || 'A revolutionary new application.';
    this.departments = config.departments || ['executive', 'management', 'engineering', 'design', 'support'];
    this.currentSprint = config.currentSprint || 1;
    this.sprintCount = config.sprintCount || 0;
    this.status = config.status || 'setup'; // 'setup', 'running', 'paused'
  }

  /**
   * Creates a new company
   * @param {string} name 
   * @param {string} projectName 
   * @param {string} projectDescription 
   * @returns {Company}
   */
  static create(name, projectName, projectDescription) {
    return new Company({
      name,
      projectName,
      projectDescription
    });
  }

  /**
   * Returns a department object if needed. Currently departments are strings.
   * @param {string} name 
   * @returns {Object}
   */
  getDepartment(name) {
    if (this.departments.includes(name)) {
      return { name };
    }
    return null;
  }

  /**
   * Returns employees filtered by department
   * @param {string} dept 
   * @returns {Array} Array of employee objects
   */
  getEmployeesByDepartment(dept) {
    const state = getState();
    const employees = state.employees || [];
    return employees.filter(emp => emp.department === dept);
  }

  /**
   * Returns calculated metrics for the company
   * @returns {Object}
   */
  getMetrics() {
    const state = getState();
    const employees = state.employees || [];
    const tasks = state.tasks || [];
    
    const totalEmployees = employees.length;
    const tasksCompleted = tasks.filter(t => t.status === 'done').length;
    const tasksInProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length;
    
    const avgProductivity = employees.length 
      ? employees.reduce((sum, emp) => sum + emp.productivity, 0) / employees.length 
      : 0;

    const sprintTasks = tasks.filter(t => t.sprintId === this.currentSprint);
    const sprintCompleted = sprintTasks.filter(t => t.status === 'done').length;
    const sprintProgress = sprintTasks.length 
      ? Math.round((sprintCompleted / sprintTasks.length) * 100) 
      : 0;

    return {
      totalEmployees,
      tasksCompleted,
      tasksInProgress,
      productivity: Math.round(avgProductivity),
      sprintProgress
    };
  }

  /**
   * Alias for toJSON
   */
  serialize() {
    return this.toJSON();
  }

  /**
   * Converts the instance to a plain JSON object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      founded: this.founded.toISOString(),
      budget: this.budget,
      projectName: this.projectName,
      projectDescription: this.projectDescription,
      departments: this.departments,
      currentSprint: this.currentSprint,
      sprintCount: this.sprintCount,
      status: this.status
    };
  }

  /**
   * Creates a Company instance from a plain JSON object
   * @param {Object} data 
   * @returns {Company}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Company(data);
  }
}
