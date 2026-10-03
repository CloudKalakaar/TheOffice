import { createElement, escapeHtml } from '../utils/helpers.js';

export class Toast {
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
