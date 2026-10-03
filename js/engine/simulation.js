/**
 * @module engine/simulation
 */
import { getState, setState, on } from '../store/state.js';
import { Company } from './company.js';
import { Employee } from './employee.js';
import { Task } from './task.js';
import { GameClock } from './tick.js';
import { Workflow } from './workflow.js';
import { ScrumMaster } from './scrum.js';
import { OfficeEvents } from './events.js';

export class Simulation {
  constructor(aiRouter) {
    this.company = null;
    this.employees = [];
    this.tasks = [];
    this.clock = new GameClock();
    this.aiRouter = aiRouter;
    this.isInitialized = false;
    this.scrumMaster = new ScrumMaster();

    on('tick', (tickData) => this.onTick(tickData));
  }

  /**
   * Initialize simulation from saved or new data
   * @param {Object} companyData 
   * @param {Array<Object>} employeesData 
   */
  async initialize(companyData, employeesData) {
    this.company = Company.fromJSON(companyData);
    this.employees = (employeesData || []).map(e => Employee.fromJSON(e));
    
    const stateTasks = getState().tasks || [];
    this.tasks = stateTasks.map(t => Task.fromJSON(t));

    this.isInitialized = true;
    setState('company', this.company.toJSON());
    setState('employees', this.employees.map(e => e.toJSON()));
    setState('tasks', this.tasks.map(t => t.toJSON()));
  }

  /**
   * Main tick handler
   * @param {Object} tickData 
   */
  async onTick(tickData) {
    if (!this.isInitialized) return;

    // 1. Trigger random events occasionally
    const event = OfficeEvents.rollForEvent(tickData.tick);
    if (event) {
      const result = OfficeEvents.applyEvent(event, this.employees);
      // Event log or toast could be emitted here
    }

    // 2. Check each employee's status and assign tasks
    this.assignTasks();

    // 3. For working employees, process work
    for (const emp of this.employees) {
      if (emp.status === 'working' && emp.currentTaskId) {
        const task = this.tasks.find(t => t.id === emp.currentTaskId);
        if (task) {
          // Simulate some time passed. If time is up, make AI call and complete
          task.actualHours += 1;
          if (task.actualHours >= task.estimatedHours) {
            await this.executeEmployeeWork(emp, task);
          }
        } else {
          emp.completeTask(); // Task missing or completed
        }
      }
    }

    // 8. Save state
    this.save();
  }

  /**
   * Make the actual AI call for an employee working on a task
   * @param {Employee} employee 
   * @param {Task} task 
   */
  async executeEmployeeWork(employee, task) {
    const messages = Workflow.buildAIMessages(employee, task, { company: this.company });
    
    try {
      const aiResponse = await this.aiRouter.route(messages, employee.provider);
      const parsed = Workflow.parseAIResponse(aiResponse, task.type);
      
      task.complete(parsed.text);
      employee.completeTask();
      
      // Update moods/productivity
      employee.updateMood(2);
      employee.updateProductivity(1);
    } catch (error) {
      console.error('AI Call failed', error);
      task.block('AI generation failed');
      employee.completeTask();
      employee.updateMood(-5);
    }
  }

  /**
   * Auto-assigns unassigned tasks to idle employees
   */
  assignTasks() {
    const idleEmployees = this.employees.filter(e => e.status === 'idle');
    if (idleEmployees.length === 0) return;

    const unassignedTasks = this.tasks.filter(t => t.status === 'backlog' && t.areDependenciesMet(this.tasks));

    for (const task of unassignedTasks) {
      const step = Workflow.getNextStep(task, this.employees);
      if (step && step.action === 'assign') {
        const candidate = idleEmployees.find(e => e.role === step.nextRole);
        if (candidate) {
          task.assign(candidate.id);
          candidate.assignTask(task.id);
          idleEmployees.splice(idleEmployees.indexOf(candidate), 1);
        }
      }
      if (idleEmployees.length === 0) break;
    }
  }

  /**
   * Returns full simulation status
   * @returns {Object}
   */
  getStatus() {
    return {
      company: this.company ? this.company.toJSON() : null,
      employees: this.employees.map(e => e.toJSON()),
      tasks: this.tasks.map(t => t.toJSON()),
      clock: {
        tick: this.clock.currentTick,
        timeDisplay: this.clock.getTimeDisplay(),
        speed: this.clock.speed,
        isRunning: this.clock.isRunning
      }
    };
  }

  pause() {
    this.clock.pause();
  }

  resume() {
    this.clock.resume();
  }

  async save() {
    setState('company', this.company.toJSON());
    setState('employees', this.employees.map(e => e.toJSON()));
    setState('tasks', this.tasks.map(t => t.toJSON()));
  }

  async load() {
    const state = getState();
    await this.initialize(state.company, state.employees);
    this.tasks = (state.tasks || []).map(t => Task.fromJSON(t));
  }
}
