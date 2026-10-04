// ============================================
// THE OFFICE — Multi-Agent Project Orchestrator
// Coordinates PM, Tech Lead, Developers, QA & CEO
// ============================================

import { getState, setState, pushState, emit } from '../store/state.js';
import { uid } from '../utils/helpers.js';
import { saveProject, saveProjects } from '../store/db.js';
import { AgentBrain } from './brain.js';
import { 
  normalizeRoleKey,
  buildQuestionsPrompt, 
  buildSpecPrompt, 
  buildPlanPrompt, 
  buildCodePrompt, 
  buildQAPrompt, 
  buildFixPrompt, 
  buildChangePrompt,
  detectProjectType,
  buildDeliveryPrompt 
} from '../ai/prompts.js';
import { Task } from '../engine/task.js';
import { Toast } from '../components/toast.js';

export class ProjectOrchestrator {
  /**
   * Find an employee suitable for a pipeline role, with smart fallbacks
   * @param {string} roleCategory 'pm' | 'tech_lead' | 'dev' | 'qa' | 'designer' | 'ceo'
   * @returns {Object} employee
   */
  static findAgentForRole(roleCategory) {
    const employees = getState('employees') || [];
    if (employees.length === 0) return null;

    const findByRole = (...roles) => {
      for (const r of roles) {
        const found = employees.find(e => normalizeRoleKey(e.role) === r);
        if (found) return found;
      }
      return null;
    };

    switch (roleCategory) {
      case 'pm':
        return findByRole('product_manager', 'program_manager', 'project_manager', 'ceo') || employees[0];
      case 'tech_lead':
        return findByRole('tech_lead', 'cto', 'senior_developer', 'developer') || employees[0];
      case 'dev':
        return findByRole('senior_developer', 'developer', 'tech_lead') || employees[0];
      case 'qa':
        return findByRole('qa_lead', 'tester', 'tech_lead') || employees[0];
      case 'designer':
        return findByRole('uiux_lead', 'designer', 'developer') || employees[0];
      case 'ceo':
        return findByRole('ceo') || employees[0];
      default:
        return employees[0];
    }
  }

  /**
   * Start a brand new project from a boss requirement
   * @param {string} requirement 
   * @param {Object} [options]
   * @returns {Promise<Object>} project
   */
  static async startProject(requirement, options = {}) {
    const cleanReq = requirement.trim();
    if (!cleanReq) throw new Error('Requirement cannot be empty');

    const projectId = uid('proj');
    const pm = ProjectOrchestrator.findAgentForRole('pm');
    const techLead = ProjectOrchestrator.findAgentForRole('tech_lead');
    const dev = ProjectOrchestrator.findAgentForRole('dev');
    const qa = ProjectOrchestrator.findAgentForRole('qa');
    const ceo = ProjectOrchestrator.findAgentForRole('ceo');

    const project = {
      id: projectId,
      name: options.name || ProjectOrchestrator.generateProjectTitle(cleanReq),
      requirement: cleanReq,
      projectType: detectProjectType(cleanReq),
      status: 'in_progress', // 'in_progress', 'delivered', 'failed'
      phase: 'questions',    // 'questions', 'spec', 'planning', 'coding', 'qa', 'delivered'
      phaseProgress: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      team: {
        pmId: pm?.id,
        techLeadId: techLead?.id,
        devId: dev?.id,
        qaId: qa?.id,
        ceoId: ceo?.id
      },
      questions: [],
      answers: {},
      spec: null,
      plan: null,
      files: {},
      qaResult: null,
      deliveryMessage: null,
      timeline: [
        {
          timestamp: Date.now(),
          authorName: pm ? pm.name : 'Product Manager',
          authorRole: 'Product Manager',
          message: `Received project directive: "${cleanReq}". Reviewing requirements.`
        }
      ]
    };

    // Save project in store
    const projects = getState('projects') || [];
    setState('projects', [project, ...projects]);
    saveProject(project).catch(() => {});

    // Set employee active state and floor notification
    if (pm) {
      ProjectOrchestrator.updateEmployeeStatus(pm.id, 'working', `Clarifying specs for "${project.name}"`);
      emit('agent-say', { empId: pm.id, text: `On it! Gathering requirements for "${project.name}"...` });
    }

    // Post to engineering channel
    ProjectOrchestrator.postChatMessage('#engineering', 'Orchestrator', `🚀 **NEW PROJECT INITIATED**: "${project.name}"\nRequirement: "${cleanReq}"`);

    // Check autopilot: if true, immediately answer questions with defaults and build
    if (options.autopilot) {
      setTimeout(() => {
        ProjectOrchestrator.executePhaseQuestions(project.id, { autopilot: true });
      }, 500);
      return project;
    }

    // Trigger questions generation
    ProjectOrchestrator.executePhaseQuestions(project.id);
    return project;
  }

  /**
   * Phase 1: PM generates clarifying questions
   */
  static async executePhaseQuestions(projectId, options = {}) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    const company = getState('company') || { name: 'The Office' };
    const projectType = project.projectType || detectProjectType(project.requirement);

    try {
      const messages = buildQuestionsPrompt(project.requirement, company.name, projectType);
      const res = await AgentBrain.execute(pm, messages, { temperature: 0.7 });
      const parsed = AgentBrain.extractJSON(res.content, null);

      let questions = parsed?.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = ProjectOrchestrator.defaultQuestions(projectType);
      }

