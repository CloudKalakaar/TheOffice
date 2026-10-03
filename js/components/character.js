// ============================================
// THE OFFICE — Roaming Floor Character Component
// Sprites, Waypoint Pathfinding, Movement & State
// ============================================

import { createElement, escapeHtml } from '../utils/helpers.js';
import { emit } from '../store/state.js';

export class FloorCharacter {
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

export default FloorCharacter;
