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
export async function saveCompany(company) {
  return put(STORES.COMPANY, { id: 'current', ...company });
}

/** Load company data */
export async function loadCompany() {
  return get(STORES.COMPANY, 'current');
}

/** Save all employees */
export async function saveEmployees(employees) {
  await clear(STORES.EMPLOYEES);
  return bulkPut(STORES.EMPLOYEES, employees);
}

/** Load all employees */
export async function loadEmployees() {
  return getAll(STORES.EMPLOYEES);
}

/** Save all tasks */
export async function saveTasks(tasks) {
  await clear(STORES.TASKS);
  return bulkPut(STORES.TASKS, tasks);
}

/** Load all tasks */
export async function loadTasks() {
  return getAll(STORES.TASKS);
}

/** Get tasks by status */
export async function getTasksByStatus(status) {
  return getByIndex(STORES.TASKS, 'status', status);
}

/** Save a chat message */
export async function saveMessage(message) {
  return put(STORES.MESSAGES, message);
}

/** Save multiple messages */
export async function saveMessages(messages) {
  return bulkPut(STORES.MESSAGES, messages);
}

/** Get messages by channel */
export async function getMessagesByChannel(channel) {
  return getByIndex(STORES.MESSAGES, 'channel', channel);
}

/** Load all messages */
export async function loadAllMessages() {
  return getAll(STORES.MESSAGES);
}

/** Save a setting */
export async function saveSetting(key, value) {
  return put(STORES.SETTINGS, { key, value });
}

/** Load a setting */
export async function loadSetting(key) {
  const result = await get(STORES.SETTINGS, key);
  return result ? result.value : undefined;
}

/** Save game state */
export async function saveGameState(gameState) {
  return saveSetting('gameState', gameState);
}

/** Load game state */
export async function loadGameState() {
  return loadSetting('gameState');
}

/** Save setup state */
export async function saveSetupState(setupState) {
  return saveSetting('setupState', setupState);
}

/** Load setup state */
export async function loadSetupState() {
  return loadSetting('setupState');
}

/** Save an event */
export async function saveEvent(event) {
  return put(STORES.EVENTS, event);
}

/** Load all events */
export async function loadEvents() {
  return getAll(STORES.EVENTS);
}

/** Save a project */
export async function saveProject(project) {
  return put(STORES.PROJECTS, project);
}

/** Load a project by ID */
export async function loadProject(id) {
  return get(STORES.PROJECTS, id);
}

/** Save all projects */
export async function saveProjects(projects) {
  await clear(STORES.PROJECTS);
  return bulkPut(STORES.PROJECTS, projects);
}

/** Load all projects */
export async function loadProjects() {
  return getAll(STORES.PROJECTS);
}

/** Clear all data (reset game) */
export async function clearAll() {
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
export async function hasSavedGame() {
  const company = await loadCompany();
  return !!company;
}

export default {
  saveCompany, loadCompany,
  saveEmployees, loadEmployees,
  saveTasks, loadTasks, getTasksByStatus,
  saveMessage, saveMessages, getMessagesByChannel, loadAllMessages,
  saveSetting, loadSetting,
  saveGameState, loadGameState,
  saveSetupState, loadSetupState,
  saveEvent, loadEvents,
  saveProject, loadProject, saveProjects, loadProjects,
  clearAll, hasSavedGame
};
