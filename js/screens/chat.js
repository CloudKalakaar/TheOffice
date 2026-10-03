import { getState, mergeState, pushState, on } from '../store/state.js';
import { createElement, uid } from '../utils/helpers.js';
import { renderMessage, renderAvatar } from '../components/message.js';
import { getAIRouter } from '../app.js';
import { buildSystemPrompt } from '../ai/prompts.js';
import { EmployeeConversation } from '../agents/conversation.js';

export class ChatScreen {
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
