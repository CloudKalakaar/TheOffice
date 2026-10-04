# The Office — AI-Powered Office Simulator (PWA)

A mobile-first, vertical static Progressive Web App (PWA) that simulates a software company where autonomous AI bots act as employees organized in a realistic corporate hierarchy. Themed after the American TV show *The Office* with comic/cartoon flair.

---

## 🌟 Key Features

- **📱 Mobile-First Vertical PWA**: Designed for portrait phone screens (360px–428px). Supports native **Add to Home Screen (A2HS)** on Android & iOS with custom icons, splash screens, and cache refresh.
- **🤖 Top AI Providers & Free Models**:
  - **Google Gemini** (Free tier: 15 RPM, 1,500 RPD)
  - **Groq** (Free tier: 30 RPM, 14,400 RPD — ultra fast Llama 3.3 70B)
  - **OpenRouter** (Free community models available)
  - **HuggingFace** (Serverless inference)
  - **OpenAI** (GPT-4o, GPT-4o-mini)
  - **Anthropic** (Claude 3.5 Sonnet, Claude 3.5 Haiku)
  - **xAI Grok** (Grok-2, Grok-3-mini)
- **🏢 Physical Office Floor Simulation**:
  - Interactive top-down comic-style office floor
  - Executive suites (CEO & CTO private offices)
  - Conference/Meeting room
  - Open workspace with individual developer desks
  - Break room with coffee machine & water cooler
  - Scrum area with sticky-note board
  - Live animated employee status (working, in meetings, coffee breaks, typing bubbles)
- **👥 Corporate Hierarchy & Hiring**:
  - **Executive Suite**: CEO, CTO, CIO
  - **Management**: Program Manager, Product Manager, Project Manager
  - **Engineering**: Tech Lead, Senior Developer, Developer, QA Lead, Tester, DevOps Engineer, Networking Engineer
  - **Design & Support**: UI/UX Lead, Designer, Technical Writer, Data Analyst
  - Character personalities inspired by *The Office* (Michael, Stanley, Angela, Jim, Dwight, Pam, etc.)
- **💬 Team Communication & Chat**:
  - Channels: `#general`, `#engineering`, `#standup`, `#random`
  - Direct 1:1 messages with any employee bot
  - Personality-driven conversations and real AI responses
- **📋 Kanban Task Board**:
  - Backlog, In Progress, In Review, Done
  - Task priority management (P0 to P3)
  - Real-time sprint progress tracking
- **📊 Executive Dashboard**:
  - Team productivity tracker
  - Sprint velocity and burndown
  - Office event history
- **🎉 Random Office Events**:
  - Pretzel Day, Dundie Awards, fire drills, coffee runs, printer jams, water cooler chats
- **⚡ 100% Static & Serverless**:
  - Zero build steps required (Pure Vanilla JS with native ES Modules)
  - Direct deployment to **GitHub Pages**
  - Offline-first with Service Worker caching and automatic cache invalidation on updates
  - Local state persistence using **IndexedDB** & encrypted **localStorage**

---

## 🚀 How to Host on GitHub Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of The Office PWA"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** → **Pages** (under Code and automation).
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**.
   - Select branch **`main`** and folder **`/(root)`**, then click **Save**.
   - Within 1–2 minutes, your app will be live at `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`.

---

## 📲 How to Install as Mobile App (Add to Home Screen)

### On Android (Chrome / Brave / Edge)
1. Open your GitHub Pages link in Chrome on your phone.
2. Tap the **three dots menu** (⋮) at top-right.
3. Tap **Add to Home screen** or **Install app**.
4. Confirm installation. The app will launch in standalone fullscreen mode like a native app.

### On iOS (Safari)
1. Open your GitHub Pages link in Safari on your iPhone.
2. Tap the **Share button** (square with upward arrow) at the bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.

---

## 🔑 Getting Started (In-Game Setup)

1. **Launch App**: Open the app on your phone.
2. **Company Name**: Set your company name (e.g. *Acme Labs*) and target software project.
3. **Connect AI**:
   - Enter an API key for any of the top providers (e.g. Gemini or Groq for free usage).
   - Click **Test Connection** to verify your key.
4. **Build Your Team**:
   - Use the **Quick-Start** buttons (`Startup (5)`, `Small Team (10)`, or `Full Office (20)`) or hire role-by-role with custom names and personalities.
5. **Start Working**:
   - Watch your team work at their desks, hold meetings, discuss features in chat, and complete sprint tasks!
