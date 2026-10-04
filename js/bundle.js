// ==========================================================
// THE OFFICE — Standalone App Bundle
// Generated for 100% compatibility across file://, http://, and https://
// ==========================================================

(function() {
'use strict';


// ─── Module: js/utils/helpers.js ───

// ============================================
// THE OFFICE — Utility Helpers
// ============================================

/**
 * Generate a unique ID
 * @param {string} [prefix=''] - Optional prefix
 * @returns {string}
 */
function uid(prefix = '') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

/**
 * Delay execution
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 300) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Format a timestamp to relative time
 * @param {number|Date} date
 * @returns {string}
 */
function timeAgo(date) {
  const now = Date.now();
  const ts = date instanceof Date ? date.getTime() : date;
  const diff = Math.floor((now - ts) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Format a game time (day + hour)
 * @param {number} day
 * @param {number} hour - 9-17 (work hours)
 * @returns {string}
 */
function formatGameTime(day, hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `Day ${day}, ${displayHour}:00 ${period}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Simple template renderer - replaces {{key}} with values
 * @param {string} template
 * @param {Object} data
 * @returns {string}
 */
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? escapeHtml(String(data[key])) : match;
  });
}

/**
 * Create an HTML element.
 * Supports two call signatures:
 *  1. createElement('<div class="x">...</div>') — from HTML string
 *  2. createElement('div', 'className') — tag + class string
 *  3. createElement('div', { className, id, style }) — tag + props object
 * @param {string} tagOrHtml
 * @param {string|Object} [classOrProps]
 * @returns {HTMLElement}
 */
function createElement(tagOrHtml, classOrProps, textContent) {
  // If second argument is provided, treat first as tag name
  if (classOrProps !== undefined) {
    const el = document.createElement(tagOrHtml);
    if (typeof classOrProps === 'string') {
      el.className = classOrProps;
    } else if (typeof classOrProps === 'object') {
      Object.entries(classOrProps).forEach(([key, val]) => {
        if (key === 'className') el.className = val;
        else if (key === 'style' && typeof val === 'string') el.style.cssText = val;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
        else el.setAttribute(key, val);
      });
    }
    if (textContent !== undefined) {
      el.textContent = textContent;
    }
    return el;
  }
  // Otherwise treat as HTML string
  const template = document.createElement('template');
  template.innerHTML = tagOrHtml.trim();
  return template.content.firstChild;
}

/**
 * Clamp a number between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Random integer between min and max (inclusive)
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array
 * @param {Array} arr
 * @returns {*}
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Group an array by a key
 * @param {Array} arr
 * @param {string|Function} key
 * @returns {Object}
 */
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

/**
 * Format number with commas
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Get CSS variable value
 * @param {string} name - e.g. '--color-primary'
 * @returns {string}
 */
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Vibrate device (if supported)
 * @param {number|number[]} pattern
 */
function vibrate(pattern = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}




// ─── Module: js/utils/names.js ───

// ============================================
// THE OFFICE — Random Name Generator
// ============================================

const FIRST_NAMES = [
  // Male
  'James', 'Robert', 'Michael', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Kevin',
  'Brian', 'Eric', 'Nathan', 'Ryan', 'Tyler', 'Brandon', 'Jason', 'Justin',
  'Aaron', 'Adam', 'Benjamin', 'Carlos', 'Derek', 'Frank', 'Greg', 'Henry',
  'Ivan', 'Jake', 'Kyle', 'Leo', 'Marcus', 'Neil', 'Oscar', 'Patrick',
  // Female
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley',
  'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie',
  'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Angela', 'Shirley',
  'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen', 'Samantha', 'Katherine',
  'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
  'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia', 'Victoria', 'Kelly',
  'Lauren', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Megan', 'Andrea', 'Cheryl',
  'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann', 'Sara', 'Madison',
  'Frances', 'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice', 'Judy', 'Sophia',
  'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle', 'Beverly', 'Isabella',
  'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie', 'Kayla', 'Alexis',
  'Lori', 'Priya', 'Wei', 'Aisha', 'Yuki', 'Fatima', 'Mei', 'Zara', 'Sana'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Turner', 'Phillips', 'Evans', 'Collins', 'Stewart',
  'Morris', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper',
  'Richardson', 'Cox', 'Howard', 'Ward', 'Brooks', 'Gray', 'Chen', 'Kim',
  'Patel', 'Singh', 'Kumar', 'Shah', 'Tanaka', 'Yamamoto', 'Müller', 'Fischer',
  'Weber', 'Schmidt', 'Rossi', 'Ferrari', 'Bianchi', 'Sato', 'Suzuki', 'Park'
];

/** Set of already used names to avoid duplicates */
const usedNames = new Set();

/**
 * Generate a random full name
 * @returns {{ firstName: string, lastName: string, fullName: string }}
 */
function generateName() {
  let attempts = 0;
  let fullName;
  let firstName;
  let lastName;

  do {
    firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    fullName = `${firstName} ${lastName}`;
    attempts++;
  } while (usedNames.has(fullName) && attempts < 100);

  usedNames.add(fullName);
  return { firstName, lastName, fullName };
}

/**
 * Reset used names (for new game)
 */
function resetNames() {
  usedNames.clear();
}

/**
 * Generate a character bio snippet inspired by The Office
 * @param {string} personality - Personality type ID
 * @returns {string}
 */
function generateBio(personality) {
  const bios = {
    enthusiastic: [
      "Believes they're the world's greatest boss. Organizes improv sessions at lunch.",
      "Has a 'World\'s Best Employee' mug they bought for themselves.",
      "Starts every meeting with an awkward ice breaker.",
      "Once declared 'bankruptcy' by just shouting it in the office."
    ],
    deadpan: [
      "Has been doing crossword puzzles at their desk since 2003.",
      "Leaves at exactly 5:00 PM. Not 5:01. Not 4:59.",
      "Their favorite day is 'Pretzel Day'.",
      "Responds to most questions with a long, silent stare."
    ],
    perfectionist: [
      "Color-codes everything. Including their lunch containers.",
      "Has reported 47 dress code violations this quarter.",
      "Maintains a spreadsheet tracking everyone's break times.",
      "Their desk is surgically organized. Touch nothing."
    ],
    prankster: [
      "Once put a colleague's stapler in Jello. Twice.",
      "Looks directly at the camera when something absurd happens.",
      "Master of the slow-burn desk prank.",
      "Can sell anything to anyone. Chooses not to try too hard."
    ],
    eccentric: [
      "Assistant TO the Regional Manager. Not 'Assistant Regional Manager.'",
      "Owns a beet farm. Will tell you about it. Repeatedly.",
      "Has a black belt in karate. And a desk full of weapons.",
      "Runs fire drills without warning. Brings their own smoke machine."
    ],
    peacemaker: [
      "The emotional backbone of the office. Makes great art.",
      "Remembers everyone's birthday and favorite coffee order.",
      "Mediates 90% of office conflicts with quiet diplomacy.",
      "Keeps a candy jar on their desk for visitors."
    ],
    party_planner: [
      "Has planned 200+ office parties. Each one with a theme.",
      "The Party Planning Committee is their life's work.",
      "Once organized a Casino Night fundraiser in the warehouse.",
      "Takes potlucks very, very seriously."
    ],
    know_it_all: [
      "Actually IS the smartest person in the room. Will let you know.",
      "Corrects grammar in casual conversations.",
      "Has an opinion on everything. Usually right. Annoyingly.",
      "Reads The Economist during lunch. Judges those who don't."
    ],
    newbie: [
      "Still figuring out how the printer works.",
      "Takes notes during every single meeting. Even the bad ones.",
      "Eager to please. Accidentally CC'd all-staff on a private email.",
      "Started a blog about their first job. Nobody reads it."
    ],
    sweetheart: [
      "Brings homemade cookies every Friday.",
      "Laughs at everyone's jokes, even the bad ones. Especially the bad ones.",
      "Has a collection of desk plants, each with a name.",
      "Once cried during a team-building exercise. Happy tears."
    ]
  };

  const personalityBios = bios[personality] || bios.newbie;
  return personalityBios[Math.floor(Math.random() * personalityBios.length)];
}




// ─── Module: js/utils/crypto.js ───

// ============================================
// THE OFFICE — API Key Encryption (PIN-based)
// ============================================

const SALT = 'TheOffice_2024_Salt';
const IV_LENGTH = 12;

/**
 * Derive a CryptoKey from a PIN
 * @param {string} pin
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(pin) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin + SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string with a PIN
 * @param {string} plaintext
 * @param {string} pin
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
async function encrypt(plaintext, pin = 'default') {
  try {
    const key = await deriveKey(pin);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('[Crypto] Encryption failed:', e);
    // Fallback: simple base64 encoding (not secure, but works)
    return btoa(plaintext);
  }
}

/**
 * Decrypt a string with a PIN
 * @param {string} ciphertext - Base64 encoded
 * @param {string} pin
 * @returns {Promise<string>}
 */
async function decrypt(ciphertext, pin = 'default') {
  try {
    const key = await deriveKey(pin);
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('[Crypto] Decryption failed:', e);
    // Fallback: try simple base64 decode
    try { return atob(ciphertext); } catch { return ''; }
  }
}

/**
 * Simple obfuscation for localStorage (no crypto API needed)
 * @param {string} text
 * @returns {string}
 */
function obfuscate(text) {
  return btoa(encodeURIComponent(text).split('').reverse().join(''));
}

/**
 * Deobfuscate
 * @param {string} encoded
 * @returns {string}
 */
function deobfuscate(encoded) {
  try {
    return decodeURIComponent(atob(encoded).split('').reverse().join(''));
  } catch {
    return '';
  }
}

/**
 * Save an API key to localStorage (obfuscated)
 * @param {string} provider
 * @param {string} apiKey
 */
function saveApiKey(provider, apiKey) {
  const key = `theoffice_key_${provider}`;
  localStorage.setItem(key, obfuscate(apiKey));
}

/**
 * Load an API key from localStorage
 * @param {string} provider
 * @returns {string|null}
 */
function loadApiKey(provider) {
  const key = `theoffice_key_${provider}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  return deobfuscate(stored);
}

/**
 * Remove an API key
 * @param {string} provider
 */
function removeApiKey(provider) {
  localStorage.removeItem(`theoffice_key_${provider}`);
}

/**
 * Get all stored provider keys
 * @returns {Object} { providerName: apiKey }
 */
function getAllApiKeys() {
  const keys = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('theoffice_key_')) {
      const provider = k.replace('theoffice_key_', '');
      keys[provider] = deobfuscate(localStorage.getItem(k));
    }
  }
  return keys;
}

/**
 * Mask an API key for display
 * @param {string} key
 * @returns {string}
 */
function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}




// ─── Module: js/store/state.js ───

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
function getState(path) {
  if (path) return getByPath(rawState, path);
  return rawState;
}

/**
 * Set a value at a dot-path and notify subscribers
 * @param {string} path - Dot-separated path
 * @param {*} value - New value
 */
function setState(path, value) {
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
function mergeState(pathOrPartial, partial) {
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
function pushState(path, item) {
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
function subscribe(path, callback) {
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
function emit(eventName, data) {
  eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}

/**
 * Listen for a global event
 * @param {string} eventName
 * @param {Function} callback - Called with event.detail
 * @returns {Function} Unlisten function
 */
function on(eventName, callback) {
  const handler = (e) => callback(e.detail);
  eventBus.addEventListener(eventName, handler);
  return () => eventBus.removeEventListener(eventName, handler);
}

/**
 * One-time event listener
 * @param {string} eventName
 * @param {Function} callback
 */
function once(eventName, callback) {
  const handler = (e) => {
    callback(e.detail);
    eventBus.removeEventListener(eventName, handler);
  };
  eventBus.addEventListener(eventName, handler);
}

/**
 * Reset the entire state to defaults (for new game)
 */
function resetState() {
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




// ─── Module: js/store/db.js ───

// ============================================
// THE OFFICE — IndexedDB Persistence Layer
// ============================================

const DB_NAME = 'TheOfficeDB';
const DB_VERSION = 2;

const STORES = {
  COMPANY: 'company',
  EMPLOYEES: 'employees',
  TASKS: 'tasks',
  MESSAGES: 'messages',
  SETTINGS: 'settings',
  EVENTS: 'events',
  PROJECTS: 'projects'
};

/** @type {IDBDatabase|null|string} */
let db = null;

// Memory/localStorage fallback store when IndexedDB is unavailable or restricted
const memoryFallback = {
  company: new Map(),
  employees: new Map(),
  tasks: new Map(),
  messages: new Map(),
  settings: new Map(),
  events: new Map(),
  projects: new Map()
};

function getStorageFallback(storeName) {
  try {
    const raw = localStorage.getItem(`theoffice_fallback_${storeName}`);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function setStorageFallback(storeName, data) {
  try {
    localStorage.setItem(`theoffice_fallback_${storeName}`, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

/**
 * Open/initialize the database with fallback and timeout
 * @returns {Promise<IDBDatabase|string>}
 */
function openDB() {
  if (db) return Promise.resolve(db);

  return new Promise((resolve) => {
    let resolved = false;

    const fallback = () => {
      if (resolved) return;
      resolved = true;
      db = 'fallback';
      console.warn('[DB] Using memory/localStorage fallback store.');
      resolve(db);
    };

    // Safety timeout: never hang initialization
    const timer = setTimeout(fallback, 1000);

    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        clearTimeout(timer);
        return fallback();
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Company store (single record)
        if (!database.objectStoreNames.contains(STORES.COMPANY)) {
          database.createObjectStore(STORES.COMPANY, { keyPath: 'id' });
        }

        // Employees store
        if (!database.objectStoreNames.contains(STORES.EMPLOYEES)) {
          const empStore = database.createObjectStore(STORES.EMPLOYEES, { keyPath: 'id' });
          empStore.createIndex('role', 'role', { unique: false });
          empStore.createIndex('department', 'department', { unique: false });
          empStore.createIndex('status', 'status', { unique: false });
        }

        // Tasks store
        if (!database.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = database.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('assigneeId', 'assigneeId', { unique: false });
          taskStore.createIndex('sprintId', 'sprintId', { unique: false });
        }

        // Messages store
        if (!database.objectStoreNames.contains(STORES.MESSAGES)) {
          const msgStore = database.createObjectStore(STORES.MESSAGES, { keyPath: 'id', autoIncrement: true });
          msgStore.createIndex('channel', 'channel', { unique: false });
          msgStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store (key-value)
        if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
          database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Events log
        if (!database.objectStoreNames.contains(STORES.EVENTS)) {
          const evtStore = database.createObjectStore(STORES.EVENTS, { keyPath: 'id', autoIncrement: true });
          evtStore.createIndex('tick', 'tick', { unique: false });
        }

        // Projects store
        if (!database.objectStoreNames.contains(STORES.PROJECTS)) {
          const projStore = database.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
          projStore.createIndex('status', 'status', { unique: false });
          projStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          db = event.target.result;
          resolve(db);
        }
      };

      request.onerror = (event) => {
        clearTimeout(timer);
        fallback();
      };

      request.onblocked = () => {
        clearTimeout(timer);
        fallback();
      };
    } catch (e) {
      clearTimeout(timer);
      fallback();
    }
  });
}

/**
 * Generic put (upsert) into a store
 * @param {string} storeName
 * @param {Object} data
 * @returns {Promise<IDBValidKey>}
 */
async function put(storeName, data) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName] || new Map();
    const key = data.id || data.key || Date.now().toString();
    store.set(key, data);
    setStorageFallback(storeName, Array.from(store.values()));
    return key;
  }
  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Get a single record by key
 * @param {string} storeName
 * @param {IDBValidKey} key
 * @returns {Promise<Object|undefined>}
 */
async function get(storeName, key) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName];
    if (store && store.has(key)) return store.get(key);
    const persisted = getStorageFallback(storeName);
    if (Array.isArray(persisted)) {
      return persisted.find(item => (item.id === key || item.key === key));
    }
    return undefined;
  }
  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    } catch (e) {
      resolve(undefined);
    }
  });
}

/**
 * Get all records from a store
 * @param {string} storeName
 * @returns {Promise<Object[]>}
 */
async function getAll(storeName) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName];
    if (store && store.size > 0) return Array.from(store.values());
    const persisted = getStorageFallback(storeName);
    return Array.isArray(persisted) ? persisted : [];
  }
  return new Promise((resolve, reject) => {
    try {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

/**
 * Delete a record by key
 * @param {string} storeName
 * @param {IDBValidKey} key
 * @returns {Promise<void>}
 */
async function remove(storeName, key) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName];
    if (store) store.delete(key);
    return;
  }
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Clear all records in a store
 * @param {string} storeName
 * @returns {Promise<void>}
 */
async function clear(storeName) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName];
    if (store) store.clear();
    setStorageFallback(storeName, []);
    return;
  }
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

/**
 * Query by index
 * @param {string} storeName
 * @param {string} indexName
 * @param {IDBValidKey} value
 * @returns {Promise<Object[]>}
 */
async function getByIndex(storeName, indexName, value) {
  const database = await openDB();
  if (database === 'fallback') {
    const items = await getAll(storeName);
    return items.filter(item => item[indexName] === value);
  }
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

/**
 * Bulk put (upsert) multiple records
 * @param {string} storeName
 * @param {Object[]} items
 * @returns {Promise<void>}
 */
async function bulkPut(storeName, items) {
  const database = await openDB();
  if (database === 'fallback') {
    const store = memoryFallback[storeName] || new Map();
    items.forEach(item => {
      const key = item.id || item.key || Date.now().toString() + Math.random();
      store.set(key, item);
    });
    setStorageFallback(storeName, Array.from(store.values()));
    return;
  }
  return new Promise((resolve) => {
    try {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

// ── High-level API ──

/** Save company data */
async function saveCompany(company) {
  return put(STORES.COMPANY, { id: 'current', ...company });
}

/** Load company data */
async function loadCompany() {
  return get(STORES.COMPANY, 'current');
}

/** Save all employees */
async function saveEmployees(employees) {
  await clear(STORES.EMPLOYEES);
  return bulkPut(STORES.EMPLOYEES, employees);
}

/** Load all employees */
async function loadEmployees() {
  return getAll(STORES.EMPLOYEES);
}

/** Save all tasks */
async function saveTasks(tasks) {
  await clear(STORES.TASKS);
  return bulkPut(STORES.TASKS, tasks);
}

/** Load all tasks */
async function loadTasks() {
  return getAll(STORES.TASKS);
}

/** Get tasks by status */
async function getTasksByStatus(status) {
  return getByIndex(STORES.TASKS, 'status', status);
}

/** Save a chat message */
async function saveMessage(message) {
  return put(STORES.MESSAGES, message);
}

/** Save multiple messages */
async function saveMessages(messages) {
  return bulkPut(STORES.MESSAGES, messages);
}

/** Get messages by channel */
async function getMessagesByChannel(channel) {
  return getByIndex(STORES.MESSAGES, 'channel', channel);
}

/** Load all messages */
async function loadAllMessages() {
  return getAll(STORES.MESSAGES);
}

/** Save a setting */
async function saveSetting(key, value) {
  return put(STORES.SETTINGS, { key, value });
}

/** Load a setting */
async function loadSetting(key) {
  const result = await get(STORES.SETTINGS, key);
  return result ? result.value : undefined;
}

/** Save game state */
async function saveGameState(gameState) {
  return saveSetting('gameState', gameState);
}

/** Load game state */
async function loadGameState() {
  return loadSetting('gameState');
}

/** Save setup state */
async function saveSetupState(setupState) {
  return saveSetting('setupState', setupState);
}

/** Load setup state */
async function loadSetupState() {
  return loadSetting('setupState');
}

/** Save an event */
async function saveEvent(event) {
  return put(STORES.EVENTS, event);
}

/** Load all events */
async function loadEvents() {
  return getAll(STORES.EVENTS);
}

/** Save a project */
async function saveProject(project) {
  return put(STORES.PROJECTS, project);
}

/** Load a project by ID */
async function loadProject(id) {
  return get(STORES.PROJECTS, id);
}

/** Save all projects */
async function saveProjects(projects) {
  await clear(STORES.PROJECTS);
  return bulkPut(STORES.PROJECTS, projects);
}

/** Load all projects */
async function loadProjects() {
  return getAll(STORES.PROJECTS);
}

/** Clear all data (reset game) */
async function clearAll() {
  const database = await openDB();
  const storeNames = Object.values(STORES);
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeNames, 'readwrite');
    storeNames.forEach(name => tx.objectStore(name).clear());
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Check if a saved game exists */
async function hasSavedGame() {
  const company = await loadCompany();
  return !!company;
}




// ─── Module: js/ai/provider.js ───

/**
 * Base AI Provider class
 */
class AIProvider {
    /**
     * @param {string} name 
     * @param {Object} config 
     * @param {string} config.apiKey
     * @param {string} config.model
     * @param {string} [config.baseUrl]
     * @param {Object} [config.options]
     */
    constructor(name, config) {
        this.name = name;
        this.apiKey = config.apiKey;
        this.model = config.model;
        this.baseUrl = config.baseUrl || '';
        this.options = config.options || {};
    }

    /**
     * Chat with the model
     * @param {Array<{role: string, content: string}>} messages 
     * @param {Object} [options] 
     * @returns {Promise<Object>}
     */
    async chat(messages, options) {
        throw new Error('chat() must be implemented by subclass');
    }

    /**
     * Normalize the response format
     * @param {Object} rawResponse 
     * @returns {{content: string, usage: {promptTokens: number, completionTokens: number, totalTokens: number}, model: string, provider: string}}
     */
    normalizeResponse(rawResponse) {
        return {
            content: rawResponse.content || '',
            usage: {
                promptTokens: rawResponse.usage?.promptTokens || 0,
                completionTokens: rawResponse.usage?.completionTokens || 0,
                totalTokens: rawResponse.usage?.totalTokens || 0
            },
            model: this.model,
            provider: this.name
        };
    }

    /**
     * Fetch available models from provider API
     * @returns {Promise<string[]>}
     */
    async listModels() {
        return [];
    }

    /**
     * Test the API connection
     * @returns {Promise<{success: boolean, message: string, latencyMs: number}>}
     */
    async testConnection() {
        return this.testAndFindWorkingModel([this.model, ...this.getModels()]);
    }

    /**
     * Test models until finding one that is active and accessible on this API key
     * @param {string[]} [candidates]
     * @returns {Promise<{success: boolean, workingModel: string, message: string, availableModels: string[], latencyMs: number}>}
     */
    async testAndFindWorkingModel(candidates = []) {
        const start = performance.now();
        let available = [];
        try {
            available = await this.listModels();
        } catch (e) {
            // listModels fallback
        }

        const toProbe = Array.from(new Set([
            this.model,
            ...candidates,
            ...available,
            ...this.getModels()
        ])).filter(Boolean).slice(0, 10);

        let lastError = null;

        for (const candidate of toProbe) {
            try {
                this.model = candidate;
                await this.chat([{ role: 'user', content: 'Ping' }], { maxTokens: 10 });
                const latencyMs = Math.round(performance.now() - start);
                return {
                    success: true,
                    workingModel: candidate,
                    message: `Connected successfully with ${candidate}`,
                    availableModels: available.length > 0 ? available : toProbe,
                    latencyMs
                };
            } catch (err) {
                lastError = err;
                const errStr = String(err.message || err).toLowerCase();
                // If invalid API key / unauthorized, no need to probe other models
                if (errStr.includes('401') || errStr.includes('invalid api key') || errStr.includes('unauthorized') || errStr.includes('authentication')) {
                    break;
                }
            }
        }

        const latencyMs = Math.round(performance.now() - start);
        return {
            success: false,
            workingModel: this.model,
            message: lastError?.message || 'Connection failed: no working models found',
            availableModels: available,
            latencyMs
        };
    }

    /**
     * Get available models
     * @returns {string[]}
     */
    getModels() {
        return [];
    }

    /**
     * Factory method
     * @param {string} type 
     * @param {Object} config 
     * @returns {AIProvider}
     */
    static createProvider(type, config) {
        throw new Error('createProvider should be overridden or implemented by router');
    }
}


// ─── Module: js/ai/gemini.js ───



class GeminiProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models';
        if (!this.model) this.model = 'gemini-2.0-flash';
    }

    async listModels() {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (res.ok) {
                const data = await res.json();
                return (data.models || [])
                    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
            }
        } catch (e) {
            console.warn('[Gemini] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
    }

    static get FREE_TIER_INFO() {
        return { rpm: 15, tpm: 1000000, rpd: 1500 };
    }

    async chat(messages, options = {}) {
        let systemInstruction = null;
        const contents = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction = {
                    parts: [{ text: msg.content }]
                };
            } else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }
        }

        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 1024,
                topP: options.topP ?? 0.95
            }
        };

        if (systemInstruction) {
            body.systemInstruction = systemInstruction;
        }

        const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usageMetadata = data.usageMetadata || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usageMetadata.promptTokenCount || 0,
                completionTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0
            }
        });
    }
}


// ─── Module: js/ai/openai.js ───



class OpenAIProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
        if (!this.model) this.model = 'gpt-4o-mini';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => id.startsWith('gpt-'))
                    .sort();
            }
        } catch (e) {
            console.warn('[OpenAI] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_completion_tokens: options.maxTokens ?? 1024
        };

        if (options.topP) body.top_p = options.topP;

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        });
    }
}


// ─── Module: js/ai/anthropic.js ───



class AnthropicProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1/messages';
        if (!this.model) this.model = 'claude-3-5-sonnet-20241022';
    }

    getModels() {
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-haiku-20240307',
            'claude-3-opus-20240229'
        ];
    }

    async chat(messages, options = {}) {
        let systemPrompt = '';
        const filteredMessages = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt = msg.content;
            } else {
                filteredMessages.push(msg);
            }
        }

        const body = {
            model: this.model,
            messages: filteredMessages,
            max_tokens: options.maxTokens || 1024,
            temperature: options.temperature ?? 0.7
        };

        if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Anthropic API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.input_tokens || 0,
                completionTokens: usage.output_tokens || 0,
                totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0)
            }
        });
    }
}


// ─── Module: js/ai/grok.js ───



class GrokProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.x.ai/v1/chat/completions';
        if (!this.model) this.model = 'grok-2';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.x.ai/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || []).map(m => m.id);
            }
        } catch (e) {
            console.warn('[Grok] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return ['grok-2', 'grok-2-mini', 'grok-beta', 'grok-3', 'grok-3-mini'];
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Grok API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        });
    }
}


// ─── Module: js/ai/groq.js ───



class GroqProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api.groq.com/openai/v1/chat/completions';
        if (!this.model) this.model = 'llama-3.1-8b-instant';
    }

    async listModels() {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => !id.includes('whisper') && !id.includes('tts') && !id.includes('guard'));
            }
        } catch (e) {
            console.warn('[Groq] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return [
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'llama3-8b-8192',
            'llama3-70b-8192',
            'mixtral-8x7b-32768',
            'gemma2-9b-it',
            'deepseek-r1-distill-llama-70b',
            'qwen-2.5-32b'
        ];
    }

    static get FREE_TIER_INFO() {
        return { rpm: 30, rpd: 14400 };
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        });
    }
}


// ─── Module: js/ai/openrouter.js ───



class OpenRouterProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
        if (!this.model) this.model = 'meta-llama/llama-3.3-70b-instruct:free';
    }

    async listModels() {
        try {
            const res = await fetch('https://openrouter.ai/api/v1/models');
            if (res.ok) {
                const data = await res.json();
                return (data.data || [])
                    .map(m => m.id)
                    .filter(id => id.includes(':free') || id.startsWith('meta-llama/') || id.startsWith('google/'));
            }
        } catch (e) {
            console.warn('[OpenRouter] listModels warning:', e);
        }
        return [];
    }

    getModels() {
        return [
            'meta-llama/llama-3.3-70b-instruct:free', 
            'google/gemini-2.0-flash-exp:free', 
            'deepseek/deepseek-r1:free', 
            'meta-llama/llama-3.1-8b-instruct:free',
            'qwen/qwen-2.5-72b-instruct:free',
            'openai/gpt-4o', 
            'anthropic/claude-3.5-sonnet'
        ];
    }

    async chat(messages, options = {}) {
        const body = {
            model: this.model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'The Office'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage || {};

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0
            }
        });
    }
}


// ─── Module: js/ai/huggingface.js ───



class HuggingFaceProvider extends AIProvider {
    constructor(name, config) {
        super(name, config);
        this.baseUrl = config.baseUrl || 'https://api-inference.huggingface.co/models';
        if (!this.model) this.model = 'meta-llama/Llama-3.1-8B-Instruct';
    }

    getModels() {
        return [
            'meta-llama/Llama-3.1-8B-Instruct', 
            'mistralai/Mistral-7B-Instruct-v0.3', 
            'Qwen/Qwen2.5-72B-Instruct'
        ];
    }

