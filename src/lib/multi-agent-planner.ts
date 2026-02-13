/**
 * Multi-Agent Execution Planner Service
 * 
 * Provides utilities for creating, validating, and managing multi-agent execution plans.
 */

import type {
  MultiAgentExecutionPlan,
  PlanTemplate,
  TemplateLibrary,
  Task,
  TaskBreakdown,
  DependencyEdge,
  Agent,
  Checkpoint,
} from '@/types/multi-agent';

// ============================================================================
// Default Template: General Project Delivery
// ============================================================================

export const DEFAULT_GENERAL_PROJECT_TEMPLATE: PlanTemplate = {
  name: 'General Project Delivery',
  description: 'Multi-agent execution plan for coordinating a team to deliver a complex general project',
  version: '1.0.0',
  
  goalAndSuccessCriteria: {
    deliverables: [
      {
        id: 'charter',
        name: 'Project Charter + Scope',
        description: 'Clear scope boundaries and non-goals documented',
      },
      {
        id: 'requirements',
        name: 'Requirements & Acceptance Criteria',
        description: 'Testable, prioritized, and traceable requirements',
      },
      {
        id: 'plan',
        name: 'Execution Plan',
        description: 'Milestones, owners, and risks defined',
      },
      {
        id: 'output',
        name: 'Final Integrated Output',
        description: 'Coherent, reviewed v1 release',
      },
    ],
    successCriteria: [
      {
        id: 'sc1',
        description: 'Clear scope boundaries + non-goals documented',
        measurable: true,
      },
      {
        id: 'sc2',
        description: 'Requirements are testable, prioritized, and traceable to outputs',
        measurable: true,
      },
      {
        id: 'sc3',
        description: 'Plan is executable: owners assigned, dependencies mapped, checkpoints defined',
        measurable: true,
      },
      {
        id: 'sc4',
        description: 'Final output passes QA checks (consistency, completeness, formatting, rationale)',
        measurable: true,
      },
    ],
    constraints: [
      { type: 'agent_count', value: 3, description: 'Three agents on the team' },
      { type: 'pattern', value: 'parallel', description: 'Parallel execution pattern' },
      { type: 'max_concurrency', value: 5, description: 'Maximum 5 concurrent tasks' },
      { type: 'timeout', value: 300, description: '300 seconds per task' },
      { type: 'retry_count', value: 3, description: 'Up to 3 retry attempts' },
      { type: 'communication', value: 'artifact-based', description: 'Shared docs/specs, minimal chatter' },
    ],
  },
  
  teamRoster: [
    {
      id: 'integrator',
      role: 'Integrator / Program Lead',
      responsibilities: [
        'Owns overall plan',
        'Dependency mapping',
        'Checkpoint facilitation',
        'Final merge',
        'QA and versioning',
      ],
      backupAgent: 'requirements_lead',
    },
    {
      id: 'requirements_lead',
      role: 'Requirements Lead',
      responsibilities: [
        'Elicits/defines requirements',
        'Acceptance tests',
        'Prioritization (Must/Should/Could)',
        'Traceability matrix',
      ],
      backupAgent: 'risk_lead',
    },
    {
      id: 'risk_lead',
      role: 'Risk & Quality Lead',
      responsibilities: [
        'Risk register',
        'QA gates',
        'Consistency checks',
        'Red team review',
        'Recovery playbooks',
      ],
      backupAgent: 'integrator',
    },
  ],
  
  taskBreakdown: [
    {
      id: 'task1',
      name: 'Define project charter & boundaries',
      owner: 'integrator',
      goal: 'Produce a one-page charter that anchors all agent work',
      inputs: [
        { name: 'Default goal assumptions', source: 'external', required: true },
        { name: 'Existing constraints', source: 'external', required: false },
      ],
      outputs: [
        {
          name: 'Charter v1',
          description: 'Objectives, stakeholders, in-scope/out-of-scope, assumptions, definition of done',
          format: 'markdown',
        },
      ],
      dependencies: [],
      acceptanceChecks: [
        { id: 'ac1_1', description: 'Has explicit scope + non-goals', objective: true },
        { id: 'ac1_2', description: 'Has measurable definition of done', objective: true },
        { id: 'ac1_3', description: 'Assumptions listed and labeled as such', objective: true },
      ],
      priority: 'must',
      risk: 'medium',
      fallback: [
        {
          condition: 'Scope feels too broad',
          action: 'Constrain to a "v1 release" with 3–5 core outcomes',
        },
      ],
      timeoutSeconds: 300,
      retryCount: 3,
    },
    {
      id: 'task2',
      name: 'Requirements + acceptance criteria (testable)',
      owner: 'requirements_lead',
      goal: 'Convert the charter into prioritized, testable requirements',
      inputs: [
        { name: 'Charter v1', source: 'task1', required: true },
      ],
      outputs: [
        {
          name: 'Requirements doc',
          description: 'Requirements + acceptance criteria; Must/Should/Could; traceability IDs',
          format: 'structured_document',
        },
      ],
      dependencies: ['task1'],
      acceptanceChecks: [
        { id: 'ac2_1', description: 'Each requirement is unambiguous and testable', objective: true },
        { id: 'ac2_2', description: 'Each has acceptance criteria and priority', objective: true },
        { id: 'ac2_3', description: 'Conflicts or gaps flagged', objective: true },
      ],
      priority: 'must',
      risk: 'medium-high',
      fallback: [
        {
          condition: 'Requirements are fuzzy',
          action: 'Create a "requirements backlog" with explicit unknowns + assumptions',
        },
      ],
      timeoutSeconds: 300,
      retryCount: 3,
    },
    {
      id: 'task3',
      name: 'Workplan & milestones (execution design)',
      owner: 'integrator',
      goal: 'Translate requirements into a workable plan (milestones, owners, handoffs)',
      inputs: [
        { name: 'Charter v1', source: 'task1', required: true },
        { name: 'Requirements doc', source: 'task2', required: true },
      ],
      outputs: [
        {
          name: 'Milestone plan',
          description: 'RACI-lite assignments, dependency list, checkpoint schedule',
          format: 'structured_document',
        },
      ],
      dependencies: ['task1', 'task2'],
      acceptanceChecks: [
        { id: 'ac3_1', description: 'Every Must requirement mapped to at least one milestone/task', objective: true },
        { id: 'ac3_2', description: 'Dependencies are explicit; no circular dependency', objective: true },
        { id: 'ac3_3', description: 'Owners + expected artifacts defined', objective: true },
      ],
      priority: 'must',
      risk: 'medium',
      fallback: [
        {
          condition: 'Dependencies are messy',
          action: 'Simplify into 2–3 milestones and defer non-critical items',
        },
      ],
      timeoutSeconds: 300,
      retryCount: 3,
    },
    {
      id: 'task4',
      name: 'Risk register & quality gates (red team)',
      owner: 'risk_lead',
      goal: 'Identify top risks and define QA gates/checklists at checkpoints',
      inputs: [
        { name: 'Charter v1', source: 'task1', required: true },
        { name: 'Requirements doc', source: 'task2', required: true },
        { name: 'Workplan', source: 'task3', required: false },
      ],
      outputs: [
        {
          name: 'Risk register',
          description: 'Probability/impact/mitigation + QA checklist + escalation rules',
          format: 'structured_document',
        },
      ],
      dependencies: ['task1', 'task2'],
      acceptanceChecks: [
        { id: 'ac4_1', description: 'Top 5–10 risks listed with mitigations', objective: true },
        { id: 'ac4_2', description: 'QA gates are objective (pass/fail)', objective: true },
        { id: 'ac4_3', description: 'Recovery actions are specified (retry/failover/rollback)', objective: true },
      ],
      priority: 'must',
      risk: 'medium',
      fallback: [
        {
          condition: 'Lacking detail',
          action: 'Use standard risks: scope creep, unclear acceptance, dependency blockage, integration drift',
        },
      ],
      timeoutSeconds: 300,
      retryCount: 3,
    },
    {
      id: 'task5',
      name: 'Integration & final "Project Delivery Pack" assembly',
      owner: 'integrator',
      goal: 'Merge artifacts into a single coherent v1 deliverable',
      inputs: [
        { name: 'Charter v1', source: 'task1', required: true },
        { name: 'Requirements doc', source: 'task2', required: true },
        { name: 'Milestone plan', source: 'task3', required: true },
        { name: 'Risk register', source: 'task4', required: true },
      ],
      outputs: [
        {
          name: 'Final Pack v1',
          description: 'Single doc or folder + changelog + QA signoff notes',
          format: 'complete_package',
        },
      ],
      dependencies: ['task1', 'task2', 'task3', 'task4'],
      acceptanceChecks: [
        { id: 'ac5_1', description: 'Traceability: Must requirements → implemented/covered section', objective: true },
        { id: 'ac5_2', description: 'Consistent terminology and formatting', objective: true },
        { id: 'ac5_3', description: 'QA checklist passed; open issues tracked', objective: true },
      ],
      priority: 'must',
      risk: 'medium-high',
      fallback: [
        {
          condition: 'Conflicts persist',
          action: 'Freeze scope to Musts only; add "Open Questions / Deferred" appendix',
        },
      ],
      timeoutSeconds: 300,
      retryCount: 3,
    },
  ],
  
  dependenciesAndDataFlow: {
    dependencyGraph: [
      { from: 'task1', to: 'task2', artifact: 'Charter v1' },
      { from: 'task1', to: 'task3', artifact: 'Charter v1' },
      { from: 'task2', to: 'task3', artifact: 'Requirements doc' },
      { from: 'task1', to: 'task4', artifact: 'Charter v1' },
      { from: 'task2', to: 'task4', artifact: 'Requirements doc' },
      { from: 'task1', to: 'task5', artifact: 'Charter v1' },
      { from: 'task2', to: 'task5', artifact: 'Requirements doc' },
      { from: 'task3', to: 'task5', artifact: 'Milestone plan' },
      { from: 'task4', to: 'task5', artifact: 'Risk register' },
    ],
    sharedArtifacts: [
      {
        id: 'charter_v1',
        name: 'Charter v1',
        owner: 'integrator',
        consumers: ['requirements_lead', 'risk_lead'],
      },
      {
        id: 'requirements_doc',
        name: 'Requirements & Acceptance',
        owner: 'requirements_lead',
        consumers: ['integrator', 'risk_lead'],
      },
      {
        id: 'workplan',
        name: 'Workplan & Dependencies',
        owner: 'integrator',
        consumers: ['requirements_lead', 'risk_lead'],
      },
      {
        id: 'risk_register',
        name: 'Risk Register + QA Checklist',
        owner: 'risk_lead',
        consumers: ['integrator', 'requirements_lead'],
      },
    ],
    mergePoints: [
      {
        id: 'merge1',
        name: 'Charter + Requirements alignment',
        description: 'Validate Charter v1 completeness + scope boundaries',
        inputs: ['task1', 'task2'],
        checkpoint: 'checkpoint_a',
      },
      {
        id: 'merge2',
        name: 'Requirements → Workplan mapping',
        description: 'Spot-check: 5 Must requirements are testable + mapped to workplan milestones',
        inputs: ['task2', 'task3'],
        checkpoint: 'checkpoint_b',
      },
      {
        id: 'merge3',
        name: 'Full pack integration + QA',
        description: 'Run QA checklist, ensure traceability, resolve conflicts',
        inputs: ['task1', 'task2', 'task3', 'task4', 'task5'],
        checkpoint: 'checkpoint_c',
      },
    ],
  },
  
  orchestrationAndTimeline: {
    pattern: 'parallel',
    concurrencyPlan: {
      maxConcurrency: 5,
      phases: [
        {
          name: 'Phase 1: Charter',
          tasks: ['task1'],
          parallelizable: false,
        },
        {
          name: 'Phase 2: Requirements & Initial Risk Assessment',
          tasks: ['task2', 'task4'],
          parallelizable: true,
        },
        {
          name: 'Phase 3: Workplan & Risk Refinement',
          tasks: ['task3'],
          parallelizable: false,
        },
        {
          name: 'Phase 4: Integration',
          tasks: ['task5'],
          parallelizable: false,
        },
      ],
    },
    checkpoints: [
      {
        id: 'checkpoint_a',
        name: 'Checkpoint A: Plan Review',
        description: 'Validate Charter v1 completeness + scope boundaries',
        validationCriteria: [
          'Charter v1 is complete',
          'Requirements Lead and Risk/Quality Lead interpret scope the same way',
        ],
        tasks: ['task1', 'task2'],
      },
      {
        id: 'checkpoint_b',
        name: 'Checkpoint B: Mid-flight Validation',
        description: 'Spot-check requirements mapping and risk coverage',
        validationCriteria: [
          '5 Must requirements are testable + mapped to workplan milestones',
          'Risk mitigations cover the highest-impact items',
        ],
        tasks: ['task2', 'task3', 'task4'],
      },
      {
        id: 'checkpoint_c',
        name: 'Checkpoint C: Merge & Final QA',
        description: 'Run QA checklist, ensure traceability, resolve conflicts',
        validationCriteria: [
          'QA checklist passed',
          'Traceability complete',
          'All conflicts resolved',
          'Pack v1 + changelog produced',
        ],
        tasks: ['task5'],
      },
    ],
    estimatedDurationSeconds: 1200, // ~20 minutes
  },
  
  risksAndRecovery: {
    risks: [
      {
        id: 'risk1',
        description: 'Scope creep (v1 expands uncontrollably)',
        probability: 'high',
        impact: 'high',
        mitigation: 'Strict scope boundaries in charter; checkpoint reviews; freeze to Musts only if needed',
      },
      {
        id: 'risk2',
        description: 'Ambiguous requirements (hard to test, disagreements)',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Explicit acceptance criteria; Must/Should/Could prioritization; requirements backlog for unknowns',
      },
      {
        id: 'risk3',
        description: 'Integration drift (agents use different terms/assumptions)',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Shared artifacts with single owners; checkpoint reviews; glossary/terminology guide',
      },
      {
        id: 'risk4',
        description: 'Dependency blockage (Task 3 waiting on Task 2 clarity)',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Clear task dependencies; fallback procedures; escalation paths',
      },
      {
        id: 'risk5',
        description: 'Quality dilution (no objective QA gates)',
        probability: 'low',
        impact: 'high',
        mitigation: 'Objective acceptance checks; QA checklist; dedicated Risk & Quality Lead',
      },
    ],
    retryStrategy: {
      maxAttempts: 3,
      backoffSeconds: 10,
      conditions: [
        'Output fails acceptance checks',
        'Missing required sections/format',
        'Inconsistencies detected',
      ],
    },
    failoverStrategy: {
      triggers: [
        'A subtask exceeds 300s with no progress',
        '2 retries fail for the same reason (capability mismatch)',
        'Dependency is blocked due to missing inputs',
      ],
      actions: [
        'Backup agent takes over with the same inputs + issue notes',
        'Integrator reduces scope to Musts + documents deferred items',
        'Roll back to last checkpoint (A or B) for integration-breaking conflicts',
      ],
    },
    escalationPaths: [
      {
        level: 1,
        description: 'Owner attempts retry',
        action: 'Fix with acceptance checklist',
      },
      {
        level: 2,
        description: 'Backup agent takes over',
        action: 'Same inputs + issue notes',
      },
      {
        level: 3,
        description: 'Integrator reduces scope',
        action: 'Musts only + document deferred items',
      },
      {
        level: 4,
        description: 'Roll back to checkpoint',
        action: 'Revert to last stable checkpoint (A or B)',
      },
    ],
  },
  
  metadata: {
    projectType: 'general',
    tags: ['default', 'general-purpose', 'project-delivery'],
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a new multi-agent execution plan from a template
 */
export function createPlanFromTemplate(
  template: PlanTemplate,
  customizations?: Partial<MultiAgentExecutionPlan>
): MultiAgentExecutionPlan {
  const now = new Date().toISOString();
  
  return {
    id: generatePlanId(),
    createdAt: now,
    updatedAt: now,
    ...template,
    ...customizations,
  };
}

/**
 * Validate a multi-agent execution plan
 */
export function validatePlan(plan: MultiAgentExecutionPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate team roster
  if (plan.teamRoster.length === 0) {
    errors.push('Team roster must have at least one agent');
  }
  
  // Validate task breakdown
  if (plan.taskBreakdown.length === 0) {
    errors.push('Task breakdown must have at least one task');
  }
  
  // Validate task owners exist in team roster
  const agentIds = new Set(plan.teamRoster.map(a => a.id));
  plan.taskBreakdown.forEach(task => {
    if (!agentIds.has(task.owner)) {
      errors.push(`Task "${task.name}" owner "${task.owner}" not found in team roster`);
    }
  });
  
  // Validate task dependencies
  const taskIds = new Set(plan.taskBreakdown.map(t => t.id));
  plan.taskBreakdown.forEach(task => {
    task.dependencies.forEach(depId => {
      if (!taskIds.has(depId)) {
        errors.push(`Task "${task.name}" depends on non-existent task "${depId}"`);
      }
    });
  });
  
  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(plan.taskBreakdown);
  if (circularDeps.length > 0) {
    errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
  }
  
  // Validate checkpoints reference existing tasks
  plan.orchestrationAndTimeline.checkpoints.forEach(checkpoint => {
    checkpoint.tasks.forEach(taskId => {
      if (!taskIds.has(taskId)) {
        errors.push(`Checkpoint "${checkpoint.name}" references non-existent task "${taskId}"`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Detect circular dependencies in task breakdown
 */
export function detectCircularDependencies(tasks: TaskBreakdown): string[] {
  const circular: string[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  function dfs(taskId: string, path: string[]): boolean {
    if (recursionStack.has(taskId)) {
      circular.push([...path, taskId].join(' → '));
      return true;
    }
    
    if (visited.has(taskId)) {
      return false;
    }
    
    visited.add(taskId);
    recursionStack.add(taskId);
    
    const task = taskMap.get(taskId);
    if (task) {
      for (const depId of task.dependencies) {
        if (dfs(depId, [...path, taskId])) {
          return true;
        }
      }
    }
    
    recursionStack.delete(taskId);
    return false;
  }
  
  tasks.forEach(task => {
    if (!visited.has(task.id)) {
      dfs(task.id, []);
    }
  });
  
  return circular;
}

/**
 * Get tasks that can be executed in parallel (no dependencies or dependencies satisfied)
 */
export function getExecutableTasks(
  tasks: TaskBreakdown,
  completedTaskIds: Set<string>
): Task[] {
  return tasks.filter(task => {
    // Skip already completed tasks
    if (completedTaskIds.has(task.id)) {
      return false;
    }
    
    // Check if all dependencies are satisfied
    return task.dependencies.every(depId => completedTaskIds.has(depId));
  });
}

/**
 * Calculate critical path for task execution
 */
export function calculateCriticalPath(tasks: TaskBreakdown): {
  path: string[];
  durationSeconds: number;
} {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const durations = new Map<string, number>();
  const paths = new Map<string, string[]>();
  
  // Initialize
  tasks.forEach(task => {
    durations.set(task.id, 0);
    paths.set(task.id, []);
  });
  
  // Topological sort
  const sorted = topologicalSort(tasks);
  
  // Calculate longest path
  sorted.forEach(taskId => {
    const task = taskMap.get(taskId);
    if (!task) return;
    
    const taskDuration = task.timeoutSeconds || 300;
    let maxPredecessorDuration = 0;
    let maxPredecessorPath: string[] = [];
    
    task.dependencies.forEach(depId => {
      const depDuration = durations.get(depId) || 0;
      if (depDuration > maxPredecessorDuration) {
        maxPredecessorDuration = depDuration;
        maxPredecessorPath = paths.get(depId) || [];
      }
    });
    
    durations.set(taskId, maxPredecessorDuration + taskDuration);
    paths.set(taskId, [...maxPredecessorPath, taskId]);
  });
  
  // Find maximum duration
  let maxDuration = 0;
  let criticalPath: string[] = [];
  
  durations.forEach((duration, taskId) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      criticalPath = paths.get(taskId) || [];
    }
  });
  
  return {
    path: criticalPath,
    durationSeconds: maxDuration,
  };
}

/**
 * Topological sort of tasks
 */
function topologicalSort(tasks: TaskBreakdown): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  
  function visit(taskId: string) {
    if (visited.has(taskId)) return;
    
    visited.add(taskId);
    const task = taskMap.get(taskId);
    
    if (task) {
      task.dependencies.forEach(depId => visit(depId));
    }
    
    sorted.push(taskId);
  }
  
  tasks.forEach(task => visit(task.id));
  
  return sorted;
}

/**
 * Generate a unique plan ID
 */
function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Export plan to markdown format
 */
export function exportPlanToMarkdown(plan: MultiAgentExecutionPlan): string {
  let md = `# ${plan.name}\n\n`;
  md += `${plan.description}\n\n`;
  md += `**Version:** ${plan.version}  \n`;
  md += `**Created:** ${new Date(plan.createdAt).toLocaleString()}\n\n`;
  
  // Goal and Success Criteria
  md += `## 1) Goal and Success Criteria\n\n`;
  md += `### Deliverables\n\n`;
  plan.goalAndSuccessCriteria.deliverables.forEach((d, i) => {
    md += `${i + 1}. **${d.name}**: ${d.description}\n`;
  });
  
  md += `\n### Success Criteria\n\n`;
  plan.goalAndSuccessCriteria.successCriteria.forEach(sc => {
    md += `- ${sc.description}\n`;
  });
  
  md += `\n### Constraints\n\n`;
  plan.goalAndSuccessCriteria.constraints.forEach(c => {
    md += `- **${c.type}**: ${c.value}`;
    if (c.description) md += ` - ${c.description}`;
    md += '\n';
  });
  
  // Team Roster
  md += `\n## 2) Team Roster\n\n`;
  md += `| Role/Agent | Responsibilities | Backup |\n`;
  md += `|------------|-----------------|--------|\n`;
  plan.teamRoster.forEach(agent => {
    const backup = plan.teamRoster.find(a => a.id === agent.backupAgent)?.role || 'N/A';
    md += `| ${agent.role} | ${agent.responsibilities.join(', ')} | ${backup} |\n`;
  });
  
  // Task Breakdown
  md += `\n## 3) Task Breakdown\n\n`;
  plan.taskBreakdown.forEach((task, i) => {
    const owner = plan.teamRoster.find(a => a.id === task.owner)?.role || task.owner;
    md += `### Task ${i + 1}: ${task.name}\n\n`;
    md += `- **Owner**: ${owner}\n`;
    md += `- **Goal**: ${task.goal}\n`;
    md += `- **Inputs**: ${task.inputs.map(inp => inp.name).join(', ') || 'None'}\n`;
    md += `- **Outputs**: ${task.outputs.map(out => out.name).join(', ')}\n`;
    md += `- **Dependencies**: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}\n`;
    md += `- **Acceptance Checks**:\n`;
    task.acceptanceChecks.forEach(ac => {
      md += `  - ${ac.description}\n`;
    });
    if (task.risk) {
      md += `- **Time/Complexity Risk**: ${task.risk}\n`;
    }
    if (task.fallback && task.fallback.length > 0) {
      md += `- **Fallback**: ${task.fallback[0].action}\n`;
    }
    md += '\n';
  });
  
  // Dependencies and Data Flow
  md += `## 4) Dependencies & Data Flow\n\n`;
  md += `### Dependency Graph\n\n`;
  plan.dependenciesAndDataFlow.dependencyGraph.forEach(edge => {
    md += `- **${edge.from}** → **${edge.to}**: ${edge.artifact}\n`;
  });
  
  md += `\n### Shared Artifacts\n\n`;
  plan.dependenciesAndDataFlow.sharedArtifacts.forEach(artifact => {
    const owner = plan.teamRoster.find(a => a.id === artifact.owner)?.role || artifact.owner;
    md += `- **${artifact.name}** (owner: ${owner})\n`;
  });
  
  md += `\n### Merge Points\n\n`;
  plan.dependenciesAndDataFlow.mergePoints.forEach(mp => {
    md += `- **${mp.name}**: ${mp.description}\n`;
  });
  
  // Orchestration and Timeline
  md += `\n## 5) Orchestration & Timeline\n\n`;
  md += `**Pattern**: ${plan.orchestrationAndTimeline.pattern}  \n`;
  md += `**Max Concurrency**: ${plan.orchestrationAndTimeline.concurrencyPlan.maxConcurrency}\n\n`;
  
  md += `### Execution Phases\n\n`;
  plan.orchestrationAndTimeline.concurrencyPlan.phases.forEach((phase, i) => {
    md += `${i + 1}. **${phase.name}**: ${phase.tasks.join(', ')} (${phase.parallelizable ? 'parallel' : 'sequential'})\n`;
  });
  
  md += `\n### Checkpoints\n\n`;
  plan.orchestrationAndTimeline.checkpoints.forEach(cp => {
    md += `#### ${cp.name}\n\n`;
    md += `${cp.description}\n\n`;
    md += `Validation:\n`;
    cp.validationCriteria.forEach(vc => {
      md += `- ${vc}\n`;
    });
    md += '\n';
  });
  
  // Risks and Recovery
  md += `## 6) Risks & Recovery\n\n`;
  md += `### Top Risks\n\n`;
  plan.risksAndRecovery.risks.forEach((risk, i) => {
    md += `${i + 1}. **${risk.description}** (${risk.probability} probability, ${risk.impact} impact)  \n`;
    md += `   Mitigation: ${risk.mitigation}\n\n`;
  });
  
  md += `### Retry Strategy\n\n`;
  md += `- **Max Attempts**: ${plan.risksAndRecovery.retryStrategy.maxAttempts}\n`;
  md += `- **Backoff**: ${plan.risksAndRecovery.retryStrategy.backoffSeconds || 0} seconds\n`;
  md += `- **Conditions**:\n`;
  plan.risksAndRecovery.retryStrategy.conditions.forEach(cond => {
    md += `  - ${cond}\n`;
  });
  
  md += `\n### Failover Strategy\n\n`;
  md += `**Triggers**:\n`;
  plan.risksAndRecovery.failoverStrategy.triggers.forEach(trigger => {
    md += `- ${trigger}\n`;
  });
  md += `\n**Actions**:\n`;
  plan.risksAndRecovery.failoverStrategy.actions.forEach(action => {
    md += `- ${action}\n`;
  });
  
  md += `\n### Escalation Path\n\n`;
  plan.risksAndRecovery.escalationPaths.forEach(ep => {
    md += `${ep.level}. **${ep.description}**: ${ep.action}\n`;
  });
  
  return md;
}

// ============================================================================
// Template Library
// ============================================================================

export const TEMPLATE_LIBRARY: TemplateLibrary = {
  general_project: {
    name: 'General Project Delivery',
    description: 'Default template for complex general project coordination',
    template: DEFAULT_GENERAL_PROJECT_TEMPLATE,
    category: 'general',
  },
};

/**
 * Get all available templates
 */
export function getAvailableTemplates(): TemplateLibrary {
  return TEMPLATE_LIBRARY;
}

/**
 * Get a specific template by ID
 */
export function getTemplate(templateId: string): PlanTemplate | null {
  const entry = TEMPLATE_LIBRARY[templateId];
  return entry ? entry.template : null;
}
