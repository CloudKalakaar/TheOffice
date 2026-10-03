// ============================================
// THE OFFICE — Reactive State Store
// Proxy-based reactivity + global event bus
// ============================================

/** @type {Map<string, Set<Function>>} */
const pathSubscribers = new Map();

/** @type {EventTarget} */
const eventBus = new EventTarget();

/**
 * Deep clone a value (structuredClone or fallback)
 * @param {*} value
 * @returns {*}
 */
function deepClone(value) {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value); } catch { /* fallback */ }
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * Get a nested value from an object by dot-path
 * @param {Object} obj
 * @param {string} path - Dot-separated path like 'company.name'
 * @returns {*}
 */
function getByPath(obj, path) {
  if (!path) return obj;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Set a nested value on an object by dot-path
 * @param {Object} obj
 * @param {string} path
 * @param {*} value
 */
function setByPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// ── Core State Object ──
const rawState = {
  // App-level
  initialized: false,
  currentScreen: 'setup',
  previousScreen: null,

  // Setup
  setup: {
    step: 0,
    companyName: '',
    projectName: '',
    projectDescription: '',
    providers: {} // { providerName: { apiKey, model, connected } }
  },

  // Company
  company: null, // Company object

  // Employees
  employees: [], // Employee objects

  // Tasks
  tasks: [], // Task objects

  // Projects
  projects: [], // Real software projects built by agents

  // Chat
  chat: {
    channels: {
      general: { name: 'General', icon: '📢', messages: [], unread: 0 },
      engineering: { name: 'Engineering', icon: '💻', messages: [], unread: 0 },
      standup: { name: 'Standup', icon: '🧍', messages: [], unread: 0 },
      random: { name: 'Random', icon: '🎲', messages: [], unread: 0 }
    },
    activeChannel: 'general',
    directMessages: {} // { recipientId: { messages: [], unread: 0 } }
  },

  // Game
  game: {
    isRunning: false,
    speed: 1,
    currentTick: 0,
    currentDay: 1,
    currentHour: 9,
    eventsLog: [],
    sprintNumber: 1
  },

  // Dashboard
  dashboard: {
    tasksCompleted: 0,
    totalApiCalls: 0,
    totalTokensUsed: 0,
    productivityHistory: []
  },

  // UI
  ui: {
    activePanel: null,
    activePanelData: null,
    activeModal: null,
    activeModalData: null
  }
};

/**
 * Notify all subscribers whose path matches or is a parent/child of the changed path
 * @param {string} changedPath
 */
function notifySubscribers(changedPath) {
  for (const [subscribedPath, callbacks] of pathSubscribers) {
    // Notify if exact match, or if one is a prefix of the other
    if (
      subscribedPath === changedPath ||
      subscribedPath === '*' ||
      changedPath.startsWith(subscribedPath + '.') ||
      subscribedPath.startsWith(changedPath + '.')
    ) {
      const value = getByPath(rawState, subscribedPath === '*' ? '' : subscribedPath);
      callbacks.forEach(cb => {
        try { cb(value, subscribedPath); } catch (e) { console.error('[State] Subscriber error:', e); }
      });
    }
  }
}

/**
 * Get the current state (or a nested path)
 * @param {string} [path] - Optional dot-path
 * @returns {*}
 */
export function getState(path) {
  if (path) return getByPath(rawState, path);
  return rawState;
}

/**
 * Set a value at a dot-path and notify subscribers
 * @param {string} path - Dot-separated path
 * @param {*} value - New value
 */
export function setState(path, value) {
  const oldValue = getByPath(rawState, path);
  if (oldValue === value) return; // No change
  setByPath(rawState, path, value);
  notifySubscribers(path);
}

/**
 * Update state with a partial object merge at a path, or root-level partial object
 * @param {string|Object} pathOrPartial
 * @param {Object} [partial]
 */
export function mergeState(pathOrPartial, partial) {
  if (typeof pathOrPartial === 'object' && pathOrPartial !== null && partial === undefined) {
    for (const [key, val] of Object.entries(pathOrPartial)) {
      mergeState(key, val);
    }
    return;
  }
  const path = pathOrPartial;
  const current = getByPath(rawState, path);
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    Object.assign(current, partial);
  } else {
    setByPath(rawState, path, partial);
  }
  notifySubscribers(path);
}

/**
 * Push an item to an array at a path
 * @param {string} path
 * @param {*} item
 */
export function pushState(path, item) {
  const arr = getByPath(rawState, path);
  if (Array.isArray(arr)) {
    arr.push(item);
    notifySubscribers(path);
  } else {
    console.warn(`[State] pushState: ${path} is not an array`);
  }
}

/**
 * Subscribe to state changes at a path
 * @param {string} path - Dot-path to watch (use '*' for all changes)
 * @param {Function} callback - Called with (newValue, path)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(path, callback) {
  if (!pathSubscribers.has(path)) {
    pathSubscribers.set(path, new Set());
  }
  pathSubscribers.get(path).add(callback);

  return () => {
    const set = pathSubscribers.get(path);
    if (set) {
      set.delete(callback);
      if (set.size === 0) pathSubscribers.delete(path);
    }
  };
}

/**
 * Emit a global event
 * @param {string} eventName
 * @param {*} [data]
 */
export function emit(eventName, data) {
  eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}

/**
 * Listen for a global event
 * @param {string} eventName
 * @param {Function} callback - Called with event.detail
 * @returns {Function} Unlisten function
 */
export function on(eventName, callback) {
  const handler = (e) => callback(e.detail);
  eventBus.addEventListener(eventName, handler);
  return () => eventBus.removeEventListener(eventName, handler);
}

/**
 * One-time event listener
 * @param {string} eventName
 * @param {Function} callback
 */
export function once(eventName, callback) {
  const handler = (e) => {
    callback(e.detail);
    eventBus.removeEventListener(eventName, handler);
  };
  eventBus.addEventListener(eventName, handler);
}

/**
 * Reset the entire state to defaults (for new game)
 */
export function resetState() {
  const defaults = {
    initialized: false,
    currentScreen: 'setup',
    previousScreen: null,
    setup: { step: 0, companyName: '', projectName: '', projectDescription: '', providers: {} },
    company: null,
    employees: [],
    tasks: [],
    projects: [],
    chat: {
      channels: {
        general: { name: 'General', icon: '📢', messages: [], unread: 0 },
        engineering: { name: 'Engineering', icon: '💻', messages: [], unread: 0 },
        standup: { name: 'Standup', icon: '🧍', messages: [], unread: 0 },
        random: { name: 'Random', icon: '🎲', messages: [], unread: 0 }
      },
      activeChannel: 'general',
      directMessages: {}
    },
    game: { isRunning: false, speed: 1, currentTick: 0, currentDay: 1, currentHour: 9, eventsLog: [], sprintNumber: 1 },
    dashboard: { tasksCompleted: 0, totalApiCalls: 0, totalTokensUsed: 0, productivityHistory: [] },
    ui: { activePanel: null, activePanelData: null, activeModal: null, activeModalData: null }
  };
  Object.assign(rawState, defaults);
  notifySubscribers('');
}

export default { getState, setState, mergeState, pushState, subscribe, emit, on, once, resetState };