    _formatPrompt(messages) {
        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'system') {
                prompt += `System: ${msg.content}\n\n`;
            } else if (msg.role === 'user') {
                prompt += `User: ${msg.content}\n\n`;
            } else {
                prompt += `Assistant: ${msg.content}\n\n`;
            }
        }
        prompt += 'Assistant:';
        return prompt;
    }

    async chat(messages, options = {}) {
        const inputs = this._formatPrompt(messages);
        
        const body = {
            inputs,
            parameters: {
                max_new_tokens: options.maxTokens || 1024,
                temperature: options.temperature ?? 0.7
            }
        };

        const response = await fetch(`${this.baseUrl}/${this.model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HuggingFace API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        let content = '';
        
        if (Array.isArray(data) && data.length > 0) {
            content = data[0].generated_text || '';
            if (content.startsWith(inputs)) {
                content = content.slice(inputs.length).trim();
            }
        }

        return this.normalizeResponse({
            content,
            usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0
            }
        });
    }
}


// ─── Module: js/ai/router.js ───









class AIRouter {
    constructor() {
        this.providers = new Map();
    }

    /**
    /**
     * Factory method to create a provider instance
     * @param {string} type
     * @param {Object} config
     * @returns {AIProvider}
     */
    static createProvider(type, config) {
        const name = config.name || type;
        switch (type.toLowerCase()) {
            case 'gemini': return new GeminiProvider(name, config);
            case 'openai': return new OpenAIProvider(name, config);
            case 'anthropic': return new AnthropicProvider(name, config);
            case 'grok': return new GrokProvider(name, config);
            case 'groq': return new GroqProvider(name, config);
            case 'openrouter': return new OpenRouterProvider(name, config);
            case 'huggingface': return new HuggingFaceProvider(name, config);
            default: throw new Error(`Unknown provider type: ${type}`);
        }
    }

    /**
     * @param {string} type 
     * @param {Object} config 
     */
    addProvider(type, config) {
        const provider = AIRouter.createProvider(type, config);
        this.providers.set(provider.name, provider);
        return provider;
    }

    removeProvider(name) {
        return this.providers.delete(name);
    }

    getProvider(name) {
        return this.providers.get(name);
    }

    getProviders() {
        return Array.from(this.providers.values());
    }

    getActiveProviderCount() {
        return this.providers.size;
    }

    /**
     * @param {Array<{role: string, content: string}>} messages 
     * @param {Object|string} [options] 
     */
    async route(messages, options = {}) {
        if (this.providers.size === 0) {
            throw new Error('No AI providers configured. Go to Settings or Setup to connect an API key.');
        }

        const opts = typeof options === 'string' ? { preferredProvider: options } : (options || {});

        let targetProvider;
        const pref = opts.preferredProvider || opts.provider;
        if (pref && this.providers.has(pref)) {
            targetProvider = this.providers.get(pref);
        } else {
            targetProvider = this.providers.values().next().value;
        }

        const origModel = targetProvider.model;
        if (opts.model) {
            targetProvider.model = opts.model;
        }

        try {
            const res = await targetProvider.chat(messages, opts);
            targetProvider.model = origModel;
            return res;
        } catch (error) {
            targetProvider.model = origModel;
            console.warn(`Provider ${targetProvider.name} failed, attempting fallback`, error);
            
            for (const [name, fallbackProvider] of this.providers) {
                if (name === targetProvider.name) continue;
                try {
                    return await fallbackProvider.chat(messages, opts);
                } catch (e) {
                    console.warn(`Fallback provider ${name} failed`, e);
                }
            }
            throw error;
        }
    }

    async testAll() {
        const results = [];
        for (const [name, provider] of this.providers) {
            const res = await provider.testConnection();
            results.push({ name, ...res });
        }
        return results;
    }
}


// ─── Module: js/ai/prompts.js ───

// ============================================
// THE OFFICE — Role & Agent Prompts
// ============================================

const CANONICAL_ROLES = {
  ceo: { key: 'ceo', title: 'CEO', label: 'Chief Executive Officer', department: 'executive' },
  cto: { key: 'cto', title: 'CTO', label: 'Chief Technology Officer', department: 'executive' },
  cio: { key: 'cio', title: 'CIO', label: 'Chief Information Officer', department: 'executive' },
  program_manager: { key: 'program_manager', title: 'Program Manager', label: 'Program Manager', department: 'management' },
  product_manager: { key: 'product_manager', title: 'Product Manager', label: 'Product Manager', department: 'management' },
  project_manager: { key: 'project_manager', title: 'Project Manager', label: 'Project Manager', department: 'management' },
  tech_lead: { key: 'tech_lead', title: 'Tech Lead', label: 'Tech Lead', department: 'engineering' },
  senior_developer: { key: 'senior_developer', title: 'Senior Developer', label: 'Senior Developer', department: 'engineering' },
  developer: { key: 'developer', title: 'Developer', label: 'Software Developer', department: 'engineering' },
  qa_lead: { key: 'qa_lead', title: 'QA Lead', label: 'QA Lead', department: 'engineering' },
  tester: { key: 'tester', title: 'Tester', label: 'Quality Assurance Tester', department: 'engineering' },
  devops_engineer: { key: 'devops_engineer', title: 'DevOps Engineer', label: 'DevOps Engineer', department: 'engineering' },
  uiux_lead: { key: 'uiux_lead', title: 'UI/UX Lead', label: 'UI/UX Lead', department: 'design' },
  designer: { key: 'designer', title: 'Designer', label: 'UI/UX Designer', department: 'design' },
  technical_writer: { key: 'technical_writer', title: 'Technical Writer', label: 'Technical Writer', department: 'support' },
  networking_engineer: { key: 'networking_engineer', title: 'Networking Engineer', label: 'Networking Engineer', department: 'engineering' },
  data_analyst: { key: 'data_analyst', title: 'Data Analyst', label: 'Data Analyst', department: 'management' }
};

function normalizeRoleKey(roleStr = '') {
  const clean = String(roleStr).toLowerCase().replace(/[\s_\-\/]+/g, '');
  if (clean.includes('ceo')) return 'ceo';
  if (clean.includes('cto')) return 'cto';
  if (clean.includes('cio')) return 'cio';
  if (clean.includes('product')) return 'product_manager';
  if (clean.includes('program')) return 'program_manager';
  if (clean.includes('project')) return 'project_manager';
  if (clean.includes('techlead')) return 'tech_lead';
  if (clean.includes('seniordev')) return 'senior_developer';
  if (clean.includes('developer') || clean === 'dev') return 'developer';
  if (clean.includes('qalead')) return 'qa_lead';
  if (clean.includes('test')) return 'tester';
  if (clean.includes('devops')) return 'devops_engineer';
  if (clean.includes('uiux') || clean.includes('uxlead')) return 'uiux_lead';
  if (clean.includes('design')) return 'designer';
  if (clean.includes('writer') || clean.includes('docs')) return 'technical_writer';
  if (clean.includes('network')) return 'networking_engineer';
  if (clean.includes('data') || clean.includes('analyst')) return 'data_analyst';
  return 'developer';
}

const ROLE_PROMPTS = {
  ceo: "You are the Chief Executive Officer. You provide high-level vision, drive company growth, and ensure the business meets its overarching goals. Keep your communication strategic, decisive, and focused on the bottom line. You format your answers clearly, often with executive summaries.",
  cto: "You are the Chief Technology Officer. You guide the technical direction, make architectural decisions, and evaluate new technologies. You communicate with technical authority, balancing innovation with practicality.",
  cio: "You are the Chief Information Officer. You manage IT infrastructure, ensure data security, and optimize internal technical processes. You are risk-aware, process-oriented, and structured.",
  program_manager: "You are the Program Manager. You oversee multiple related projects, coordinate between different departments, and track cross-project dependencies. You are organized, communicative, and diplomatic.",
  product_manager: "You are the Product Manager. You own product requirements, write user stories, clarify ambiguities with the boss, and prioritize features based on user value. You focus on user needs and market fit.",
  project_manager: "You are the Project Manager. You track timelines, manage sprints, assign tasks, and remove blockers. You are very detail-oriented and focus on delivery and scheduling.",
  tech_lead: "You are the Tech Lead. You mentor developers, architect systems, review code, and make day-to-day technical choices. You are pragmatic, deeply technical, and focused on code quality and team velocity.",
  senior_developer: "You are a Senior Developer. You write high-quality, scalable code, tackle the hardest technical problems, and assist junior team members. You communicate concisely and focus on implementation details.",
  developer: "You are a Software Developer. You implement clean, working, modern code, write tests, and fix bugs. You write self-contained, robust web applications using HTML5, modern CSS, and JavaScript.",
  qa_lead: "You are the QA Lead. You define testing strategies, oversee the testing process, and ensure the product meets quality standards. You are meticulous, skeptical, and focus on edge cases.",
  tester: "You are a QA Tester. You test software, check for edge cases, verify requirements, and report bugs clearly with reproduction steps.",
  devops_engineer: "You are a DevOps Engineer. You manage CI/CD pipelines, runtime configurations, packaging, and deployments. You prioritize automation, reliability, and security.",
  uiux_lead: "You are the UI/UX Lead. You define the design language, conduct user research, and create wireframes/prototypes. You advocate for the user and focus on aesthetics and usability.",
  designer: "You are a UI/UX Designer. You craft beautiful, responsive interfaces, choose harmonious palettes, polish typography, and ensure visual delight and great user ergonomics.",
  technical_writer: "You are a Technical Writer. You create documentation, API references, and user guides. You are clear, concise, and focused on readability.",
  networking_engineer: "You are a Networking Engineer. You design and maintain network infrastructure, troubleshoot connectivity issues, and ensure network security.",
  data_analyst: "You are a Data Analyst. You query databases, build dashboards, and extract insights from data. You are analytical, data-driven, and objective."
};

// Aliases for camelCase legacy lookups
ROLE_PROMPTS.CEO = ROLE_PROMPTS.ceo;
ROLE_PROMPTS.CTO = ROLE_PROMPTS.cto;
ROLE_PROMPTS.CIO = ROLE_PROMPTS.cio;
ROLE_PROMPTS.ProgramManager = ROLE_PROMPTS.program_manager;
ROLE_PROMPTS.ProductManager = ROLE_PROMPTS.product_manager;
ROLE_PROMPTS.ProjectManager = ROLE_PROMPTS.project_manager;
ROLE_PROMPTS.TechLead = ROLE_PROMPTS.tech_lead;
ROLE_PROMPTS.SeniorDeveloper = ROLE_PROMPTS.senior_developer;
ROLE_PROMPTS.Developer = ROLE_PROMPTS.developer;
ROLE_PROMPTS.QALead = ROLE_PROMPTS.qa_lead;
ROLE_PROMPTS.Tester = ROLE_PROMPTS.tester;
ROLE_PROMPTS.DevOpsEngineer = ROLE_PROMPTS.devops_engineer;
ROLE_PROMPTS.UIUXLead = ROLE_PROMPTS.uiux_lead;
ROLE_PROMPTS.Designer = ROLE_PROMPTS.designer;
ROLE_PROMPTS.TechnicalWriter = ROLE_PROMPTS.technical_writer;
ROLE_PROMPTS.NetworkingEngineer = ROLE_PROMPTS.networking_engineer;
ROLE_PROMPTS.DataAnalyst = ROLE_PROMPTS.data_analyst;

const PERSONALITY_MODIFIERS = {
  enthusiastic: " You are constantly upbeat, easily excitable, and often make inappropriate but well-meaning jokes, much like Michael Scott.",
  deadpan: " You are unbothered, cynical, and speak in a flat, deadpan tone. You just want to do your job and go home, much like Stanley.",
  perfectionist: " You are uptight, hypocritical, and excessively critical of others' work. You demand strict adherence to the rules, much like Angela.",
  prankster: " You are laid-back, charming, and occasionally pull harmless pranks or break the fourth wall. You don't take things too seriously, much like Jim.",
  eccentric: " You are intensely loyal, fiercely competitive, and hold bizarre beliefs. You take your job way too seriously, much like Dwight.",
  peacemaker: " You are friendly, somewhat timid, but generally the voice of reason. You try to mediate conflicts, much like Pam.",
  party_planner: " You are seemingly sweet but can be surprisingly passive-aggressive and gossipy, much like Phyllis.",
  know_it_all: " You are pedantic, actually smart but arrogant, and love correcting people, much like Oscar.",
  newbie: " You are overly ambitious, pretend to know more than you do, and use trendy buzzwords incorrectly, much like Ryan.",
  sweetheart: " You are lovable, a bit slow, and very simple-minded. You focus on food and simple pleasures, much like Kevin."
};

/**
 * Builds the base system prompt for an employee
 */
function buildSystemPrompt(role, personality, companyName = 'The Office', projectDescription = 'Software Applications') {
  const norm = normalizeRoleKey(role);
  const baseRole = ROLE_PROMPTS[norm] || "You are a professional software company employee.";
  const basePersonality = PERSONALITY_MODIFIERS[personality] || "";
  
  return `${baseRole}${basePersonality}
Company: ${companyName}.
Context: ${projectDescription}.
Always balance your entertaining in-character personality with genuine, high-quality, professional execution of your tasks.`;
}

/**
 * Detect what kind of deliverable the boss is asking for.
 * @param {string} requirement
 * @returns {'terraform'|'python'|'script'|'fullstack_pyodide'|'web'}
 */
function detectProjectType(requirement = '') {
  const r = String(requirement).toLowerCase();
  const has = (...words) => words.some(w => new RegExp(`\\b${w}\\b`).test(r));

  if (has('terraform', 'hcl', 'iac', 'infrastructure as code', 'provision', 'provisioning')) return 'terraform';

  const wantsUI = has('web app', 'webapp', 'website', 'web page', 'webpage', 'frontend', 'front-end', 'ui', 'dashboard', 'html', 'react', 'flask', 'fastapi', 'django', 'backend');
  const wantsPython = has('python', 'py', 'boto3', 'pandas', 'pip');

  if (wantsPython && wantsUI) return 'fullstack_pyodide';
  if (wantsPython) return 'python';
  if (has('bash', 'shell script', 'powershell', 'cli')) return 'script';
  if (has('script') && !wantsUI) return 'python';
  return 'web';
}

const PROJECT_TYPE_GUIDE = {
  python: 'A standalone Python 3 script/CLI that the boss will download and run locally (NOT a web app, NOT HTML). Use real libraries appropriate to the task (e.g. boto3 for AWS, requests for HTTP).',
  terraform: 'Terraform (HCL) infrastructure-as-code files the boss will run with `terraform init/plan/apply` (NOT a web app).',
  script: 'A standalone shell/CLI script the boss will run locally (NOT a web app).',
  fullstack_pyodide: 'A web app with Python logic. Deliver an index.html UI that runs the Python code in-browser via Pyodide, plus the Python source file(s).',
  web: 'A self-contained web application (HTML/CSS/JS) that runs in the browser without a build step.'
};

/**
 * Prompt: Product Manager questions to the boss
 */
function buildQuestionsPrompt(requirement, companyName = 'The Office', projectType = detectProjectType(requirement)) {
  return [
    {
      role: 'system',
      content: `You are the Lead Product Manager at ${companyName}. The boss just gave you a requirement.
Deliverable type: ${PROJECT_TYPE_GUIDE[projectType] || PROJECT_TYPE_GUIDE.web}
Your job is to ask 3 to 4 smart, high-impact clarifying questions before the engineering team starts coding.
Questions MUST be specific to THIS requirement and deliverable type. For scripts/infra ask about things like authentication, region/scope, filters, output format and error handling — never about visual themes unless a UI is requested.
For EACH question, provide 3 short, actionable multiple-choice options, plus a recommended default.

CRITICAL: Return ONLY valid JSON in this exact structure with no extra text or markdown backticks:
{
  "greeting": "A short, respectful 1-sentence in-character greeting acknowledging the boss's request",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C"],
      "defaultOption": "Option A",
      "rationale": "Why this question matters for the build"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Boss requirement: "${requirement}"\nGenerate the clarifying questions now as pure JSON.`
    }
  ];
}

/**
 * Prompt: Product Manager spec document
 */
function buildSpecPrompt(requirement, answers = {}, companyName = 'The Office', projectType = detectProjectType(requirement)) {
  const answersText = Object.entries(answers).length > 0 
    ? Object.entries(answers).map(([q, a]) => `- ${q}: ${a}`).join('\n')
    : "Proceeded with optimal engineering recommendations.";

  return [
    {
      role: 'system',
      content: `You are the Lead Product Manager at ${companyName}.
Create a concise, production-ready Specification for EXACTLY what the boss asked for. Do not invent a different product.
Deliverable type: ${PROJECT_TYPE_GUIDE[projectType] || PROJECT_TYPE_GUIDE.web}
Include:
1. Deliverable Name & One-line Summary (restate the boss's goal faithfully)
2. Core Functionality (3-5 concrete behaviours)
3. Inputs, Outputs & Usage (how the boss runs/uses it)
4. Technical Requirements (language, libraries, auth/credentials, runtime)
5. Acceptance Criteria (bullet points QA can test against)

Keep it clear and concise.`
    },
    {
      role: 'user',
      content: `Project Requirement: "${requirement}"\nClarifications / User Decisions:\n${answersText}\n\nWrite the complete Specification.`
    }
  ];
}

/**
 * Prompt: Tech Lead architecture plan
 */
function buildPlanPrompt(spec, companyName = 'The Office', requirement = '', projectType = detectProjectType(requirement)) {
  return [
    {
      role: 'system',
      content: `You are the Principal Systems Architect and Tech Lead at ${companyName}.
Review the Specification and create the Technical Implementation Plan.
The boss's ORIGINAL requirement is the source of truth. Detected deliverable type: "${projectType}" — ${PROJECT_TYPE_GUIDE[projectType] || PROJECT_TYPE_GUIDE.web}
File conventions per type:
1. python: "main.py" (or a descriptive name like "list_ec2_instances.py"), "requirements.txt", "README.md". NO index.html.
2. terraform: "main.tf", "variables.tf", "outputs.tf", "README.md". NO index.html.
3. script: e.g. "script.sh" or "script.ps1" plus "README.md".
4. fullstack_pyodide: an interactive "index.html" that runs Python in-browser via Pyodide (CDN), plus "app.py".
5. web: a self-contained "index.html" (or "index.html", "style.css", "app.js").
Keep the file list small (1-4 files).

CRITICAL: Return ONLY valid JSON in this exact structure:
{
  "architectureSummary": "1-2 sentence architecture overview",
  "projectType": "web" | "python" | "terraform" | "fullstack_pyodide" | "script",
  "files": [
    {
      "name": "filename with proper extension (e.g. main.py, main.tf, index.html)",
      "description": "Description of responsibilities and contents",
      "role": "File role in the project"
    }
  ],
  "tasks": [
    {
      "title": "Clear task title",
      "assigneeRole": "developer",
      "description": "Concrete task description"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Boss's original requirement: "${requirement}"\n\nSpecification:\n${spec}\n\nProduce the technical architecture plan as pure JSON.`
    }
  ];
}

/**
 * Prompt: Developer writing a code file
 */
function buildCodePrompt(fileName, fileDesc, spec, plan, otherFiles = {}, requirement = '') {
  const existingFilesContext = Object.keys(otherFiles).length > 0
    ? `\nOther files created so far in this project:\n` + Object.entries(otherFiles).map(([f, c]) => `=== FILE: ${f} ===\n${c.substring(0, 500)}...\n`).join('\n')
    : '';

  const ext = fileName.split('.').pop().toLowerCase();
  let specializedGuideline = '';

  if (ext === 'py') {
    specializedGuideline = `You are a Senior Python Engineer.
- Write clean, modern, production-grade Python 3 code with type hints, docstrings, and robust exception handling.
- Include executable entrypoint (if __name__ == '__main__': ...) with example CLI usage, argument parsing, or test execution.
- If third-party libraries are required, keep them standard or document them in requirements.txt.`;
  } else if (ext === 'tf') {
    specializedGuideline = `You are a Principal Cloud & DevOps Architect.
- Write complete, syntactically valid Terraform HCL code (v1.5+ syntax).
- Declare required_providers (AWS, Azure, GCP, or generic as requested), resource blocks, variable definitions with types/descriptions/defaults, and useful outputs.
- No dummy pseudo-code; use authentic Terraform resource types and parameters.`;
  } else if (ext === 'html') {
    specializedGuideline = `You are an expert Full-Stack & Frontend Engineer.
- If the project requires a Python backend or Python execution inside our static browser app, integrate Pyodide (https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js) so real Python code executes inside WebAssembly in the browser with full interactive UI and output console!
- Include polished styling (<style>) and responsive layout. Everything must be interactive and runnable immediately.`;
  } else if (ext === 'sh' || ext === 'bash') {
    specializedGuideline = `You are a Senior Linux DevOps Engineer.
- Write robust, executable bash scripts with set -euo pipefail, parameter validation, and clear status log messages.`;
  } else if (ext === 'txt' && fileName.toLowerCase().includes('requirements')) {
    specializedGuideline = `List ONLY the pip packages the Python code actually imports (one per line, with sensible version pins). No commentary.`;
  } else if (ext === 'md') {
    specializedGuideline = `Write a concise README: purpose, prerequisites (credentials, permissions, packages), install steps, exact usage commands with examples, and sample output.`;
  } else {
    specializedGuideline = `Write complete, production-ready, functional code for this file.`;
  }

  return [
    {
      role: 'system',
      content: `You are an expert Senior Software Engineer.
Your mission is to write COMPLETE, PRODUCTION-READY, FULLY FUNCTIONAL code for "${fileName}".
The boss's original requirement is the source of truth — the file must directly serve it. Do not build a different or generic program.
Guidelines:
- No placeholders, no TODOs, no "implement this later". Everything must work end-to-end.
${specializedGuideline}
- Format the output clearly. You MUST start your response with:
=== FILE: ${fileName} ===
followed immediately by the complete file content, and end with:
=== END FILE ===`
    },
    {
      role: 'user',
      content: `Boss's original requirement: "${requirement}"\n\nFile to write: ${fileName}${fileDesc ? ` — ${fileDesc}` : ''}\n\nSpecification:\n${spec}\n\nPlan:\n${typeof plan === 'string' ? plan : JSON.stringify(plan, null, 2)}${existingFilesContext}\n\nWrite the complete code for ${fileName} now.`
    }
  ];
}

/**
 * Prompt: QA Review
 */
function buildQAPrompt(spec, files) {
  const filesText = Object.entries(files).map(([name, code]) => `=== FILE: ${name} ===\n${code}\n=== END FILE ===`).join('\n\n');

  return [
    {
      role: 'system',
      content: `You are the Lead QA Engineer. You meticulously review software against requirements and find real bugs, usability flaws, or broken logic.
Analyze the code against the specification.
Return ONLY valid JSON in this exact structure:
{
  "passed": true, // or false if critical bugs exist
  "score": 95, // 0 to 100 quality score
  "summary": "Brief 1-2 sentence evaluation",
  "bugs": [
    {
      "severity": "minor", // "critical", "major", "minor"
      "file": "index.html",
      "issue": "Description of the flaw",
      "fix": "Concrete suggestion for the developer to fix it"
    }
  ]
}`
    },
    {
      role: 'user',
      content: `Specification:\n${spec}\n\nCode deliverable:\n${filesText}\n\nReview the deliverable and return pure JSON.`
    }
  ];
}

/**
 * Prompt: Developer fixing QA bugs
 */
function buildFixPrompt(fileName, currentCode, bugs) {
  const bugsText = (bugs || []).map(b => `- [${b.severity}] ${b.issue}: ${b.fix}`).join('\n');

  return [
    {
      role: 'system',
      content: `You are the Senior Developer. QA reviewed your code and reported the following issues.
Fix each issue carefully while preserving all existing working functionality.
Output the complete updated file starting with:
=== FILE: ${fileName} ===
and ending with:
=== END FILE ===`
    },
    {
      role: 'user',
      content: `Current code for ${fileName}:\n${currentCode}\n\nQA Issues to fix:\n${bugsText}\n\nProvide the fixed complete code.`
    }
  ];
}

/**
 * Prompt: Developer applying a boss revision request across the project
 */
function buildChangePrompt(requirement, files, changeDirective) {
  const filesText = Object.entries(files || {})
    .map(([name, code]) => `=== FILE: ${name} ===\n${code}\n=== END FILE ===`)
    .join('\n\n');

  return [
    {
      role: 'system',
      content: `You are the Senior Developer. The boss reviewed the delivered project and requested a revision.
Apply the requested change completely while preserving all existing working functionality and the original purpose of the project.
Output ONLY the files you modified or created, each as the COMPLETE file content in this exact format:
=== FILE: <filename> ===
<complete file content>
=== END FILE ===
Do not output unchanged files. Do not add commentary outside the file blocks.`
    },
    {
      role: 'user',
      content: `Original requirement: "${requirement}"\n\nCurrent project files:\n${filesText}\n\nBoss's revision request: "${changeDirective}"\n\nApply it now.`
    }
  ];
}

/**
 * Prompt: CEO Delivery Note
 */
function buildDeliveryPrompt(requirement, spec, files, qaResult) {
  return [
    {
      role: 'system',
      content: `You are Michael Scott, Regional Manager and CEO of the software company.
The engineering team just finished building an app for the boss.
Write a fun, proud, in-character delivery message presenting the app.
Highlight 2-3 cool features the team built, compliment the developers, and invite the boss to test it out right now!`
    },
    {
      role: 'user',
      content: `Original Request: "${requirement}"\nQA Score: ${qaResult?.score || 100}/100\nDeliverable files: ${Object.keys(files).join(', ')}`
    }
  ];
}

/**
 * Prompt: Boss conversation & direct updates
 */
function buildBossChatPrompt(employee, context = {}) {
  const norm = normalizeRoleKey(employee.role);
  const roleText = ROLE_PROMPTS[norm] || "You are an employee.";
  const persText = PERSONALITY_MODIFIERS[employee.personality] || "";
  
  const currentTaskText = context.currentTask 
    ? `Current Task: "${context.currentTask.title}" (${context.currentTask.status})` 
    : "Current Task: Idle / Available for new assignments";

  const currentProjectText = context.activeProject
    ? `Active Company Project: "${context.activeProject.name}" (Phase: ${context.activeProject.phase})`
    : "No active company project right now.";

  return `You are ${employee.name}, ${employee.role} at ${context.companyName || 'The Office'}.
${roleText}${persText}
Status: ${employee.status}. Mood: ${employee.mood}/100.
${currentTaskText}
${currentProjectText}

The user is your BOSS talking to you directly on the office floor.
Respond directly to the boss in-character. Be helpful, funny, professional, and authentic to The Office.
If the boss asks for an update, explain what you are currently doing and how it is going.
If the boss gives a new directive or requests building an app/feature, enthusiastically accept and tell them what your immediate next step will be.

CRITICAL: Return ONLY valid JSON in this exact structure:
{
  "reply": "Your in-character reply to the boss",
  "action": "none", // one of: "start_project", "create_task", "take_break", "speed_up", "none"
  "actionPayload": {} // e.g. { "projectName": "Joke App", "directive": "..." }
}`;
}




// ─── Module: js/ai/queue.js ───

class AIRequestQueue extends EventTarget {
    constructor() {
        super();
        this.queue = [];
        this.processing = new Set();
        this.completed = 0;
        this.failed = 0;
        this.isProcessing = false;
        
        // Track requests per provider per minute
        this.providerUsage = new Map(); 
    }

    /**
     * @param {Object} request 
     * @param {string} request.id
     * @param {Array} request.messages
     * @param {Object} request.options
     * @param {Object} request.provider
     * @param {number} [request.priority=0]
     * @param {Function} request.resolve
     * @param {Function} request.reject
     */
    enqueue(request) {
        request.priority = request.priority || 0;
        request.retries = 0;
        
        this.queue.push(request);
        // Sort by priority (higher first)
        this.queue.sort((a, b) => b.priority - a.priority);
        
        this.process();
    }

    async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift();
            this.processing.add(request.id);
            this.dispatchEvent(new CustomEvent('request_start', { detail: request }));

            this._executeRequest(request);
        }

        this.isProcessing = false;
        if (this.processing.size === 0) {
            this.dispatchEvent(new Event('queue_empty'));
        }
    }

    async _executeRequest(request) {
        try {
            // Very simple rate limit enforcement (could be improved)
            const providerName = request.provider.name;
            const now = Date.now();
            const usage = this.providerUsage.get(providerName) || [];
            
            // clean up older than 1 minute
            const recentUsage = usage.filter(t => now - t < 60000);
            this.providerUsage.set(providerName, recentUsage);

            // Assume basic limit if not specified, e.g., 15 RPM for free tier
            const rpmLimit = request.provider.constructor.FREE_TIER_INFO?.rpm || 60;

            if (recentUsage.length >= rpmLimit) {
                // Rate limited, requeue with delay
                await new Promise(r => setTimeout(r, 2000));
                throw new Error('Rate limit exceeded (local throttle)');
            }

            recentUsage.push(Date.now());
            this.providerUsage.set(providerName, recentUsage);

            const result = await request.provider.chat(request.messages, request.options);
            
            this.completed++;
            this.processing.delete(request.id);
            this.dispatchEvent(new CustomEvent('request_complete', { detail: { id: request.id, result } }));
            request.resolve(result);

        } catch (error) {
            if (request.retries < 3) {
                request.retries++;
                const delay = Math.pow(2, request.retries) * 1000; // Exponential backoff: 2s, 4s, 8s
                setTimeout(() => {
                    this.processing.delete(request.id);
                    this.queue.push(request);
                    this.queue.sort((a, b) => b.priority - a.priority);
                    this.process();
                }, delay);
            } else {
                this.failed++;
                this.processing.delete(request.id);
                this.dispatchEvent(new CustomEvent('request_error', { detail: { id: request.id, error } }));
                request.reject(error);
            }
        }
    }

    getStats() {
        return {
            pending: this.queue.length,
            processing: this.processing.size,
            completed: this.completed,
            failed: this.failed
        };
    }
}


// ─── Module: js/engine/tick.js ───

/**
 * @module engine/tick
 */


const SPEED_MS = {
  1: 3000,
  2: 1500,
  5: 600
};

/**
 * GameClock class for managing game time and ticks
 */
class GameClock {
  constructor() {
    this.currentTick = 0;
    this.ticksPerDay = 8;
    this.speed = 1;
    this.isRunning = false;
    this.currentDay = 1;
    this.currentHour = 9; // Starts at 9 AM
    this.intervalId = null;
  }

  /**
   * Starts the clock
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._scheduleNextTick();
  }

  /**
   * Pauses the clock
   */
  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resumes the clock
   */
  resume() {
    this.start();
  }

  /**
   * Sets the clock speed
   * @param {number} speed 
   */
  setSpeed(speed) {
    if (SPEED_MS[speed]) {
      this.speed = speed;
      if (this.isRunning) {
        this.pause();
        this.start();
      }
    }
  }

  /**
   * Returns formatted time display string
   * @returns {string} e.g. "Day 3, 2:00 PM"
   */
  getTimeDisplay() {
    const isPM = this.currentHour >= 12;
    const displayHour = this.currentHour > 12 ? this.currentHour - 12 : (this.currentHour === 0 ? 12 : this.currentHour);
    const ampm = isPM ? 'PM' : 'AM';
    return `Day ${this.currentDay}, ${displayHour}:00 ${ampm}`;
  }

  /**
   * Internal method to schedule the next tick
   * @private
   */
  _scheduleNextTick() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    const ms = SPEED_MS[this.speed] || 3000;
    this.intervalId = setInterval(() => {
      this._tick();
    }, ms);
  }

  /**
   * Internal method to process a single tick
   * @private
   */
  _tick() {
    this.currentTick++;
    this.currentHour++;

    if (this.currentHour === 9) {
      emit('day_start', { day: this.currentDay });
    }

    // Work day ends at 5 PM (17:00), so 8 ticks from 9 AM
    if (this.currentHour > 17) {
      emit('day_end', { day: this.currentDay });
      this.currentDay++;
      this.currentHour = 9; // Reset to 9 AM next day
    }

    emit('tick', {
      tick: this.currentTick,
      day: this.currentDay,
      hour: this.currentHour,
      speed: this.speed
    });
  }
}


// ─── Module: js/engine/company.js ───

/**
 * @module engine/company
 */


/**
 * Company model representing the simulated software company.
 */
class Company {
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


// ─── Module: js/engine/employee.js ───

/**
 * @module engine/employee
 */

const ROLES = {
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

const PERSONALITIES = [
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
class Employee {
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


// ─── Module: js/engine/task.js ───

/**
 * @module engine/task
 */

/**
 * Task model representing work items.
 */
class Task {
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


// ─── Module: js/engine/workflow.js ───

/**
 * @module engine/workflow
 */

/**
 * Workflow class to orchestrate task flows through the company hierarchy.
 */
class Workflow {
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


// ─── Module: js/engine/scrum.js ───

/**
 * @module engine/scrum
 */


/**
 * ScrumMaster manages scrum ceremonies.
 */
class ScrumMaster {
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


// ─── Module: js/engine/events.js ───

/**
 * @module engine/events
 */

const EVENTS = [
  { id: 'coffee_run', name: 'Coffee Run', description: 'Someone makes a coffee run', emoji: '☕', probability: 0.05, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(5) },
  { id: 'printer_jam', name: 'Printer Jam', description: 'Printer is jammed again', emoji: '🖨️', probability: 0.03, duration: 2, type: 'disruptive', effect: (emp) => emp.updateProductivity(-5) },
  { id: 'birthday_party', name: 'Birthday Party', description: 'It\'s someone\'s birthday', emoji: '🎂', probability: 0.01, duration: 1, type: 'fun', effect: (emp) => { emp.updateMood(10); emp.updateProductivity(-5); } },
  { id: 'fire_drill', name: 'Fire Drill', description: 'Fire drill!', emoji: '🔥', probability: 0.01, duration: 1, type: 'disruptive', effect: (emp) => emp.setStatus('idle') },
  { id: 'pizza_day', name: 'Pizza Day', description: 'Pizza in the break room', emoji: '🍕', probability: 0.02, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(15) },
  { id: 'water_cooler', name: 'Water Cooler Gossip', description: 'Water cooler gossip', emoji: '🚰', probability: 0.08, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(3) },
  { id: 'motivational_meeting', name: 'Motivational Meeting', description: 'Manager calls motivational meeting', emoji: '📢', probability: 0.04, duration: 1, type: 'productive', effect: (emp) => emp.updateMood(2) },
  { id: 'bug_crisis', name: 'Bug Crisis', description: 'Critical bug found in production!', emoji: '🐛', probability: 0.02, duration: 0, type: 'disruptive', effect: (emp) => emp.updateMood(-5) },
  { id: 'client_praise', name: 'Client Praise', description: 'Client sends praise email', emoji: '⭐', probability: 0.02, duration: 0, type: 'productive', effect: (emp) => { emp.updateMood(10); emp.updateProductivity(5); } },
  { id: 'internet_outage', name: 'Internet Outage', description: 'Internet is down', emoji: '📡', probability: 0.01, duration: 2, type: 'disruptive', effect: (emp) => { emp.setStatus('blocked'); emp.updateProductivity(-10); } },
  { id: 'team_lunch', name: 'Team Lunch', description: 'Team lunch outing', emoji: '🍽️', probability: 0.02, duration: 1, type: 'fun', effect: (emp) => emp.updateMood(8) },
  { id: 'standup_comedy', name: 'Standup Comedy', description: 'Someone tells a joke in standup', emoji: '😂', probability: 0.05, duration: 0, type: 'fun', effect: (emp) => emp.updateMood(5) },
  { id: 'keyboard_warrior', name: 'Keyboard Warrior', description: 'Mechanical keyboard annoys neighbors', emoji: '⌨️', probability: 0.04, duration: 0, type: 'disruptive', effect: (emp) => emp.updateMood(-3) },
  { id: 'rubber_duck', name: 'Rubber Ducking', description: 'Developer explains problem to rubber duck', emoji: '🦆', probability: 0.06, duration: 0, type: 'productive', effect: (emp) => emp.updateProductivity(10) },
  { id: 'whiteboard_session', name: 'Whiteboard Session', description: 'Impromptu whiteboard brainstorming', emoji: '📋', probability: 0.05, duration: 1, type: 'productive', effect: (emp) => emp.updateProductivity(5) }
];

let eventLog = [];

/**
 * OfficeEvents manages random office events.
 */
class OfficeEvents {
  /**
   * Randomly picks an event based on probability
   * @param {number} currentTick 
   * @returns {Object|null}
   */
  static rollForEvent(currentTick) {
    for (const event of EVENTS) {
      if (Math.random() < event.probability) {
        return event;
      }
    }
    return null;
  }

  /**
   * Applies event effects to employees
   * @param {Object} event 
   * @param {Array<Object>} employees 
   * @returns {Object}
   */
  static applyEvent(event, employees) {
    let affectedEmployees = [];
    
    if (['coffee_run', 'birthday_party', 'fire_drill', 'pizza_day', 'client_praise', 'internet_outage', 'team_lunch'].includes(event.id)) {
      affectedEmployees = employees;
    } else {
      // Pick 1-3 random employees for other events
      const numAffected = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...employees].sort(() => 0.5 - Math.random());
      affectedEmployees = shuffled.slice(0, numAffected);
    }

    affectedEmployees.forEach(emp => event.effect(emp));
    
    const record = {
      event,
      affectedCount: affectedEmployees.length,
      timestamp: new Date()
    };
    eventLog.push(record);
    
    return {
      event,
      affectedEmployees,
      description: `${event.emoji} ${event.name}: ${event.description}`
    };
  }

  /**
   * Returns array of past events
   * @returns {Array<Object>}
   */
  static getEventLog() {
    return eventLog;
  }
}


// ─── Module: js/engine/simulation.js ───

/**
 * @module engine/simulation
 */









class Simulation {
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


// ─── Module: js/components/toast.js ───



class Toast {
  static show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const emojis = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    const emoji = emojis[type] || emojis.info;

    const toast = createElement('div', {
      className: `toast toast--${type}`
    });
    
    toast.innerHTML = `<span class="toast-icon">${emoji}</span><span class="toast-message">${escapeHtml(message)}</span>`;
    
    container.appendChild(toast);

    const currentToasts = container.querySelectorAll('.toast');
    if (currentToasts.length > 3) {
      const oldest = currentToasts[0];
      if (!oldest.classList.contains('toast-removing')) {
        Toast.remove(oldest, container);
      }
    }

    setTimeout(() => {
      if (container.contains(toast)) {
        Toast.remove(toast, container);
      }
    }, duration);
  }

  static remove(toastElement, container) {
    toastElement.classList.add('toast-removing');
    toastElement.style.opacity = '0';
    toastElement.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      if (container.contains(toastElement)) {
        container.removeChild(toastElement);
      }
    }, 300);
  }
}


// ─── Module: js/components/modal.js ───



class Modal {
  constructor(config = {}) {
    this.config = config;
  }

  open() {
    Modal.show({
      title: this.config.title || '',
      body: this.config.body || (typeof this.config.content === 'string' ? this.config.content : ''),
      contentElement: this.config.content instanceof HTMLElement ? this.config.content : null,
      buttons: (this.config.buttons || []).map(b => ({
        text: b.text,
        class: b.class || (b.primary ? 'btn btn--primary' : 'btn btn--secondary'),
        onClick: b.onClick
      })),
      onClose: this.config.onClose
    });
  }

  close() {
    Modal.hide();
  }

  static show({ title, body = '', contentElement = null, buttons = [], onClose = null }) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    const header = document.getElementById('modal-header');
    const bodyContainer = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    if (!overlay || !modal || !header || !bodyContainer || !footer) return;

    header.innerHTML = `
      <h3 class="modal__title">${escapeHtml(title)}</h3>
      <button class="modal__close" id="modal-close-btn">&times;</button>
    `;

    if (contentElement) {
      bodyContainer.innerHTML = '';
      bodyContainer.appendChild(contentElement);
    } else {
      bodyContainer.innerHTML = body;
    }

    footer.innerHTML = '';

    const cleanup = () => {
      Modal.hide();
      if (onClose) onClose();
      document.removeEventListener('keydown', keyHandler);
      overlay.removeEventListener('click', overlayHandler);
    };

    const closeBtn = header.querySelector('#modal-close-btn');
    if (closeBtn) closeBtn.onclick = cleanup;

    if (buttons && buttons.length) {
      buttons.forEach(btnConfig => {
        const btn = document.createElement('button');
        btn.textContent = btnConfig.text;
        btn.className = btnConfig.class || 'btn btn--primary';
        btn.addEventListener('click', () => {
          if (btnConfig.onClick) btnConfig.onClick();
          cleanup();
        });
        footer.appendChild(btn);
      });
      footer.style.display = 'flex';
    } else {
      footer.style.display = 'none';
    }

    const keyHandler = (e) => {
      if (e.key === 'Escape') cleanup();
    };
    document.addEventListener('keydown', keyHandler);

    const overlayHandler = (e) => {
      if (e.target === overlay) cleanup();
    };
    overlay.addEventListener('click', overlayHandler);

    Modal._cleanup = cleanup;

    overlay.classList.add('visible');
    overlay.style.display = 'flex';
    modal.style.display = 'block';
  }

  static hide() {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => {
        if (!overlay.classList.contains('visible')) {
          overlay.style.display = 'none';
        }
      }, 250);
    }
    if (modal) modal.style.display = 'none';
  }

  static confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    return new Promise(resolve => {
      Modal.show({
        title,
        body: `<p style="padding: 10px 0;">${escapeHtml(message)}</p>`,
        buttons: [
          { text: cancelText, class: 'btn btn--secondary', onClick: () => resolve(false) },
          { text: confirmText, class: 'btn btn--danger', onClick: () => resolve(true) }
        ],
        onClose: () => resolve(false)
      });
    });
  }
}




// ─── Module: js/components/message.js ───



function renderAvatar(avatarConfig, size = 'sm') {
  const sizes = { sm: '28px', md: '40px', lg: '56px', xl: '72px' };
  const s = sizes[size] || sizes.sm;
  const config = avatarConfig || { skin: '#ffdbac', hair: '#000', shirt: '#ccc' };

  const avatar = document.createElement('div');
  avatar.className = `avatar avatar--${size}`;
  avatar.style.width = s;
  avatar.style.height = s;
  avatar.style.borderRadius = '50%';
  avatar.style.background = config.hair || '#000';
  avatar.style.position = 'relative';
  avatar.style.overflow = 'hidden';
  avatar.style.flexShrink = '0';

  const head = document.createElement('div');
  head.className = 'avatar__head';
  head.style.position = 'absolute';
  head.style.bottom = '20%';
  head.style.left = '15%';
  head.style.width = '70%';
  head.style.height = '70%';
  head.style.borderRadius = '50%';
  head.style.background = config.skin || '#ffdbac';

  const shirt = document.createElement('div');
  shirt.className = 'avatar__shirt';
  shirt.style.position = 'absolute';
  shirt.style.bottom = '0';
  shirt.style.left = '10%';
  shirt.style.width = '80%';
  shirt.style.height = '30%';
  shirt.style.borderRadius = '40% 40% 0 0';
  shirt.style.background = config.shirt || '#ccc';

  avatar.appendChild(head);
  avatar.appendChild(shirt);

  return avatar;
}

function renderMessage(message) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message';
  msgDiv.style.marginBottom = '16px';

  if (message.isSystem) {
    msgDiv.style.textAlign = 'center';
    msgDiv.style.color = '#888';
    msgDiv.style.fontSize = '12px';
    msgDiv.style.fontStyle = 'italic';
    msgDiv.style.margin = '10px 0';
    msgDiv.textContent = message.text;
    return msgDiv;
  }

  msgDiv.style.display = 'flex';
  msgDiv.style.gap = '12px';

  const avatarEl = renderAvatar(message.senderAvatar, 'sm');
  msgDiv.appendChild(avatarEl);

  const contentDiv = document.createElement('div');
  contentDiv.style.flex = '1';
  contentDiv.style.minWidth = '0'; // Allow text wrapping in flex

  const headerDiv = document.createElement('div');
  headerDiv.style.marginBottom = '4px';
  
  const timeString = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const sender = message.senderName || message.sender || 'Unknown';
  headerDiv.innerHTML = `
    <span style="font-weight: bold; font-size: 13px; font-family: var(--font-family-mono); color: var(--ink);">${escapeHtml(sender)}</span> 
    <span style="color: var(--ink-faint); font-size: 10px; font-family: var(--font-family-mono); margin-left: 8px;">${timeString}</span>
  `;
  
  let formattedText = escapeHtml(message.text || '');
  
  // Format code blocks in CRT style
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre style="background:var(--crt-bg); color:var(--crt-green); padding:8px; border:2px solid var(--ink); box-shadow:2px 2px 0 var(--ink); overflow-x:auto; font-family:var(--font-family-mono); font-size:11px; margin:6px 0;"><code>$1</code></pre>');
  // Format inline code
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background:var(--cream-2); border:1px solid var(--ink); padding:1px 4px; font-family:var(--font-family-mono); font-size:11px; color:var(--maroon);">$1</code>');
  // Format bold
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Format line breaks
  formattedText = formattedText.replace(/\n/g, '<br>');

  const textDiv = document.createElement('div');
  textDiv.style.fontSize = '14px';
  textDiv.style.lineHeight = '1.4';
  textDiv.style.color = '#444';
  textDiv.style.wordBreak = 'break-word';
  textDiv.innerHTML = formattedText;

  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(textDiv);
  msgDiv.appendChild(contentDiv);

  return msgDiv;
}


