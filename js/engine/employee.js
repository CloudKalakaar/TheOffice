/**
 * @module engine/employee
 */

export const ROLES = {
  ceo: { title: 'CEO', department: 'executive', emoji: '👔', description: 'Chief Executive Officer', aiCapabilities: ['strategy', 'leadership'] },
  cto: { title: 'CTO', department: 'executive', emoji: '🤓', description: 'Chief Technology Officer', aiCapabilities: ['architecture', 'strategy'] },
  cio: { title: 'CIO', department: 'executive', emoji: '🖥️', description: 'Chief Information Officer', aiCapabilities: ['infrastructure', 'security'] },
  program_manager: { title: 'Program Manager', department: 'management', emoji: '📊', description: 'Oversees multiple projects', aiCapabilities: ['planning', 'coordination'] },
  product_manager: { title: 'Product Manager', department: 'management', emoji: '💡', description: 'Defines product vision', aiCapabilities: ['requirements', 'user_stories'] },
  project_manager: { title: 'Project Manager', department: 'management', emoji: '📅', description: 'Keeps projects on track', aiCapabilities: ['scheduling', 'scrum'] },
  tech_lead: { title: 'Tech Lead', department: 'engineering', emoji: '👨‍💻', description: 'Leads engineering team', aiCapabilities: ['architecture', 'code_review'] },
  senior_developer: { title: 'Senior Developer', department: 'engineering', emoji: '💻', description: 'Experienced coder', aiCapabilities: ['coding', 'mentoring'] },
  developer: { title: 'Developer', department: 'engineering', emoji: '🧑‍💻', description: 'Writes code', aiCapabilities: ['coding', 'testing'] },
  qa_lead: { title: 'QA Lead', department: 'engineering', emoji: '🐛', description: 'Leads quality assurance', aiCapabilities: ['test_planning', 'automation'] },
  tester: { title: 'Tester', department: 'engineering', emoji: '🔍', description: 'Tests software', aiCapabilities: ['manual_testing', 'bug_reporting'] },
  devops_engineer: { title: 'DevOps Engineer', department: 'engineering', emoji: '🚀', description: 'Manages deployments', aiCapabilities: ['ci_cd', 'infrastructure'] },
  uiux_lead: { title: 'UI/UX Lead', department: 'design', emoji: '🎨', description: 'Leads design team', aiCapabilities: ['wireframing', 'user_research'] },
  designer: { title: 'Designer', department: 'design', emoji: '🖌️', description: 'Designs interfaces', aiCapabilities: ['ui_design', 'prototyping'] },
  technical_writer: { title: 'Technical Writer', department: 'support', emoji: '📝', description: 'Writes documentation', aiCapabilities: ['documentation', 'tutorials'] },
  networking_engineer: { title: 'Networking Engineer', department: 'engineering', emoji: '🌐', description: 'Manages network infrastructure', aiCapabilities: ['networking', 'security'] },
  data_analyst: { title: 'Data Analyst', department: 'management', emoji: '📈', description: 'Analyzes data', aiCapabilities: ['sql', 'reporting'] }
};

