import os
import re

files_in_order = [
    'js/utils/helpers.js',
    'js/utils/names.js',
    'js/utils/crypto.js',
    'js/store/state.js',
    'js/store/db.js',
    'js/ai/provider.js',
    'js/ai/gemini.js',
    'js/ai/openai.js',
    'js/ai/anthropic.js',
    'js/ai/grok.js',
    'js/ai/groq.js',
    'js/ai/openrouter.js',
    'js/ai/huggingface.js',
    'js/ai/router.js',
    'js/ai/prompts.js',
    'js/ai/queue.js',
    'js/engine/tick.js',
    'js/engine/company.js',
    'js/engine/employee.js',
    'js/engine/task.js',
    'js/engine/workflow.js',
    'js/engine/scrum.js',
    'js/engine/events.js',
    'js/engine/simulation.js',
    'js/components/toast.js',
    'js/components/modal.js',
    'js/components/message.js',
    'js/components/task-card.js',
    'js/components/employee-card.js',
    'js/agents/artifacts.js',
    'js/agents/brain.js',
    'js/agents/orchestrator.js',
    'js/agents/conversation.js',
    'js/components/character.js',
    'js/components/talk-sheet.js',
    'js/components/floor.js',
    'js/components/bottom-nav.js',
    'js/screens/setup.js',
    'js/screens/hire.js',
    'js/screens/projects.js',
    'js/screens/office.js',
    'js/screens/chat.js',
    'js/screens/tasks.js',
    'js/screens/dashboard.js',
    'js/app.js'
]

bundle_parts = [
    "// ==========================================================",
    "// THE OFFICE — Standalone App Bundle",
    "// Generated for 100% compatibility across file://, http://, and https://",
    "// ==========================================================\n",
    "(function() {",
    "'use strict';\n"
]

for rel_path in files_in_order:
    if not os.path.exists(rel_path):
        print(f"Error: {rel_path} not found")
        continue
    
    with open(rel_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # Special handling for app.js SCREEN_MODULES to avoid dynamic import()
    if rel_path == 'js/app.js':
        code = re.sub(
            r'const SCREEN_MODULES\s*=\s*\{[\s\S]*?\};',
            """const SCREEN_MODULES = {
  setup: async () => ({ default: SetupScreen }),
  hire: async () => ({ default: HireScreen }),
  office: async () => ({ default: OfficeScreen }),
  chat: async () => ({ default: ChatScreen }),
  projects: async () => ({ default: ProjectsScreen }),
  tasks: async () => ({ default: TasksScreen }),
  dashboard: async () => ({ default: DashboardScreen })
};""",
            code
        )

    # Remove import statements (only when they start a line, so strings are never touched)
    code = re.sub(r'^[ \t]*import\s+[^;]*?\s+from\s*[\'"][^\'"]*[\'"];?[ \t]*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^[ \t]*import\s+[\'"][^\'"]*[\'"];?[ \t]*$', '', code, flags=re.MULTILINE)

    # Remove export statements (line-anchored)
    code = re.sub(r'^[ \t]*export\s+default\s*\{[^}]*\};?[ \t]*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^[ \t]*export\s+default\s+[A-Za-z_$][\w$]*;?[ \t]*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^[ \t]*export\s*\{[^}]*\};?[ \t]*$', '', code, flags=re.MULTILINE)
    code = re.sub(r'^([ \t]*)export\s+(async\s+function|function|class|const|let|var)\b', r'\1\2', code, flags=re.MULTILINE)

    bundle_parts.append(f"\n// ─── Module: {rel_path} ───\n")
    bundle_parts.append(code)

bundle_parts.append("\n})();\n")

bundle_content = "\n".join(bundle_parts)

with open('js/bundle.js', 'w', encoding='utf-8') as f:
    f.write(bundle_content)

print(f"Bundle generated: js/bundle.js ({len(bundle_content)} bytes)")