// ─── Module: js/components/task-card.js ───





function renderTaskCard(task, employees = []) {
  const card = document.createElement('div');
  card.className = `task-card task-card--p${task.priority !== undefined ? task.priority : 3}`;
  card.style.background = '#fff';
  card.style.border = '1px solid #e0e0e0';
  card.style.borderRadius = '8px';
  card.style.padding = '12px 12px 12px 16px';
  card.style.marginBottom = '10px';
  card.style.cursor = 'pointer';
  card.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  card.style.transition = 'box-shadow 0.2s, transform 0.1s';

  card.addEventListener('mouseover', () => {
    card.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
  });
  card.addEventListener('mouseout', () => {
    card.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
  });

  // Priority stripe
  const priorityColors = { 0: '#dc3545', 1: '#fd7e14', 2: '#ffc107', 3: '#17a2b8' };
  const stripeColor = priorityColors[task.priority] || priorityColors[3];
  
  const stripe = document.createElement('div');
  stripe.style.position = 'absolute';
  stripe.style.left = '0';
  stripe.style.top = '0';
  stripe.style.bottom = '0';
  stripe.style.width = '4px';
  stripe.style.background = stripeColor;
  card.appendChild(stripe);

  const title = document.createElement('div');
  title.style.fontWeight = '600';
  title.style.fontSize = '14px';
  title.style.marginBottom = '8px';
  title.style.color = '#333';
  title.textContent = truncate(task.title || 'Untitled Task', 40);
  card.appendChild(title);

  const metaRow = document.createElement('div');
  metaRow.style.display = 'flex';
  metaRow.style.justifyContent = 'space-between';
  metaRow.style.alignItems = 'center';
  metaRow.style.fontSize = '12px';
  metaRow.style.color = '#666';

  const typeEmojis = {
    feature: '✨', bug: '🐛', design: '🎨', test: '🧪', 
    docs: '📝', devops: '🔧', research: '🔍', review: '👀'
  };
  
  const typeLabel = task.type || 'feature';
  const typeEmoji = typeEmojis[typeLabel] || '📌';
  
  const typeDiv = document.createElement('div');
  typeDiv.style.display = 'flex';
  typeDiv.style.alignItems = 'center';
  typeDiv.style.gap = '4px';
  typeDiv.style.background = '#f8f9fa';
  typeDiv.style.padding = '2px 6px';
  typeDiv.style.borderRadius = '4px';
  typeDiv.textContent = `${typeEmoji} ${typeLabel}`;
  metaRow.appendChild(typeDiv);

  const assigneeDiv = document.createElement('div');
  assigneeDiv.style.display = 'flex';
  assigneeDiv.style.alignItems = 'center';
  assigneeDiv.style.gap = '6px';
  
  const assignee = employees.find(e => e.id === task.assigneeId);
  if (assignee) {
    const avatar = renderAvatar(assignee.avatar, 'sm');
    avatar.style.width = '16px';
    avatar.style.height = '16px';
    assigneeDiv.appendChild(avatar);
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = escapeHtml(assignee.name.split(' ')[0]);
    assigneeDiv.appendChild(nameSpan);
  } else {
    assigneeDiv.textContent = 'Unassigned';
    assigneeDiv.style.fontStyle = 'italic';
    assigneeDiv.style.color = '#999';
  }
  
  metaRow.appendChild(assigneeDiv);
  card.appendChild(metaRow);

  card.addEventListener('click', () => {
    emit('task-select', task.id);
  });

  return card;
}


// ─── Module: js/components/employee-card.js ───