export const PERSONALITIES = [
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Always upbeat and positive.', traits: ['cheerful', 'energetic'], moodModifier: 1.1, productivityModifier: 1.05, chatStyle: 'uses lots of exclamation marks and emojis' },
  { id: 'deadpan', name: 'Deadpan', description: 'Shows little emotion.', traits: ['calm', 'stoic'], moodModifier: 0.9, productivityModifier: 1.0, chatStyle: 'short, direct, no emojis' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Wants everything to be flawless.', traits: ['detailed', 'anxious'], moodModifier: 0.8, productivityModifier: 1.2, chatStyle: 'detailed and critical' },
  { id: 'prankster', name: 'Prankster', description: 'Loves playing jokes.', traits: ['funny', 'distracting'], moodModifier: 1.2, productivityModifier: 0.9, chatStyle: 'makes jokes and uses sarcasm' },
  { id: 'eccentric', name: 'Eccentric', description: 'Unconventional and odd.', traits: ['creative', 'weird'], moodModifier: 1.0, productivityModifier: 1.1, chatStyle: 'uses strange metaphors' },
  { id: 'peacemaker', name: 'Peacemaker', description: 'Resolves conflicts.', traits: ['diplomatic', 'friendly'], moodModifier: 1.1, productivityModifier: 1.0, chatStyle: 'polite and accommodating' },
  { id: 'party_planner', name: 'Party Planner', description: 'Always organizing events.', traits: ['social', 'distracted'], moodModifier: 1.3, productivityModifier: 0.8, chatStyle: 'talks about food and events' },
  { id: 'know_it_all', name: 'Know-It-All', description: 'Thinks they know best.', traits: ['smart', 'arrogant'], moodModifier: 0.9, productivityModifier: 1.1, chatStyle: 'corrects others frequently' },
  { id: 'newbie', name: 'Newbie', description: 'Eager but inexperienced.', traits: ['curious', 'confused'], moodModifier: 1.0, productivityModifier: 0.7, chatStyle: 'asks lots of questions' },
  { id: 'sweetheart', name: 'Sweetheart', description: 'Kind and supportive.', traits: ['caring', 'helpful'], moodModifier: 1.2, productivityModifier: 0.9, chatStyle: 'warm and encouraging' }
];

/**
 * Employee model representing a worker in the company.
 */
export class Employee {
  /**
   * @param {Object} config 
   */
  constructor(config = {}) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name || Employee.generateRandomName();
    this.avatar = config.avatar || Employee.generateAvatar();
    this.role = config.role || 'developer';
    this.department = config.department || ROLES[this.role]?.department || 'engineering';
    this.personality = config.personality || 'deadpan';
    this.skills = config.skills || ROLES[this.role]?.aiCapabilities || [];
    this.mood = config.mood ?? 80;
    this.productivity = config.productivity ?? 80;
    this.status = config.status || 'idle'; // 'idle', 'working', 'meeting', 'break', 'blocked'
    this.currentTaskId = config.currentTaskId || null;
    this.provider = config.provider || 'default';
    this.position = config.position || { x: 0, y: 0 };
    this.hiredAt = config.hiredAt ? new Date(config.hiredAt) : new Date();
    this.terminalLogs = config.terminalLogs || [
      `[INIT] Agent ${this.name} (${this.role}) booted.`,
      `[CLI] Model Engine: ${this.provider || 'gemini'}`,
      `[HIVE] Connected to office blackboard.`
    ];
    this.mailbox = config.mailbox || {
      inbox: [],
      outbox: []
    };
    this.thought = config.thought || 'Awaiting supervisor directives...';
  }

  addTerminalLog(text) {
    const timestamp = new Date().toLocaleTimeString();
    this.terminalLogs.push(`[${timestamp}] ${text}`);
    if (this.terminalLogs.length > 50) this.terminalLogs.shift();
  }

  sendMail(toName, subject, content) {
    const msg = { id: crypto.randomUUID(), to: toName, subject, content, timestamp: Date.now() };
    this.mailbox.outbox.push(msg);
    this.addTerminalLog(`[OUTBOX] -> ${toName}: "${subject}"`);
    return msg;
  }

  receiveMail(fromName, subject, content) {
    const msg = { id: crypto.randomUUID(), from: fromName, subject, content, timestamp: Date.now() };
    this.mailbox.inbox.push(msg);
    this.addTerminalLog(`[INBOX] <- ${fromName}: "${subject}"`);
    return msg;
  }

  /**
   * Creates a new employee
   * @param {string} role 
   * @param {string} name 
   * @param {string} personality 
   * @param {string} provider 
   * @returns {Employee}
   */
  static create(role, name, personality, provider) {
    return new Employee({ role, name, personality, provider });
  }

  /**
   * Generates a random realistic name
   * @returns {string}
   */
  static generateRandomName() {
    const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  }

  /**
   * Generates a random avatar configuration
   * @returns {Object}
   */
  static generateAvatar() {
    const hairs = ['#000000', '#4a4a4a', '#8b4513', '#d2b48c', '#ffd700', '#ff4500'];
    const skins = ['#ffdfc4', '#f0d5be', '#d2b48c', '#a0522d', '#5c3317', '#3d1e0f'];
    const shirts = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];
    const accessories = ['glasses', 'hat', 'none', 'necklace', 'earrings'];
    return {
      hair: hairs[Math.floor(Math.random() * hairs.length)],
      skin: skins[Math.floor(Math.random() * skins.length)],
      shirt: shirts[Math.floor(Math.random() * shirts.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)]
    };
  }

  /**
   * Assigns a task to the employee
   * @param {string} taskId 
   */
  assignTask(taskId) {
    this.currentTaskId = taskId;
    this.setStatus('working');
  }

  /**
   * Completes the current task
   */
  completeTask() {
    this.currentTaskId = null;
    this.setStatus('idle');
  }

  /**
   * Sets the employee's status
   * @param {string} status 
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * Updates the employee's mood
   * @param {number} delta 
   */
  updateMood(delta) {
    this.mood = Math.max(0, Math.min(100, this.mood + delta));
  }

  /**
   * Updates the employee's productivity
   * @param {number} delta 
   */
  updateProductivity(delta) {
    this.productivity = Math.max(0, Math.min(100, this.productivity + delta));
  }

  /**
   * Returns formatted info for UI
   * @returns {Object}
   */
  getDisplayInfo() {
    const roleInfo = ROLES[this.role];
    const personalityInfo = PERSONALITIES.find(p => p.id === this.personality);
    return {
      name: this.name,
      title: roleInfo?.title || this.role,
      emoji: roleInfo?.emoji || '👤',
      department: this.department,
      personalityName: personalityInfo?.name || 'Unknown',
      status: this.status,
      mood: this.mood,
      productivity: this.productivity,
      avatar: this.avatar
    };
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
      name: this.name,
      avatar: this.avatar,
      role: this.role,
      department: this.department,
      personality: this.personality,
      skills: this.skills,
      mood: this.mood,
      productivity: this.productivity,
      status: this.status,
      currentTaskId: this.currentTaskId,
      provider: this.provider,
      position: this.position,
      hiredAt: this.hiredAt.toISOString(),
      terminalLogs: this.terminalLogs,
      mailbox: this.mailbox,
      thought: this.thought
    };
  }

  /**
   * Creates an Employee instance from JSON
   * @param {Object} data 
   * @returns {Employee}
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Employee(data);
  }
}
