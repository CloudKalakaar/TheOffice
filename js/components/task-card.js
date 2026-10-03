import { escapeHtml, truncate } from '../utils/helpers.js';
import { renderAvatar } from './message.js';
import { emit } from '../store/state.js';

export function renderTaskCard(task, employees = []) {
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