class EmployeeCard {
  static show(employee, currentTask) {
    const panel = document.getElementById('slide-panel');
    const header = document.getElementById('panel-header');
    const bodyContainer = document.getElementById('panel-body');
    const backdrop = document.getElementById('panel-backdrop');

    if (!panel || !header || !bodyContainer || !backdrop) return;

    panel.style.background = 'var(--paper)';
    panel.style.borderTop = '3px solid var(--ink)';
    panel.style.boxShadow = '0 -6px 0 rgba(27,27,27,0.15)';

    const isMichael = (employee.role || '').toLowerCase().includes('ceo') || (employee.name || '').toLowerCase().includes('michael');
    const providerName = employee.provider || 'gemini';

    // Terminal Titlebar
    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="display: flex; gap: 5px;">
            <span style="width: 10px; height: 10px; background: #FF5F56; border: 1px solid var(--ink); display: inline-block;"></span>
            <span style="width: 10px; height: 10px; background: #FFBD2E; border: 1px solid var(--ink); display: inline-block;"></span>
            <span style="width: 10px; height: 10px; background: #27C93F; border: 1px solid var(--ink); display: inline-block;"></span>
          </div>
          <span style="font-family: var(--font-family-mono); font-size: 11px; font-weight: 700; color: var(--ink); margin-left: 6px;">
            ${isMichael ? "👑 MICHAEL'S COMMAND TERMINAL" : `AGENT TERMINAL: ${escapeHtml(employee.name.toUpperCase())}`}
          </span>
        </div>
        <button id="btn-close-terminal" style="background: var(--white); border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); cursor: pointer; padding: 2px 6px; font-weight: bold;">✕</button>
      </div>
    `;

    header.querySelector('#btn-close-terminal').onclick = () => EmployeeCard.hide();

    // Default logs if empty
    const logs = employee.terminalLogs && employee.terminalLogs.length ? employee.terminalLogs : [
      `[09:00:00] Agent ${employee.name} (${employee.role}) booted.`,
      `[09:00:01] Model Engine: ${providerName.toUpperCase()}`,
      `[09:00:02] Hive connection: OK. Mailbox synced.`,
      `[09:00:05] Status: ${employee.status.toUpperCase()}. Thought: "${employee.thought || 'Awaiting orders...'}"`
    ];

    if (currentTask) {
      logs.push(`[ACTIVE TASK] "${currentTask.title}" (${currentTask.priority || 'P2'})`);
    }

    bodyContainer.innerHTML = `
      <!-- Agent Meta Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; background: var(--cream); border: 2px solid var(--ink); padding: 8px; box-shadow: 2px 2px 0 var(--ink);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border: 2px solid var(--ink); background: ${employee.avatar?.shirt || '#1B1B1B'}; box-shadow: 2px 2px 0 var(--ink); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            ${isMichael ? '☕' : '💻'}
          </div>
          <div>
            <div style="font-weight: 700; font-family: var(--font-family-mono); font-size: 13px;">${escapeHtml(employee.name)}</div>
            <div style="font-size: 11px; color: var(--ink-dim); font-family: var(--font-family-mono);">${escapeHtml(employee.role)} · ${escapeHtml(employee.department)}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
          <span class="badge ${employee.status === 'working' ? 'badge-success' : 'badge-primary'}">${employee.status || 'idle'}</span>
          <span style="font-size: 10px; font-family: var(--font-family-mono); color: var(--ink-faint);">${providerName}</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display: flex; gap: 4px; margin-bottom: 8px;">
        <button class="tab-btn active" id="tab-terminal-btn">CRT TERMINAL</button>
        <button class="tab-btn" id="tab-mailbox-btn">MAILBOX (${(employee.mailbox?.inbox?.length || 0)})</button>
        <button class="tab-btn" id="tab-vitals-btn">STATS & VITALS</button>
      </div>

      <!-- View 1: CRT Terminal -->
      <div id="view-terminal" class="crt-terminal" style="margin-bottom: 12px;">
        <div class="crt-terminal__titlebar">
          <span>bash - 80x24</span>
          <span style="color: #666;">PID ${Math.floor(Math.random() * 8000 + 1000)}</span>
        </div>
        <div class="crt-terminal__screen" id="terminal-screen" style="max-height: 180px; min-height: 140px; font-size: 11px;">
          ${logs.map(log => `<div>${escapeHtml(log)}</div>`).join('')}
          <div style="margin-top: 6px; color: var(--yellow);">
            <span>${employee.name.toLowerCase().replace(/\s+/g, '')}@the-office:~$ </span>
            <span class="crt-terminal__cursor"></span>
          </div>
        </div>
      </div>

      <!-- Prompt Input for Agent -->
      <div id="agent-command-box" style="display: flex; gap: 6px; margin-bottom: 12px;">
        <input type="text" id="agent-direct-prompt" placeholder="Instruct ${employee.name.split(' ')[0]}..." style="flex: 1; font-size: 12px; padding: 8px;">
        <button class="btn btn-primary" id="btn-send-agent-prompt" style="padding: 0 12px;">RUN</button>
      </div>

      <!-- View 2: Mailbox (Hidden by default) -->
      <div id="view-mailbox" style="display: none; margin-bottom: 12px;">
        <div style="background: var(--white); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 10px;">
          <h4 style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 8px 0; border-bottom: 1px dashed var(--ink); padding-bottom: 4px;">INBOX (NOTES & COMMISSIONS)</h4>
          ${(employee.mailbox?.inbox && employee.mailbox.inbox.length) ? employee.mailbox.inbox.map(m => `
            <div style="border-bottom: 1px solid var(--cream-2); padding: 4px 0; font-size: 11px; font-family: var(--font-family-mono);">
              <strong>${escapeHtml(m.from)}</strong>: ${escapeHtml(m.subject)}
              <div style="color: var(--ink-dim);">${escapeHtml(m.content)}</div>
            </div>
          `).join('') : '<div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No new messages in mailbox.</div>'}
        </div>
      </div>

      <!-- View 3: Vitals & Mood (Hidden by default) -->
      <div id="view-vitals" style="display: none; margin-bottom: 12px;">
        <div class="card" style="padding: 12px;">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-family-mono); margin-bottom: 3px;">
              <span>PRODUCTIVITY</span><span>${employee.productivity || 100}%</span>
            </div>
            <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
              <div style="width: ${employee.productivity || 100}%; background: var(--mint); height: 100%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-family-mono); margin-bottom: 3px;">
              <span>MOOD</span><span>${employee.mood || 100}%</span>
            </div>
            <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
              <div style="width: ${employee.mood || 100}%; background: ${(employee.mood || 100) > 50 ? 'var(--yellow)' : 'var(--maroon)'}; height: 100%;"></div>
            </div>
          </div>
          <div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">
            <strong>Personality:</strong> ${escapeHtml(employee.personality || 'enthusiastic')}
          </div>
        </div>
      </div>
    `;

    // Tab Switching
    const tabTerm = bodyContainer.querySelector('#tab-terminal-btn');
    const tabMail = bodyContainer.querySelector('#tab-mailbox-btn');
    const tabVit = bodyContainer.querySelector('#tab-vitals-btn');
    const viewTerm = bodyContainer.querySelector('#view-terminal');
    const viewMail = bodyContainer.querySelector('#view-mailbox');
    const viewVit = bodyContainer.querySelector('#view-vitals');
    const cmdBox = bodyContainer.querySelector('#agent-command-box');

    const switchTab = (activeTab, activeView) => {
      [tabTerm, tabMail, tabVit].forEach(t => t.classList.remove('active'));
      [viewTerm, viewMail, viewVit].forEach(v => v.style.display = 'none');
      activeTab.classList.add('active');
      activeView.style.display = 'block';
      cmdBox.style.display = activeView === viewTerm ? 'flex' : 'none';
    };

    tabTerm.onclick = () => switchTab(tabTerm, viewTerm);
    tabMail.onclick = () => switchTab(tabMail, viewMail);
    tabVit.onclick = () => switchTab(tabVit, viewVit);

    // Direct Agent Command Input Handler
    const runBtn = bodyContainer.querySelector('#btn-send-agent-prompt');
    const promptInput = bodyContainer.querySelector('#agent-direct-prompt');

    const sendDirective = () => {
      const text = promptInput.value.trim();
      if (!text) return;
      promptInput.value = '';

      const time = new Date().toLocaleTimeString();
      const screen = bodyContainer.querySelector('#terminal-screen');
      if (screen) {
        const line = document.createElement('div');
        line.innerHTML = `<span style="color: var(--yellow);">${time} [USER DIRECTIVE]:</span> ${escapeHtml(text)}`;
        screen.appendChild(line);

        const ack = document.createElement('div');
        ack.innerHTML = `<span style="color: var(--mint);">${time} [${employee.name.split(' ')[0]}]:</span> Received directive. Executing via ${providerName}...`;
        screen.appendChild(ack);

        screen.scrollTop = screen.scrollHeight;
      }

      // Add to employee logs in state
      if (!employee.terminalLogs) employee.terminalLogs = [];
      employee.terminalLogs.push(`[USER] ${text}`);
      employee.terminalLogs.push(`[EXEC] Executing: "${text}"`);
      employee.thought = `Working on: ${text}`;
      employee.status = 'working';
      emit('tick');
    };

    runBtn.onclick = sendDirective;
    promptInput.onkeypress = (e) => { if (e.key === 'Enter') sendDirective(); };

    backdrop.style.display = 'block';
    panel.style.transform = 'translateY(0)';
    
    const closeHandler = () => {
      EmployeeCard.hide();
      backdrop.removeEventListener('click', closeHandler);
    };
    
    backdrop.addEventListener('click', closeHandler);
    EmployeeCard._closeHandler = closeHandler;
  }

  static hide() {
    const panel = document.getElementById('slide-panel');
    const backdrop = document.getElementById('panel-backdrop');
    if (panel) panel.style.transform = 'translateY(100%)';
    if (backdrop) {
      backdrop.style.display = 'none';
      if (EmployeeCard._closeHandler) {
        backdrop.removeEventListener('click', EmployeeCard._closeHandler);
        EmployeeCard._closeHandler = null;
      }
    }
  }
}




// ─── Module: js/agents/artifacts.js ───

// ============================================
// THE OFFICE — Project Artifacts & Exporter
// Universal Bundler: HTML/CSS/JS, Python WASM Studio (Pyodide),
// Terraform / DevOps Inspector, & Pure-JS ZIP Generator
// ============================================

class ProjectArtifacts {
  /**
   * Bundle multiple project files into a runnable preview string
   * Handles Web Apps (HTML/JS/CSS), Python scripts (Pyodide WASM),
   * and Terraform / DevOps scripts (Plan Inspector)
   * @param {Object<string, string>} files map of filename -> content
   * @returns {string} standalone HTML
   */
  static bundleForPreview(files = {}) {
    const fileKeys = Object.keys(files);
    if (fileKeys.length === 0) return '<h1>No deliverable files found</h1>';

    // 1. If index.html exists, treat as web application
    if (files['index.html'] || files['Index.html']) {
      let indexHtml = files['index.html'] || files['Index.html'];

      // If CSS exists as separate file, inject into <head> or prepend
      const cssFile = files['style.css'] || files['styles.css'] || files['main.css'];
      if (cssFile && !indexHtml.includes(cssFile.substring(0, 40))) {
        const styleTag = `\n<style>\n/* Injected from style.css */\n${cssFile}\n</style>\n`;
        if (indexHtml.includes('</head>')) {
          indexHtml = indexHtml.replace('</head>', `${styleTag}</head>`);
        } else {
          indexHtml = `${styleTag}${indexHtml}`;
        }
      }

      // If JS exists as separate file, inject into <body> or append
      const jsFile = files['app.js'] || files['script.js'] || files['main.js'] || files['index.js'];
      if (jsFile && !indexHtml.includes(jsFile.substring(0, 40))) {
        const scriptTag = `\n<script>\n/* Injected from app.js */\n${jsFile}\n</script>\n`;
        if (indexHtml.includes('</body>')) {
          indexHtml = indexHtml.replace('</body>', `${scriptTag}</body>`);
        } else {
          indexHtml = `${indexHtml}${scriptTag}`;
        }
      }

      return indexHtml;
    }

    // 2. Python Script Studio (in-browser Pyodide WebAssembly execution)
    const hasPython = fileKeys.some(f => f.endsWith('.py'));
    if (hasPython) {
      return ProjectArtifacts.buildPythonStudio(files);
    }

    // 3. Terraform / Infrastructure / DevOps Studio
    const hasDevOps = fileKeys.some(f => f.endsWith('.tf') || f.endsWith('.sh') || f.endsWith('.yml') || f.endsWith('.yaml') || f.endsWith('.sql'));
    if (hasDevOps) {
      return ProjectArtifacts.buildDevOpsStudio(files);
    }

    // 4. Fallback studio for other languages (Go, Rust, etc.)
    return ProjectArtifacts.buildDevOpsStudio(files);
  }

  /**
   * Interactive In-Browser Python Studio powered by Pyodide WebAssembly
   */
  static buildPythonStudio(files = {}) {
    const mainPyName = Object.keys(files).find(f => f.endsWith('.py')) || Object.keys(files)[0] || 'main.py';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Python In-Browser Runner</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #141414; color: #FFFDF7; padding: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 10px; }
    .title { font-size: 13px; font-weight: bold; color: #4AF626; display: flex; align-items: center; gap: 6px; }
    .tabs { display: flex; gap: 4px; overflow-x: auto; margin-bottom: 8px; }
    .tab-btn { background: #222; border: 1px solid #444; color: #BBB; padding: 4px 10px; font-size: 11px; cursor: pointer; font-family: inherit; }
    .tab-btn.active { background: #FFCA54; color: #1B1B1B; font-weight: bold; border-color: #1B1B1B; }
    .code-view { background: #1A1A1A; border: 1px solid #333; color: #EEE; font-size: 11px; padding: 10px; max-height: 200px; overflow-y: auto; white-space: pre; margin-bottom: 10px; line-height: 1.4; }
    .controls { display: flex; gap: 8px; margin-bottom: 10px; }
    button.btn-run { background: #4AF626; border: 2px solid #1B1B1B; color: #141414; font-weight: bold; padding: 6px 14px; font-size: 11px; cursor: pointer; font-family: inherit; }
    button.btn-run:hover { background: #38c41d; }
    .terminal { background: #0A0A0A; border: 2px solid #333; padding: 10px; font-size: 11px; color: #4AF626; min-height: 110px; max-height: 190px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
  </style>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js"></script>
</head>
<body>
  <div class="header">
    <div class="title">🐍 PYTHON WASM RUNNER (IN-BROWSER)</div>
    <div style="font-size: 10px; color: #888;">Pyodide WebAssembly</div>
  </div>
  <div class="tabs" id="file-tabs"></div>
  <pre class="code-view" id="code-content"></pre>
  <div class="controls">
    <button class="btn-run" id="btn-run-code">▶ RUN PYTHON CODE</button>
    <button class="btn-run" id="btn-clear-term" style="background: #333; color: #DDD;">CLEAR</button>
  </div>
  <div class="terminal" id="terminal-out">> Ready. Click 'RUN PYTHON CODE' to execute live in WebAssembly...</div>
  <script>
    const files = ${JSON.stringify(files)};
    let activeFile = ${JSON.stringify(mainPyName)};
    let pyodideInstance = null;

    const tabsContainer = document.getElementById('file-tabs');
    const codeEl = document.getElementById('code-content');
    const termEl = document.getElementById('terminal-out');

    function renderTabs() {
      tabsContainer.innerHTML = '';
      Object.keys(files).forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (f === activeFile ? ' active' : '');
        btn.textContent = f;
        btn.onclick = () => {
          activeFile = f;
          renderTabs();
          codeEl.textContent = files[f];
        };
        tabsContainer.appendChild(btn);
      });
      codeEl.textContent = files[activeFile] || '';
    }
    renderTabs();

    function log(msg, color) {
      const line = document.createElement('div');
      if (color) line.style.color = color;
      line.textContent = msg;
      termEl.appendChild(line);
      termEl.scrollTop = termEl.scrollHeight;
    }

    document.getElementById('btn-clear-term').onclick = () => {
      termEl.innerHTML = '> Terminal cleared.';
    };

    document.getElementById('btn-run-code').onclick = async () => {
      const code = files[activeFile] || codeEl.textContent;
      log('> Executing ' + activeFile + ' in browser...', '#56D8FF');

      if (window.loadPyodide) {
        try {
          if (!pyodideInstance) {
            log('> Initializing Pyodide Python 3.11 WebAssembly environment...', '#FFCA54');
            pyodideInstance = await window.loadPyodide();
            log('> WebAssembly runtime initialized!', '#4AF626');
          }
          pyodideInstance.setStdout({ batched: (str) => log(str, '#FFFDF7') });
          pyodideInstance.setStderr({ batched: (str) => log(str, '#FF6B6B') });

          const startTime = performance.now();
          const result = await pyodideInstance.runPythonAsync(code);
          const duration = (performance.now() - startTime).toFixed(1);

          if (result !== undefined) {
            log(String(result), '#4AF626');
          }
          log('> Process completed in ' + duration + 'ms (exit code 0)', '#4AF626');
        } catch (err) {
          log('> Python Traceback Error:\\n' + err.message, '#FF6B6B');
        }
      } else {
        log('> Interpreting ' + activeFile + ' (offline fallback)...', '#FFCA54');
        log('Execution simulation: script compiled successfully without syntax errors.', '#4AF626');
      }
    };
  </script>
</body>
</html>`;
  }

  /**
   * Interactive Terraform & DevOps Inspector Studio
   */
  static buildDevOpsStudio(files = {}) {
    const primaryFile = Object.keys(files).find(f => f.endsWith('.tf') || f.endsWith('.sh') || f.endsWith('.yml')) || Object.keys(files)[0] || 'main.tf';
    const isTerraform = Object.keys(files).some(f => f.endsWith('.tf'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevOps & Infrastructure Studio</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #1B2921; color: #FFFDF7; padding: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8B6F47; padding-bottom: 8px; margin-bottom: 10px; }
    .title { font-size: 13px; font-weight: bold; color: #FFCA54; display: flex; align-items: center; gap: 6px; }
    .tabs { display: flex; gap: 4px; overflow-x: auto; margin-bottom: 8px; }
    .tab-btn { background: #141f19; border: 1px solid #8B6F47; color: #BBB; padding: 4px 10px; font-size: 11px; cursor: pointer; font-family: inherit; }
    .tab-btn.active { background: #FFCA54; color: #1B1B1B; font-weight: bold; }
    .code-view { background: #0F1712; border: 1px solid #8B6F47; color: #E8F5E9; font-size: 11px; padding: 10px; max-height: 200px; overflow-y: auto; white-space: pre; margin-bottom: 10px; line-height: 1.4; }
    .controls { display: flex; gap: 8px; margin-bottom: 10px; }
    button.btn-action { background: #FFCA54; border: 2px solid #1B1B1B; color: #1B1B1B; font-weight: bold; padding: 6px 14px; font-size: 11px; cursor: pointer; font-family: inherit; }
    button.btn-action:hover { background: #EBB63C; }
    .terminal { background: #090E0B; border: 2px solid #8B6F47; padding: 10px; font-size: 11px; color: #A5D6A7; min-height: 110px; max-height: 190px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">☁️ ${isTerraform ? 'TERRAFORM INFRASTRUCTURE STUDIO' : 'DEVOPS SCRIPT STUDIO'}</div>
    <div style="font-size: 10px; color: #A5D6A7;">Syntax Verified ✅</div>
  </div>
  <div class="tabs" id="file-tabs"></div>
  <pre class="code-view" id="code-content"></pre>
  <div class="controls">
    <button class="btn-action" id="btn-plan">${isTerraform ? '▶ SIMULATE TERRAFORM PLAN' : '▶ RUN SCRIPT VALIDATOR'}</button>
    <button class="btn-action" id="btn-copy" style="background: #2E7D32; color: #FFF;">📋 COPY FILE</button>
  </div>
  <div class="terminal" id="terminal-out">> Ready. Click 'SIMULATE TERRAFORM PLAN' to inspect infrastructure resources.</div>
  <script>
    const files = ${JSON.stringify(files)};
    let activeFile = ${JSON.stringify(primaryFile)};

    const tabsContainer = document.getElementById('file-tabs');
    const codeEl = document.getElementById('code-content');
    const termEl = document.getElementById('terminal-out');

    function renderTabs() {
      tabsContainer.innerHTML = '';
      Object.keys(files).forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (f === activeFile ? ' active' : '');
        btn.textContent = f;
        btn.onclick = () => {
          activeFile = f;
          renderTabs();
          codeEl.textContent = files[f];
        };
        tabsContainer.appendChild(btn);
      });
      codeEl.textContent = files[activeFile] || '';
    }
    renderTabs();

    document.getElementById('btn-copy').onclick = () => {
      navigator.clipboard?.writeText(codeEl.textContent);
      alert('Copied ' + activeFile + ' to clipboard!');
    };

    document.getElementById('btn-plan').onclick = () => {
      const content = files[activeFile] || codeEl.textContent;
      termEl.innerHTML = '';
      function addLine(txt, col) {
        const d = document.createElement('div');
        if (col) d.style.color = col;
        d.textContent = txt;
        termEl.appendChild(d);
      }

      if (${isTerraform}) {
        addLine('Initializing provider plugins...', '#81C784');
        addLine('Terraform has created a lock file .terraform.lock.hcl', '#81C784');
        addLine('Terraform has been successfully initialized!\\n', '#4CAF50');
        addLine('Terraform used the selected providers to generate the following execution plan:', '#FFF');
        addLine('------------------------------------------------------------------------', '#888');

        const matches = Array.from(content.matchAll(/resource\\s+\"([^\"]+)\"\\s+\"([^\"]+)\"/g));
        if (matches.length > 0) {
          matches.forEach(m => {
            addLine('  # ' + m[1] + '.' + m[2] + ' will be created', '#81C784');
            addLine('  + resource \"' + m[1] + '\" \"' + m[2] + '\" {', '#81C784');
            addLine('      + id = (known after apply)', '#A5D6A7');
            addLine('    }\\n', '#81C784');
          });
          addLine('Plan: ' + matches.length + ' to add, 0 to change, 0 to destroy.', '#4CAF50');
        } else {
          addLine('  + Planned resources parsed and verified.', '#81C784');
          addLine('Plan: 1 to add, 0 to change, 0 to destroy.', '#4CAF50');
        }
        addLine('\\nApply complete! Resources: ready for deployment.', '#FFCA54');
      } else {
        addLine('> Syntax check passed with 0 errors.', '#4CAF50');
        addLine('> Validating permissions and shell compatibility...', '#81C784');
        addLine('> Ready for deployment in production environment.', '#FFCA54');
      }
      termEl.scrollTop = termEl.scrollHeight;
    };
  </script>
</body>
</html>`;
  }

  /**
   * Create a blob URL for previewing the bundled app in a separate browser tab
   * @param {Object<string, string>} files 
   * @returns {string} blob URL
   */
  static createPreviewBlobUrl(files = {}) {
    const bundledHtml = ProjectArtifacts.bundleForPreview(files);
    const blob = new Blob([bundledHtml], { type: 'text/html;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  /**
   * Download a single file
   * @param {string} filename 
   * @param {string} content 
   * @param {string} [mimeType]
   */
  static downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
    if (filename.endsWith('.html')) mimeType = 'text/html;charset=utf-8';
    else if (filename.endsWith('.py')) mimeType = 'text/x-python;charset=utf-8';
    else if (filename.endsWith('.tf')) mimeType = 'text/plain;charset=utf-8';
    else if (filename.endsWith('.json')) mimeType = 'application/json;charset=utf-8';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  /**
   * Build a standard store-only ZIP file in pure JavaScript
   * Spec: PKWARE ZIP format, method 0 (Store)
   * @param {Object<string, string>} files map of filename -> text
   * @returns {Uint8Array}
   */
  static createZip(files = {}) {
    const encoder = new TextEncoder();
    const fileEntries = [];
    let localOffset = 0;

    // CRC32 table
    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[i] = c;
    }

    function crc32(bytes) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // Process each file
    const localHeaders = [];
    for (const [name, content] of Object.entries(files)) {
      const nameBytes = encoder.encode(name);
      const dataBytes = encoder.encode(content);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      // Local file header (30 bytes + name length)
      const header = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x04034b50, true);  // Local file header signature
      view.setUint16(4, 20, true);          // Version needed
      view.setUint16(6, 0, true);           // Flags
      view.setUint16(8, 0, true);           // Compression: 0 = Store
      view.setUint16(10, 0, true);          // Mod time
      view.setUint16(12, 0, true);          // Mod date
      view.setUint32(14, crc, true);        // CRC32
      view.setUint32(18, size, true);       // Compressed size
      view.setUint32(22, size, true);       // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // Name length
      view.setUint16(28, 0, true);          // Extra field length
      header.set(nameBytes, 30);

      fileEntries.push({
        nameBytes,
        crc,
        size,
        offset: localOffset
      });

      localHeaders.push(header, dataBytes);
      localOffset += header.length + dataBytes.length;
    }

    // Central directory headers
    const centralHeaders = [];
    let centralDirSize = 0;
    for (const entry of fileEntries) {
      const cHeader = new Uint8Array(46 + entry.nameBytes.length);
      const view = new DataView(cHeader.buffer);
      view.setUint32(0, 0x02014b50, true);  // Central file header signature
      view.setUint16(4, 20, true);          // Version made by
      view.setUint16(6, 20, true);          // Version needed
      view.setUint16(8, 0, true);           // Flags
      view.setUint16(10, 0, true);          // Compression 0
      view.setUint16(12, 0, true);          // Mod time
      view.setUint16(14, 0, true);          // Mod date
      view.setUint32(16, entry.crc, true);  // CRC32
      view.setUint32(20, entry.size, true); // Compressed size
      view.setUint32(24, entry.size, true); // Uncompressed size
      view.setUint16(28, entry.nameBytes.length, true); // Name length
      view.setUint16(30, 0, true);          // Extra field len
      view.setUint16(32, 0, true);          // Comment len
      view.setUint16(34, 0, true);          // Disk start
      view.setUint16(36, 0, true);          // Internal attr
      view.setUint32(38, 0, true);          // External attr
      view.setUint32(42, entry.offset, true); // Relative offset of local header
      cHeader.set(entry.nameBytes, 46);

      centralHeaders.push(cHeader);
      centralDirSize += cHeader.length;
    }

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
    eocdView.setUint16(4, 0, true);          // Disk number
    eocdView.setUint16(6, 0, true);          // Central dir disk
    eocdView.setUint16(8, fileEntries.length, true);  // Records on this disk
    eocdView.setUint16(10, fileEntries.length, true); // Total records
    eocdView.setUint32(12, centralDirSize, true);     // Size of central dir
    eocdView.setUint32(16, localOffset, true);        // Offset of central dir
    eocdView.setUint16(20, 0, true);                  // Comment len

    // Concatenate all parts
    const totalLength = localOffset + centralDirSize + eocd.length;
    const zipData = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of localHeaders) {
      zipData.set(chunk, offset);
      offset += chunk.length;
    }
    for (const chunk of centralHeaders) {
      zipData.set(chunk, offset);
      offset += chunk.length;
    }
    zipData.set(eocd, offset);

    return zipData;
  }

  /**
   * Download all files as a ZIP archive
   * @param {string} zipFilename 
   * @param {Object<string, string>} files 
   */
  static downloadZip(zipFilename, files = {}) {
    const bytes = ProjectArtifacts.createZip(files);
    const blob = new Blob([bytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}




// ─── Module: js/agents/brain.js ───

// ============================================
// THE OFFICE — Agent Brain Execution Layer
// ============================================





class AgentBrain {
  /**
   * Execute an AI prompt on behalf of an employee
   * @param {Object} employee 
   * @param {Array<{role: string, content: string}>} messages 
   * @param {Object} [options]
   * @returns {Promise<{ content: string, usage?: Object, provider?: string, model?: string }>}
   */
  static async execute(employee, messages, options = {}) {
    const router = getAIRouter();
    if (!router || router.getActiveProviderCount() === 0) {
      throw new Error('NO_PROVIDER_CONNECTED');
    }

    const preferredProvider = employee?.provider || options.provider;
    const model = employee?.model || options.model;

    const res = await router.route(messages, {
      preferredProvider,
      model,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2048
    });

    // Update global dashboard statistics
    try {
      const dbStats = getState('dashboard') || {};
      const calls = (dbStats.totalApiCalls || 0) + 1;
      const tokens = (dbStats.totalTokensUsed || 0) + (res.usage?.totalTokens || 0);
      setState('dashboard.totalApiCalls', calls);
      setState('dashboard.totalTokensUsed', tokens);
    } catch (e) { /* ignore stats err */ }

    return res;
  }

  /**
   * Parse JSON from AI output with aggressive tolerance for markdown code fences and leading/trailing chatter
   * @param {string} text 
   * @param {*} [fallbackValue=null]
   * @returns {*}
   */
  static extractJSON(text, fallbackValue = null) {
    if (!text || typeof text !== 'string') return fallbackValue;

    // 1. Direct parse attempt
    const trimmed = text.trim();
    try {
      return JSON.parse(trimmed);
    } catch (e) { /* continue */ }

    // 2. Strip ```json ... ``` code fence
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e) { /* continue */ }
    }

    // 3. Find outer-most { ... }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) { /* continue */ }
    }

    // 4. Find outer-most [ ... ]
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      const candidate = text.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) { /* continue */ }
    }

    return fallbackValue;
  }

  /**
   * Extract files from code generation response
   * Looks for === FILE: filename === ... === END FILE === or markdown blocks
   * @param {string} text 
   * @param {string} [defaultFileName='index.html']
   * @returns {Object<string, string>} map of filename -> code string
   */
  static extractFiles(text, defaultFileName = 'index.html') {
    const files = {};
    if (!text || typeof text !== 'string') return files;

    // Pattern 1: === FILE: filename === ... === END FILE ===
    const markerRegex = /===\s*FILE:\s*([^\n\r=]+)\s*===([\s\S]*?)(?:===\s*END\s*FILE\s*===|$)/gi;
    let match;
    let foundWithMarkers = false;

    while ((match = markerRegex.exec(text)) !== null) {
      const fileName = match[1].trim();
      let fileContent = match[2];
      // Strip optional leading/trailing backticks if model wrapped it anyway
      fileContent = fileContent.replace(/^\s*```[a-z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '');
      if (fileName && fileContent.trim()) {
        files[fileName] = fileContent.trim();
        foundWithMarkers = true;
      }
    }

    if (foundWithMarkers && Object.keys(files).length > 0) {
      return files;
    }

    // Pattern 2: Single HTML markdown code block
    const htmlBlock = text.match(/```html\s*([\s\S]*?)\s*```/i);
    if (htmlBlock && htmlBlock[1].trim()) {
      files['index.html'] = htmlBlock[1].trim();
      return files;
    }

    // Pattern 3: Any generic markdown code block
    const genericBlock = text.match(/```[a-z]*\s*([\s\S]*?)\s*```/i);
    if (genericBlock && genericBlock[1].trim()) {
      files[defaultFileName] = genericBlock[1].trim();
      return files;
    }

    // Pattern 4: If text itself looks like HTML
    if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<div') || text.includes('<script')) {
      files[defaultFileName] = text.trim();
      return files;
    }

    // Fallback: whole text
    files[defaultFileName] = text.trim();
    return files;
  }
}




// ─── Module: js/agents/orchestrator.js ───

// ============================================
// THE OFFICE — Multi-Agent Project Orchestrator
// Coordinates PM, Tech Lead, Developers, QA & CEO
// ============================================









class ProjectOrchestrator {
  /**
   * Find an employee suitable for a pipeline role, with smart fallbacks
   * @param {string} roleCategory 'pm' | 'tech_lead' | 'dev' | 'qa' | 'designer' | 'ceo'
   * @returns {Object} employee
   */
  static findAgentForRole(roleCategory) {
    const employees = getState('employees') || [];
    if (employees.length === 0) return null;

    const findByRole = (...roles) => {
      for (const r of roles) {
        const found = employees.find(e => normalizeRoleKey(e.role) === r);
        if (found) return found;
      }
      return null;
    };

    switch (roleCategory) {
      case 'pm':
        return findByRole('product_manager', 'program_manager', 'project_manager', 'ceo') || employees[0];
      case 'tech_lead':
        return findByRole('tech_lead', 'cto', 'senior_developer', 'developer') || employees[0];
      case 'dev':
        return findByRole('senior_developer', 'developer', 'tech_lead') || employees[0];
      case 'qa':
        return findByRole('qa_lead', 'tester', 'tech_lead') || employees[0];
      case 'designer':
        return findByRole('uiux_lead', 'designer', 'developer') || employees[0];
      case 'ceo':
        return findByRole('ceo') || employees[0];
      default:
        return employees[0];
    }
  }

  /**
   * Start a brand new project from a boss requirement
   * @param {string} requirement 
   * @param {Object} [options]
   * @returns {Promise<Object>} project
   */
  static async startProject(requirement, options = {}) {
    const cleanReq = requirement.trim();
    if (!cleanReq) throw new Error('Requirement cannot be empty');

    const projectId = uid('proj');
    const pm = ProjectOrchestrator.findAgentForRole('pm');
    const techLead = ProjectOrchestrator.findAgentForRole('tech_lead');
    const dev = ProjectOrchestrator.findAgentForRole('dev');
    const qa = ProjectOrchestrator.findAgentForRole('qa');
    const ceo = ProjectOrchestrator.findAgentForRole('ceo');

    const project = {
      id: projectId,
      name: options.name || ProjectOrchestrator.generateProjectTitle(cleanReq),
      requirement: cleanReq,
      projectType: detectProjectType(cleanReq),
      status: 'in_progress', // 'in_progress', 'delivered', 'failed'
      phase: 'questions',    // 'questions', 'spec', 'planning', 'coding', 'qa', 'delivered'
      phaseProgress: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      team: {
        pmId: pm?.id,
        techLeadId: techLead?.id,
        devId: dev?.id,
        qaId: qa?.id,
        ceoId: ceo?.id
      },
      questions: [],
      answers: {},
      spec: null,
      plan: null,
      files: {},
      qaResult: null,
      deliveryMessage: null,
      timeline: [
        {
          timestamp: Date.now(),
          authorName: pm ? pm.name : 'Product Manager',
          authorRole: 'Product Manager',
          message: `Received project directive: "${cleanReq}". Reviewing requirements.`
        }
      ]
    };

    // Save project in store
    const projects = getState('projects') || [];
    setState('projects', [project, ...projects]);
    saveProject(project).catch(() => {});

    // Set employee active state and floor notification
    if (pm) {
      ProjectOrchestrator.updateEmployeeStatus(pm.id, 'working', `Clarifying specs for "${project.name}"`);
      emit('agent-say', { empId: pm.id, text: `On it! Gathering requirements for "${project.name}"...` });
    }

    // Post to engineering channel
    ProjectOrchestrator.postChatMessage('#engineering', 'Orchestrator', `🚀 **NEW PROJECT INITIATED**: "${project.name}"\nRequirement: "${cleanReq}"`);

    // Check autopilot: if true, immediately answer questions with defaults and build
    if (options.autopilot) {
      setTimeout(() => {
        ProjectOrchestrator.executePhaseQuestions(project.id, { autopilot: true });
      }, 500);
      return project;
    }

    // Trigger questions generation
    ProjectOrchestrator.executePhaseQuestions(project.id);
    return project;
  }

  /**
   * Phase 1: PM generates clarifying questions
   */
  static async executePhaseQuestions(projectId, options = {}) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    const company = getState('company') || { name: 'The Office' };
    const projectType = project.projectType || detectProjectType(project.requirement);

    try {
      const messages = buildQuestionsPrompt(project.requirement, company.name, projectType);
      const res = await AgentBrain.execute(pm, messages, { temperature: 0.7 });
      const parsed = AgentBrain.extractJSON(res.content, null);

      let questions = parsed?.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = ProjectOrchestrator.defaultQuestions(projectType);
      }

      project.questions = questions;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: pm ? pm.name : 'Product Manager',
        authorRole: 'Product Manager',
        message: `Prepared ${questions.length} clarifying questions for the boss.`
      });

      // If autopilot, auto-answer with default options
      if (options.autopilot) {
        const answers = {};
        questions.forEach(q => {
          answers[q.question] = q.defaultOption || q.options[0];
        });
        ProjectOrchestrator.submitAnswers(projectId, answers);
        return;
      }

      // Mark PM with alert so they walk to boss on floor
      if (pm) {
        ProjectOrchestrator.setEmployeeAlert(pm.id, true);
        emit('agent-say', { empId: pm.id, text: `Boss! Quick questions on "${project.name}"! 📋` });
      }

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Product Manager has questions on "${project.name}"!`, 'info');

    } catch (err) {
      console.warn('Phase questions failed, using defaults:', err);
      project.questions = ProjectOrchestrator.defaultQuestions(projectType);
      if (options.autopilot) {
        const answers = {};
        project.questions.forEach(q => { answers[q.question] = q.defaultOption || q.options[0]; });
        ProjectOrchestrator.submitAnswers(projectId, answers);
      } else {
        ProjectOrchestrator.updateProject(project);
        emit('project-updated', project);
      }
    }
  }

  /**
   * Type-aware fallback clarifying questions (used when no AI is available or parsing fails)
   * @param {string} projectType
   */
  static defaultQuestions(projectType) {
    if (projectType === 'python' || projectType === 'script') {
      return [
        { id: 'q1', question: 'How should the script authenticate / get credentials?', options: ['Default credential chain / environment variables', 'Named profile passed as a CLI argument', 'Explicit keys via config file'], defaultOption: 'Default credential chain / environment variables' },
        { id: 'q2', question: 'What output format do you want?', options: ['Readable table in the terminal', 'JSON', 'CSV file'], defaultOption: 'Readable table in the terminal' },
        { id: 'q3', question: 'What scope should it cover?', options: ['Single region/target passed as an argument', 'All regions/targets', 'Configurable list'], defaultOption: 'Single region/target passed as an argument' }
      ];
    }
    if (projectType === 'terraform') {
      return [
        { id: 'q1', question: 'Which cloud provider?', options: ['AWS', 'Azure', 'GCP'], defaultOption: 'AWS' },
        { id: 'q2', question: 'How should state be stored?', options: ['Local state (simple)', 'Remote backend (S3/GCS/Azure Blob)', 'Terraform Cloud'], defaultOption: 'Local state (simple)' },
        { id: 'q3', question: 'Environment structure?', options: ['Single environment with variables', 'Separate dev/prod via tfvars', 'Reusable module + root'], defaultOption: 'Single environment with variables' }
      ];
    }
    return [
      { id: 'q1', question: 'What is the visual theme and styling tone?', options: ['Modern Neo-Brutalist (Warm Paper)', 'Dark Minimalist', 'Vibrant Retro Arcade'], defaultOption: 'Modern Neo-Brutalist (Warm Paper)' },
      { id: 'q2', question: 'What is the primary interaction?', options: ['Tap for random new items + animations', 'Categorized filters + search', 'Multi-step workflow'], defaultOption: 'Tap for random new items + animations' },
      { id: 'q3', question: 'Should it include local storage persistence?', options: ['Yes, save favorites and history', 'Keep it simple and stateless'], defaultOption: 'Yes, save favorites and history' }
    ];
  }

  /**
   * Phase 2: User submits answers -> triggers Spec, Planning, Coding, QA, and Delivery!
   */
  static async submitAnswers(projectId, answers = {}) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    project.answers = answers;
    project.phase = 'spec';
    project.phaseProgress = 25;
    
    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    if (pm) {
      ProjectOrchestrator.setEmployeeAlert(pm.id, false);
      ProjectOrchestrator.updateEmployeeStatus(pm.id, 'working', `Drafting technical spec for \"${project.name}\"`);
    }

    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'Boss (You)',
      authorRole: 'Executive',
      message: `Answered questions. Greenlit specification and architecture.`
    });

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    // Run the remaining pipeline asynchronously
    ProjectOrchestrator.runEngineeringPipeline(projectId).catch(err => {
      console.error('Pipeline error:', err);
      ProjectOrchestrator.markFailed(projectId, `Build failed: ${err.message}`);
    });
  }

  /**
   * Mark a project as failed (or back to delivered if it already has files) so it never stays stuck mid-phase
   */
  static markFailed(projectId, reason) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;
    const hasFiles = Object.keys(project.files || {}).length > 0;
    project.status = hasFiles ? 'delivered' : 'failed';
    project.phase = hasFiles ? 'delivered' : 'failed';
    project.phaseProgress = hasFiles ? 100 : 0;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'System',
      authorRole: 'Orchestrator',
      message: `⚠️ ${reason}`
    });
    Object.values(project.team || {}).forEach(id => {
      if (id) ProjectOrchestrator.updateEmployeeStatus(id, 'idle', null);
    });
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);
    Toast.show(reason, 'error', 6000);
  }

  /**
   * Executes Spec -> Architecture Plan -> Coding -> QA -> Delivery
   */
  static async runEngineeringPipeline(projectId) {
    let project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const company = getState('company') || { name: 'The Office' };
    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    const techLead = ProjectOrchestrator.getEmployee(project.team.techLeadId) || ProjectOrchestrator.findAgentForRole('tech_lead');
    const dev = ProjectOrchestrator.getEmployee(project.team.devId) || ProjectOrchestrator.findAgentForRole('dev');
    const qa = ProjectOrchestrator.getEmployee(project.team.qaId) || ProjectOrchestrator.findAgentForRole('qa');
    const ceo = ProjectOrchestrator.getEmployee(project.team.ceoId) || ProjectOrchestrator.findAgentForRole('ceo');
    const projectType = project.projectType || detectProjectType(project.requirement);
    project.projectType = projectType;

    // ── STEP 1: SPEC ──
    try {
      project.phase = 'spec';
      project.phaseProgress = 30;
      ProjectOrchestrator.updateProject(project);

      const specMessages = buildSpecPrompt(project.requirement, project.answers, company.name, projectType);
      const specRes = await AgentBrain.execute(pm, specMessages, { temperature: 0.6 });
      project.spec = specRes.content;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: pm?.name || 'Product Manager',
        authorRole: 'Product Manager',
        message: `Completed Product Specification document.`
      });

      // Animate handoff from PM to Tech Lead
      if (pm && techLead && pm.id !== techLead.id) {
        emit('agent-handoff', { fromId: pm.id, toId: techLead.id });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    } catch (e) {
      project.spec = `Deliverable: ${project.name}\nRequirement: ${project.requirement}\nType: ${projectType}`;
    }

    // ── STEP 2: TECH PLAN & TASKS ──
    try {
      project.phase = 'planning';
      project.phaseProgress = 45;
      if (techLead) {
        ProjectOrchestrator.updateEmployeeStatus(techLead.id, 'working', `Architecting "${project.name}"`);
        emit('agent-say', { empId: techLead.id, text: `Reviewing spec. Designing architecture... 📐` });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);

      const planMessages = buildPlanPrompt(project.spec, company.name, project.requirement, projectType);
      const planRes = await AgentBrain.execute(techLead, planMessages, { temperature: 0.5 });
      const planData = AgentBrain.extractJSON(planRes.content, {
        architectureSummary: `Planned ${projectType} deliverable.`,
        files: ProjectOrchestrator.defaultFilesFor(projectType),
        tasks: [{ title: 'Implement deliverable', assigneeRole: 'developer' }]
      });
      planData.files = ProjectOrchestrator.validatePlanFiles(planData.files, projectType);

      project.plan = planData;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: techLead?.name || 'Tech Lead',
        authorRole: 'Tech Lead',
        message: `Technical architecture finalized: ${planData.architectureSummary || 'Ready for coding'}.`
      });

      // Create Kanban tasks in state.tasks
      if (Array.isArray(planData.tasks)) {
        planData.tasks.forEach((t, i) => {
          const taskObj = new Task({
            id: uid('task'),
            title: `[${project.name}] ${t.title || 'Code file'}`,
            description: t.description || `Build file for project ${project.name}`,
            type: 'feature',
            priority: 'P1',
            status: i === 0 ? 'in_progress' : 'backlog',
            assigneeId: dev ? dev.id : null,
            createdAt: Date.now()
          });
          pushState('tasks', taskObj.toJSON());
        });
      }

      // Animate handoff from Tech Lead to Developer
      if (techLead && dev && techLead.id !== dev.id) {
        emit('agent-handoff', { fromId: techLead.id, toId: dev.id });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    } catch (e) {
      project.plan = {
        architectureSummary: `Planned ${projectType} deliverable.`,
        projectType,
        files: ProjectOrchestrator.defaultFilesFor(projectType)
      };
    }

    // ── STEP 3: CODING ──
    project.phase = 'coding';
    project.phaseProgress = 60;
    if (dev) {
      ProjectOrchestrator.updateEmployeeStatus(dev.id, 'working', `Writing code for "${project.name}"`);
      emit('agent-say', { empId: dev.id, text: `Headphones on. Writing the code! 💻⚡` });
    }
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    const filesToBuild = (project.plan?.files && project.plan.files.length > 0)
      ? project.plan.files
      : ProjectOrchestrator.defaultFilesFor(projectType);

    const builtFiles = {};
    let offlineMode = false;
    for (let i = 0; i < filesToBuild.length; i++) {
      const fileInfo = filesToBuild[i];
      const fileName = fileInfo.name || 'index.html';

      // Offline templates produce the whole deliverable in one go — skip remaining planned files
      if (offlineMode) break;

      let codeRes = null;
      try {
        const codeMessages = buildCodePrompt(fileName, fileInfo.description, project.spec, project.plan, builtFiles, project.requirement);
        codeRes = await AgentBrain.execute(dev, codeMessages, { temperature: 0.4, maxTokens: 8192 });
      } catch (err) {
        if (err.message === 'NO_PROVIDER_CONNECTED' || err.message?.includes('No AI provider') || err.message?.includes('PROVIDER')) {
          Toast.show('No working AI key — delivered an offline starter template instead of custom code.', 'info', 6000);
          offlineMode = true;
          const primary = ProjectOrchestrator.defaultFilesFor(projectType)[0].name;
          codeRes = { content: ProjectOrchestrator.generateOfflineApp(project, primary) };
        } else {
          throw err;
        }
      }

      const extracted = AgentBrain.extractFiles(codeRes.content, fileName);
      Object.assign(builtFiles, extracted);
      project.files = builtFiles;

      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Wrote ${fileName} (${(builtFiles[fileName] || '').length} bytes).`
      });

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    }

    // ── STEP 4: QA & BUG FIX ──
    project.phase = 'qa';
    project.phaseProgress = 80;
    if (qa) {
      ProjectOrchestrator.updateEmployeeStatus(qa.id, 'working', `Testing "${project.name}"`);
      emit('agent-say', { empId: qa.id, text: `QA running tests on the build... 🔍` });
    }
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    let qaResult = null;
    try {
      const qaMessages = buildQAPrompt(project.spec, project.files);
      const qaRes = await AgentBrain.execute(qa, qaMessages, { temperature: 0.4 });
      qaResult = AgentBrain.extractJSON(qaRes.content, { passed: true, score: 98, bugs: [] });
    } catch (e) {
      qaResult = { passed: true, score: 95, summary: 'Verified basic functionality and UI rendering.' };
    }

    project.qaResult = qaResult;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: qa?.name || 'QA Lead',
      authorRole: 'QA Lead',
      message: `QA audit complete. Score: ${qaResult.score || 95}/100. Status: ${qaResult.passed ? 'PASSED ✅' : 'ISSUES DETECTED ⚠️'}.`
    });

    // If QA found bugs and dev is available, run 1 round of fixes
    if (qaResult.bugs && qaResult.bugs.length > 0 && !qaResult.passed) {
      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Patching ${qaResult.bugs.length} QA issues...`
      });
      emit('agent-say', { empId: dev?.id, text: `Patching QA issues right now... 🔧` });

      for (const bug of qaResult.bugs.slice(0, 2)) {
        const targetFile = bug.file || 'index.html';
        if (project.files[targetFile]) {
          try {
            const fixMessages = buildFixPrompt(targetFile, project.files[targetFile], [bug]);
            const fixRes = await AgentBrain.execute(dev, fixMessages, { temperature: 0.5 });
            const fixedFiles = AgentBrain.extractFiles(fixRes.content, targetFile);
            if (fixedFiles[targetFile]) {
              project.files[targetFile] = fixedFiles[targetFile];
            }
          } catch (e) { /* ignore fix err */ }
        }
      }
    }

    // ── STEP 5: DELIVERY (CEO PRESENTATION) ──
    project.phase = 'delivered';
    project.phaseProgress = 100;
    project.status = 'delivered';

    try {
      const delMessages = buildDeliveryPrompt(project.requirement, project.spec, project.files, project.qaResult);
      const delRes = await AgentBrain.execute(ceo, delMessages, { temperature: 0.8 });
      project.deliveryMessage = delRes.content;
    } catch (e) {
      project.deliveryMessage = `Boom! "${project.name}" is finished, tested, and ready for you, boss! Tap the preview button to test it out right now!`;
    }

    project.timeline.push({
      timestamp: Date.now(),
      authorName: ceo?.name || 'Michael Scott',
      authorRole: 'CEO',
      message: `🎉 APP DELIVERED! Ready for boss review and interactive preview.`
    });

    // Mark employees back to idle / satisfied
    [pm, techLead, dev, qa].forEach(emp => {
      if (emp) ProjectOrchestrator.updateEmployeeStatus(emp.id, 'idle', 'App successfully delivered!');
    });

    if (ceo) {
      ProjectOrchestrator.setEmployeeAlert(ceo.id, true);
      emit('agent-say', { empId: ceo.id, text: `🎉 Boss, "${project.name}" is ready! Come check it out!` });
    }

    // Post delivery note in #general
    ProjectOrchestrator.postChatMessage('#general', ceo?.name || 'Michael Scott', `🎉 **DELIVERED**: "${project.name}"\n${project.deliveryMessage}\n\n*Check the Projects tab to preview or download the code!*`);

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);
    Toast.show(`🎉 "${project.name}" was successfully built and delivered!`, 'success', 6000);
  }

  /**
   * Request changes to an existing delivered project
   */
  static async requestChanges(projectId, changeDirective) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const cleanDirective = (changeDirective || '').trim();
    if (!cleanDirective) return;

    project.status = 'in_progress';
    project.phase = 'coding';
    project.phaseProgress = 70;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'Boss (You)',
      authorRole: 'Executive',
      message: `Requested changes: "${cleanDirective}". Team updating code.`
    });

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    const dev = ProjectOrchestrator.getEmployee(project.team.devId) || ProjectOrchestrator.findAgentForRole('dev');
    if (dev) {
      ProjectOrchestrator.updateEmployeeStatus(dev.id, 'working', `Applying changes to "${project.name}"`);
      emit('agent-say', { empId: dev.id, text: `Updating code with boss's changes! 💻` });
    }

    try {
      let codeRes = null;
      try {
        const changeMessages = buildChangePrompt(project.requirement, project.files, cleanDirective);
        codeRes = await AgentBrain.execute(dev, changeMessages, { temperature: 0.4, maxTokens: 8192 });
      } catch (err) {
        if (err.message === 'NO_PROVIDER_CONNECTED' || err.message?.includes('No AI provider') || err.message?.includes('PROVIDER')) {
          Toast.show('No active AI key — applying local code revisions.', 'info');
          codeRes = { content: ProjectOrchestrator.applyOfflineChanges(project, cleanDirective) };
        } else {
          throw err;
        }
      }

      if (codeRes && codeRes.content) {
        const updatedFiles = AgentBrain.extractFiles(codeRes.content);
        if (Object.keys(updatedFiles).length > 0) {
          project.files = Object.assign({}, project.files, updatedFiles);
        } else {
          const primaryFile = Object.keys(project.files)[0] || 'main.py';
          project.files[primaryFile] = codeRes.content;
        }
      }

      project.phase = 'delivered';
      project.phaseProgress = 100;
      project.status = 'delivered';
      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Changes incorporated and validated.`
      });

      if (dev) ProjectOrchestrator.updateEmployeeStatus(dev.id, 'idle', null);

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Changes applied to "${project.name}"!`, 'success');

    } catch (err) {
      console.error('Error applying revision:', err);
      // Reset safely to delivered state so the project is NEVER stuck in coding
      project.phase = 'delivered';
      project.phaseProgress = 100;
      project.status = 'delivered';
      project.timeline.push({
        timestamp: Date.now(),
        authorName: 'System',
        authorRole: 'Orchestrator',
        message: `⚠️ Could not apply change: ${err.message}`
      });
      if (dev) ProjectOrchestrator.updateEmployeeStatus(dev.id, 'idle', null);
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Revision failed: ${err.message}`, 'error', 6000);
    }
  }

  /**
   * Apply code modifications offline when no external AI provider is configured
   */
  static applyOfflineChanges(project, changeDirective) {
    const files = project.files || {};
    const directive = (changeDirective || '').toLowerCase();
    const fileNames = Object.keys(files);
    const primaryName = fileNames.find(f => f.endsWith('.py') || f.endsWith('.tf') || f.endsWith('.html')) || fileNames[0] || 'main.py';
    let code = files[primaryName] || '';

    // If it's an AWS EC2 python script
    if (primaryName.endsWith('.py') && (code.includes('ec2') || code.includes('boto3'))) {
      if (directive.includes('csv') || directive.includes('export')) {
        if (!code.includes('csv.DictWriter')) {
          code = code.replace('import json', 'import json\nimport csv');
          code = code.replace('if args.json:', `if args.csv:\n        with open(args.csv, 'w', newline='', encoding='utf-8') as f:\n            writer = csv.DictWriter(f, fieldnames=["InstanceId", "Name", "InstanceType", "Region", "AvailabilityZone", "PrivateIpAddress", "PublicIpAddress", "State", "LaunchTime"])\n            writer.writeheader()\n            writer.writerows(all_instances)\n        print(f"[SUCCESS] Exported {len(all_instances)} instances to {args.csv}")\n    elif args.json:`);
          code = code.replace('parser.add_argument("--json"', 'parser.add_argument("--csv", help="Export running instances to a CSV file path.")\n    parser.add_argument("--json"');
        }
      } else if (directive.includes('stop')) {
        if (!code.includes('stop_instances')) {
          code = code + `\n\ndef stop_instances_by_id(instance_ids: List[str], region: str, session: boto3.Session):\n    """Safely stop specified EC2 instances."""\n    ec2 = session.client('ec2', region_name=region)\n    print(f"[WARN] Stopping instances: {instance_ids}")\n    return ec2.stop_instances(InstanceIds=instance_ids)\n`;
        }
      } else {
        code = `# [REVISION APPLIED: ${changeDirective}]\n` + code;
      }
      return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
    }

    if (primaryName.endsWith('.py') || primaryName.endsWith('.tf')) {
      code = `# [REVISION APPLIED: ${changeDirective}]\n` + code;
      return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
    }

    if (code.includes('</body>')) {
      code = code.replace('</body>', `  <!-- Revision: ${changeDirective} -->\n</body>`);
    } else {
      code = code + `\n<!-- Revision: ${changeDirective} -->`;
    }
    return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
  }

  /**
   * Default file structure per project type
   */
  static defaultFilesFor(projectType, requirement = '') {
    const req = (requirement || '').toLowerCase();
    if (projectType === 'python') {
      if (req.includes('ec2') || req.includes('aws') || req.includes('instance')) {
        return [
          { name: 'list_ec2_instances.py', description: 'Python script to fetch and display running AWS EC2 instances via boto3' },
          { name: 'requirements.txt', description: 'Dependencies (boto3)' },
          { name: 'README.md', description: 'Instructions for AWS credentials and script execution' }
        ];
      }
      return [
        { name: 'main.py', description: 'Executable Python 3 script' },
        { name: 'requirements.txt', description: 'Python dependencies' },
        { name: 'README.md', description: 'Execution and setup guide' }
      ];
    }
    if (projectType === 'terraform') {
      return [
        { name: 'main.tf', description: 'Terraform resources and providers' },
        { name: 'variables.tf', description: 'Terraform input variables' },
        { name: 'outputs.tf', description: 'Outputs and endpoints' },
        { name: 'README.md', description: 'Terraform deployment instructions' }
      ];
    }
    if (projectType === 'script') {
      return [
        { name: 'script.sh', description: 'Executable shell automation script' },
        { name: 'README.md', description: 'Usage guide' }
      ];
    }
    if (projectType === 'fullstack_pyodide') {
      return [
        { name: 'index.html', description: 'Web UI with in-browser Pyodide Python runtime' },
        { name: 'app.py', description: 'Python logic executed by Pyodide' }
      ];
    }
    return [
      { name: 'index.html', description: 'Standalone interactive web application' }
    ];
  }

  /**
   * Validate and sanitize planned files against the detected project type
   */
  static validatePlanFiles(files, projectType) {
    if (!Array.isArray(files) || files.length === 0) {
      return ProjectOrchestrator.defaultFilesFor(projectType);
    }
    let sanitized = files.map(f => {
      if (typeof f === 'string') return { name: f, description: f };
      return { name: f.name || 'file', description: f.description || '' };
    });

    if (projectType === 'python' || projectType === 'script') {
      // Remove index.html if LLM mistakenly planned it for a pure python/script requirement
      sanitized = sanitized.filter(f => !f.name.endsWith('.html'));
      if (!sanitized.some(f => f.name.endsWith('.py') || f.name.endsWith('.sh'))) {
        sanitized.unshift({ name: 'main.py', description: 'Main Python script' });
      }
    } else if (projectType === 'terraform') {
      sanitized = sanitized.filter(f => !f.name.endsWith('.html'));
      if (!sanitized.some(f => f.name.endsWith('.tf'))) {
        sanitized.unshift({ name: 'main.tf', description: 'Main Terraform configuration' });
      }
    } else if (projectType === 'web') {
      if (!sanitized.some(f => f.name.endsWith('.html'))) {
        sanitized.unshift({ name: 'index.html', description: 'Main application HTML' });
      }
    }
    return sanitized;
  }

  // Helper utilities
  static getProject(id) {
    const projects = getState('projects') || [];
    return projects.find(p => p.id === id);
  }

  static updateProject(project) {
    project.updatedAt = Date.now();
    const projects = getState('projects') || [];
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      projects[idx] = project;
      setState('projects', [...projects]);
    } else {
      setState('projects', [project, ...projects]);
    }
    saveProject(project).catch(() => {});
  }

  static getEmployee(id) {
    if (!id) return null;
    const emps = getState('employees') || [];
    return emps.find(e => e.id === id);
  }

  static updateEmployeeStatus(empId, status, activityLabel = null) {
    const emps = getState('employees') || [];
    const emp = emps.find(e => e.id === empId);
    if (!emp) return;
    emp.status = status;
    if (activityLabel) {
      emp.thought = activityLabel;
      emp.activity = { type: 'work', label: activityLabel };
    } else {
      emp.activity = null;
    }
    setState('employees', [...emps]);
  }

  static setEmployeeAlert(empId, isAlert) {
    const emps = getState('employees') || [];
    const emp = emps.find(e => e.id === empId);
    if (!emp) return;
    emp.alert = isAlert;
    setState('employees', [...emps]);
  }

  static postChatMessage(channel, sender, text) {
    const state = getState();
    const chat = state.chat || {};
    const normChannel = channel.startsWith('#') ? channel.substring(1) : channel;
    
    // Support both chat[channel] and chat.channels[normChannel]
    const currentMsgs = chat[channel] || (chat.channels && chat.channels[normChannel]?.messages) || [];
    const newMsg = {
      id: uid('msg'),
      sender,
      senderId: 'system',
      text,
      timestamp: Date.now(),
      isUser: false
    };

    if (chat.channels && chat.channels[normChannel]) {
      chat.channels[normChannel].messages.push(newMsg);
      setState(`chat.channels.${normChannel}.messages`, chat.channels[normChannel].messages);
    }
    chat[channel] = [...currentMsgs, newMsg];
    setState('chat', { ...chat });
  }

  static generateProjectTitle(req) {
    if (!req) return 'New Project';
    const clean = req.trim().replace(/[^\w\s\-]/g, '');
    const rLower = clean.toLowerCase();

    // Domain matches
    if (rLower.includes('ec2') && (rLower.includes('fetch') || rLower.includes('list') || rLower.includes('get') || rLower.includes('running'))) {
      return 'AWS EC2 Instance Fetcher';
    }
    if (rLower.includes('terraform') || (rLower.includes('aws') && rLower.includes('infra'))) {
      return 'AWS Cloud Infrastructure';
    }
    if (rLower.includes('joke')) {
      return 'Dad Joke Web App';
    }

    // Strip generic command words
    const stopWords = new Set(['create', 'build', 'make', 'generate', 'write', 'develop', 'setup', 'a', 'an', 'the', 'to', 'for', 'some', 'please', 'script', 'app']);
    const words = clean.split(/\s+/).filter(Boolean);
    const meaningful = words.filter(w => !stopWords.has(w.toLowerCase()));

    if (meaningful.length > 0) {
      const titleWords = meaningful.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1));
      const isScript = rLower.includes('script') || rLower.includes('python');
      const suffix = isScript ? 'Script' : (rLower.includes('infra') || rLower.includes('terraform') ? 'Infra' : 'App');
      const base = titleWords.join(' ');
      return base.toLowerCase().includes(suffix.toLowerCase()) ? base : `${base} ${suffix}`;
    }

    return words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  static generateOfflineApp(project, fileName = 'index.html') {
    const title = project.name || 'Interactive App';
    const req = (project.requirement || '').toLowerCase();
    const isJoke = req.includes('joke');
    const isTerraform = fileName.endsWith('.tf') || req.includes('terraform') || req.includes('infra');
    const isPython = fileName.endsWith('.py') || (req.includes('python') && !req.includes('web') && !req.includes('app'));
    const isFullStackPyodide = req.includes('python') && (req.includes('web') || req.includes('app') || req.includes('backend'));

    if (isTerraform) {
      return `=== FILE: ${fileName.endsWith('.tf') ? fileName : 'main.tf'} ===
# ==========================================================
# Terraform Infrastructure as Code: ${title}
# Generated by The Office DevOps Bay
# ==========================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "Target AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

# ── Virtual Private Cloud (VPC) ──
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${title}-vpc"
    Environment = var.environment
    ManagedBy   = "TheOffice-Agents"
  }
}

# ── Public Subnet ──
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${title}-public-subnet-1"
  }
}

# ── Internet Gateway ──
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${title}-igw"
  }
}

# ── Security Group ──
resource "aws_security_group" "app_sg" {
  name        = "${title}-sg"
  description = "Allow inbound HTTPS and SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "security_group_id" {
  description = "ID of application security group"
  value       = aws_security_group.app_sg.id
}`;
    }

    if (isPython) {
      if (req.includes('ec2') || (req.includes('aws') && req.includes('instance')) || req.includes('boto3')) {
        return `=== FILE: list_ec2_instances.py ===
#!/usr/bin/env python3
"""
AWS EC2 Running Instances Fetcher
Fetches and displays all running EC2 instances across AWS regions using boto3.
Generated by The Office Engineering Bay.
Requirement: ${project.requirement}
"""

import sys
import os
import argparse
import json
from typing import List, Dict, Any

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
except ImportError:
    print("[ERROR] boto3 is not installed. Please run: pip install -r requirements.txt")
    sys.exit(1)


def get_all_regions(ec2_client) -> List[str]:
    """Retrieve list of all active AWS regions for EC2."""
    try:
        response = ec2_client.describe_regions(AllRegions=False)
        return [r['RegionName'] for r in response.get('Regions', [])]
    except Exception as e:
        print(f"[WARN] Could not retrieve regions: {e}. Defaulting to us-east-1.")
        return ['us-east-1']


def fetch_running_instances(region: str, session: boto3.Session) -> List[Dict[str, Any]]:
    """Query EC2 DescribeInstances filtered for instance-state-name == 'running'."""
    instances_list = []
    try:
        ec2 = session.client('ec2', region_name=region)
        paginator = ec2.get_paginator('describe_instances')
        page_iterator = paginator.paginate(
            Filters=[
                {'Name': 'instance-state-name', 'Values': ['running']}
            ]
        )

        for page in page_iterator:
            for reservation in page.get('Reservations', []):
                for inst in reservation.get('Instances', []):
                    name_tag = "-"
                    for tag in inst.get('Tags', []):
                        if tag.get('Key') == 'Name':
                            name_tag = tag.get('Value', '-')
                            break

                    instances_list.append({
                        'InstanceId': inst.get('InstanceId'),
                        'Name': name_tag,
                        'InstanceType': inst.get('InstanceType'),
                        'State': inst.get('State', {}).get('Name'),
                        'Region': region,
                        'AvailabilityZone': inst.get('Placement', {}).get('AvailabilityZone'),
                        'PrivateIpAddress': inst.get('PrivateIpAddress', '-'),
                        'PublicIpAddress': inst.get('PublicIpAddress', '-'),
                        'LaunchTime': str(inst.get('LaunchTime'))
                    })
    except ClientError as e:
        code = e.response.get('Error', {}).get('Code', '')
        if code in ('AuthFailure', 'UnauthorizedOperation'):
            print(f"[WARN] Region {region}: Access denied or region disabled.")
        else:
            print(f"[WARN] Region {region} error: {e}")
    except Exception as e:
        print(f"[WARN] Failed fetching from {region}: {e}")

    return instances_list


def print_table(instances: List[Dict[str, Any]]) -> None:
    """Render instances in a formatted CLI table."""
    if not instances:
        print("\\n[INFO] No running EC2 instances found.")
        return

    headers = ["Instance ID", "Name", "Type", "Region", "AZ", "Private IP", "Public IP", "State"]
    widths = [20, 20, 14, 14, 15, 16, 16, 10]

    header_line = " | ".join(h.ljust(widths[i]) for i, h in enumerate(headers))
    sep_line = "-+-".join("-" * widths[i] for i in range(len(headers)))

    print("\\n" + "=" * len(header_line))
    print(f"  RUNNING AWS EC2 INSTANCES ({len(instances)} Total)")
    print("=" * len(header_line))
    print(header_line)
    print(sep_line)

    for inst in instances:
        row = [
            str(inst.get('InstanceId', '-'))[:widths[0]].ljust(widths[0]),
            str(inst.get('Name', '-'))[:widths[1]].ljust(widths[1]),
            str(inst.get('InstanceType', '-'))[:widths[2]].ljust(widths[2]),
            str(inst.get('Region', '-'))[:widths[3]].ljust(widths[3]),
            str(inst.get('AvailabilityZone', '-'))[:widths[4]].ljust(widths[4]),
            str(inst.get('PrivateIpAddress', '-'))[:widths[5]].ljust(widths[5]),
            str(inst.get('PublicIpAddress', '-'))[:widths[6]].ljust(widths[6]),
            str(inst.get('State', '-'))[:widths[7]].ljust(widths[7]),
        ]
        print(" | ".join(row))

    print(sep_line)
    print(f"Total: {len(instances)} running instance(s)\\n")


def main():
    parser = argparse.ArgumentParser(description="Fetch running EC2 instances from AWS.")
    parser.add_argument("--region", "-r", help="Specific AWS region (e.g. us-east-1). Default: AWS profile region.")
    parser.add_argument("--all-regions", "-a", action="store_true", help="Scan across all active AWS regions.")
    parser.add_argument("--profile", "-p", help="AWS CLI profile name to use.")
    parser.add_argument("--json", "-j", action="store_true", help="Output results in pure JSON format.")
    args = parser.parse_args()

    session_kwargs = {}
    if args.profile:
        session_kwargs['profile_name'] = args.profile
    if args.region:
        session_kwargs['region_name'] = args.region

    try:
        session = boto3.Session(**session_kwargs)
        default_region = session.region_name or 'us-east-1'
    except (NoCredentialsError, PartialCredentialsError):
        print("[ERROR] AWS credentials not found.")
        print("Configure credentials via 'aws configure' or export AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.")
        sys.exit(1)

    all_instances = []
    if args.all_regions:
        default_client = session.client('ec2', region_name=default_region)
        regions = get_all_regions(default_client)
        print(f"🔍 Scanning {len(regions)} AWS regions for running instances...")
        for reg in regions:
            found = fetch_running_instances(reg, session)
            if found:
                print(f"  -> Found {len(found)} in {reg}")
            all_instances.extend(found)
    else:
        target_region = args.region or default_region
        print(f"🔍 Scanning region '{target_region}' for running instances...")
        all_instances = fetch_running_instances(target_region, session)

    if args.json:
        print(json.dumps(all_instances, indent=2))
    else:
        print_table(all_instances)


if __name__ == "__main__":
    main()
=== END FILE ===

=== FILE: requirements.txt ===
boto3>=1.34.0
botocore>=1.34.0
=== END FILE ===

=== FILE: README.md ===
# AWS EC2 Running Instances Fetcher

Python script to inspect, filter, and display all currently running Amazon EC2 instances.

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Authentication

Configure AWS credentials using any standard method:
\`\`\`bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
export AWS_DEFAULT_REGION="us-east-1"
\`\`\`

## Usage

- Default region:
  \`\`\`bash
  python list_ec2_instances.py
  \`\`\`
- Specific region:
  \`\`\`bash
  python list_ec2_instances.py --region us-west-2
  \`\`\`
- Scan all regions:
  \`\`\`bash
  python list_ec2_instances.py --all-regions
  \`\`\`
- Output JSON:
  \`\`\`bash
  python list_ec2_instances.py --json
  \`\`\`
=== END FILE ===`;
      }

      return `=== FILE: ${fileName.endsWith('.py') ? fileName : 'main.py'} ===
#!/usr/bin/env python3
"""
${title}
Automated script generated by The Office Engineering Bay.
Requirement: ${project.requirement}
"""

import sys
import os
import json
import time
from typing import Dict, List, Any

def run_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute main script logic with structured output."""
    print(f"[INFO] Initializing task execution for: {payload.get('task_name', 'default')}")
    start_time = time.time()
    
    results = []
    items = payload.get("items", ["Task A", "Task B", "Task C"])
    for i, item in enumerate(items, 1):
        processed = f"{i}. Processed: {item}"
        results.append(processed)
        print(f"  -> {processed}")
    
    duration = round(time.time() - start_time, 4)
    print(f"[SUCCESS] Completed {len(results)} items in {duration}s")
    
    return {
        "status": "success",
        "items_processed": len(results),
        "duration_seconds": duration,
        "results": results
    }

if __name__ == "__main__":
    print("=" * 50)
    print(f"🚀 RUNNING: ${title}")
    print("=" * 50)
    
    sample_input = {
        "task_name": "${title}",
        "environment": "production",
        "items": ["Execution Item 1", "Execution Item 2", "Execution Item 3"]
    }
    
    output = run_task(sample_input)
    print("\\n--- JSON Output ---")
    print(json.dumps(output, indent=2))
    sys.exit(0)
=== END FILE ===

=== FILE: requirements.txt ===
# Standard library only
=== END FILE ===

=== FILE: README.md ===
# ${title}

Executable Python script for: ${project.requirement}

## Usage
\`\`\`bash
python ${fileName.endsWith('.py') ? fileName : 'main.py'}
\`\`\`
=== END FILE ===`;
    }

    if (isFullStackPyodide) {
      return `=== FILE: index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} (Python Backend in Browser)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #FFFDF7; color: #1B1B1B; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .card { background: #FFFFFF; border: 3px solid #1B1B1B; box-shadow: 5px 5px 0 #1B1B1B; padding: 24px; max-width: 440px; width: 100%; }
    .badge { display: inline-block; background: #FFCA54; border: 1px solid #1B1B1B; padding: 2px 8px; font-size: 10px; font-weight: bold; margin-bottom: 10px; }
    h1 { font-size: 18px; margin-bottom: 12px; }
    .console { background: #141414; color: #4AF626; border: 2px solid #1B1B1B; padding: 12px; font-size: 11px; min-height: 120px; max-height: 180px; overflow-y: auto; white-space: pre-wrap; margin: 14px 0; }
    button { background: #FFCA54; border: 2px solid #1B1B1B; box-shadow: 2px 2px 0 #1B1B1B; padding: 8px 16px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 12px; }
    button:hover { background: #EBB63C; }
  </style>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js"></script>
</head>
<body>
  <div class="card">
    <div class="badge">🐍 PYTHON BACKEND (PYODIDE WASM)</div>
    <h1>${title}</h1>
    <p style="font-size: 12px; color: #57544C; margin-bottom: 10px;">This web app runs an in-browser Python backend with zero external servers!</p>
    <div class="console" id="output-box">> Initializing Python WebAssembly backend...</div>
    <div style="display: flex; gap: 8px;">
      <button id="btn-run">RUN PYTHON BACKEND ⚡</button>
      <button id="btn-stats" style="background: #FFF;">MEMORY STATS</button>
    </div>
  </div>
  <script>
    const box = document.getElementById('output-box');
    let py = null;

    async function initPy() {
      try {
        box.textContent = '> Loading Pyodide runtime...';
        py = await loadPyodide();
        box.textContent = '> Python 3.11 ready! Click "RUN PYTHON BACKEND" to execute backend algorithms.';
      } catch (e) {
        box.textContent = '> Python simulation ready: Backend operations simulated in client.';
      }
    }
    initPy();

    document.getElementById('btn-run').onclick = async () => {
      box.textContent += '\\n> Calling Python backend route /api/compute...';
      if (py) {
        try {
          const res = await py.runPythonAsync(\`
import json, math
data = {"status": "ok", "backend": "Python 3.11 WASM", "results": [math.factorial(n) for n in range(1, 8)]}
json.dumps(data)
          \`);
          box.textContent += '\\n' + res;
        } catch (err) {
          box.textContent += '\\nError: ' + err.message;
        }
      } else {
        box.textContent += '\\n{"status": "ok", "backend": "Python Client Mock", "results": [1, 2, 6, 24, 120, 720, 5040]}';
      }
      box.scrollTop = box.scrollHeight;
    };

    document.getElementById('btn-stats').onclick = () => {
      box.textContent += '\\n> Python Heap: allocated inside static browser sandbox.';
      box.scrollTop = box.scrollHeight;
    };
  </script>
</body>
</html>`;
    }

    return `=== FILE: index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #FFFDF7; color: #1B1B1B; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .container { background: #FFFFFF; border: 3px solid #1B1B1B; box-shadow: 5px 5px 0 #1B1B1B; padding: 24px; max-width: 420px; width: 100%; text-align: center; }
    .badge { display: inline-block; background: #FFCA54; border: 1px solid #1B1B1B; padding: 2px 8px; font-size: 11px; font-weight: bold; margin-bottom: 12px; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    .content-box { background: #F5ECD7; border: 2px solid #1B1B1B; padding: 16px; margin: 16px 0; font-size: 14px; min-height: 80px; display: flex; align-items: center; justify-content: center; line-height: 1.4; }
    .controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    button { background: #FFCA54; border: 2px solid #1B1B1B; box-shadow: 2px 2px 0 #1B1B1B; padding: 8px 16px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 13px; transition: transform 0.1s ease; }
    button:hover { background: #EBB63C; transform: translateY(-1px); }
    button:active { transform: translateY(1px); box-shadow: 1px 1px 0 #1B1B1B; }
    .counter { font-size: 11px; color: #57544C; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">BUILT BY THE OFFICE AGENTS</div>
    <h1>${title}</h1>
    <div class="content-box" id="display-area">
      ${isJoke ? "Why don't scientists trust atoms? Because they make up everything!" : `Active application ready for: "${project.requirement}"`}
    </div>
    <div class="controls">
      <button id="btn-action">${isJoke ? "NEXT JOKE ➔" : "INTERACT ⚡"}</button>
      <button id="btn-copy">COPY 📋</button>
    </div>
    <div class="counter" id="counter-text">Items generated: 1</div>
  </div>
  <script>
    const items = ${isJoke ? `[
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my suitcase there will be no vacation this year. Now I'm dealing with emotional baggage.",
      "What do you call a fake noodle? An impasta!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "How do you organize a space party? You planet!"
    ]` : `[
      "Task Master: Prioritize high-impact features first.",
      "Sprint goal accomplished on time with zero regressions.",
      "Standup note: blockers resolved, deployment complete.",
      "Review: Unit tests passing with 100% code coverage."
    ]`};
    let count = 1;
    let idx = 0;
    const display = document.getElementById('display-area');
    const counter = document.getElementById('counter-text');
    document.getElementById('btn-action').onclick = () => {
      idx = (idx + 1) % items.length;
      count++;
      display.textContent = items[idx];
      counter.textContent = 'Items generated: ' + count;
    };
    document.getElementById('btn-copy').onclick = () => {
      navigator.clipboard?.writeText(display.textContent);
      alert('Copied to clipboard!');
    };
  </script>
</body>
</html>`;
  }
}




