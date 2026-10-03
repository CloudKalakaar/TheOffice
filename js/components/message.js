import { escapeHtml } from '../utils/helpers.js';

export function renderAvatar(avatarConfig, size = 'sm') {
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

export function renderMessage(message) {
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
