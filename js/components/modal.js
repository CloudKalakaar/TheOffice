import { escapeHtml } from '../utils/helpers.js';

export class Modal {
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

export default Modal;