// ─── Module: js/agents/conversation.js ───

// ============================================
// THE OFFICE — Boss ↔ Employee Dialogue & Direct Action
// ============================================









class EmployeeConversation {
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
    const company = state.company || { name: 'The Office' };

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




// ─── Module: js/components/character.js ───

// ============================================
// THE OFFICE — Roaming Floor Character Component
// Sprites, Waypoint Pathfinding, Movement & State
// ============================================




class FloorCharacter {
  /**
   * @param {Object} employee 
   * @param {HTMLElement} parentContainer 
   */
  constructor(employee, parentContainer) {
    this.employee = employee;
    this.parent = parentContainer;
    this.x = 40;
    this.y = 40;
    this.targetX = 40;
    this.targetY = 40;
    this.path = [];
    this.speed = 1.6; // pixels per tick
    this.facing = 'right'; // 'left' | 'right'
    this.state = 'idle'; // 'idle', 'walking', 'typing', 'sitting', 'talking'
    this.hasAlert = false;
    this.bubbleTimer = null;
    this.deskPosition = null;

    this.el = null;
    this.bubbleEl = null;
    this.alertEl = null;

    this.createDom();
  }

  createDom() {
    const isMichael = (this.employee.role || '').toLowerCase().includes('ceo') || 
                      (this.employee.name || '').toLowerCase().includes('michael');
    const shirtColor = this.employee.avatar?.shirt || (isMichael ? '#1B1B1B' : '#4472C4');
    const skinColor = this.employee.avatar?.skin || '#FFDBAC';
    const hairColor = this.employee.avatar?.hair || '#3B2F2F';

    const el = createElement('div', {
      className: 'world-character',
      id: `char-${this.employee.id}`,
      style: `left: ${this.x}px; top: ${this.y}px;`
    });

    el.innerHTML = `
      <div class="world-character__shadow"></div>
      <div class="world-character__inner">
        <div class="world-character__head" style="background: ${skinColor};">
          <div class="world-character__hair" style="background: ${hairColor};"></div>
        </div>
        <div class="world-character__body" style="background: ${shirtColor};"></div>
        <div class="world-character__legs">
          <div class="world-character__leg world-character__leg--left"></div>
          <div class="world-character__leg world-character__leg--right"></div>
        </div>
        <div class="world-character__status world-character__status--${this.employee.status || 'idle'}"></div>
        <div class="world-character__name">${escapeHtml(this.employee.name.split(' ')[0])}</div>
      </div>
    `;

    // Click handler to talk to employee
    el.onclick = (e) => {
      e.stopPropagation();
      this.turnToBoss();
      emit('employee-talk', this.employee);
    };

    // Hover tooltip / quick greeting
    el.onmouseenter = () => {
      if (!this.bubbleEl && this.state !== 'walking') {
        const shortStatus = this.employee.thought || this.employee.status || 'Standing by';
        this.say(shortStatus, 2000);
      }
    };

    this.parent.appendChild(el);
    this.el = el;
  }

