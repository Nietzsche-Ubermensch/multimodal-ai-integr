# Multi-Agent Execution Plan Guide

## Overview

The Multi-Agent Execution Plan system provides a comprehensive framework for coordinating teams of AI agents to deliver complex projects. It includes structured templates for defining goals, organizing teams, breaking down tasks, mapping dependencies, orchestrating execution, and managing risks.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Plan Structure](#plan-structure)
3. [Getting Started](#getting-started)
4. [Template Usage](#template-usage)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Best Practices](#best-practices)

## Core Concepts

### Multi-Agent Coordination

A multi-agent execution plan coordinates multiple AI agents working together to achieve a common goal. Key principles:

- **Clear Ownership**: Each task has a single owner agent
- **Artifact-Based Communication**: Agents communicate through shared documents and specifications
- **Parallel Execution**: Tasks can run concurrently when dependencies allow
- **Checkpoints**: Regular validation points ensure alignment and quality
- **Recovery Strategies**: Built-in retry, failover, and escalation mechanisms

### Plan Components

Every multi-agent execution plan consists of six main sections:

1. **Goal and Success Criteria**: Defines deliverables, success metrics, and constraints
2. **Team Roster**: Lists agents with their roles, responsibilities, and backup assignments
3. **Task Breakdown**: Detailed tasks with owners, inputs, outputs, dependencies, and acceptance criteria
4. **Dependencies and Data Flow**: Maps how data flows between tasks and agents
5. **Orchestration and Timeline**: Defines execution pattern, phases, and checkpoints
6. **Risks and Recovery**: Identifies risks and specifies retry, failover, and escalation strategies

## Plan Structure

### 1. Goal and Success Criteria

```typescript
{
  deliverables: [
    {
      id: 'charter',
      name: 'Project Charter',
      description: 'Clear scope and objectives'
    }
  ],
  successCriteria: [
    {
      id: 'sc1',
      description: 'Requirements are testable and traceable',
      measurable: true
    }
  ],
  constraints: [
    { type: 'agent_count', value: 3 },
    { type: 'max_concurrency', value: 5 },
    { type: 'timeout', value: 300 }
  ]
}
```

**Key Elements**:
- **Deliverables**: Concrete outputs the plan will produce
- **Success Criteria**: Measurable indicators of success
- **Constraints**: Limits on resources, time, and execution patterns

### 2. Team Roster

```typescript
{
  teamRoster: [
    {
      id: 'integrator',
      role: 'Integrator / Program Lead',
      responsibilities: [
        'Owns overall plan',
        'Dependency mapping',
        'Final merge and QA'
      ],
      backupAgent: 'requirements_lead'
    }
  ]
}
```

**Key Elements**:
- **Role**: Descriptive name for the agent's function
- **Responsibilities**: Specific duties this agent owns
- **Backup Agent**: Fallback agent if primary becomes unavailable

### 3. Task Breakdown

```typescript
{
  taskBreakdown: [
    {
      id: 'task1',
      name: 'Define project charter',
      owner: 'integrator',
      goal: 'Produce one-page charter',
      inputs: [
        { name: 'Requirements', source: 'external', required: true }
      ],
      outputs: [
        { name: 'Charter v1', description: 'Scope and objectives' }
      ],
      dependencies: [],
      acceptanceChecks: [
        { id: 'ac1', description: 'Has measurable goals', objective: true }
      ],
      priority: 'must',
      risk: 'medium',
      fallback: [
        { condition: 'Scope too broad', action: 'Constrain to v1' }
      ],
      timeoutSeconds: 300,
      retryCount: 3
    }
  ]
}
```

**Key Elements**:
- **Owner**: Agent responsible for execution
- **Inputs/Outputs**: What the task consumes and produces
- **Dependencies**: Tasks that must complete before this one
- **Acceptance Checks**: Criteria for task completion
- **Fallback**: Actions to take if task encounters issues

### 4. Dependencies and Data Flow

```typescript
{
  dependenciesAndDataFlow: {
    dependencyGraph: [
      { from: 'task1', to: 'task2', artifact: 'Charter v1' }
    ],
    sharedArtifacts: [
      {
        id: 'charter_v1',
        name: 'Charter v1',
        owner: 'integrator',
        consumers: ['requirements_lead', 'risk_lead']
      }
    ],
    mergePoints: [
      {
        id: 'merge1',
        name: 'Charter + Requirements alignment',
        inputs: ['task1', 'task2'],
        checkpoint: 'checkpoint_a'
      }
    ]
  }
}
```

**Key Elements**:
- **Dependency Graph**: Visual representation of task dependencies
- **Shared Artifacts**: Documents or data shared between agents
- **Merge Points**: Where multiple work streams combine

### 5. Orchestration and Timeline

```typescript
{
  orchestrationAndTimeline: {
    pattern: 'parallel',
    concurrencyPlan: {
      maxConcurrency: 5,
      phases: [
        {
          name: 'Phase 1: Foundation',
          tasks: ['task1'],
          parallelizable: false
        },
        {
          name: 'Phase 2: Development',
          tasks: ['task2', 'task3'],
          parallelizable: true
        }
      ]
    },
    checkpoints: [
      {
        id: 'checkpoint_a',
        name: 'Foundation Review',
        validationCriteria: ['Charter complete', 'Scope agreed'],
        tasks: ['task1']
      }
    ]
  }
}
```

**Key Elements**:
- **Pattern**: Execution strategy (sequential, parallel, hierarchical)
- **Concurrency Plan**: How many tasks run simultaneously and in what order
- **Checkpoints**: Validation points during execution

### 6. Risks and Recovery

```typescript
{
  risksAndRecovery: {
    risks: [
      {
        id: 'risk1',
        description: 'Scope creep',
        probability: 'high',
        impact: 'high',
        mitigation: 'Strict boundaries in charter'
      }
    ],
    retryStrategy: {
      maxAttempts: 3,
      backoffSeconds: 10,
      conditions: ['Output fails validation']
    },
    failoverStrategy: {
      triggers: ['Task timeout', 'Repeated failures'],
      actions: ['Backup agent takes over']
    },
    escalationPaths: [
      { level: 1, description: 'Owner retry', action: 'Fix with checklist' },
      { level: 2, description: 'Backup takeover', action: 'Same inputs + notes' }
    ]
  }
}
```

**Key Elements**:
- **Risks**: Identified threats with probability, impact, and mitigation
- **Retry Strategy**: Automatic retry logic for transient failures
- **Failover Strategy**: Switching to backup resources
- **Escalation Paths**: Progressive response levels

## Getting Started

### Installation

The multi-agent planner is included in the AI Integration Platform. Import it in your TypeScript code:

```typescript
import {
  createPlanFromTemplate,
  validatePlan,
  exportPlanToMarkdown,
  getAvailableTemplates,
  DEFAULT_GENERAL_PROJECT_TEMPLATE
} from '@/lib/multi-agent-planner';

import type { MultiAgentExecutionPlan } from '@/types/multi-agent';
```

### Creating Your First Plan

```typescript
// 1. Create a plan from the default template
const plan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE, {
  name: 'My Custom Project',
  description: 'Building a new feature'
});

// 2. Validate the plan
const validation = validatePlan(plan);
if (!validation.valid) {
  console.error('Plan validation errors:', validation.errors);
}

// 3. Export to markdown
const markdown = exportPlanToMarkdown(plan);
console.log(markdown);
```

### Customizing a Plan

```typescript
// Start with a template and customize it
const customPlan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE, {
  name: 'Product Launch Plan',
  description: 'Coordinated launch of new product',
  
  // Override team roster
  teamRoster: [
    {
      id: 'product_lead',
      role: 'Product Lead',
      responsibilities: ['Product strategy', 'Feature prioritization'],
      backupAgent: 'tech_lead'
    },
    {
      id: 'tech_lead',
      role: 'Technical Lead',
      responsibilities: ['Architecture', 'Implementation'],
      backupAgent: 'product_lead'
    },
    {
      id: 'qa_lead',
      role: 'QA Lead',
      responsibilities: ['Testing', 'Quality gates'],
      backupAgent: 'tech_lead'
    }
  ],
  
  // Add custom metadata
  metadata: {
    projectType: 'product_launch',
    estimatedCost: 50000,
    tags: ['product', 'launch', 'high-priority']
  }
});
```

## Template Usage

### Available Templates

The system includes built-in templates for common scenarios:

```typescript
import { getAvailableTemplates } from '@/lib/multi-agent-planner';

const templates = getAvailableTemplates();

// Templates available:
// - general_project: Default general project coordination
// - product_launch: Product release planning (coming soon)
// - research_report: Research project coordination (coming soon)
// - software_feature: Feature development planning (coming soon)
```

### Using a Specific Template

```typescript
import { getTemplate, createPlanFromTemplate } from '@/lib/multi-agent-planner';

// Get a template by ID
const template = getTemplate('general_project');

if (template) {
  const plan = createPlanFromTemplate(template, {
    name: 'My Project',
    description: 'Custom project based on general template'
  });
}
```

## API Reference

### Core Functions

#### `createPlanFromTemplate(template, customizations?)`

Creates a new execution plan from a template.

**Parameters**:
- `template: PlanTemplate` - Base template to use
- `customizations?: Partial<MultiAgentExecutionPlan>` - Optional overrides

**Returns**: `MultiAgentExecutionPlan`

#### `validatePlan(plan)`

Validates a plan's structure and dependencies.

**Parameters**:
- `plan: MultiAgentExecutionPlan` - Plan to validate

**Returns**: `{ valid: boolean; errors: string[] }`

#### `exportPlanToMarkdown(plan)`

Exports a plan to markdown format.

**Parameters**:
- `plan: MultiAgentExecutionPlan` - Plan to export

**Returns**: `string` - Markdown representation

### Utility Functions

#### `detectCircularDependencies(tasks)`

Detects circular dependencies in task breakdown.

**Parameters**:
- `tasks: TaskBreakdown` - Array of tasks to check

**Returns**: `string[]` - List of circular dependency chains

#### `getExecutableTasks(tasks, completedTaskIds)`

Gets tasks that can be executed based on completed dependencies.

**Parameters**:
- `tasks: TaskBreakdown` - All tasks
- `completedTaskIds: Set<string>` - IDs of completed tasks

**Returns**: `Task[]` - Tasks ready for execution

#### `calculateCriticalPath(tasks)`

Calculates the critical path through the task network.

**Parameters**:
- `tasks: TaskBreakdown` - All tasks

**Returns**: `{ path: string[]; durationSeconds: number }`

## Examples

### Example 1: Software Feature Development

```typescript
const featurePlan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE, {
  name: 'New Chat Interface Feature',
  description: 'Implement streaming chat with context retention',
  
  goalAndSuccessCriteria: {
    deliverables: [
      { id: 'd1', name: 'Feature Spec', description: 'Technical specification' },
      { id: 'd2', name: 'Implementation', description: 'Working code' },
      { id: 'd3', name: 'Tests', description: 'Unit and integration tests' },
      { id: 'd4', name: 'Documentation', description: 'User and dev docs' }
    ],
    successCriteria: [
      { id: 'sc1', description: 'All tests pass', measurable: true },
      { id: 'sc2', description: 'Performance benchmarks met', measurable: true },
      { id: 'sc3', description: 'Code review approved', measurable: true }
    ],
    constraints: [
      { type: 'agent_count', value: 3 },
      { type: 'timeout', value: 600 }
    ]
  },
  
  teamRoster: [
    {
      id: 'architect',
      role: 'Software Architect',
      responsibilities: ['Design', 'Technical spec', 'Code review'],
      backupAgent: 'developer'
    },
    {
      id: 'developer',
      role: 'Developer',
      responsibilities: ['Implementation', 'Unit tests'],
      backupAgent: 'qa'
    },
    {
      id: 'qa',
      role: 'QA Engineer',
      responsibilities: ['Test plan', 'Integration tests', 'Quality gates'],
      backupAgent: 'architect'
    }
  ]
});
```

### Example 2: Research Report

```typescript
const researchPlan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE, {
  name: 'AI Model Comparison Research',
  description: 'Comprehensive analysis of latest LLM models',
  
  taskBreakdown: [
    {
      id: 'task1',
      name: 'Literature Review',
      owner: 'researcher',
      goal: 'Survey existing research and benchmarks',
      inputs: [
        { name: 'Research questions', source: 'external', required: true }
      ],
      outputs: [
        { name: 'Literature survey', description: 'Annotated bibliography' }
      ],
      dependencies: [],
      acceptanceChecks: [
        { id: 'ac1', description: '20+ papers reviewed', objective: true },
        { id: 'ac2', description: 'Key findings summarized', objective: true }
      ],
      priority: 'must',
      risk: 'low',
      timeoutSeconds: 600
    },
    {
      id: 'task2',
      name: 'Experimental Design',
      owner: 'analyst',
      goal: 'Design benchmarks and evaluation criteria',
      inputs: [
        { name: 'Literature survey', source: 'task1', required: true }
      ],
      outputs: [
        { name: 'Experiment protocol', description: 'Benchmarks and metrics' }
      ],
      dependencies: ['task1'],
      acceptanceChecks: [
        { id: 'ac1', description: 'Metrics are quantifiable', objective: true },
        { id: 'ac2', description: 'Protocol is reproducible', objective: true }
      ],
      priority: 'must',
      risk: 'medium',
      timeoutSeconds: 300
    }
  ]
});
```

## Best Practices

### 1. Clear Task Ownership

- Assign each task to exactly one agent
- Ensure agent has the capabilities needed for the task
- Define clear backup agents for critical tasks

### 2. Explicit Dependencies

- Map all dependencies between tasks
- Avoid circular dependencies
- Use shared artifacts for data exchange

### 3. Measurable Acceptance Criteria

- Make acceptance checks objective and verifiable
- Include both functional and quality criteria
- Use automated validation where possible

### 4. Realistic Timeouts

- Set timeouts based on task complexity
- Include buffer for retries
- Monitor and adjust based on actual execution

### 5. Comprehensive Risk Management

- Identify risks early in planning
- Define clear mitigation strategies
- Test failover and escalation paths

### 6. Regular Checkpoints

- Include checkpoints at major milestones
- Validate progress and alignment
- Use checkpoints for course correction

### 7. Artifact-Based Communication

- Define clear artifact ownership
- Use versioning for shared documents
- Maintain single source of truth

### 8. Parallel Execution

- Identify parallelizable tasks
- Respect concurrency limits
- Balance load across agents

### 9. Recovery Strategies

- Implement retry logic for transient failures
- Define failover procedures for persistent issues
- Create escalation paths for unresolvable problems

### 10. Documentation

- Export plans to markdown for review
- Keep plans under version control
- Document lessons learned

## Advanced Topics

### Custom Validation Rules

You can extend the validation logic with custom rules:

```typescript
function validateCustomRules(plan: MultiAgentExecutionPlan): string[] {
  const errors: string[] = [];
  
  // Example: Ensure all "must" priority tasks have acceptance checks
  plan.taskBreakdown.forEach(task => {
    if (task.priority === 'must' && task.acceptanceChecks.length === 0) {
      errors.push(`Must priority task "${task.name}" lacks acceptance checks`);
    }
  });
  
  return errors;
}

// Use alongside built-in validation
const validation = validatePlan(plan);
const customErrors = validateCustomRules(plan);
const allErrors = [...validation.errors, ...customErrors];
```

### Dynamic Task Generation

Generate tasks programmatically based on requirements:

```typescript
function generateTestTasks(features: string[], owner: string): Task[] {
  return features.map((feature, i) => ({
    id: `test_${i}`,
    name: `Test ${feature}`,
    owner,
    goal: `Verify ${feature} works correctly`,
    inputs: [
      { name: `${feature} implementation`, source: `impl_${i}`, required: true }
    ],
    outputs: [
      { name: `${feature} test report`, description: 'Test results' }
    ],
    dependencies: [`impl_${i}`],
    acceptanceChecks: [
      { id: `ac_${i}`, description: 'All tests pass', objective: true }
    ],
    priority: 'must',
    risk: 'low',
    timeoutSeconds: 180
  }));
}
```

### Execution Monitoring

Track plan execution progress:

```typescript
interface ExecutionState {
  planId: string;
  startTime: string;
  completedTasks: Set<string>;
  failedTasks: Map<string, string>; // taskId -> error
  currentPhase: number;
}

function updateExecutionState(
  state: ExecutionState,
  taskId: string,
  status: 'completed' | 'failed',
  error?: string
): ExecutionState {
  if (status === 'completed') {
    state.completedTasks.add(taskId);
  } else {
    state.failedTasks.set(taskId, error || 'Unknown error');
  }
  
  return state;
}
```

## Troubleshooting

### Common Issues

**Issue**: Circular dependency detected
- **Solution**: Review task dependencies and break circular chains
- **Tool**: Use `detectCircularDependencies()` to identify cycles

**Issue**: Plan validation fails
- **Solution**: Check validation errors for specific issues
- **Tool**: Run `validatePlan()` and review error messages

**Issue**: Tasks not parallelizing
- **Solution**: Verify dependencies are correctly specified
- **Tool**: Use `getExecutableTasks()` to see what can run

**Issue**: Checkpoint validation fails
- **Solution**: Ensure referenced tasks exist in task breakdown
- **Tool**: Cross-reference checkpoint.tasks with taskBreakdown IDs

## Contributing

To add new templates or improve the multi-agent planner:

1. Define your template following the `PlanTemplate` interface
2. Add it to `TEMPLATE_LIBRARY` in `multi-agent-planner.ts`
3. Include documentation and examples
4. Test with `validatePlan()` before submitting

## License

Part of the AI Integration Platform - See main LICENSE file.
