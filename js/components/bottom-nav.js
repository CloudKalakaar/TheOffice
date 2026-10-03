import { emit } from '../store/state.js';
import { createElement } from '../utils/helpers.js';

export class BottomNav {
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

export default BottomNav;