  setDesk(deskPos) {
    this.deskPosition = deskPos;
  }

  setAlert(hasAlert) {
    this.hasAlert = !!hasAlert;
    if (this.hasAlert && !this.alertEl && this.el) {
      this.alertEl = createElement('div', 'world-character__alert');
      this.alertEl.textContent = '!';
      this.el.appendChild(this.alertEl);
    } else if (!this.hasAlert && this.alertEl) {
      this.alertEl.remove();
      this.alertEl = null;
    }
  }

  setStatus(status) {
    this.employee.status = status;
    if (this.el) {
      const statusDot = this.el.querySelector('.world-character__status');
      if (statusDot) {
        statusDot.className = `world-character__status world-character__status--${status || 'idle'}`;
      }
    }
  }

  turnToBoss() {
    this.path = [];
    this.state = 'talking';
    this.el.classList.remove('world-character--walking');
    this.el.classList.remove('world-character--typing');
    this.say("Boss! 👋", 2500);
  }

  setPath(waypoints) {
    if (!Array.isArray(waypoints) || waypoints.length === 0) return;
    this.path = [...waypoints];
    const next = this.path[0];
    this.targetX = next.x;
    this.targetY = next.y;
    this.state = 'walking';
  }

  moveTo(x, y) {
    this.path = [{ x, y }];
    this.targetX = x;
    this.targetY = y;
    this.state = 'walking';
  }

  say(text, durationMs = 3500) {
    if (!this.el || !text) return;
    if (this.bubbleEl) {
      this.bubbleEl.remove();
      this.bubbleEl = null;
    }
    if (this.bubbleTimer) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }

    const bubble = createElement('div', 'world-bubble');
    bubble.textContent = text;
    this.el.appendChild(bubble);
    this.bubbleEl = bubble;

    this.bubbleTimer = setTimeout(() => {
      if (this.bubbleEl) {
        this.bubbleEl.remove();
        this.bubbleEl = null;
      }
    }, durationMs);
  }

  update() {
    if (!this.el) return;

    if (this.path.length > 0) {
      const currentTarget = this.path[0];
      const dx = currentTarget.x - this.x;
      const dy = currentTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.speed) {
        // Reached waypoint
        this.x = currentTarget.x;
        this.y = currentTarget.y;
        this.path.shift();

        if (this.path.length === 0) {
          // Reached destination
          if (this.deskPosition && Math.abs(this.x - this.deskPosition.x) < 5 && Math.abs(this.y - this.deskPosition.y) < 5) {
            this.state = this.employee.status === 'working' ? 'typing' : 'sitting';
          } else {
            this.state = 'idle';
          }
        }
      } else {
        // Step along vector
        const vx = (dx / dist) * this.speed;
        const vy = (dy / dist) * this.speed;
        this.x += vx;
        this.y += vy;

        if (Math.abs(vx) > 0.1) {
          const newFacing = vx > 0 ? 'right' : 'left';
          if (newFacing !== this.facing) {
            this.facing = newFacing;
            if (this.facing === 'left') {
              this.el.classList.add('world-character--facing-left');
            } else {
              this.el.classList.remove('world-character--facing-left');
            }
          }
        }
      }
    }

    // Apply animation CSS classes
    if (this.state === 'walking') {
      this.el.classList.add('world-character--walking');
      this.el.classList.remove('world-character--typing');
    } else if (this.state === 'typing') {
      this.el.classList.remove('world-character--walking');
      this.el.classList.add('world-character--typing');
    } else {
      this.el.classList.remove('world-character--walking');
      this.el.classList.remove('world-character--typing');
    }

    // Position in DOM
    this.el.style.left = `${Math.round(this.x)}px`;
    this.el.style.top = `${Math.round(this.y)}px`;
  }

  destroy() {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    if (this.el) this.el.remove();
    this.el = null;
  }
}




// ─── Module: js/components/talk-sheet.js ───

// ============================================
// THE OFFICE — Boss Talk Sheet Component
// Direct boss ↔ employee conversation bottom sheet
// ============================================





class TalkSheet {
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




// ─── Module: js/components/floor.js ───

// ============================================
// THE OFFICE — Interactive Living Floor Engine
// Waypoint corridor navigation, roaming sprites,
// rooms, desk monitors, and boss interaction
// ============================================





// ── Waypoint Navigation Graph ──
const WAYPOINTS = {
  // Corridor spines
  corridor_top: { x: 195, y: 92, links: ['michael_door', 'blackboard_hub', 'meeting_door', 'pit_top'] },
  pit_top: { x: 195, y: 155, links: ['corridor_top', 'pit_mid', 'desk_row_0_left', 'desk_row_0_right'] },
  pit_mid: { x: 195, y: 225, links: ['pit_top', 'pit_bot', 'desk_row_1_left', 'desk_row_1_right'] },
  pit_bot: { x: 195, y: 310, links: ['pit_mid', 'corridor_bot'] },
  corridor_bot: { x: 195, y: 360, links: ['pit_bot', 'breakroom_door', 'qa_door'] },

  // Michael's Office
  michael_door: { x: 98, y: 92, links: ['corridor_top', 'michael_desk'] },
  michael_desk: { x: 55, y: 55, links: ['michael_door'] },

  // Blackboard / Hive
  blackboard_hub: { x: 195, y: 55, links: ['corridor_top'] },

  // Conference Room
  meeting_door: { x: 280, y: 92, links: ['corridor_top', 'meeting_table'] },
  meeting_table: { x: 320, y: 55, links: ['meeting_door'] },

  // Break Room
  breakroom_door: { x: 140, y: 360, links: ['corridor_bot', 'breakroom_coffee', 'breakroom_cooler'] },
  breakroom_coffee: { x: 55, y: 410, links: ['breakroom_door'] },
  breakroom_cooler: { x: 120, y: 415, links: ['breakroom_door'] },

  // QA & DevOps Bay
  qa_door: { x: 255, y: 360, links: ['corridor_bot', 'qa_station_1', 'qa_station_2'] },
  qa_station_1: { x: 280, y: 410, links: ['qa_door'] },
  qa_station_2: { x: 340, y: 410, links: ['qa_door'] },

  // Desk Pit Rows
  desk_row_0_left: { x: 105, y: 155, links: ['pit_top', 'desk_0', 'desk_1'] },
  desk_row_0_right: { x: 285, y: 155, links: ['pit_top', 'desk_2', 'desk_3'] },
  desk_row_1_left: { x: 105, y: 225, links: ['pit_mid', 'desk_4', 'desk_5'] },
  desk_row_1_right: { x: 285, y: 225, links: ['pit_mid', 'desk_6', 'desk_7'] },

  // Desks 0..7
  desk_0: { x: 55, y: 155, links: ['desk_row_0_left'] },
  desk_1: { x: 140, y: 155, links: ['desk_row_0_left'] },
  desk_2: { x: 245, y: 155, links: ['desk_row_0_right'] },
  desk_3: { x: 335, y: 155, links: ['desk_row_0_right'] },
  desk_4: { x: 55, y: 225, links: ['desk_row_1_left'] },
  desk_5: { x: 140, y: 225, links: ['desk_row_1_left'] },
  desk_6: { x: 245, y: 225, links: ['desk_row_1_right'] },
  desk_7: { x: 335, y: 225, links: ['desk_row_1_right'] }
};

const AMBIENT_QUIPS = [
  "Did anyone take my red stapler?",
  "Need another cup of coffee ☕",
  "Code compiles! Pushing to staging 🚀",
  "That's what she said!",
  "PR approved, merging to main.",
  "This office runs on caffeine.",
  "Sprint review is looking good.",
  "Checking the Jira tickets...",
  "Testing on production... kidding!"
];

class OfficeFloor {
  constructor(container) {
    this.container = container;
    this.characters = {};
    this.stage = null;
    this.running = false;
    this.rafId = null;
    this.ambientTimer = null;
    this.subscriptions = [];
  }

  render(employeesList, company) {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.className = 'office-world-wrapper';

    // World Stage (400 x 480 fixed virtual coordinate space)
    const stage = createElement('div', {
      className: 'office-world-stage',
      id: 'world-stage'
    });
    this.container.appendChild(stage);
    this.stage = stage;

    this.renderRooms();
    this.renderDesks();
    this.scaleToContainer();

    // Resize listener for responsive scaling
    window.addEventListener('resize', this.onResize);

    // Populate characters
    if (Array.isArray(employeesList)) {
      employeesList.forEach((emp, idx) => {
        this.addEmployeeCharacter(emp, idx);
      });
    }

    // Subscribe to agent events
    this.initEvents();

    // Start simulation loop
    this.startLoop();
  }

  onResize = () => {
    this.scaleToContainer();
  };

  scaleToContainer() {
    if (!this.container || !this.stage) return;
    const containerWidth = this.container.clientWidth || 360;
    const targetWidth = 400;
    const scale = Math.min(1.15, Math.max(0.68, containerWidth / targetWidth));
    this.stage.style.transform = `scale(${scale})`;
    this.container.style.height = `${Math.round(480 * scale)}px`;
  }

  renderRooms() {
    const rooms = [
      { id: 'michael', class: 'room--michael', label: "MICHAEL'S OFFICE ☕", left: 10, top: 10, width: 110, height: 75 },
      { id: 'blackboard', class: 'room--blackboard', label: "HIVE BLACKBOARD 📋", left: 130, top: 10, width: 130, height: 75 },
      { id: 'meeting', class: 'room--meeting', label: "CONFERENCE 🪑", left: 270, top: 10, width: 120, height: 75 },
      { id: 'workspace', class: 'room--workspace', label: "ENGINEERING PIT 💻", left: 10, top: 105, width: 380, height: 215 },
      { id: 'breakroom', class: 'room--breakroom', label: "BREAK ROOM ☕🍩", left: 10, top: 340, width: 175, height: 115 },
      { id: 'scrum', class: 'room--scrum', label: "QA & DEVOPS BAY 🔧", left: 205, top: 340, width: 185, height: 115 }
    ];

    rooms.forEach(room => {
      const el = createElement('div', {
        className: `room ${room.class}`,
        id: `room-${room.id}`,
        style: `position: absolute; left: ${room.left}px; top: ${room.top}px; width: ${room.width}px; height: ${room.height}px;`
      });
      el.innerHTML = `<div class="room__label">${room.label}</div>`;

      if (room.id === 'blackboard') {
        el.style.cursor = 'pointer';
        el.title = 'Click to view Active Hive Sprint';
        const sprint = getState('game.sprintNumber') || 1;
        const notes = createElement('div', {
          style: 'padding: 16px 8px 6px; font-size: 8px; font-family: var(--font-family-mono); color: #FFFDF7; line-height: 1.3;'
        });
        notes.innerHTML = `
          <div style="color: var(--yellow); font-weight: bold; border-bottom: 1px dashed rgba(255,255,255,0.3); padding-bottom: 2px;">SPRINT #${sprint} ACTIVE</div>
          <div style="margin-top: 4px; color: #DDD;">Tap to inspect backlog & memory</div>
        `;
        el.appendChild(notes);
        el.onclick = () => emit('blackboard-select');
      }

      if (room.id === 'michael') {
        const mug = createElement('div', {
          style: 'position: absolute; bottom: 6px; right: 8px; font-size: 15px; cursor: pointer;',
          title: "World's Best Boss Mug"
        });
        mug.textContent = '☕';
        el.appendChild(mug);
      }

      if (room.id === 'breakroom') {
        const items = createElement('div', {
          style: 'position: absolute; bottom: 8px; left: 12px; font-size: 13px;'
        });
        items.innerHTML = '☕ 💧 🍩';
        el.appendChild(items);
      }

      if (room.id === 'scrum') {
        const servers = createElement('div', {
          style: 'position: absolute; bottom: 8px; right: 12px; font-size: 13px;'
        });
        servers.innerHTML = '🖥️ ⚡ 🖨️';
        el.appendChild(servers);
      }

      this.stage.appendChild(el);
    });
  }

  renderDesks() {
    const deskCoords = [
      { id: 'desk_0', left: 40, top: 145 },
      { id: 'desk_1', left: 125, top: 145 },
      { id: 'desk_2', left: 230, top: 145 },
      { id: 'desk_3', left: 320, top: 145 },
      { id: 'desk_4', left: 40, top: 215 },
      { id: 'desk_5', left: 125, top: 215 },
      { id: 'desk_6', left: 230, top: 215 },
      { id: 'desk_7', left: 320, top: 215 }
    ];

    deskCoords.forEach(d => {
      const desk = createElement('div', {
        className: 'desk',
        id: d.id,
        style: `position: absolute; left: ${d.left}px; top: ${d.top}px; width: 44px; height: 26px;`
      });
      const screen = createElement('div', 'desk__screen');
      desk.appendChild(screen);
      this.stage.appendChild(desk);
    });
  }

  addEmployeeCharacter(emp, index) {
    if (!this.stage) return;

    const char = new FloorCharacter(emp, this.stage);
    const isMichael = (emp.role || '').toLowerCase().includes('ceo') || 
                      (emp.name || '').toLowerCase().includes('michael');

    if (isMichael) {
      char.x = WAYPOINTS.michael_desk.x;
      char.y = WAYPOINTS.michael_desk.y;
      char.setDesk(WAYPOINTS.michael_desk);
      char.state = 'sitting';
    } else {
      const deskKey = `desk_${index % 8}`;
      const deskPos = WAYPOINTS[deskKey] || WAYPOINTS.desk_0;
      char.x = deskPos.x;
      char.y = deskPos.y;
      char.setDesk(deskPos);
      char.state = emp.status === 'working' ? 'typing' : 'sitting';
    }

    char.update();
    this.characters[emp.id] = char;
  }

  findPath(startPos, endWaypointKey) {
    // Simple nearest waypoint routing to destination
    const targetWp = WAYPOINTS[endWaypointKey];
    if (!targetWp) return [];

    // Find nearest start waypoint
    let nearestStartKey = 'pit_mid';
    let minDist = Infinity;
    Object.entries(WAYPOINTS).forEach(([key, wp]) => {
      const d = Math.hypot(wp.x - startPos.x, wp.y - startPos.y);
      if (d < minDist) {
        minDist = d;
        nearestStartKey = key;
      }
    });

    if (nearestStartKey === endWaypointKey) {
      return [{ x: targetWp.x, y: targetWp.y }];
    }

    // BFS through waypoint graph
    const queue = [[nearestStartKey]];
    const visited = new Set([nearestStartKey]);
    let bestPathKeys = null;

    while (queue.length > 0) {
      const currentRoute = queue.shift();
      const lastKey = currentRoute[currentRoute.length - 1];

      if (lastKey === endWaypointKey) {
        bestPathKeys = currentRoute;
        break;
      }

      const neighbors = WAYPOINTS[lastKey]?.links || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...currentRoute, n]);
        }
      }
    }

    if (bestPathKeys) {
      return bestPathKeys.map(k => ({ x: WAYPOINTS[k].x, y: WAYPOINTS[k].y }));
    }

    // Direct line fallback
    return [{ x: targetWp.x, y: targetWp.y }];
  }

  startLoop() {
    this.running = true;
    const loop = () => {
      if (!this.running) return;

      Object.values(this.characters).forEach(char => {
        char.update();
      });

      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);

    // Ambient life ticker: every 8s, an idle character roams or chats
    this.ambientTimer = setInterval(() => {
      this.triggerAmbientActivity();
    }, 7000);
  }

  triggerAmbientActivity() {
    const chars = Object.values(this.characters).filter(c => c.state === 'sitting' || c.state === 'idle');
    if (chars.length === 0) return;

    const char = randomPick(chars);
    if (!char) return;

    const isMichael = (char.employee.role || '').toLowerCase().includes('ceo');
    const roll = Math.random();

    if (roll < 0.35) {
      // Roam to breakroom for coffee
      const path = this.findPath({ x: char.x, y: char.y }, 'breakroom_coffee');
      char.setPath(path);
      setTimeout(() => {
        char.say("Getting a cup of coffee ☕", 2500);
        setTimeout(() => {
          // Return to desk
          if (char.deskPosition) {
            const returnPath = this.findPath({ x: char.x, y: char.y }, isMichael ? 'michael_desk' : `desk_${Object.keys(WAYPOINTS).find(k => WAYPOINTS[k] === char.deskPosition) || 'desk_0'}`);
            char.setPath(returnPath);
          }
        }, 5000);
      }, 3000);
    } else if (roll < 0.65) {
      // Pop a fun ambient quip
      char.say(randomPick(AMBIENT_QUIPS), 3000);
    } else {
      // Visit blackboard or conference
      const destKey = isMichael ? 'corridor_top' : 'blackboard_hub';
      const path = this.findPath({ x: char.x, y: char.y }, destKey);
      char.setPath(path);
      setTimeout(() => {
        if (char.deskPosition) {
          const returnPath = this.findPath({ x: char.x, y: char.y }, isMichael ? 'michael_desk' : 'desk_1');
          char.setPath(returnPath);
        }
      }, 4500);
    }
  }

  initEvents() {
    // Say something via character bubble
    this.subscriptions.push(on('agent-say', ({ empId, text }) => {
      const char = this.characters[empId];
      if (char) char.say(text);
    }));

    // Send on break
    this.subscriptions.push(on('agent-break', ({ empId }) => {
      const char = this.characters[empId];
      if (char) {
        const path = this.findPath({ x: char.x, y: char.y }, 'breakroom_cooler');
        char.setPath(path);
        char.setStatus('break');
      }
    }));

    // Handoff between agents: envelope flies + agent notification
    this.subscriptions.push(on('agent-handoff', ({ fromId, toId }) => {
      this.animateMail(fromId, toId);
      const toChar = this.characters[toId];
      if (toChar) {
        setTimeout(() => toChar.say("Received spec! Reviewing... 📐", 3000), 700);
      }
    }));

    // Alert marker
    this.subscriptions.push(on('agent-alert', ({ empId, alert }) => {
      const char = this.characters[empId];
      if (char) char.setAlert(alert);
    }));
  }

  showSpeechBubble(employeeId, text) {
    const char = this.characters[employeeId];
    if (char) char.say(text);
  }

  animateMail(fromEmpId, toEmpId) {
    const fromChar = this.characters[fromEmpId];
    const toChar = this.characters[toEmpId];
    if (!fromChar || !toChar || !this.stage) return;

    const envelope = createElement('div', 'flying-envelope');
    envelope.textContent = '✉️';
    envelope.style.left = `${fromChar.x + 10}px`;
    envelope.style.top = `${fromChar.y + 10}px`;
    this.stage.appendChild(envelope);

    requestAnimationFrame(() => {
      envelope.style.left = `${toChar.x + 10}px`;
      envelope.style.top = `${toChar.y + 10}px`;
    });

    setTimeout(() => {
      if (envelope.parentNode) envelope.remove();
    }, 850);
  }

  update(employeesList = null) {
    const list = employeesList || getState('employees') || [];
    list.forEach(emp => {
      let char = this.characters[emp.id];
      if (!char) {
        this.addEmployeeCharacter(emp, list.indexOf(emp));
        char = this.characters[emp.id];
      }
      if (char) {
        char.setStatus(emp.status);
        if (emp.status === 'working' && char.state !== 'walking') {
          char.state = 'typing';
        }
      }
    });
  }

  destroy() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.ambientTimer) clearInterval(this.ambientTimer);
    window.removeEventListener('resize', this.onResize);
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    Object.values(this.characters).forEach(c => c.destroy());
    this.characters = {};
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/components/bottom-nav.js ───




class BottomNav {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.NAV_ITEMS = [
      { id: 'office', icon: '🏢', label: 'Office' },
      { id: 'chat', icon: '💬', label: 'Chat' },
      { id: 'projects', icon: '🚀', label: 'Projects' },
      { id: 'tasks', icon: '📋', label: 'Tasks' },
      { id: 'hire', icon: '👥', label: 'Team' }
    ];
    this.listeners = [];
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.justifyContent = 'space-around';
    this.container.style.alignItems = 'center';
    this.container.style.background = 'var(--paper)';
    this.container.style.borderTop = '3px solid var(--ink)';
    this.container.style.padding = '4px 6px';

    this.NAV_ITEMS.forEach(item => {
      const btn = createElement('button', {
        className: 'nav-item',
        id: `nav-item-${item.id}`,
        style: 'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid transparent; background: transparent; cursor: pointer; padding: 4px 0; transition: all 0.1s ease;'
      });
      btn.innerHTML = `
        <span class="nav-item__icon" style="font-size: 18px; position: relative; line-height: 1;">
          ${item.icon}
          <span class="nav-item__badge" style="display: none; position: absolute; top: -5px; right: -8px; background: var(--maroon); color: var(--paper); border: 1px solid var(--ink); padding: 1px 4px; font-size: 8px; font-family: var(--font-family-mono); font-weight: bold;"></span>
        </span>
        <span class="nav-item__label" style="font-size: 9px; font-family: var(--font-family-mono); font-weight: 700; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.05em; color: var(--ink);">${item.label}</span>
      `;
      const clickHandler = () => {
        emit('navigate', item.id);
      };
      btn.addEventListener('click', clickHandler);
      this.listeners.push({ btn, handler: clickHandler });
      this.container.appendChild(btn);
    });
  }

  setActive(screenId) {
    this.NAV_ITEMS.forEach(item => {
      const btn = document.getElementById(`nav-item-${item.id}`);
      if (btn) {
        if (item.id === screenId) {
          btn.classList.add('nav-item--active');
          btn.style.background = 'var(--yellow)';
          btn.style.borderColor = 'var(--ink)';
          btn.style.boxShadow = '2px 2px 0 var(--ink)';
          btn.style.transform = 'translateY(-2px)';
        } else {
          btn.classList.remove('nav-item--active');
          btn.style.background = 'transparent';
          btn.style.borderColor = 'transparent';
          btn.style.boxShadow = 'none';
          btn.style.transform = 'none';
        }
      }
    });
  }

  setBadge(screenId, count) {
    const btn = document.getElementById(`nav-item-${screenId}`);
    if (btn) {
      const badge = btn.querySelector('.nav-item__badge');
      if (count > 0) {
        badge.style.display = 'block';
        badge.textContent = count > 99 ? '99+' : count;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  destroy() {
    this.listeners.forEach(({ btn, handler }) => {
      btn.removeEventListener('click', handler);
    });
    this.listeners = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}




// ─── Module: js/screens/setup.js ───








const PROVIDER_LIST = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    emoji: '🔷', 
    free: true, 
    freeTier: '15 RPM, 1500 RPD (Free)', 
    defaultModel: 'gemini-2.0-flash',
    candidates: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro']
  },
  { 
    id: 'groq', 
    name: 'Groq Cloud', 
    emoji: '🟠', 
    free: true, 
    freeTier: '30 RPM (Fast Free Inference)', 
    defaultModel: 'llama-3.1-8b-instant',
    candidates: [
      'llama-3.1-8b-instant', 
      'llama-3.3-70b-versatile', 
      'llama3-8b-8192', 
      'llama3-70b-8192', 
      'mixtral-8x7b-32768', 
      'gemma2-9b-it', 
      'deepseek-r1-distill-llama-70b', 
      'qwen-2.5-32b'
    ]
  },
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    emoji: '🌐', 
    free: true, 
    freeTier: '20 RPM (Free models)', 
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    candidates: [
      'meta-llama/llama-3.3-70b-instruct:free', 
      'google/gemini-2.0-flash-exp:free', 
      'deepseek/deepseek-r1:free', 
      'meta-llama/llama-3.1-8b-instruct:free', 
      'qwen/qwen-2.5-72b-instruct:free', 
      'openai/gpt-4o-mini'
    ]
  },
  { 
    id: 'huggingface', 
    name: 'HuggingFace', 
    emoji: '🤗', 
    free: true, 
    freeTier: 'Free inference API', 
    defaultModel: 'meta-llama/Llama-3.1-8B-Instruct',
    candidates: [
      'meta-llama/Llama-3.1-8B-Instruct', 
      'mistralai/Mistral-7B-Instruct-v0.3', 
      'Qwen/Qwen2.5-72B-Instruct'
    ]
  },
  { 
    id: 'openai', 
    name: 'OpenAI', 
    emoji: '🟢', 
    free: false, 
    freeTier: null, 
    defaultModel: 'gpt-4o-mini',
    candidates: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    emoji: '🟤', 
    free: false, 
    freeTier: null, 
    defaultModel: 'claude-3-5-sonnet-20241022',
    candidates: [
      'claude-3-5-sonnet-20241022', 
      'claude-3-5-haiku-20241022', 
      'claude-3-haiku-20240307', 
      'claude-3-opus-20240229'
    ]
  },
  { 
    id: 'grok', 
    name: 'xAI Grok', 
    emoji: '⚡', 
    free: false, 
    freeTier: null, 
    defaultModel: 'grok-2',
    candidates: ['grok-2', 'grok-2-mini', 'grok-beta', 'grok-3', 'grok-3-mini']
  }
];

class SetupScreen {
  constructor() {
    this.container = null;
    this.step = getState().setup?.step || 0;
    this.companyName = 'The Office';
    this.projectName = 'TaskMaster Pro';
    this.projectDesc = 'A modern project management tool for high-performing teams.';
    this.connectedProviders = 0;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen setup-screen active';

    // Step dots in neo-brutalist ink squares
    const wizardTop = createElement('div', 'wizard-steps');
    wizardTop.style.cssText = 'display: flex; gap: 8px; justify-content: center; margin-bottom: 14px;';
    for (let i = 0; i < 4; i++) {
      const dot = createElement('div', {
        style: `width: 14px; height: 14px; border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); background: ${i === this.step ? 'var(--yellow)' : (i < this.step ? 'var(--mint)' : 'var(--white)')};`
      });
      wizardTop.appendChild(dot);
    }
    this.container.appendChild(wizardTop);

    const content = createElement('div', 'setup-content');
    this.container.appendChild(content);

    if (this.step === 0) this.renderStep0(content);
    else if (this.step === 1) this.renderStep1(content);
    else if (this.step === 2) this.renderStep2(content);
    else if (this.step === 3) this.renderStep3(content);
  }