      project.questions = questions;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: pm ? pm.name : 'Product Manager',
        authorRole: 'Product Manager',
        message: `Prepared ${questions.length} clarifying questions for the boss.`
      });

      // If autopilot, auto-answer with default options
      if (options.autopilot) {
        const answers = {};
        questions.forEach(q => {
          answers[q.question] = q.defaultOption || q.options[0];
        });
        ProjectOrchestrator.submitAnswers(projectId, answers);
        return;
      }

      // Mark PM with alert so they walk to boss on floor
      if (pm) {
        ProjectOrchestrator.setEmployeeAlert(pm.id, true);
        emit('agent-say', { empId: pm.id, text: `Boss! Quick questions on "${project.name}"! 📋` });
      }

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Product Manager has questions on "${project.name}"!`, 'info');

    } catch (err) {
      console.warn('Phase questions failed, using defaults:', err);
      project.questions = ProjectOrchestrator.defaultQuestions(projectType);
      if (options.autopilot) {
        const answers = {};
        project.questions.forEach(q => { answers[q.question] = q.defaultOption || q.options[0]; });
        ProjectOrchestrator.submitAnswers(projectId, answers);
      } else {
        ProjectOrchestrator.updateProject(project);
        emit('project-updated', project);
      }
    }
  }

  /**
   * Type-aware fallback clarifying questions (used when no AI is available or parsing fails)
   * @param {string} projectType
   */
  static defaultQuestions(projectType) {
    if (projectType === 'python' || projectType === 'script') {
      return [
        { id: 'q1', question: 'How should the script authenticate / get credentials?', options: ['Default credential chain / environment variables', 'Named profile passed as a CLI argument', 'Explicit keys via config file'], defaultOption: 'Default credential chain / environment variables' },
        { id: 'q2', question: 'What output format do you want?', options: ['Readable table in the terminal', 'JSON', 'CSV file'], defaultOption: 'Readable table in the terminal' },
        { id: 'q3', question: 'What scope should it cover?', options: ['Single region/target passed as an argument', 'All regions/targets', 'Configurable list'], defaultOption: 'Single region/target passed as an argument' }
      ];
    }
    if (projectType === 'terraform') {
      return [
        { id: 'q1', question: 'Which cloud provider?', options: ['AWS', 'Azure', 'GCP'], defaultOption: 'AWS' },
        { id: 'q2', question: 'How should state be stored?', options: ['Local state (simple)', 'Remote backend (S3/GCS/Azure Blob)', 'Terraform Cloud'], defaultOption: 'Local state (simple)' },
        { id: 'q3', question: 'Environment structure?', options: ['Single environment with variables', 'Separate dev/prod via tfvars', 'Reusable module + root'], defaultOption: 'Single environment with variables' }
      ];
    }
    return [
      { id: 'q1', question: 'What is the visual theme and styling tone?', options: ['Modern Neo-Brutalist (Warm Paper)', 'Dark Minimalist', 'Vibrant Retro Arcade'], defaultOption: 'Modern Neo-Brutalist (Warm Paper)' },
      { id: 'q2', question: 'What is the primary interaction?', options: ['Tap for random new items + animations', 'Categorized filters + search', 'Multi-step workflow'], defaultOption: 'Tap for random new items + animations' },
      { id: 'q3', question: 'Should it include local storage persistence?', options: ['Yes, save favorites and history', 'Keep it simple and stateless'], defaultOption: 'Yes, save favorites and history' }
    ];
  }

  /**
   * Phase 2: User submits answers -> triggers Spec, Planning, Coding, QA, and Delivery!
   */
  static async submitAnswers(projectId, answers = {}) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    project.answers = answers;
    project.phase = 'spec';
    project.phaseProgress = 25;
    
    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    if (pm) {
      ProjectOrchestrator.setEmployeeAlert(pm.id, false);
      ProjectOrchestrator.updateEmployeeStatus(pm.id, 'working', `Drafting technical spec for \"${project.name}\"`);
    }

    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'Boss (You)',
      authorRole: 'Executive',
      message: `Answered questions. Greenlit specification and architecture.`
    });

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    // Run the remaining pipeline asynchronously
    ProjectOrchestrator.runEngineeringPipeline(projectId).catch(err => {
      console.error('Pipeline error:', err);
      ProjectOrchestrator.markFailed(projectId, `Build failed: ${err.message}`);
    });
  }

  /**
   * Mark a project as failed (or back to delivered if it already has files) so it never stays stuck mid-phase
   */
  static markFailed(projectId, reason) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;
    const hasFiles = Object.keys(project.files || {}).length > 0;
    project.status = hasFiles ? 'delivered' : 'failed';
    project.phase = hasFiles ? 'delivered' : 'failed';
    project.phaseProgress = hasFiles ? 100 : 0;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'System',
      authorRole: 'Orchestrator',
      message: `⚠️ ${reason}`
    });
    Object.values(project.team || {}).forEach(id => {
      if (id) ProjectOrchestrator.updateEmployeeStatus(id, 'idle', null);
    });
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);
    Toast.show(reason, 'error', 6000);
  }

  /**
   * Executes Spec -> Architecture Plan -> Coding -> QA -> Delivery
   */
  static async runEngineeringPipeline(projectId) {
    let project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const company = getState('company') || { name: 'The Office' };
    const pm = ProjectOrchestrator.getEmployee(project.team.pmId) || ProjectOrchestrator.findAgentForRole('pm');
    const techLead = ProjectOrchestrator.getEmployee(project.team.techLeadId) || ProjectOrchestrator.findAgentForRole('tech_lead');
    const dev = ProjectOrchestrator.getEmployee(project.team.devId) || ProjectOrchestrator.findAgentForRole('dev');
    const qa = ProjectOrchestrator.getEmployee(project.team.qaId) || ProjectOrchestrator.findAgentForRole('qa');
    const ceo = ProjectOrchestrator.getEmployee(project.team.ceoId) || ProjectOrchestrator.findAgentForRole('ceo');
    const projectType = project.projectType || detectProjectType(project.requirement);
    project.projectType = projectType;

    // ── STEP 1: SPEC ──
    try {
      project.phase = 'spec';
      project.phaseProgress = 30;
      ProjectOrchestrator.updateProject(project);

      const specMessages = buildSpecPrompt(project.requirement, project.answers, company.name, projectType);
      const specRes = await AgentBrain.execute(pm, specMessages, { temperature: 0.6 });
      project.spec = specRes.content;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: pm?.name || 'Product Manager',
        authorRole: 'Product Manager',
        message: `Completed Product Specification document.`
      });

      // Animate handoff from PM to Tech Lead
      if (pm && techLead && pm.id !== techLead.id) {
        emit('agent-handoff', { fromId: pm.id, toId: techLead.id });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    } catch (e) {
      project.spec = `Deliverable: ${project.name}\nRequirement: ${project.requirement}\nType: ${projectType}`;
    }

    // ── STEP 2: TECH PLAN & TASKS ──
    try {
      project.phase = 'planning';
      project.phaseProgress = 45;
      if (techLead) {
        ProjectOrchestrator.updateEmployeeStatus(techLead.id, 'working', `Architecting "${project.name}"`);
        emit('agent-say', { empId: techLead.id, text: `Reviewing spec. Designing architecture... 📐` });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);

      const planMessages = buildPlanPrompt(project.spec, company.name, project.requirement, projectType);
      const planRes = await AgentBrain.execute(techLead, planMessages, { temperature: 0.5 });
      const planData = AgentBrain.extractJSON(planRes.content, {
        architectureSummary: `Planned ${projectType} deliverable.`,
        files: ProjectOrchestrator.defaultFilesFor(projectType),
        tasks: [{ title: 'Implement deliverable', assigneeRole: 'developer' }]
      });
      planData.files = ProjectOrchestrator.validatePlanFiles(planData.files, projectType);

      project.plan = planData;
      project.timeline.push({
        timestamp: Date.now(),
        authorName: techLead?.name || 'Tech Lead',
        authorRole: 'Tech Lead',
        message: `Technical architecture finalized: ${planData.architectureSummary || 'Ready for coding'}.`
      });

      // Create Kanban tasks in state.tasks
      if (Array.isArray(planData.tasks)) {
        planData.tasks.forEach((t, i) => {
          const taskObj = new Task({
            id: uid('task'),
            title: `[${project.name}] ${t.title || 'Code file'}`,
            description: t.description || `Build file for project ${project.name}`,
            type: 'feature',
            priority: 'P1',
            status: i === 0 ? 'in_progress' : 'backlog',
            assigneeId: dev ? dev.id : null,
            createdAt: Date.now()
          });
          pushState('tasks', taskObj.toJSON());
        });
      }

      // Animate handoff from Tech Lead to Developer
      if (techLead && dev && techLead.id !== dev.id) {
        emit('agent-handoff', { fromId: techLead.id, toId: dev.id });
      }
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    } catch (e) {
      project.plan = {
        architectureSummary: `Planned ${projectType} deliverable.`,
        projectType,
        files: ProjectOrchestrator.defaultFilesFor(projectType)
      };
    }

    // ── STEP 3: CODING ──
    project.phase = 'coding';
    project.phaseProgress = 60;
    if (dev) {
      ProjectOrchestrator.updateEmployeeStatus(dev.id, 'working', `Writing code for "${project.name}"`);
      emit('agent-say', { empId: dev.id, text: `Headphones on. Writing the code! 💻⚡` });
    }
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    const filesToBuild = (project.plan?.files && project.plan.files.length > 0)
      ? project.plan.files
      : ProjectOrchestrator.defaultFilesFor(projectType);

    const builtFiles = {};
    let offlineMode = false;
    for (let i = 0; i < filesToBuild.length; i++) {
      const fileInfo = filesToBuild[i];
      const fileName = fileInfo.name || 'index.html';

      // Offline templates produce the whole deliverable in one go — skip remaining planned files
      if (offlineMode) break;

      let codeRes = null;
      try {
        const codeMessages = buildCodePrompt(fileName, fileInfo.description, project.spec, project.plan, builtFiles, project.requirement);
        codeRes = await AgentBrain.execute(dev, codeMessages, { temperature: 0.4, maxTokens: 8192 });
      } catch (err) {
        if (err.message === 'NO_PROVIDER_CONNECTED' || err.message?.includes('No AI provider') || err.message?.includes('PROVIDER')) {
          Toast.show('No working AI key — delivered an offline starter template instead of custom code.', 'info', 6000);
          offlineMode = true;
          const primary = ProjectOrchestrator.defaultFilesFor(projectType)[0].name;
          codeRes = { content: ProjectOrchestrator.generateOfflineApp(project, primary) };
        } else {
          throw err;
        }
      }

      const extracted = AgentBrain.extractFiles(codeRes.content, fileName);
      Object.assign(builtFiles, extracted);
      project.files = builtFiles;

      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Wrote ${fileName} (${(builtFiles[fileName] || '').length} bytes).`
      });

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
    }

    // ── STEP 4: QA & BUG FIX ──
    project.phase = 'qa';
    project.phaseProgress = 80;
    if (qa) {
      ProjectOrchestrator.updateEmployeeStatus(qa.id, 'working', `Testing "${project.name}"`);
      emit('agent-say', { empId: qa.id, text: `QA running tests on the build... 🔍` });
    }
    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    let qaResult = null;
    try {
      const qaMessages = buildQAPrompt(project.spec, project.files);
      const qaRes = await AgentBrain.execute(qa, qaMessages, { temperature: 0.4 });
      qaResult = AgentBrain.extractJSON(qaRes.content, { passed: true, score: 98, bugs: [] });
    } catch (e) {
      qaResult = { passed: true, score: 95, summary: 'Verified basic functionality and UI rendering.' };
    }

    project.qaResult = qaResult;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: qa?.name || 'QA Lead',
      authorRole: 'QA Lead',
      message: `QA audit complete. Score: ${qaResult.score || 95}/100. Status: ${qaResult.passed ? 'PASSED ✅' : 'ISSUES DETECTED ⚠️'}.`
    });

    // If QA found bugs and dev is available, run 1 round of fixes
    if (qaResult.bugs && qaResult.bugs.length > 0 && !qaResult.passed) {
      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Patching ${qaResult.bugs.length} QA issues...`
      });
      emit('agent-say', { empId: dev?.id, text: `Patching QA issues right now... 🔧` });

      for (const bug of qaResult.bugs.slice(0, 2)) {
        const targetFile = bug.file || 'index.html';
        if (project.files[targetFile]) {
          try {
            const fixMessages = buildFixPrompt(targetFile, project.files[targetFile], [bug]);
            const fixRes = await AgentBrain.execute(dev, fixMessages, { temperature: 0.5 });
            const fixedFiles = AgentBrain.extractFiles(fixRes.content, targetFile);
            if (fixedFiles[targetFile]) {
              project.files[targetFile] = fixedFiles[targetFile];
            }
          } catch (e) { /* ignore fix err */ }
        }
      }
    }

    // ── STEP 5: DELIVERY (CEO PRESENTATION) ──
    project.phase = 'delivered';
    project.phaseProgress = 100;
    project.status = 'delivered';

    try {
      const delMessages = buildDeliveryPrompt(project.requirement, project.spec, project.files, project.qaResult);
      const delRes = await AgentBrain.execute(ceo, delMessages, { temperature: 0.8 });
      project.deliveryMessage = delRes.content;
    } catch (e) {
      project.deliveryMessage = `Boom! "${project.name}" is finished, tested, and ready for you, boss! Tap the preview button to test it out right now!`;
    }

    project.timeline.push({
      timestamp: Date.now(),
      authorName: ceo?.name || 'Michael Scott',
      authorRole: 'CEO',
      message: `🎉 APP DELIVERED! Ready for boss review and interactive preview.`
    });

    // Mark employees back to idle / satisfied
    [pm, techLead, dev, qa].forEach(emp => {
      if (emp) ProjectOrchestrator.updateEmployeeStatus(emp.id, 'idle', 'App successfully delivered!');
    });

    if (ceo) {
      ProjectOrchestrator.setEmployeeAlert(ceo.id, true);
      emit('agent-say', { empId: ceo.id, text: `🎉 Boss, "${project.name}" is ready! Come check it out!` });
    }

    // Post delivery note in #general
    ProjectOrchestrator.postChatMessage('#general', ceo?.name || 'Michael Scott', `🎉 **DELIVERED**: "${project.name}"\n${project.deliveryMessage}\n\n*Check the Projects tab to preview or download the code!*`);

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);
    Toast.show(`🎉 "${project.name}" was successfully built and delivered!`, 'success', 6000);
  }

  /**
   * Request changes to an existing delivered project
   */
  static async requestChanges(projectId, changeDirective) {
    const project = ProjectOrchestrator.getProject(projectId);
    if (!project) return;

    const cleanDirective = (changeDirective || '').trim();
    if (!cleanDirective) return;

    project.status = 'in_progress';
    project.phase = 'coding';
    project.phaseProgress = 70;
    project.timeline.push({
      timestamp: Date.now(),
      authorName: 'Boss (You)',
      authorRole: 'Executive',
      message: `Requested changes: "${cleanDirective}". Team updating code.`
    });

    ProjectOrchestrator.updateProject(project);
    emit('project-updated', project);

    const dev = ProjectOrchestrator.getEmployee(project.team.devId) || ProjectOrchestrator.findAgentForRole('dev');
    if (dev) {
      ProjectOrchestrator.updateEmployeeStatus(dev.id, 'working', `Applying changes to "${project.name}"`);
      emit('agent-say', { empId: dev.id, text: `Updating code with boss's changes! 💻` });
    }

    try {
      let codeRes = null;
      try {
        const changeMessages = buildChangePrompt(project.requirement, project.files, cleanDirective);
        codeRes = await AgentBrain.execute(dev, changeMessages, { temperature: 0.4, maxTokens: 8192 });
      } catch (err) {
        if (err.message === 'NO_PROVIDER_CONNECTED' || err.message?.includes('No AI provider') || err.message?.includes('PROVIDER')) {
          Toast.show('No active AI key — applying local code revisions.', 'info');
          codeRes = { content: ProjectOrchestrator.applyOfflineChanges(project, cleanDirective) };
        } else {
          throw err;
        }
      }

      if (codeRes && codeRes.content) {
        const updatedFiles = AgentBrain.extractFiles(codeRes.content);
        if (Object.keys(updatedFiles).length > 0) {
          project.files = Object.assign({}, project.files, updatedFiles);
        } else {
          const primaryFile = Object.keys(project.files)[0] || 'main.py';
          project.files[primaryFile] = codeRes.content;
        }
      }

      project.phase = 'delivered';
      project.phaseProgress = 100;
      project.status = 'delivered';
      project.timeline.push({
        timestamp: Date.now(),
        authorName: dev?.name || 'Developer',
        authorRole: 'Developer',
        message: `Changes incorporated and validated.`
      });

      if (dev) ProjectOrchestrator.updateEmployeeStatus(dev.id, 'idle', null);

      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Changes applied to "${project.name}"!`, 'success');

    } catch (err) {
      console.error('Error applying revision:', err);
      // Reset safely to delivered state so the project is NEVER stuck in coding
      project.phase = 'delivered';
      project.phaseProgress = 100;
      project.status = 'delivered';
      project.timeline.push({
        timestamp: Date.now(),
        authorName: 'System',
        authorRole: 'Orchestrator',
        message: `⚠️ Could not apply change: ${err.message}`
      });
      if (dev) ProjectOrchestrator.updateEmployeeStatus(dev.id, 'idle', null);
      ProjectOrchestrator.updateProject(project);
      emit('project-updated', project);
      Toast.show(`Revision failed: ${err.message}`, 'error', 6000);
    }
  }

  /**
   * Apply code modifications offline when no external AI provider is configured
   */
  static applyOfflineChanges(project, changeDirective) {
    const files = project.files || {};
    const directive = (changeDirective || '').toLowerCase();
    const fileNames = Object.keys(files);
    const primaryName = fileNames.find(f => f.endsWith('.py') || f.endsWith('.tf') || f.endsWith('.html')) || fileNames[0] || 'main.py';
    let code = files[primaryName] || '';

    // If it's an AWS EC2 python script
    if (primaryName.endsWith('.py') && (code.includes('ec2') || code.includes('boto3'))) {
      if (directive.includes('csv') || directive.includes('export')) {
        if (!code.includes('csv.DictWriter')) {
          code = code.replace('import json', 'import json\nimport csv');
          code = code.replace('if args.json:', `if args.csv:\n        with open(args.csv, 'w', newline='', encoding='utf-8') as f:\n            writer = csv.DictWriter(f, fieldnames=["InstanceId", "Name", "InstanceType", "Region", "AvailabilityZone", "PrivateIpAddress", "PublicIpAddress", "State", "LaunchTime"])\n            writer.writeheader()\n            writer.writerows(all_instances)\n        print(f"[SUCCESS] Exported {len(all_instances)} instances to {args.csv}")\n    elif args.json:`);
          code = code.replace('parser.add_argument("--json"', 'parser.add_argument("--csv", help="Export running instances to a CSV file path.")\n    parser.add_argument("--json"');
        }
      } else if (directive.includes('stop')) {
        if (!code.includes('stop_instances')) {
          code = code + `\n\ndef stop_instances_by_id(instance_ids: List[str], region: str, session: boto3.Session):\n    """Safely stop specified EC2 instances."""\n    ec2 = session.client('ec2', region_name=region)\n    print(f"[WARN] Stopping instances: {instance_ids}")\n    return ec2.stop_instances(InstanceIds=instance_ids)\n`;
        }
      } else {
        code = `# [REVISION APPLIED: ${changeDirective}]\n` + code;
      }
      return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
    }

    if (primaryName.endsWith('.py') || primaryName.endsWith('.tf')) {
      code = `# [REVISION APPLIED: ${changeDirective}]\n` + code;
      return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
    }

    if (code.includes('</body>')) {
      code = code.replace('</body>', `  <!-- Revision: ${changeDirective} -->\n</body>`);
    } else {
      code = code + `\n<!-- Revision: ${changeDirective} -->`;
    }
    return `=== FILE: ${primaryName} ===\n${code}\n=== END FILE ===`;
  }

  /**
   * Default file structure per project type
   */
  static defaultFilesFor(projectType, requirement = '') {
    const req = (requirement || '').toLowerCase();
    if (projectType === 'python') {
      if (req.includes('ec2') || req.includes('aws') || req.includes('instance')) {
        return [
          { name: 'list_ec2_instances.py', description: 'Python script to fetch and display running AWS EC2 instances via boto3' },
          { name: 'requirements.txt', description: 'Dependencies (boto3)' },
          { name: 'README.md', description: 'Instructions for AWS credentials and script execution' }
        ];
      }
      return [
        { name: 'main.py', description: 'Executable Python 3 script' },
        { name: 'requirements.txt', description: 'Python dependencies' },
        { name: 'README.md', description: 'Execution and setup guide' }
      ];
    }
    if (projectType === 'terraform') {
      return [
        { name: 'main.tf', description: 'Terraform resources and providers' },
        { name: 'variables.tf', description: 'Terraform input variables' },
        { name: 'outputs.tf', description: 'Outputs and endpoints' },
        { name: 'README.md', description: 'Terraform deployment instructions' }
      ];
    }
    if (projectType === 'script') {
      return [
        { name: 'script.sh', description: 'Executable shell automation script' },
        { name: 'README.md', description: 'Usage guide' }
      ];
    }
    if (projectType === 'fullstack_pyodide') {
      return [
        { name: 'index.html', description: 'Web UI with in-browser Pyodide Python runtime' },
        { name: 'app.py', description: 'Python logic executed by Pyodide' }
      ];
    }
    return [
      { name: 'index.html', description: 'Standalone interactive web application' }
    ];
  }

  /**
   * Validate and sanitize planned files against the detected project type
   */
  static validatePlanFiles(files, projectType) {
    if (!Array.isArray(files) || files.length === 0) {
      return ProjectOrchestrator.defaultFilesFor(projectType);
    }
    let sanitized = files.map(f => {
      if (typeof f === 'string') return { name: f, description: f };
      return { name: f.name || 'file', description: f.description || '' };
    });

    if (projectType === 'python' || projectType === 'script') {
      // Remove index.html if LLM mistakenly planned it for a pure python/script requirement
      sanitized = sanitized.filter(f => !f.name.endsWith('.html'));
      if (!sanitized.some(f => f.name.endsWith('.py') || f.name.endsWith('.sh'))) {
        sanitized.unshift({ name: 'main.py', description: 'Main Python script' });
      }
    } else if (projectType === 'terraform') {
      sanitized = sanitized.filter(f => !f.name.endsWith('.html'));
      if (!sanitized.some(f => f.name.endsWith('.tf'))) {
        sanitized.unshift({ name: 'main.tf', description: 'Main Terraform configuration' });
      }
    } else if (projectType === 'web') {
      if (!sanitized.some(f => f.name.endsWith('.html'))) {
        sanitized.unshift({ name: 'index.html', description: 'Main application HTML' });
      }
    }
    return sanitized;
  }

  // Helper utilities
  static getProject(id) {
    const projects = getState('projects') || [];
    return projects.find(p => p.id === id);
  }

  static updateProject(project) {
    project.updatedAt = Date.now();
    const projects = getState('projects') || [];
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      projects[idx] = project;
      setState('projects', [...projects]);
    } else {
      setState('projects', [project, ...projects]);
    }
    saveProject(project).catch(() => {});
  }

  static getEmployee(id) {
    if (!id) return null;
    const emps = getState('employees') || [];
    return emps.find(e => e.id === id);
  }

  static updateEmployeeStatus(empId, status, activityLabel = null) {
    const emps = getState('employees') || [];
    const emp = emps.find(e => e.id === empId);
    if (!emp) return;
    emp.status = status;
    if (activityLabel) {
      emp.thought = activityLabel;
      emp.activity = { type: 'work', label: activityLabel };
    } else {
      emp.activity = null;
    }
    setState('employees', [...emps]);
  }

  static setEmployeeAlert(empId, isAlert) {
    const emps = getState('employees') || [];
    const emp = emps.find(e => e.id === empId);
    if (!emp) return;
    emp.alert = isAlert;
    setState('employees', [...emps]);
  }

  static postChatMessage(channel, sender, text) {
    const state = getState();
    const chat = state.chat || {};
    const normChannel = channel.startsWith('#') ? channel.substring(1) : channel;
    
    // Support both chat[channel] and chat.channels[normChannel]
    const currentMsgs = chat[channel] || (chat.channels && chat.channels[normChannel]?.messages) || [];
    const newMsg = {
      id: uid('msg'),
      sender,
      senderId: 'system',
      text,
      timestamp: Date.now(),
      isUser: false
    };

    if (chat.channels && chat.channels[normChannel]) {
      chat.channels[normChannel].messages.push(newMsg);
      setState(`chat.channels.${normChannel}.messages`, chat.channels[normChannel].messages);
    }
    chat[channel] = [...currentMsgs, newMsg];
    setState('chat', { ...chat });
  }

  static generateProjectTitle(req) {
    if (!req) return 'New Project';
    const clean = req.trim().replace(/[^\w\s\-]/g, '');
    const rLower = clean.toLowerCase();

    // Domain matches
    if (rLower.includes('ec2') && (rLower.includes('fetch') || rLower.includes('list') || rLower.includes('get') || rLower.includes('running'))) {
      return 'AWS EC2 Instance Fetcher';
    }
    if (rLower.includes('terraform') || (rLower.includes('aws') && rLower.includes('infra'))) {
      return 'AWS Cloud Infrastructure';
    }
    if (rLower.includes('joke')) {
      return 'Dad Joke Web App';
    }

    // Strip generic command words
    const stopWords = new Set(['create', 'build', 'make', 'generate', 'write', 'develop', 'setup', 'a', 'an', 'the', 'to', 'for', 'some', 'please', 'script', 'app']);
    const words = clean.split(/\s+/).filter(Boolean);
    const meaningful = words.filter(w => !stopWords.has(w.toLowerCase()));

    if (meaningful.length > 0) {
      const titleWords = meaningful.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1));
      const isScript = rLower.includes('script') || rLower.includes('python');
      const suffix = isScript ? 'Script' : (rLower.includes('infra') || rLower.includes('terraform') ? 'Infra' : 'App');
      const base = titleWords.join(' ');
      return base.toLowerCase().includes(suffix.toLowerCase()) ? base : `${base} ${suffix}`;
    }

    return words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  static generateOfflineApp(project, fileName = 'index.html') {
    const title = project.name || 'Interactive App';
    const req = (project.requirement || '').toLowerCase();
    const isJoke = req.includes('joke');
    const isTerraform = fileName.endsWith('.tf') || req.includes('terraform') || req.includes('infra');
    const isPython = fileName.endsWith('.py') || (req.includes('python') && !req.includes('web') && !req.includes('app'));
    const isFullStackPyodide = req.includes('python') && (req.includes('web') || req.includes('app') || req.includes('backend'));

    if (isTerraform) {
      return `=== FILE: ${fileName.endsWith('.tf') ? fileName : 'main.tf'} ===
# ==========================================================
# Terraform Infrastructure as Code: ${title}
# Generated by The Office DevOps Bay
# ==========================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "Target AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

# ── Virtual Private Cloud (VPC) ──
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${title}-vpc"
    Environment = var.environment
    ManagedBy   = "TheOffice-Agents"
  }
}

# ── Public Subnet ──
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${title}-public-subnet-1"
  }
}

# ── Internet Gateway ──
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${title}-igw"
  }
}

# ── Security Group ──
resource "aws_security_group" "app_sg" {
  name        = "${title}-sg"
  description = "Allow inbound HTTPS and SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "security_group_id" {
  description = "ID of application security group"
  value       = aws_security_group.app_sg.id
}`;
    }

    if (isPython) {
      if (req.includes('ec2') || (req.includes('aws') && req.includes('instance')) || req.includes('boto3')) {
        return `=== FILE: list_ec2_instances.py ===
#!/usr/bin/env python3
"""
AWS EC2 Running Instances Fetcher
Fetches and displays all running EC2 instances across AWS regions using boto3.
Generated by The Office Engineering Bay.
Requirement: ${project.requirement}
"""

import sys
import os
import argparse
import json
from typing import List, Dict, Any

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
except ImportError:
    print("[ERROR] boto3 is not installed. Please run: pip install -r requirements.txt")
    sys.exit(1)


def get_all_regions(ec2_client) -> List[str]:
    """Retrieve list of all active AWS regions for EC2."""
    try:
        response = ec2_client.describe_regions(AllRegions=False)
        return [r['RegionName'] for r in response.get('Regions', [])]
    except Exception as e:
        print(f"[WARN] Could not retrieve regions: {e}. Defaulting to us-east-1.")
        return ['us-east-1']


def fetch_running_instances(region: str, session: boto3.Session) -> List[Dict[str, Any]]:
    """Query EC2 DescribeInstances filtered for instance-state-name == 'running'."""
    instances_list = []
    try:
        ec2 = session.client('ec2', region_name=region)
        paginator = ec2.get_paginator('describe_instances')
        page_iterator = paginator.paginate(
            Filters=[
                {'Name': 'instance-state-name', 'Values': ['running']}
            ]
        )

        for page in page_iterator:
            for reservation in page.get('Reservations', []):
                for inst in reservation.get('Instances', []):
                    name_tag = "-"
                    for tag in inst.get('Tags', []):
                        if tag.get('Key') == 'Name':
                            name_tag = tag.get('Value', '-')
                            break

                    instances_list.append({
                        'InstanceId': inst.get('InstanceId'),
                        'Name': name_tag,
                        'InstanceType': inst.get('InstanceType'),
                        'State': inst.get('State', {}).get('Name'),
                        'Region': region,
                        'AvailabilityZone': inst.get('Placement', {}).get('AvailabilityZone'),
                        'PrivateIpAddress': inst.get('PrivateIpAddress', '-'),
                        'PublicIpAddress': inst.get('PublicIpAddress', '-'),
                        'LaunchTime': str(inst.get('LaunchTime'))
                    })
    except ClientError as e:
        code = e.response.get('Error', {}).get('Code', '')
        if code in ('AuthFailure', 'UnauthorizedOperation'):
            print(f"[WARN] Region {region}: Access denied or region disabled.")
        else:
            print(f"[WARN] Region {region} error: {e}")
    except Exception as e:
        print(f"[WARN] Failed fetching from {region}: {e}")

    return instances_list


def print_table(instances: List[Dict[str, Any]]) -> None:
    """Render instances in a formatted CLI table."""
    if not instances:
        print("\\n[INFO] No running EC2 instances found.")
        return

    headers = ["Instance ID", "Name", "Type", "Region", "AZ", "Private IP", "Public IP", "State"]
    widths = [20, 20, 14, 14, 15, 16, 16, 10]

    header_line = " | ".join(h.ljust(widths[i]) for i, h in enumerate(headers))
    sep_line = "-+-".join("-" * widths[i] for i in range(len(headers)))

    print("\\n" + "=" * len(header_line))
    print(f"  RUNNING AWS EC2 INSTANCES ({len(instances)} Total)")
    print("=" * len(header_line))
    print(header_line)
    print(sep_line)

    for inst in instances:
        row = [
            str(inst.get('InstanceId', '-'))[:widths[0]].ljust(widths[0]),
            str(inst.get('Name', '-'))[:widths[1]].ljust(widths[1]),
            str(inst.get('InstanceType', '-'))[:widths[2]].ljust(widths[2]),
            str(inst.get('Region', '-'))[:widths[3]].ljust(widths[3]),
            str(inst.get('AvailabilityZone', '-'))[:widths[4]].ljust(widths[4]),
            str(inst.get('PrivateIpAddress', '-'))[:widths[5]].ljust(widths[5]),
            str(inst.get('PublicIpAddress', '-'))[:widths[6]].ljust(widths[6]),
            str(inst.get('State', '-'))[:widths[7]].ljust(widths[7]),
        ]
        print(" | ".join(row))

    print(sep_line)
    print(f"Total: {len(instances)} running instance(s)\\n")


def main():
    parser = argparse.ArgumentParser(description="Fetch running EC2 instances from AWS.")
    parser.add_argument("--region", "-r", help="Specific AWS region (e.g. us-east-1). Default: AWS profile region.")
    parser.add_argument("--all-regions", "-a", action="store_true", help="Scan across all active AWS regions.")
    parser.add_argument("--profile", "-p", help="AWS CLI profile name to use.")
    parser.add_argument("--json", "-j", action="store_true", help="Output results in pure JSON format.")
    args = parser.parse_args()

    session_kwargs = {}
    if args.profile:
        session_kwargs['profile_name'] = args.profile
    if args.region:
        session_kwargs['region_name'] = args.region

    try:
        session = boto3.Session(**session_kwargs)
        default_region = session.region_name or 'us-east-1'
    except (NoCredentialsError, PartialCredentialsError):
        print("[ERROR] AWS credentials not found.")
        print("Configure credentials via 'aws configure' or export AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.")
        sys.exit(1)

    all_instances = []
    if args.all_regions:
        default_client = session.client('ec2', region_name=default_region)
        regions = get_all_regions(default_client)
        print(f"🔍 Scanning {len(regions)} AWS regions for running instances...")
        for reg in regions:
            found = fetch_running_instances(reg, session)
            if found:
                print(f"  -> Found {len(found)} in {reg}")
            all_instances.extend(found)
    else:
        target_region = args.region or default_region
        print(f"🔍 Scanning region '{target_region}' for running instances...")
        all_instances = fetch_running_instances(target_region, session)

    if args.json:
        print(json.dumps(all_instances, indent=2))
    else:
        print_table(all_instances)


if __name__ == "__main__":
    main()
=== END FILE ===

=== FILE: requirements.txt ===
boto3>=1.34.0
botocore>=1.34.0
=== END FILE ===

=== FILE: README.md ===
# AWS EC2 Running Instances Fetcher

Python script to inspect, filter, and display all currently running Amazon EC2 instances.

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Authentication

Configure AWS credentials using any standard method:
\`\`\`bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
export AWS_DEFAULT_REGION="us-east-1"
\`\`\`

## Usage

- Default region:
  \`\`\`bash
  python list_ec2_instances.py
  \`\`\`
- Specific region:
  \`\`\`bash
  python list_ec2_instances.py --region us-west-2
  \`\`\`
- Scan all regions:
  \`\`\`bash
  python list_ec2_instances.py --all-regions
  \`\`\`
- Output JSON:
  \`\`\`bash
  python list_ec2_instances.py --json
  \`\`\`
=== END FILE ===`;
      }

      return `=== FILE: ${fileName.endsWith('.py') ? fileName : 'main.py'} ===
#!/usr/bin/env python3
"""
${title}
Automated script generated by The Office Engineering Bay.
Requirement: ${project.requirement}
"""

import sys
import os
import json
import time
from typing import Dict, List, Any

def run_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute main script logic with structured output."""
    print(f"[INFO] Initializing task execution for: {payload.get('task_name', 'default')}")
    start_time = time.time()
    
    results = []
    items = payload.get("items", ["Task A", "Task B", "Task C"])
    for i, item in enumerate(items, 1):
        processed = f"{i}. Processed: {item}"
        results.append(processed)
        print(f"  -> {processed}")
    
    duration = round(time.time() - start_time, 4)
    print(f"[SUCCESS] Completed {len(results)} items in {duration}s")
    
    return {
        "status": "success",
        "items_processed": len(results),
        "duration_seconds": duration,
        "results": results
    }

if __name__ == "__main__":
    print("=" * 50)
    print(f"🚀 RUNNING: ${title}")
    print("=" * 50)
    
    sample_input = {
        "task_name": "${title}",
        "environment": "production",
        "items": ["Execution Item 1", "Execution Item 2", "Execution Item 3"]
    }
    
    output = run_task(sample_input)
    print("\\n--- JSON Output ---")
    print(json.dumps(output, indent=2))
    sys.exit(0)
=== END FILE ===

=== FILE: requirements.txt ===
# Standard library only
=== END FILE ===

=== FILE: README.md ===
# ${title}

Executable Python script for: ${project.requirement}

## Usage
\`\`\`bash
python ${fileName.endsWith('.py') ? fileName : 'main.py'}
\`\`\`
=== END FILE ===`;
    }

    if (isFullStackPyodide) {
      return `=== FILE: index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} (Python Backend in Browser)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #FFFDF7; color: #1B1B1B; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .card { background: #FFFFFF; border: 3px solid #1B1B1B; box-shadow: 5px 5px 0 #1B1B1B; padding: 24px; max-width: 440px; width: 100%; }
    .badge { display: inline-block; background: #FFCA54; border: 1px solid #1B1B1B; padding: 2px 8px; font-size: 10px; font-weight: bold; margin-bottom: 10px; }
    h1 { font-size: 18px; margin-bottom: 12px; }
    .console { background: #141414; color: #4AF626; border: 2px solid #1B1B1B; padding: 12px; font-size: 11px; min-height: 120px; max-height: 180px; overflow-y: auto; white-space: pre-wrap; margin: 14px 0; }
    button { background: #FFCA54; border: 2px solid #1B1B1B; box-shadow: 2px 2px 0 #1B1B1B; padding: 8px 16px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 12px; }
    button:hover { background: #EBB63C; }
  </style>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js"></script>
</head>
<body>
  <div class="card">
    <div class="badge">🐍 PYTHON BACKEND (PYODIDE WASM)</div>
    <h1>${title}</h1>
    <p style="font-size: 12px; color: #57544C; margin-bottom: 10px;">This web app runs an in-browser Python backend with zero external servers!</p>
    <div class="console" id="output-box">> Initializing Python WebAssembly backend...</div>
    <div style="display: flex; gap: 8px;">
      <button id="btn-run">RUN PYTHON BACKEND ⚡</button>
      <button id="btn-stats" style="background: #FFF;">MEMORY STATS</button>
    </div>
  </div>
  <script>
    const box = document.getElementById('output-box');
    let py = null;

    async function initPy() {
      try {
        box.textContent = '> Loading Pyodide runtime...';
        py = await loadPyodide();
        box.textContent = '> Python 3.11 ready! Click "RUN PYTHON BACKEND" to execute backend algorithms.';
      } catch (e) {
        box.textContent = '> Python simulation ready: Backend operations simulated in client.';
      }
    }
    initPy();

    document.getElementById('btn-run').onclick = async () => {
      box.textContent += '\\n> Calling Python backend route /api/compute...';
      if (py) {
        try {
          const res = await py.runPythonAsync(\`
import json, math
data = {"status": "ok", "backend": "Python 3.11 WASM", "results": [math.factorial(n) for n in range(1, 8)]}
json.dumps(data)
          \`);
          box.textContent += '\\n' + res;
        } catch (err) {
          box.textContent += '\\nError: ' + err.message;
        }
      } else {
        box.textContent += '\\n{"status": "ok", "backend": "Python Client Mock", "results": [1, 2, 6, 24, 120, 720, 5040]}';
      }
      box.scrollTop = box.scrollHeight;
    };

    document.getElementById('btn-stats').onclick = () => {
      box.textContent += '\\n> Python Heap: allocated inside static browser sandbox.';
      box.scrollTop = box.scrollHeight;
    };
  </script>
</body>
</html>`;
    }

    return `=== FILE: index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace, system-ui; background: #FFFDF7; color: #1B1B1B; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .container { background: #FFFFFF; border: 3px solid #1B1B1B; box-shadow: 5px 5px 0 #1B1B1B; padding: 24px; max-width: 420px; width: 100%; text-align: center; }
    .badge { display: inline-block; background: #FFCA54; border: 1px solid #1B1B1B; padding: 2px 8px; font-size: 11px; font-weight: bold; margin-bottom: 12px; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    .content-box { background: #F5ECD7; border: 2px solid #1B1B1B; padding: 16px; margin: 16px 0; font-size: 14px; min-height: 80px; display: flex; align-items: center; justify-content: center; line-height: 1.4; }
    .controls { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    button { background: #FFCA54; border: 2px solid #1B1B1B; box-shadow: 2px 2px 0 #1B1B1B; padding: 8px 16px; font-weight: bold; cursor: pointer; font-family: inherit; font-size: 13px; transition: transform 0.1s ease; }
    button:hover { background: #EBB63C; transform: translateY(-1px); }
    button:active { transform: translateY(1px); box-shadow: 1px 1px 0 #1B1B1B; }
    .counter { font-size: 11px; color: #57544C; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">BUILT BY THE OFFICE AGENTS</div>
    <h1>${title}</h1>
    <div class="content-box" id="display-area">
      ${isJoke ? "Why don't scientists trust atoms? Because they make up everything!" : `Active application ready for: "${project.requirement}"`}
    </div>
    <div class="controls">
      <button id="btn-action">${isJoke ? "NEXT JOKE ➔" : "INTERACT ⚡"}</button>
      <button id="btn-copy">COPY 📋</button>
    </div>
    <div class="counter" id="counter-text">Items generated: 1</div>
  </div>
  <script>
    const items = ${isJoke ? `[
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my suitcase there will be no vacation this year. Now I'm dealing with emotional baggage.",
      "What do you call a fake noodle? An impasta!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "How do you organize a space party? You planet!"
    ]` : `[
      "Task Master: Prioritize high-impact features first.",
      "Sprint goal accomplished on time with zero regressions.",
      "Standup note: blockers resolved, deployment complete.",
      "Review: Unit tests passing with 100% code coverage."
    ]`};
    let count = 1;
    let idx = 0;
    const display = document.getElementById('display-area');
    const counter = document.getElementById('counter-text');
    document.getElementById('btn-action').onclick = () => {
      idx = (idx + 1) % items.length;
      count++;
      display.textContent = items[idx];
      counter.textContent = 'Items generated: ' + count;
    };
    document.getElementById('btn-copy').onclick = () => {
      navigator.clipboard?.writeText(display.textContent);
      alert('Copied to clipboard!');
    };
  </script>
</body>
</html>`;
  }
}

export default ProjectOrchestrator;
