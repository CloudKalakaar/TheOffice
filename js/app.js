// ============================================
// THE OFFICE — App Bootstrap & Router
// ============================================

import { getState, setState, resetState, subscribe, emit, on } from './store/state.js';
import { 
  hasSavedGame, loadCompany, loadEmployees, loadTasks, 
  loadGameState, loadAllMessages, saveGameState, 
  saveCompany, saveEmployees, saveTasks, clearAll,
  loadProjects, saveProjects
} from './store/db.js';
import { AIRouter } from './ai/router.js';
import { getAllApiKeys } from './utils/crypto.js';
import { formatGameTime } from './utils/helpers.js';
import { BottomNav } from './components/bottom-nav.js';
import { Simulation } from './engine/simulation.js';
import { Modal } from './components/modal.js';
import { Toast } from './components/toast.js';

import SetupScreen from './screens/setup.js';
import HireScreen from './screens/hire.js';
import OfficeScreen from './screens/office.js';
import ChatScreen from './screens/chat.js';
import TasksScreen from './screens/tasks.js';
import DashboardScreen from './screens/dashboard.js';
import ProjectsScreen from './screens/projects.js';

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
export function getAIRouter() {
  if (!aiRouter) {
    aiRouter = new AIRouter();
  }
  return aiRouter;
}

/**
 * Get the simulation instance
 */
export function getSimulation() {
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

// Expose navigate for global use
window.__navigate = navigate;

// Boot the app safely (handles both loading and interactive/complete DOM states)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already parsed
  init();
}

export { navigate, aiRouter };