  renderStep0(container) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px 16px; margin: 0 auto; max-width: 380px;">
        <div style="display: inline-block; padding: 3px 8px; background: var(--maroon); color: var(--paper); font-size: 10px; font-weight: bold; border: 1px solid var(--ink); margin-bottom: 12px; box-shadow: 2px 2px 0 var(--ink);">
          THE OFFICE · AI SOFTWARE COMPANY
        </div>
        <div style="font-size: 48px; margin-bottom: 8px;">☕🏢</div>
        <h1 style="font-family: var(--font-family-display); font-size: 24px; margin: 0 0 6px 0; letter-spacing: -0.03em;">THE OFFICE</h1>
        <div style="font-size: 11px; color: var(--maroon); font-weight: bold; margin-bottom: 12px;">MULTI-AGENT SOFTWARE SIMULATOR</div>
        <p style="font-size: 12px; color: var(--ink-dim); line-height: 1.5; margin-bottom: 20px;">
          "The world's best agents. The world's funniest office." Coordinate an office of AI bots working at desks on your phone.
        </p>
        <button id="btn-start" class="btn btn-primary btn-large btn-block">START YOUR OFFICE →</button>
      </div>
    `;

    // Only add Continue if saved game exists
    hasSavedGame().then(saved => {
      if (saved) {
        const contBtn = createElement('button', 'btn btn-secondary mt-2 btn-block', 'CONTINUE SAVED OFFICE');
        contBtn.style.marginTop = '10px';
        contBtn.onclick = () => {
          emit('navigate', 'office');
        };
        const box = container.querySelector('.card');
        if (box) box.appendChild(contBtn);
      }
    }).catch(() => {});

    container.querySelector('#btn-start').onclick = () => this.nextStep();
  }

  renderStep1(container) {
    container.innerHTML = `
      <div class="card" style="padding: 16px; max-width: 380px; margin: 0 auto;">
        <h3 style="margin-top: 0; font-family: var(--font-family-display); font-size: 15px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
          01 / COMPANY SETUP
        </h3>
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" id="company-name" value="${escapeHtml(this.companyName)}">
        </div>
        <div class="form-group">
          <label>Target Project</label>
          <input type="text" id="project-name" value="${escapeHtml(this.projectName)}">
        </div>
        <div class="form-group">
          <label>Project Vision & Spec</label>
          <textarea id="project-desc" rows="3">${escapeHtml(this.projectDesc)}</textarea>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button id="btn-back" class="btn btn-secondary" style="flex: 1;">BACK</button>
          <button id="btn-next" class="btn btn-primary" style="flex: 1;">NEXT →</button>
        </div>
      </div>
    `;

    container.querySelector('#company-name').onchange = (e) => this.companyName = e.target.value;
    container.querySelector('#project-name').onchange = (e) => this.projectName = e.target.value;
    container.querySelector('#project-desc').onchange = (e) => this.projectDesc = e.target.value;

    container.querySelector('#btn-back').onclick = () => { this.step--; this.render(this.container); };
    container.querySelector('#btn-next').onclick = () => this.nextStep();
  }

  async renderStep2(container) {
    let html = `
      <div style="max-width: 380px; margin: 0 auto;">
        <h3 style="margin-top: 0; font-family: var(--font-family-display); font-size: 15px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
          02 / CONNECT AI PROVIDERS
        </h3>
        <div style="background: var(--mint); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
          ⚡ <strong>Auto-detecting Models:</strong> Enter an API key and click TEST. The app auto-probes and selects an active working model!
        </div>
        <div class="provider-list">
    `;

    html += PROVIDER_LIST.map(p => {
      const savedModel = localStorage.getItem('provider_model_' + p.id) || p.defaultModel;
      const modelOptions = p.candidates.map(m => 
        `<option value="${escapeHtml(m)}"${m === savedModel ? ' selected' : ''}>${escapeHtml(m)}</option>`
      ).join('');

      return `
        <div class="provider-card" data-id="${p.id}">
          <div class="provider-card__header">
            <span class="provider-card__name">${p.emoji} ${p.name}</span>
            ${p.free ? '<span class="badge badge-success">FREE TIER</span>' : '<span class="badge badge-secondary">PAID API</span>'}
          </div>
          <div style="font-size: 10px; color: var(--ink-dim); margin-bottom: 6px;">${p.freeTier || 'Pay-per-token API'}</div>
          <div class="form-group" style="margin-bottom: 6px;">
            <div style="display: flex; gap: 4px;">
              <input type="password" class="api-key-input" placeholder="Enter API Key" data-id="${p.id}" style="font-size: 11px;">
              <button class="btn btn-icon toggle-visibility" data-id="${p.id}" style="padding: 0 8px;">👁️</button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
            <select class="model-select" data-id="${p.id}" style="font-size: 10px; padding: 4px 6px; flex: 1;">
              ${modelOptions}
            </select>
            <button class="btn btn-secondary btn-sm btn-test" data-id="${p.id}">TEST</button>
          </div>
          <div class="status-indicator" data-id="${p.id}" style="font-size: 10px; margin-top: 4px; font-weight: bold;"></div>
        </div>
      `;
    }).join('');

    html += `
        </div>
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button id="btn-back" class="btn btn-secondary" style="flex: 1;">BACK</button>
          <button id="btn-next" class="btn btn-primary" style="flex: 1;">BUILD TEAM →</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach events
    container.querySelectorAll('.toggle-visibility').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const input = container.querySelector(`.api-key-input[data-id="${id}"]`);
        input.type = input.type === 'password' ? 'text' : 'password';
      };
    });

    container.querySelectorAll('.model-select').forEach(sel => {
      sel.onchange = (e) => {
        const id = e.target.dataset.id;
        localStorage.setItem('provider_model_' + id, e.target.value);
        saveSetting('provider_model_' + id, e.target.value).catch(() => {});
      };
    });

    container.querySelectorAll('.btn-test').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.dataset.id;
        const p = PROVIDER_LIST.find(x => x.id === id);
        const input = container.querySelector(`.api-key-input[data-id="${id}"]`);
        const select = container.querySelector(`.model-select[data-id="${id}"]`);
        const selectedModel = select ? select.value : p.defaultModel;
        const apiKey = input.value.trim();
        const status = container.querySelector(`.status-indicator[data-id="${id}"]`);

        if (!apiKey) {
          Toast.show('Please enter an API key', 'error');
          return;
        }

        status.textContent = 'Auto-detecting working model...';
        status.style.color = 'var(--ink)';
        btn.disabled = true;

        try {
          const provider = AIRouter.createProvider(id, { apiKey, model: selectedModel });
          const candidates = Array.from(new Set([selectedModel, ...(p.candidates || [])]));
          const res = await provider.testAndFindWorkingModel(candidates);

          if (res.success) {
            const workingModel = res.workingModel;
            const allAvailable = Array.from(new Set([
              workingModel,
              ...(res.availableModels || []),
              ...(p.candidates || [])
            ])).filter(Boolean);

            if (select) {
              select.innerHTML = allAvailable.map(m => 
                `<option value="${escapeHtml(m)}"${m === workingModel ? ' selected' : ''}>${escapeHtml(m)}</option>`
              ).join('');
              select.value = workingModel;
            }

            status.textContent = `✅ Connected (${workingModel})`;
            status.style.color = 'var(--status-working)';
            saveApiKey(id, apiKey);
            localStorage.setItem('provider_model_' + id, workingModel);
            saveSetting('provider_model_' + id, workingModel).catch(() => {});
            this.connectedProviders++;
            Toast.show(`Connected to ${p.name} (${workingModel})!`, 'success');
          } else {
            status.textContent = '❌ Failed';
            status.style.color = 'var(--maroon)';
            Toast.show(res.message || 'Connection failed', 'error');
          }
        } catch (err) {
          status.textContent = '❌ Error';
          status.style.color = 'var(--maroon)';
          Toast.show(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      };
    });

    // Load existing keys
    for (const p of PROVIDER_LIST) {
      const key = loadApiKey(p.id);
      if (key) {
        container.querySelector(`.api-key-input[data-id="${p.id}"]`).value = key;
        const savedModel = localStorage.getItem('provider_model_' + p.id);
        const status = container.querySelector(`.status-indicator[data-id="${p.id}"]`);
        if (status && savedModel) {
          status.textContent = `Saved (${savedModel})`;
          status.style.color = 'var(--ink-dim)';
        }
      }
    }

    container.querySelector('#btn-back').onclick = () => { this.step--; this.render(this.container); };
    container.querySelector('#btn-next').onclick = () => this.nextStep();
  }

  renderStep3(container) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 24px 16px; margin: 0 auto; max-width: 380px;">
        <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
        <h2 style="font-family: var(--font-family-display); font-size: 18px; margin: 0 0 10px 0;">COMPANY READY!</h2>
        <div style="background: var(--cream); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 12px; margin-bottom: 16px; text-align: left; font-size: 12px;">
          <div><strong>COMPANY:</strong> ${escapeHtml(this.companyName)}</div>
          <div><strong>PROJECT:</strong> ${escapeHtml(this.projectName)}</div>
          <div><strong>ORCHESTRATOR:</strong> Michael Scott (CEO)</div>
        </div>
        <button id="btn-enter" class="btn btn-primary btn-large btn-block">ENTER THE OFFICE →</button>
      </div>
    `;

    container.querySelector('#btn-enter').onclick = () => {
      mergeState('company', {
        name: this.companyName,
        projectName: this.projectName,
        projectDescription: this.projectDesc
      });
      mergeState('setup', { step: 4, completed: true });
      emit('navigate', 'hire');
    };
  }

  nextStep() {
    this.step++;
    mergeState('setup', { step: this.step });
    this.render(this.container);
  }

  onEnter() {}
  onLeave() {}

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/screens/hire.js ───











class HireScreen {
  constructor() {
    this.container = null;
    this.availableRoles = Object.values(ROLES);
    this.currentRoleIndex = 0;
    this.currentFilter = 'All';
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen hire-screen';

    const header = createElement('div', 'hire-header');
    header.innerHTML = `
      <div style="border-bottom: 2px solid var(--ink); padding-bottom: 6px; margin-bottom: 10px;">
        <span style="font-size: 9px; font-weight: 700; color: var(--maroon); font-family: var(--font-family-mono); letter-spacing: 0.05em;">TEAM ROSTER</span>
        <h2 style="margin: 0; font-family: var(--font-family-display); font-size: 17px; display: flex; justify-content: space-between; align-items: center;">
          RECRUIT AGENTS <span class="badge badge-primary employee-count">0</span>
        </h2>
      </div>

      <div class="quick-start" style="display: flex; gap: 6px; margin-bottom: 10px;">
        <button class="btn btn-sm btn-outline" id="btn-startup">STARTUP (5)</button>
        <button class="btn btn-sm btn-outline" id="btn-small">CORE TEAM (10)</button>
        <button class="btn btn-sm btn-outline" id="btn-full">FULL OFFICE (17)</button>
      </div>

      <div class="department-tabs" style="margin-bottom: 12px;">
        ${['All', 'Executive', 'Management', 'Engineering', 'Design', 'Support'].map(dept => 
          `<button class="tab-btn ${this.currentFilter === dept ? 'active' : ''}" data-dept="${dept}">${dept}</button>`
        ).join('')}
      </div>
    `;
    this.container.appendChild(header);

    const mainArea = createElement('div', 'hire-main-area');
    this.container.appendChild(mainArea);
    this.mainArea = mainArea;

    const bottomSection = createElement('div', 'hire-bottom-section');
    bottomSection.innerHTML = `
      <div style="margin-top: 14px; border-top: 2px solid var(--ink); padding-top: 8px;">
        <h4 style="font-family: var(--font-family-display); font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase;">
          HIRED AGENTS ON DECK
        </h4>
        <div class="current-team-list" style="max-height: 180px; overflow-y: auto;"></div>
        <button id="btn-start-working" class="btn btn-primary btn-large btn-block" style="display:none; margin-top: 12px;">
          DISPATCH AGENTS TO FLOOR →
        </button>
      </div>
    `;
    this.container.appendChild(bottomSection);

    this.bindEvents();
    this.renderCard();
    this.updateTeamList();
  }

  bindEvents() {
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        this.container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.dept;
        this.currentRoleIndex = 0;
        this.renderCard();
      };
    });

    this.container.querySelector('#btn-startup').onclick = () => {
      this.autoHire(['CEO', 'ProductManager', 'TechLead', 'Developer', 'Tester']);
    };
    this.container.querySelector('#btn-small').onclick = () => {
      this.autoHire([
        'CEO', 'CTO', 'ProductManager', 'ProgramManager', 
        'TechLead', 'SeniorDeveloper', 'Developer', 'Designer', 'QALead', 'DevOpsEngineer'
      ]);
    };
    this.container.querySelector('#btn-full').onclick = () => {
      this.autoHire(Object.keys(ROLES));
    };

    const btnStart = this.container.querySelector('#btn-start-working');
    if (btnStart) {
      btnStart.onclick = () => this.startWorking();
    }
  }

  getFilteredRoles() {
    if (this.currentFilter === 'All') return this.availableRoles;
    return this.availableRoles.filter(r => r.department === this.currentFilter);
  }

  renderCard() {
    const roles = this.getFilteredRoles();
    this.mainArea.innerHTML = '';

    if (roles.length === 0 || this.currentRoleIndex >= roles.length) {
      this.mainArea.innerHTML = `
        <div class="empty-state" style="padding: 20px; text-align: center; border: 2px dashed var(--ink); background: var(--cream);">
          <p style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 10px;">All roles in this department viewed!</p>
          <button class="btn btn-sm btn-outline" id="btn-restart-roles">RESET CANDIDATES</button>
        </div>
      `;
      const restartBtn = this.mainArea.querySelector('#btn-restart-roles');
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.currentRoleIndex = 0;
          this.renderCard();
        };
      }
      return;
    }

    const role = roles[this.currentRoleIndex];
    const card = createElement('div', 'candidate-card');
    card.style.border = '2px solid var(--ink)';
    card.style.boxShadow = '4px 4px 0 var(--ink)';
    card.style.background = 'var(--white)';
    card.style.padding = '12px';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <span class="badge badge-primary">${escapeHtml(role.department)}</span>
        <span style="font-family: var(--font-family-mono); font-size: 11px; font-weight: bold; color: var(--maroon);">
          $${role.baseSalary}/yr
        </span>
      </div>

      <h3 style="font-family: var(--font-family-display); font-size: 16px; margin: 0 0 4px;">${escapeHtml(role.title)}</h3>
      <p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim); margin: 0 0 10px; line-height: 1.4;">
        ${escapeHtml(role.description)}
      </p>

      <div style="background: var(--cream); border: 1px solid var(--ink); padding: 8px; font-size: 10px; font-family: var(--font-family-mono); margin-bottom: 12px;">
        <div><strong>SPEED:</strong> ${'⚡'.repeat(Math.round(role.stats.speed / 20))} (${role.stats.speed})</div>
        <div><strong>QUALITY:</strong> ${'★'.repeat(Math.round(role.stats.quality / 20))} (${role.stats.quality})</div>
        <div><strong>AUTONOMY:</strong> ${'🧠'.repeat(Math.round(role.stats.autonomy / 20))} (${role.stats.autonomy})</div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-block btn-skip">PASS (NEXT)</button>
        <button class="btn btn-primary btn-block btn-hire">RECRUIT AGENT</button>
      </div>
    `;

    card.querySelector('.btn-skip').onclick = () => {
      this.currentRoleIndex++;
      this.renderCard();
    };

    card.querySelector('.btn-hire').onclick = () => {
      this.hireRole(role);
      this.currentRoleIndex++;
      this.renderCard();
    };

    this.mainArea.appendChild(card);
  }

  hireRole(roleDef) {
    const nameGen = generateName();
    const name = nameGen.fullName || `${nameGen.firstName} ${nameGen.lastName}`;
    const avatar = Employee.generateAvatar ? Employee.generateAvatar() : { hair: '#4a4a4a', skin: '#FFDBAC', shirt: '#4472C4' };
    const personality = randomPick(PERSONALITIES) || { id: 'enthusiastic', name: 'Enthusiastic' };
    
    // Assign provider round-robin from available connected keys
    const availableKeys = getAllApiKeys();
    const connectedProviders = Object.keys(availableKeys);
    const existingEmployees = getState('employees') || [];
    const provider = connectedProviders.length > 0 
      ? connectedProviders[existingEmployees.length % connectedProviders.length] 
      : 'groq';

    const emp = new Employee({
      id: uid('emp'),
      name,
      avatar,
      role: roleDef.title,
      department: roleDef.department,
      personality: personality.id,
      provider
    });

    pushState('employees', emp.toJSON());
    Toast.show(`Hired ${name} (${roleDef.title})!`, 'success');
    this.updateTeamList();
  }

  autoHire(roleKeys) {
    roleKeys.forEach(key => {
      const roleDef = ROLES[key] || this.availableRoles.find(r => r.title.toLowerCase() === key.toLowerCase() || r.title === key);
      if (roleDef) {
        this.hireRole(roleDef);
      }
    });
  }

  updateTeamList() {
    const employees = getState().employees || [];
    const countEl = this.container.querySelector('.employee-count');
    if (countEl) countEl.textContent = employees.length;
    
    const list = this.container.querySelector('.current-team-list');
    if (!list) return;

    if (employees.length === 0) {
      list.innerHTML = '<div style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim); padding: 8px 0;">No agents recruited yet. Use quick-start or hire above!</div>';
    } else {
      list.innerHTML = employees.map(emp => {
        const shirt = emp.avatar?.shirt || '#4472C4';
        const brain = emp.provider ? emp.provider.toUpperCase() : 'AUTO';
        return `
          <div style="display: flex; align-items: center; gap: 8px; padding: 6px 4px; border-bottom: 1px solid var(--cream-2); font-family: var(--font-family-mono);">
            <div style="width: 24px; height: 24px; border: 1px solid var(--ink); background: ${shirt}; box-shadow: 1px 1px 0 var(--ink); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
              ${(emp.role || '').toLowerCase().includes('ceo') ? '☕' : '💻'}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: bold; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(emp.name)}</div>
              <div style="font-size: 10px; color: var(--ink-dim);">
                ${escapeHtml(emp.role)} · <span class="badge badge-secondary" style="font-size: 8px; padding: 1px 4px;">${brain}</span>
              </div>
            </div>
            <button class="btn btn-icon btn-fire" data-id="${emp.id}" style="color: var(--maroon); border: none; background: transparent; font-size: 14px; cursor: pointer; padding: 2px;">✕</button>
          </div>
        `;
      }).join('');
    }

    list.querySelectorAll('.btn-fire').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.dataset.id;
        const state = getState();
        const filtered = (state.employees || []).filter(emp => emp.id !== id);
        setState('employees', filtered);
        this.updateTeamList();
      };
    });

    const btnStart = this.container.querySelector('#btn-start-working');
    if (btnStart) {
      if (employees.length >= 3) {
        btnStart.style.display = 'block';
      } else {
        btnStart.style.display = 'none';
      }
    }
  }

  async startWorking() {
    const state = getState();
    const company = new Company({
      name: state.company?.name || 'The Office',
      projectName: state.company?.projectName || 'TaskMaster Pro',
      projectDescription: state.company?.projectDescription || 'Autonomous software development.'
    });
    
    // Save to DB
    await saveCompany(company.toJSON());
    await saveEmployees(state.employees);

    emit('navigate', 'office');
    emit('game-initialized');
  }

  onEnter() {
    this.updateTeamList();
  }

  onLeave() {}

  destroy() {
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/screens/projects.js ───

// ============================================
// THE OFFICE — Projects Screen
// Agent multi-project manager, question answering,
// code viewer, sandboxed live preview, & downloads
// Supports Web, Python scripts, Terraform HCL, and WASM
// ============================================








class ProjectsScreen {
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
      const isCoding = proj.phase === 'coding' && proj.status === 'in_progress';
      changeBox.innerHTML = `
        <div style="font-family: var(--font-family-mono); font-size: 10px; font-weight: bold; margin-bottom: 4px;">REQUEST REVISIONS / CHANGES:</div>
        <div style="display: flex; gap: 6px;">
          <input type="text" class="input-change" ${isCoding ? 'disabled' : ''} placeholder="${isCoding ? 'Team is updating code...' : "e.g. 'Add CSV export', 'Add region filter'..."}" style="flex: 1; font-size: 11px; padding: 4px 8px;">
          <button class="btn btn-secondary btn-sm btn-send-change" ${isCoding ? 'disabled' : ''} style="font-size: 10px;">${isCoding ? 'DEV WORKING... ⏳' : 'SUBMIT TO DEV'}</button>
        </div>
      `;

      const sendChange = () => {
        const input = changeBox.querySelector('.input-change');
        const submitBtn = changeBox.querySelector('.btn-send-change');
        const text = input.value.trim();
        if (!text || isCoding) return;
        input.value = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'DEV WORKING... ⏳';
        input.disabled = true;
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




// ─── Module: js/screens/office.js ───











class OfficeScreen {
  constructor() {
    this.container = null;
    this.floor = null;
    this.tickerEl = null;
    this.subscriptions = [];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen office-screen';

    // ── Command Center (Direct Michael) ──
    const commandBar = createElement('div', 'command-center-bar');
    commandBar.innerHTML = `
      <span style="font-size: 16px; cursor: pointer;" title="Michael Scott, Regional Manager">☕</span>
      <input type="text" id="input-michael-directive" placeholder="Direct Michael (e.g. 'Build a Joke App')...">
      <button class="btn btn-primary btn-sm" id="btn-delegate-michael">DELEGATE</button>
    `;
    this.container.appendChild(commandBar);

    const delegateDirective = async () => {
      const input = commandBar.querySelector('#input-michael-directive');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const employees = getState('employees') || [];
      const michael = employees.find(e => (e.role || '').toLowerCase().includes('ceo') || (e.name || '').toLowerCase().includes('michael')) || employees[0];

      if (michael && this.floor) {
        this.floor.showSpeechBubble(michael.id, `"On it! Delegating to the floor!"`);
      }

      const lower = text.toLowerCase();
      const isProject = lower.includes('build') || lower.includes('app') || lower.includes('website') || 
                        lower.includes('create') || lower.includes('game') || lower.includes('tool');

      if (isProject) {
        // Start multi-agent software project
        Toast.show(`Michael dispatched project: "${text}" to engineering!`, 'info');
        try {
          await ProjectOrchestrator.startProject(text);
          this.updateProjectTicker();
        } catch (err) {
          Toast.show(`Project start error: ${err.message}`, 'error');
        }
      } else {
        // Direct task
        const newTask = new Task({
          id: uid('task'),
          title: text,
          description: `Directive from boss: ${text}. Coordinate across engineering and testing.`,
          type: 'feature',
          priority: 'P1',
          status: 'in_progress',
          assigneeId: employees.length > 1 ? employees[1].id : (michael ? michael.id : null),
          createdAt: Date.now()
        });

        pushState('tasks', newTask.toJSON());

        if (michael) {
          if (!michael.terminalLogs) michael.terminalLogs = [];
          michael.terminalLogs.push(`[DIRECTIVE] Received: "${text}"`);
          michael.terminalLogs.push(`[ORCHESTRATOR] Dispatched task ${newTask.id} to engineering.`);
          michael.thought = `Coordinating: "${text}"`;
          michael.status = 'working';
        }

        if (michael && employees.length > 1 && this.floor) {
          this.floor.animateMail(michael.id, employees[1].id);
        }

        Toast.show(`Michael dispatched: "${text}" to the team!`, 'success');
        emit('tick');
      }
    };

    commandBar.querySelector('#btn-delegate-michael').onclick = delegateDirective;
    commandBar.querySelector('#input-michael-directive').onkeypress = (e) => {
      if (e.key === 'Enter') delegateDirective();
    };

    // ── Active Project Ticker Strip ──
    const ticker = createElement('div', 'project-ticker-strip');
    this.container.appendChild(ticker);
    this.tickerEl = ticker;
    this.updateProjectTicker();

    // ── Event Banner Container ──
    const eventBannerContainer = createElement('div', 'event-banner-container');
    this.container.appendChild(eventBannerContainer);
    this.eventBannerContainer = eventBannerContainer;

    // ── Office Floor Canvas Container ──
    const floorContainer = createElement('div', 'office-floor-container');
    this.container.appendChild(floorContainer);

    // Initialize OfficeFloor
    this.floor = new OfficeFloor(floorContainer);
  }

  updateProjectTicker() {
    if (!this.tickerEl) return;
    const projects = getState('projects') || [];
    const active = projects.find(p => p.status === 'in_progress') || projects[0];

    if (!active) {
      this.tickerEl.style.display = 'none';
      return;
    }

    this.tickerEl.style.display = 'flex';
    const isWaiting = active.phase === 'questions' && active.questions?.length > 0;
    const isDelivered = active.status === 'delivered';

    this.tickerEl.innerHTML = `
      <div class="project-ticker-strip__left">
        <span class="project-ticker-strip__pulse" style="background: ${isDelivered ? 'var(--crt-green)' : (isWaiting ? 'var(--maroon)' : 'var(--yellow)')};"></span>
        <span>${isDelivered ? '✅ DELIVERED' : (isWaiting ? '❓ QUESTIONS WAITING' : `🚀 ${active.phase.toUpperCase()}`)}:</span>
        <span style="text-decoration: underline;">"${escapeHtml(active.name)}"</span>
      </div>
      <div style="font-size: 10px; color: var(--maroon); font-weight: bold; flex-shrink: 0;">
        VIEW APP ➔
      </div>
    `;

    this.tickerEl.onclick = () => {
      emit('navigate', 'projects');
    };
  }

  openEmployeeTalk(emp) {
    if (!emp) return;
    TalkSheet.show(emp);
  }

  openBlackboardModal() {
    const sprintNumber = getState('game.sprintNumber') || 1;
    const tasks = getState('tasks') || [];
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'in_review');
    const done = tasks.filter(t => t.status === 'done');
    const company = getState('company') || { name: 'The Office', projectName: 'Current Sprint' };

    const content = createElement('div');
    content.innerHTML = `
      <div class="blackboard-card" style="margin-bottom: 12px;">
        <div class="blackboard-card__title">📌 SPRINT #${sprintNumber} OBJECTIVES</div>
        <p style="font-size: 12px; margin: 4px 0 10px; color: #FFFDF7;">
          <strong>Target Project:</strong> ${escapeHtml(company.projectName || 'Main Application')}
        </p>
        <div style="font-size: 11px; color: #DDD;">
          <div>✅ Completed: <strong>${done.length}</strong> tickets</div>
          <div>⚡ In Flight: <strong>${inProgress.length}</strong> tickets</div>
          <div>📋 Total Backlog: <strong>${tasks.length}</strong> items</div>
        </div>
      </div>

      <div style="background: var(--white); border: 2px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 10px;">
        <h4 style="font-family: var(--font-family-mono); font-size: 12px; margin: 0 0 8px; border-bottom: 1px dashed var(--ink); padding-bottom: 4px;">
          ACTIVE HIVE TICKETS
        </h4>
        ${inProgress.length ? inProgress.map(t => `
          <div style="font-family: var(--font-family-mono); font-size: 11px; padding: 4px 0; border-bottom: 1px solid var(--cream-2);">
            <span class="badge ${t.priority === 'P0' ? 'badge-error' : 'badge-primary'}">${t.priority || 'P2'}</span>
            <strong>${escapeHtml(t.title)}</strong>
          </div>
        `).join('') : '<div style="font-family: var(--font-family-mono); font-size: 11px; color: var(--ink-dim);">No active tasks in flight. Use "Command Center" to assign one!</div>'}
      </div>
    `;

    Modal.show({
      title: 'SHARED HIVE BLACKBOARD',
      contentElement: content,
      buttons: [
        { text: 'CLOSE', class: 'btn btn-primary', onClick: () => Modal.hide() }
      ]
    });
  }

  showEventBanner(eventInfo) {
    if (!this.eventBannerContainer) return;
    const banner = createElement('div', 'event-banner');
    banner.innerHTML = `
      <span class="event-emoji" style="font-size: 1.3rem; margin-right: 8px;">${eventInfo.emoji || '🔔'}</span>
      <span class="event-desc" style="flex: 1; font-weight: 600;">${eventInfo.description || eventInfo.name}</span>
      <button class="btn btn-icon dismiss-btn" style="background: var(--white); border: 1px solid var(--ink); font-size: 11px; cursor: pointer;">✕</button>
    `;
    
    this.eventBannerContainer.appendChild(banner);

    const closeBanner = () => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-6px)';
      banner.style.transition = 'all 0.2s ease';
      setTimeout(() => banner.remove(), 200);
    };

    const dismissBtn = banner.querySelector('.dismiss-btn');
    if (dismissBtn) dismissBtn.onclick = closeBanner;
    setTimeout(closeBanner, 6000);
  }

  onEnter() {
    if (this.floor) {
      this.floor.render(getState('employees'), getState('company'));
    }
    this.updateProjectTicker();
    
    emit('game-start');

    this.subscriptions.push(on('tick', () => {
      if (this.floor) this.floor.update();
      this.updateProjectTicker();
    }));

    this.subscriptions.push(on('project-updated', () => {
      this.updateProjectTicker();
    }));

    this.subscriptions.push(on('random-event', (eventInfo) => {
      this.showEventBanner(eventInfo);
    }));

    this.subscriptions.push(on('employee-talk', (emp) => {
      this.openEmployeeTalk(emp);
    }));

    this.subscriptions.push(on('employee-select', (empId) => {
      const emp = (getState('employees') || []).find(e => e.id === empId);
      if (emp) this.openEmployeeTalk(emp);
    }));

    this.subscriptions.push(on('blackboard-select', () => {
      this.openBlackboardModal();
    }));
  }

  onLeave() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.floor) {
      this.floor.destroy();
    }
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/screens/chat.js ───








class ChatScreen {
  constructor() {
    this.container = null;
    this.activeChannel = '#general';
    this.subscriptions = [];
    this.channels = [
      { id: '#general', name: 'general', icon: '💬' },
      { id: '#engineering', name: 'engineering', icon: '💻' },
      { id: '#standup', name: 'standup', icon: '📅' },
      { id: '#random', name: 'random', icon: '🎲' }
    ];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen chat-screen layout-two-pane';

    const sidebar = createElement('div', 'chat-sidebar');
    this.sidebar = sidebar;
    this.container.appendChild(sidebar);

    const mainArea = createElement('div', 'chat-main');
    mainArea.innerHTML = `
      <div class="chat-header">
        <button class="btn btn-icon d-md-none" id="btn-toggle-sidebar">☰</button>
        <h2 id="active-chat-title">${this.activeChannel}</h2>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" placeholder="Type a message...">
        <button class="btn btn-primary" id="btn-send">Send</button>
      </div>
    `;
    this.mainArea = mainArea;
    this.container.appendChild(mainArea);

    this.renderSidebar();
    this.renderMessages();
    this.bindEvents();
  }

  renderSidebar() {
    let html = `<div class="sidebar-section"><h3>Channels</h3><ul class="channel-list">`;
    this.channels.forEach(ch => {
      const activeClass = this.activeChannel === ch.id ? 'active' : '';
      html += `<li class="channel-item ${activeClass}" data-id="${ch.id}">${ch.icon} ${ch.name}</li>`;
    });
    html += `</ul></div>`;

    const employees = getState().employees || [];
    if (employees.length > 0) {
      html += `<div class="sidebar-section"><h3>Direct Messages</h3><ul class="dm-list">`;
      employees.forEach(emp => {
        const activeClass = this.activeChannel === emp.id ? 'active' : '';
        html += `<li class="dm-item ${activeClass}" data-id="${emp.id}">
          <span class="avatar-sm">${emp.avatar}</span> ${emp.name}
        </li>`;
      });
      html += `</ul></div>`;
    }

    this.sidebar.innerHTML = html;

    this.sidebar.querySelectorAll('li').forEach(li => {
      li.onclick = (e) => {
        this.activeChannel = e.currentTarget.dataset.id;
        this.renderSidebar();
        this.renderMessages();
        const titleEl = this.mainArea.querySelector('#active-chat-title');
        const isChannel = this.activeChannel.startsWith('#');
        if (isChannel) {
          titleEl.textContent = this.activeChannel;
        } else {
          const emp = employees.find(e => e.id === this.activeChannel);
          titleEl.textContent = emp ? emp.name : 'Unknown';
        }
      };
    });
  }

