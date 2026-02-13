/**
 * Multi-Agent Execution Plan Types
 * 
 * Defines types for coordinating multi-agent teams to deliver complex projects
 * with task breakdown, dependencies, orchestration, and recovery strategies.
 */

// ============================================================================
// Goal and Success Criteria
// ============================================================================

export interface Deliverable {
  id: string;
  name: string;
  description: string;
}

export interface SuccessCriterion {
  id: string;
  description: string;
  measurable: boolean;
}

export interface Constraint {
  type: 'agent_count' | 'pattern' | 'max_concurrency' | 'timeout' | 'retry_count' | 'communication';
  value: string | number;
  description?: string;
}

export interface GoalAndSuccessCriteria {
  deliverables: Deliverable[];
  successCriteria: SuccessCriterion[];
  constraints: Constraint[];
}

// ============================================================================
// Team Roster
// ============================================================================

export interface Agent {
  id: string;
  role: string;
  responsibilities: string[];
  backupAgent?: string; // ID of backup agent
}

export type TeamRoster = Agent[];

// ============================================================================
// Task Breakdown
// ============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

export type TaskPriority = 'must' | 'should' | 'could';

export type TaskRisk = 'low' | 'medium' | 'medium-high' | 'high';

export interface TaskInput {
  name: string;
  source: string; // Task ID or external source
  required: boolean;
}

export interface TaskOutput {
  name: string;
  description: string;
  format?: string;
}

export interface AcceptanceCheck {
  id: string;
  description: string;
  objective: boolean; // Can be automatically verified
}

export interface FallbackProcedure {
  condition: string;
  action: string;
}

export interface Task {
  id: string;
  name: string;
  owner: string; // Agent ID
  goal: string;
  inputs: TaskInput[];
  outputs: TaskOutput[];
  dependencies: string[]; // Task IDs this task depends on
  acceptanceChecks: AcceptanceCheck[];
  priority?: TaskPriority;
  risk?: TaskRisk;
  fallback?: FallbackProcedure[];
  status?: TaskStatus;
  timeoutSeconds?: number;
  retryCount?: number;
}

export type TaskBreakdown = Task[];

// ============================================================================
// Dependencies and Data Flow
// ============================================================================

export interface DependencyEdge {
  from: string; // Task ID
  to: string; // Task ID
  artifact: string; // Name of the artifact/data being passed
}

export interface SharedArtifact {
  id: string;
  name: string;
  owner: string; // Agent ID (single source of truth)
  consumers: string[]; // Agent IDs
  format?: string;
}

export interface MergePoint {
  id: string;
  name: string;
  description: string;
  inputs: string[]; // Task IDs or artifact IDs
  checkpoint?: string; // Checkpoint ID
}

export interface DependenciesAndDataFlow {
  dependencyGraph: DependencyEdge[];
  sharedArtifacts: SharedArtifact[];
  mergePoints: MergePoint[];
}

// ============================================================================
// Orchestration and Timeline
// ============================================================================

export type ExecutionPattern = 'sequential' | 'parallel' | 'hierarchical';

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  validationCriteria: string[];
  tasks: string[]; // Task IDs to validate
}

export interface ConcurrencyPlan {
  maxConcurrency: number;
  phases: {
    name: string;
    tasks: string[]; // Task IDs to run in this phase
    parallelizable: boolean;
  }[];
}

export interface OrchestrationAndTimeline {
  pattern: ExecutionPattern;
  concurrencyPlan: ConcurrencyPlan;
  checkpoints: Checkpoint[];
  estimatedDurationSeconds?: number;
}

// ============================================================================
// Risks and Recovery
// ============================================================================

export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';

export interface Risk {
  id: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  mitigation: string;
}

export interface RetryStrategy {
  maxAttempts: number;
  backoffSeconds?: number;
  conditions: string[];
}

export interface FailoverStrategy {
  triggers: string[];
  actions: string[];
}

export interface EscalationPath {
  level: number;
  description: string;
  action: string;
}

export interface RisksAndRecovery {
  risks: Risk[];
  retryStrategy: RetryStrategy;
  failoverStrategy: FailoverStrategy;
  escalationPaths: EscalationPath[];
}

// ============================================================================
// Complete Multi-Agent Execution Plan
// ============================================================================

export interface MultiAgentExecutionPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  version: string;
  
  goalAndSuccessCriteria: GoalAndSuccessCriteria;
  teamRoster: TeamRoster;
  taskBreakdown: TaskBreakdown;
  dependenciesAndDataFlow: DependenciesAndDataFlow;
  orchestrationAndTimeline: OrchestrationAndTimeline;
  risksAndRecovery: RisksAndRecovery;
  
  // Optional metadata
  metadata?: {
    projectType?: string;
    estimatedCost?: number;
    tags?: string[];
    [key: string]: any;
  };
}

// ============================================================================
// Template Types
// ============================================================================

export type PlanTemplate = Omit<MultiAgentExecutionPlan, 'id' | 'createdAt' | 'updatedAt'>;

export interface TemplateLibrary {
  [templateId: string]: {
    name: string;
    description: string;
    template: PlanTemplate;
    category: string;
  };
}
