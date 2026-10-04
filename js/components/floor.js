// ============================================
// THE OFFICE — Interactive Living Floor Engine
// Waypoint corridor navigation, roaming sprites,
// rooms, desk monitors, and boss interaction
// ============================================

import { emit, getState, on } from '../store/state.js';
import { createElement, escapeHtml, randomPick } from '../utils/helpers.js';
import { FloorCharacter } from './character.js';

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

export class OfficeFloor {
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

export default OfficeFloor;