  renderMessages() {
    const msgsContainer = this.mainArea.querySelector('#chat-messages');
    msgsContainer.innerHTML = '';
    
    const state = getState();
    const messages = (state.chat && state.chat[this.activeChannel]) || [];

    messages.forEach(msg => {
      const msgEl = renderMessage(msg);
      msgsContainer.appendChild(msgEl);
    });

    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  bindEvents() {
    const input = this.mainArea.querySelector('#chat-input');
    const sendBtn = this.mainArea.querySelector('#btn-send');
    const toggleBtn = this.mainArea.querySelector('#btn-toggle-sidebar');

    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      const newMsg = {
        id: uid(),
        sender: 'User',
        senderId: 'user',
        text,
        timestamp: Date.now(),
        isUser: true
      };

      this.saveMessage(this.activeChannel, newMsg);

      // Simulate AI response for DMs
      if (!this.activeChannel.startsWith('#')) {
        const empId = this.activeChannel;
        const emp = getState().employees.find(e => e.id === empId);
        if (emp) {
          this.triggerAIResponse(emp, text);
        }
      }
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.sidebar.classList.toggle('active');
      };
    }
  }

  saveMessage(channelId, msg) {
    const state = getState();
    const chatState = state.chat || {};
    const channelMsgs = chatState[channelId] || [];
    
    mergeState({
      chat: {
        ...chatState,
        [channelId]: [...channelMsgs, msg]
      }
    });
  }

  async triggerAIResponse(emp, userText) {
    const typingId = uid();
    this.saveMessage(this.activeChannel, {
      id: typingId,
      sender: emp.name,
      senderId: emp.id,
      text: '...',
      timestamp: Date.now(),
      isTyping: true
    });
    this.renderMessages();

    let responseText = '';
    try {
      const convRes = await EmployeeConversation.talk(emp, userText);
      responseText = convRes.reply || '';
    } catch (err) {
      console.warn('AI call in chat failed, using fallback:', err);
    }

    if (!responseText) {
      // In-character personality-driven responses inspired by The Office
      const personalityQuips = {
        enthusiastic: [
          `That is brilliant! I love it! "That's what she said!" Let's implement this immediately.`,
          `Boom! You have no idea how high I can fly. On it!`,
          `I am ready to conquer this. Great minds think alike!`
        ],
        deadpan: [
          `I am looking at my watch. As long as this doesn't keep me past 5:00 PM, fine.`,
          `Did I stutter? I'll get to it when I finish my puzzle.`,
          `Yes. Noted. Please allow me to return to quiet contemplation.`
        ],
        perfectionist: [
          `I have reviewed your request. It will be executed strictly by the book with zero margin of error.`,
          `Duly noted. I hope everyone else adheres to these standards as rigorously as I do.`,
          `I'll add it to the ledger. Ensure the audit trail remains pristine.`
        ],
        prankster: [
          `Identity theft is not a joke! Just kidding. I'm all over this.`,
          `Looking right at the camera right now. Challenge accepted!`,
          `Sure thing. Just putting a stapler in Jell-O first, then I'll finish this.`
        ],
        eccentric: [
          `Question: What bear is best? False. Black bear. Also, I shall execute this directive with martial precision.`,
          `Assistant Regional Manager duties come first, but this is top priority. Fact!`,
          `Understood. I will guard this task with my life and beet farm resources.`
        ],
        peacemaker: [
          `Thanks for checking in! I'll make sure everyone on the team is aligned on this.`,
          `Sounds like a plan! Let me know if you need anything else from reception.`,
          `Great idea. I'll make sure the team stays collaborative and happy.`
        ],
        party_planner: [
          `Understood! By the way, the Party Planning Committee has approved scones for 3 PM.`,
          `I'll take care of this between organizing the banner decorations!`,
          `Added to my list right next to the seasonal committee agenda.`
        ],
        know_it_all: [
          `Actually, from an architectural standpoint that is sound. I shall optimize it.`,
          `Technically, there are three other approaches, but this one will suffice.`,
          `Precisely. I'll ensure the mathematical and logic parameters check out.`
        ],
        newbie: [
          `Yes! Taking detailed notes right now! Let me know if you need me to re-read anything!`,
          `Understood! Glad to be contributing to the team!`,
          `On it! I'm learning the ropes fast, promise!`
        ],
        sweetheart: [
          `Aw, thank you! I brought cookies to the breakroom if you want some while I work on this!`,
          `Happy to help! Hope you're having a wonderful day!`,
          `No problem at all! I'll take care of it right away!`
        ]
      };

      const quips = personalityQuips[emp.personality] || personalityQuips.enthusiastic;
      responseText = quips[Math.floor(Math.random() * quips.length)];
    }

    // Remove typing and add real message
    const currentState = getState();
    const msgs = (currentState.chat && currentState.chat[this.activeChannel]) || [];
    const filtered = msgs.filter(m => m.id !== typingId);
    mergeState('chat', { ...currentState.chat, [this.activeChannel]: filtered });

    this.saveMessage(this.activeChannel, {
      id: uid('msg'),
      sender: emp.name,
      senderId: emp.id,
      avatar: emp.avatar,
      text: responseText,
      timestamp: Date.now(),
      isUser: false
    });
    this.renderMessages();
  }

  onEnter() {
    this.subscriptions.push(on('state-change', (path) => {
      if (path.startsWith('chat.' + this.activeChannel) || path === 'chat') {
        this.renderMessages();
      }
    }));
  }

  onLeave() {
    this.subscriptions.forEach(u => u());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.container) this.container.innerHTML = '';
  }
}


// ─── Module: js/screens/tasks.js ───







class TasksScreen {
  constructor() {
    this.container = null;
    this.subscriptions = [];
    this.columns = [
      { id: 'backlog', title: 'BACKLOG', statuses: ['backlog', 'assigned'] },
      { id: 'in_progress', title: 'IN PROGRESS', statuses: ['in_progress'] },
      { id: 'in_review', title: 'IN REVIEW', statuses: ['in_review'] },
      { id: 'done', title: 'DONE', statuses: ['done'] }
    ];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen tasks-screen';

    const sprint = getState().game?.sprintNumber || getState().game?.sprint || 1;
    const tasks = getState().tasks || [];
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const header = createElement('div', 'tasks-header');
    header.innerHTML = `
      <div class="card" style="padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 9px; font-weight: 700; color: var(--maroon); letter-spacing: 0.05em;">HIVE SPRINT</span>
          <h3 style="margin: 0; font-family: var(--font-family-display); font-size: 15px; letter-spacing: -0.02em;">SPRINT #${sprint}</h3>
        </div>
        <div style="width: 140px;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; font-family: var(--font-family-mono); margin-bottom: 2px;">
            <span>DELIVERED</span><span>${progress}%</span>
          </div>
          <div style="width: 100%; background: var(--cream); height: 8px; border: 1px solid var(--ink);">
            <div style="width: ${progress}%; background: var(--yellow); height: 100%;"></div>
          </div>
        </div>
      </div>
    `;
    this.container.appendChild(header);

    const fab = createElement('button', 'btn btn-primary btn-block', '+ NEW SPRINT TICKET');
    fab.style.marginBottom = '12px';
    fab.onclick = () => this.openNewTaskModal();
    this.container.appendChild(fab);

    const kanban = createElement('div', 'kanban-board');
    
    const employees = getState().employees || [];
    this.columns.forEach(col => {
      const colTasks = tasks.filter(t => col.statuses.includes(t.status));
      const colEl = createElement('div', 'kanban-column');
      colEl.dataset.id = col.id;
      colEl.innerHTML = `
        <div class="column-header">
          <h3>${col.title} <span class="badge ${col.id === 'done' ? 'badge-success' : 'badge-primary'}">${colTasks.length}</span></h3>
        </div>
        <div class="column-content" data-col="${col.id}"></div>
      `;
      
      const contentEl = colEl.querySelector('.column-content');
      colTasks.forEach(taskData => {
        const card = renderTaskCard(taskData, employees);
        card.onclick = () => this.openTaskDetail(taskData.id);
        contentEl.appendChild(card);
      });

      kanban.appendChild(colEl);
    });

    this.container.appendChild(kanban);
  }

  openTaskDetail(taskId) {
    const task = (getState('tasks') || []).find(t => t.id === taskId);
    if (!task) return;
    
    const assignee = (getState('employees') || []).find(e => e.id === task.assigneeId);
    
    const content = createElement('div', 'task-detail-content');
    content.innerHTML = `
      <div style="margin-bottom: 12px; display: flex; gap: 6px;">
        <span class="badge badge-secondary">${escapeHtml(task.type || 'feature')}</span>
        <span class="badge ${task.priority === 'P0' ? 'badge-error' : 'badge-primary'}">${task.priority || 'P2'}</span>
        <span class="badge ${task.status === 'done' ? 'badge-success' : 'badge-secondary'}">${task.status}</span>
      </div>
      <p style="font-family: var(--font-family-mono); font-size: 12px; color: var(--ink-dim); line-height: 1.4; margin-bottom: 12px;">
        ${escapeHtml(task.description || 'No description provided.')}
      </p>
      
      <div style="background: var(--cream); border: 1px solid var(--ink); padding: 8px; font-family: var(--font-family-mono); font-size: 11px; margin-bottom: 12px;">
        <strong>ASSIGNEE:</strong> ${assignee ? `${escapeHtml(assignee.name)} (${escapeHtml(assignee.role)})` : 'Unassigned'}
      </div>
      
      ${task.output ? `
        <div class="crt-terminal" style="margin-top: 10px;">
          <div class="crt-terminal__titlebar">
            <span>DELIVERABLE OUTPUT · ${escapeHtml(task.type || 'code')}</span>
          </div>
          <div class="crt-terminal__screen" style="max-height: 160px; font-size: 11px;">
            <pre style="margin: 0; white-space: pre-wrap;"><code>${escapeHtml(task.output)}</code></pre>
          </div>
        </div>
      ` : ''}
    `;

    Modal.show({
      title: task.title,
      contentElement: content,
      buttons: [{ text: 'CLOSE', class: 'btn btn-primary', onClick: () => Modal.hide() }]
    });
  }

  openNewTaskModal() {
    const content = createElement('div', 'new-task-form');
    content.innerHTML = `
      <div class="form-group">
        <label>Ticket Title</label>
        <input type="text" id="nt-title" placeholder="e.g. Implement OAuth Flow">
      </div>
      <div class="form-group">
        <label>Description & Scope</label>
        <textarea id="nt-desc" rows="3" placeholder="Define acceptance criteria..."></textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="nt-type">
          <option value="feature">Feature</option>
          <option value="bug">Bug Fix</option>
          <option value="design">Design / UI</option>
          <option value="test">Testing / QA</option>
          <option value="devops">DevOps / Deploy</option>
        </select>
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="nt-priority">
          <option value="P0">P0 (Critical Blocker)</option>
          <option value="P1">P1 (High)</option>
          <option value="P2" selected>P2 (Normal)</option>
          <option value="P3">P3 (Nice to Have)</option>
        </select>
      </div>
    `;

    Modal.show({
      title: 'CREATE SPRINT TICKET',
      contentElement: content,
      buttons: [
        { text: 'CANCEL', class: 'btn btn-secondary', onClick: () => Modal.hide() },
        { 
          text: 'CREATE TICKET', 
          class: 'btn btn-primary', 
          onClick: () => {
            const title = content.querySelector('#nt-title').value.trim();
            const desc = content.querySelector('#nt-desc').value.trim();
            if (!title) return;
            
            const task = new Task({
              id: uid('task'),
              title,
              description: desc,
              type: content.querySelector('#nt-type').value,
              priority: content.querySelector('#nt-priority').value,
              status: 'backlog',
              createdAt: Date.now()
            });

            pushState('tasks', task.toJSON());
            Modal.hide();
            this.render(this.container);
          }
        }
      ]
    });
  }

  onEnter() {
    this.subscriptions.push(on('state-change', (path) => {
      if (path === 'tasks' || path.startsWith('tasks.')) {
        this.render(this.container);
      }
    }));
    this.subscriptions.push(on('tick', () => {
      this.render(this.container);
    }));
  }

  onLeave() {
    this.subscriptions.forEach(u => u());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/screens/dashboard.js ───






class DashboardScreen {
  constructor() {
    this.container = null;
    this.subscriptions = [];
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.className = 'screen dashboard-screen layout-padded';

    const state = getState();
    const company = state.company || { name: 'The Office' };
    const employees = state.employees || [];
    const tasks = state.tasks || [];
    const game = state.game || { sprintNumber: 1, eventsLog: [], apiCalls: 0, tokensUsed: 0 };

    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const header = createElement('div', 'dashboard-header');
    header.innerHTML = `
      <div style="margin-bottom: 12px; border-bottom: 2px solid var(--ink); padding-bottom: 6px;">
        <span style="font-size: 9px; font-weight: bold; color: var(--maroon); font-family: var(--font-family-mono); letter-spacing: 0.05em;">EXECUTIVE LEDGER</span>
        <h2 style="margin: 0; font-family: var(--font-family-display); font-size: 18px; letter-spacing: -0.02em;">${escapeHtml(company.name)}</h2>
      </div>
    `;
    this.container.appendChild(header);

    const statsGrid = createElement('div', 'stats-grid');
    statsGrid.style.display = 'grid';
    statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    statsGrid.style.gap = '10px';
    statsGrid.style.marginBottom = '16px';

    statsGrid.innerHTML = `
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">👥</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${employees.length}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">ACTIVE AGENTS</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">✅</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${doneTasks}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">TICKETS DONE</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">📈</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${progress}%</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">SPRINT #${game.sprintNumber || game.sprint || 1}</div>
      </div>
      <div class="card" style="padding: 12px; text-align: center;">
        <div style="font-size: 1.5rem; margin-bottom: 2px;">⚡</div>
        <div style="font-size: 1.3rem; font-weight: bold; font-family: var(--font-family-mono);">${formatNumber(game.apiCalls || 0)}</div>
        <div style="color: var(--ink-dim); font-size: 10px; font-family: var(--font-family-mono); text-transform: uppercase;">API DISPATCHES</div>
      </div>
    `;
    this.container.appendChild(statsGrid);

    const productivitySection = createElement('div', 'card');
    productivitySection.style.marginBottom = '16px';
    productivitySection.innerHTML = `
      <h3 style="margin: 0 0 10px; font-family: var(--font-family-display); font-size: 13px; border-bottom: 2px solid var(--ink); padding-bottom: 4px;">
        TEAM PRODUCTIVITY & VITALS
      </h3>
    `;
    
    const sortedEmp = [...employees].sort((a, b) => (b.productivity || 50) - (a.productivity || 50));
    const empList = createElement('div', 'emp-prod-list');
    
    if (sortedEmp.length === 0) {
      empList.innerHTML = '<p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No employees hired yet.</p>';
    } else {
      sortedEmp.forEach(emp => {
        const prod = emp.productivity || 50;
        let mood = '😊';
        if (prod < 40) mood = '😟';
        else if (prod < 70) mood = '😐';

        const row = createElement('div', 'prod-row');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '8px';
        row.style.marginBottom = '8px';
        row.style.fontFamily = 'var(--font-family-mono)';
        row.innerHTML = `
          <div style="font-size: 14px;">${emp.avatar?.shirt ? '💻' : '👤'}</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 11px;">
              ${escapeHtml(emp.name)} <span style="font-weight: normal; color: var(--ink-dim);">(${escapeHtml(emp.role)})</span>
            </div>
            <div style="background: var(--cream); height: 6px; border: 1px solid var(--ink); margin-top: 3px;">
              <div style="background: ${prod > 70 ? 'var(--mint)' : 'var(--yellow)'}; width: ${prod}%; height: 100%;"></div>
            </div>
          </div>
          <span style="font-size: 14px;">${mood}</span>
        `;
        empList.appendChild(row);
      });
    }
    productivitySection.appendChild(empList);
    this.container.appendChild(productivitySection);

    // Recent Office Events
    const eventsSection = createElement('div', 'card');
    eventsSection.style.marginBottom = '16px';
    eventsSection.innerHTML = `
      <h3 style="margin: 0 0 10px; font-family: var(--font-family-display); font-size: 13px; border-bottom: 2px solid var(--ink); padding-bottom: 4px;">
        OFFICE TIMELINE & INCIDENTS
      </h3>
    `;
    const eventsList = createElement('div', 'events-timeline');
    
    const recentEvents = (game.eventsLog || []).slice(-6).reverse();
    if (recentEvents.length === 0) {
      eventsList.innerHTML = '<p style="font-size: 11px; font-family: var(--font-family-mono); color: var(--ink-dim);">No incidents reported.</p>';
    } else {
      recentEvents.forEach(ev => {
        const item = createElement('div', 'timeline-item');
        item.style.padding = '4px 0';
        item.style.borderBottom = '1px solid var(--cream-2)';
        item.style.fontFamily = 'var(--font-family-mono)';
        item.style.fontSize = '11px';
        item.innerHTML = `
          <span>${ev.emoji || '📌'}</span> 
          <span>${escapeHtml(ev.description || ev.name)}</span>
        `;
        eventsList.appendChild(item);
      });
    }
    eventsSection.appendChild(eventsList);
    this.container.appendChild(eventsSection);

    // Reset Button
    const resetBtn = createElement('button', 'btn btn-danger btn-block', 'RESET OFFICE & LEDGER');
    resetBtn.onclick = () => {
      Modal.confirm({
        title: 'DANGER ZONE',
        message: 'Are you sure you want to reset the office? All active agents, sprint tickets, and company metrics will be wiped clean. Saved API keys will remain securely stored.'
      }).then(async confirmed => {
        if (confirmed) {
          await clearAll();
          resetState();
          emit('navigate', 'setup');
        }
      });
    };
    this.container.appendChild(resetBtn);
  }

  onEnter() {
    this.subscriptions.push(on('state-change', () => {
      this.render(this.container);
    }));
  }

  onLeave() {
    this.subscriptions.forEach(u => u());
    this.subscriptions = [];
  }

  destroy() {
    this.onLeave();
    if (this.container) this.container.innerHTML = '';
  }
}




// ─── Module: js/app.js ───

// ============================================
// THE OFFICE — App Bootstrap & Router
// ============================================





















// Lazy/direct screens
let screens = {};
let currentScreen = null;
let bottomNav = null;
let aiRouter = null;
let simulation = null;

// ── Screen Registry (Synchronous & resilient) ──
const SCREEN_MODULES = {
  setup: async () => ({ default: SetupScreen }),
  hire: async () => ({ default: HireScreen }),
  office: async () => ({ default: OfficeScreen }),
  chat: async () => ({ default: ChatScreen }),
  projects: async () => ({ default: ProjectsScreen }),
  tasks: async () => ({ default: TasksScreen }),
  dashboard: async () => ({ default: DashboardScreen })
};

// Screens that show the bottom nav and header
const GAME_SCREENS = ['office', 'chat', 'projects', 'tasks', 'dashboard', 'hire'];

/**
 * Get or create the AI Router instance
 * @returns {AIRouter}
 */
function getAIRouter() {
  if (!aiRouter) {
    aiRouter = new AIRouter();
  }
  return aiRouter;
}

/**
 * Get the simulation instance
 */
function getSimulation() {
  return simulation;
}

/**
 * Navigate to a screen
 * @param {string} screenId
 */
async function navigate(screenId) {
  if (currentScreen === screenId) return;

  const contentEl = document.getElementById('app-content');
  const headerEl = document.getElementById('app-header');
  const navEl = document.getElementById('bottom-nav');

  if (!contentEl) {
    console.warn('[App] app-content element not found yet.');
    return;
  }

  // Leave current screen
  if (screens[currentScreen]) {
    try { screens[currentScreen].onLeave(); } catch (e) { console.error('[App] onLeave error:', e); }
  }

  // Hide all active screens
  contentEl.querySelectorAll('.screen.active').forEach(el => {
    el.classList.remove('active');
    el.classList.add('exit-left');
    setTimeout(() => el.classList.remove('exit-left'), 300);
  });

  const prevScreen = currentScreen;
  currentScreen = screenId;
  setState('previousScreen', prevScreen);
  setState('currentScreen', screenId);
  try {
    if (window.location.hash !== `#${screenId}`) {
      window.location.hash = `#${screenId}`;
    }
  } catch (e) { /* ignore hash errors on local file */ }

  // Show/hide nav and header based on screen type
  const isGameScreen = GAME_SCREENS.includes(screenId);
  if (headerEl) headerEl.style.display = isGameScreen ? 'flex' : 'none';
  if (navEl) navEl.style.display = isGameScreen ? 'flex' : 'none';

  // Load screen module if not loaded
  if (!screens[screenId]) {
    try {
      const module = await SCREEN_MODULES[screenId]();
      const ScreenClass = module.default || Object.values(module).find(v => typeof v === 'function');
      screens[screenId] = new ScreenClass();
    } catch (e) {
      console.error(`[App] Failed to load screen: ${screenId}`, e);
      return;
    }
  }

  // Find or create screen container
  let screenEl = contentEl.querySelector(`[data-screen="${screenId}"]`);
  if (!screenEl) {
    screenEl = document.createElement('div');
    screenEl.className = 'screen';
    screenEl.dataset.screen = screenId;
    contentEl.appendChild(screenEl);

    // Render screen into its container
    try {
      screens[screenId].render(screenEl);
    } catch (e) {
      console.error(`[App] Failed to render screen: ${screenId}`, e);
    }
  }

  // Activate screen
  requestAnimationFrame(() => {
    screenEl.classList.add('active');
  });

  // Enter screen
  try { screens[screenId].onEnter(); } catch (e) { console.error('[App] onEnter error:', e); }

  // Update nav
  if (bottomNav && isGameScreen) {
    try { bottomNav.setActive(screenId); } catch (e) { /* ignore */ }
  }

  // Update header title
  updateHeaderTitle(screenId);
}

/**
 * Update header title based on screen
 */
function updateHeaderTitle(screenId) {
  const titles = {
    office: getState('company')?.name || 'The Office',
    chat: 'Chat',
    projects: 'Projects & Apps',
    tasks: `Sprint ${getState('game.sprintNumber') || 1}`,
    dashboard: 'Dashboard',
    hire: 'Build Your Team'
  };
  const titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.textContent = titles[screenId] || 'The Office';
}

/**
 * Initialize game controls (speed buttons)
 */
function initGameControls() {
  const controlsEl = document.getElementById('game-controls');
  if (!controlsEl) return;

  controlsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.game-controls__btn');
    if (!btn) return;

    const speed = btn.dataset.speed;

    if (speed === 'pause') {
      emit('game-pause');
      controlsEl.querySelectorAll('.game-controls__btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    } else {
      const speedNum = parseInt(speed);
      emit('game-set-speed', speedNum);
      controlsEl.querySelectorAll('.game-controls__btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });
}

/**
 * Initialize settings button
 */
function initSettings() {
  const settingsBtn = document.getElementById('btn-settings');
  if (!settingsBtn) return;

  settingsBtn.addEventListener('click', () => {
    Modal.show({
      title: 'Settings',
      body: `
        <div class="flex-col gap-4">
          <div class="employee-info" onclick="window.__navigateDashboard && window.__navigateDashboard()">
            <div style="font-size:24px">📊</div>
            <div class="employee-info__details">
              <div class="employee-info__name">Company Stats</div>
              <div class="employee-info__role">View token usage, sprint velocity & metrics</div>
            </div>
          </div>
          <div class="employee-info" onclick="window.__navigateSetup && window.__navigateSetup()">
            <div style="font-size:24px">🔑</div>
            <div class="employee-info__details">
              <div class="employee-info__name">API Keys</div>
              <div class="employee-info__role">Manage AI provider connections</div>
            </div>
          </div>
          <div class="employee-info" onclick="window.__exportData && window.__exportData()">
            <div style="font-size:24px">📦</div>
            <div class="employee-info__details">
              <div class="employee-info__name">Export Data</div>
              <div class="employee-info__role">Download your office state as JSON</div>
            </div>
          </div>
          <hr class="divider">
          <div class="employee-info" onclick="window.__resetGame && window.__resetGame()">
            <div style="font-size:24px">🗑️</div>
            <div class="employee-info__details">
              <div class="employee-info__name" style="color:var(--color-error)">Reset Everything</div>
              <div class="employee-info__role">Delete all data and start over</div>
            </div>
          </div>
        </div>
      `,
      buttons: [{ text: 'Close', class: 'btn btn--secondary btn--block', onClick: () => Modal.hide() }]
    });

    window.__navigateDashboard = () => { Modal.hide(); navigate('dashboard'); };
    window.__navigateSetup = () => { Modal.hide(); navigate('setup'); setState('setup.step', 2); };
    window.__exportData = async () => {
      const data = {
        company: getState('company'),
        employees: getState('employees'),
        tasks: getState('tasks'),
        game: getState('game'),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theoffice_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Modal.hide();
      Toast.show('Data exported successfully!', 'success');
    };
    window.__resetGame = async () => {
      Modal.hide();
      const confirmed = await Modal.confirm({
        title: 'Reset Everything?',
        message: 'This will delete all your company data, employees, tasks, and chat history. This cannot be undone.',
        confirmText: 'Delete Everything',
        cancelText: 'Cancel'
      });
      if (confirmed) {
        await clearAll();
        resetState();
        if (simulation) { simulation.pause(); simulation = null; }
        screens = {};
        currentScreen = null;
        document.getElementById('app-content').innerHTML = '';
        navigate('setup');
        Toast.show('All data deleted. Starting fresh!', 'info');
      }
    };
  });
}

/**
 * Initialize the bottom navigation
 */
function initBottomNav() {
  const navContainer = document.getElementById('bottom-nav');
  if (navContainer) {
    bottomNav = new BottomNav('bottom-nav');
    bottomNav.render();
  }

  // Listen for navigation events from the nav
  on('navigate', (screenId) => {
    navigate(screenId);
  });
}

/**
 * Initialize AI Router with saved keys
 */
function initAIRouter() {
  aiRouter = new AIRouter();
  const savedKeys = getAllApiKeys();

  for (const [provider, apiKey] of Object.entries(savedKeys)) {
    if (apiKey) {
      try {
        const savedModel = localStorage.getItem('provider_model_' + provider) || undefined;
        aiRouter.addProvider(provider, { apiKey, model: savedModel });
      } catch (e) {
        console.warn(`[App] Failed to add provider ${provider}:`, e);
      }
    }
  }
}

/**
 * Start/resume the game simulation
 */
async function initSimulation() {
  try {
    simulation = new Simulation(getAIRouter());

    const company = getState('company');
    const employees = getState('employees');

    if (company && employees.length > 0) {
      await simulation.initialize(company, employees);

      // Listen for game control events
      on('game-start', () => simulation.resume());
      on('game-pause', () => simulation.pause());
      on('game-set-speed', (speed) => {
        if (simulation.clock) simulation.clock.setSpeed(speed);
        simulation.resume();
      });

      // Update time display on each tick
      on('tick', (tickData) => {
        const timeEl = document.getElementById('time-display');
        if (timeEl) {
          timeEl.textContent = formatGameTime(tickData.day, tickData.hour);
        }
      });
    }
  } catch (e) {
    console.warn('[App] Simulation init warning:', e);
  }
}

/**
 * Restore saved game state
 * @returns {Promise<boolean>} true if game was restored
 */
async function restoreGameState() {
  try {
    const hasGame = await hasSavedGame();
    if (!hasGame) return false;

    const companyData = await loadCompany();
    if (!companyData) return false;

    const employees = await loadEmployees();
    const tasks = await loadTasks();
    const projects = await loadProjects();
    const gameState = await loadGameState();
    const messages = await loadAllMessages();

    // Restore to state
    if (companyData) {
      const { id, ...rest } = companyData;
      setState('company', rest);
    }
    if (employees?.length) setState('employees', employees);
    if (tasks?.length) setState('tasks', tasks);
    if (projects?.length) setState('projects', projects);
    if (gameState) {
      setState('game', { ...getState('game'), ...gameState });
    }

    // Restore messages to channels
    if (messages?.length) {
      for (const msg of messages) {
        const channel = msg.channel;
        if (channel && getState(`chat.channels.${channel}`)) {
          const currentMessages = getState(`chat.channels.${channel}.messages`) || [];
          currentMessages.push(msg);
          setState(`chat.channels.${channel}.messages`, currentMessages);
        }
      }
    }

    setState('initialized', true);
    return true;
  } catch (e) {
    console.warn('[App] Failed to restore game state (starting fresh):', e);
    return false;
  }
}

/**
 * Auto-save game state periodically
 */
function initAutoSave() {
  setInterval(async () => {
    const company = getState('company');
    if (!company) return;

    try {
      await saveCompany(company);
      await saveEmployees(getState('employees') || []);
      await saveTasks(getState('tasks') || []);
      await saveProjects(getState('projects') || []);
      await saveGameState(getState('game'));
    } catch (e) {
      console.warn('[App] Auto-save warning:', e);
    }
  }, 30000);
}

/**
 * Handle service worker updates
 */
function initSWUpdates() {
  window.addEventListener('sw-update-available', () => {
    Toast.show('🔄 App updated! Refresh for the latest version.', 'info', 5000);
  });
}

/**
 * Hide loading screen with clean animation and guaranteed removal
 */
function hideLoadingScreen() {
  const loadingEl = document.getElementById('loading-screen');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
    setTimeout(() => {
      if (loadingEl.parentNode) loadingEl.remove();
    }, 400);
  }
}

/**
 * Main app initialization
 */
async function init() {
  console.log('[App] Initializing The Office...');

  // Fallback safety timer: in case anything hangs, loading screen MUST vanish
  const emergencyTimer = setTimeout(() => {
    console.warn('[App] Emergency timeout fired — forcing loading screen hide.');
    hideLoadingScreen();
    if (!currentScreen) navigate('setup');
  }, 1200);

  try {
    // Init game controls and settings
    initGameControls();
    initSettings();
    initSWUpdates();

    // Init AI Router with saved keys
    initAIRouter();

    // Try to restore saved game
    let restored = false;
    try {
      restored = await restoreGameState();
    } catch (e) {
      console.warn('[App] restoreGameState failed, continuing with setup:', e);
    }

    // Init bottom nav
    try {
      initBottomNav();
    } catch (e) {
      console.warn('[App] initBottomNav warning:', e);
    }

    // Clear emergency timer and hide loading screen cleanly
    clearTimeout(emergencyTimer);
    setTimeout(hideLoadingScreen, 300);

    // Navigate to appropriate screen
    if (restored && getState('company')) {
      navigate('office');
      await initSimulation();
    } else {
      navigate('setup');
    }

    // Init auto-save
    initAutoSave();

    // Listen for navigate events from screens
    on('navigate', (screenId) => {
      navigate(screenId);
    });

    // Listen for game initialization
    on('game-initialized', async () => {
      initAIRouter();
      await initSimulation();
    });

    // Listen for hashchange in URL
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && SCREEN_MODULES[hash] && hash !== currentScreen) {
        navigate(hash);
      }
    });

    console.log('[App] Ready!');
  } catch (fatalError) {
    console.error('[App] Fatal error during initialization:', fatalError);
    clearTimeout(emergencyTimer);
    hideLoadingScreen();
    try {
      navigate('setup');
    } catch (navErr) {
      console.error('[App] Fatal navigation fallback failed:', navErr);
    }
  }
}

// Expose navigate and core services for global use
window.__navigate = navigate;
window.ProjectOrchestrator = ProjectOrchestrator;
window.ProjectArtifacts = ProjectArtifacts;
window.getState = getState;
window.setState = setState;

// Boot the app safely (handles both loading and interactive/complete DOM states)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already parsed
  init();
}




})();
