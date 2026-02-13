/**
 * Multi-Agent Execution Plan Viewer Component
 * 
 * Displays a complete multi-agent execution plan with all sections
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ListChecks, 
  GitBranch, 
  Clock, 
  Shield,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from '@phosphor-icons/react';
import type { MultiAgentExecutionPlan, Task } from '@/types/multi-agent';
import { exportPlanToMarkdown } from '@/lib/multi-agent-planner';

interface MultiAgentPlanViewerProps {
  plan: MultiAgentExecutionPlan;
  onExport?: () => void;
  className?: string;
}

type ViewSection = 'all' | 'goals' | 'team' | 'tasks' | 'dependencies' | 'orchestration' | 'risks';

export function MultiAgentPlanViewer({ plan, onExport, className = '' }: MultiAgentPlanViewerProps) {
  const [activeSection, setActiveSection] = useState<ViewSection>('all');
  
  const handleExport = () => {
    const markdown = exportPlanToMarkdown(plan);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name.toLowerCase().replace(/\s+/g, '-')}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onExport) {
      onExport();
    }
  };
  
  const sections = [
    { id: 'all', label: 'All Sections', icon: Eye },
    { id: 'goals', label: 'Goals', icon: ListChecks },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
    { id: 'orchestration', label: 'Orchestration', icon: Clock },
    { id: 'risks', label: 'Risks', icon: Shield },
  ] as const;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{plan.name}</h1>
            <p className="text-muted-foreground mb-4">{plan.description}</p>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">
                <strong>Version:</strong> {plan.version}
              </span>
              <span className="text-muted-foreground">
                <strong>Created:</strong> {new Date(plan.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download size={16} />
            Export to Markdown
          </Button>
        </div>
      </Card>
      
      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeSection === id ? 'default' : 'outline'}
            onClick={() => setActiveSection(id as ViewSection)}
            className="gap-2"
          >
            <Icon size={16} />
            {label}
          </Button>
        ))}
      </div>
      
      {/* Content Sections */}
      <div className="space-y-6">
        {(activeSection === 'all' || activeSection === 'goals') && (
          <GoalsSection plan={plan} />
        )}
        
        {(activeSection === 'all' || activeSection === 'team') && (
          <TeamRosterSection plan={plan} />
        )}
        
        {(activeSection === 'all' || activeSection === 'tasks') && (
          <TaskBreakdownSection plan={plan} />
        )}
        
        {(activeSection === 'all' || activeSection === 'dependencies') && (
          <DependenciesSection plan={plan} />
        )}
        
        {(activeSection === 'all' || activeSection === 'orchestration') && (
          <OrchestrationSection plan={plan} />
        )}
        
        {(activeSection === 'all' || activeSection === 'risks') && (
          <RisksSection plan={plan} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Section Components
// ============================================================================

function GoalsSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ListChecks size={24} className="text-primary" />
        Goal and Success Criteria
      </h2>
      
      <div className="space-y-6">
        {/* Deliverables */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Deliverables</h3>
          <div className="grid gap-3">
            {plan.goalAndSuccessCriteria.deliverables.map((d, i) => (
              <div key={d.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="font-bold text-primary">{i + 1}.</span>
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-sm text-muted-foreground">{d.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Success Criteria */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Success Criteria</h3>
          <div className="grid gap-2">
            {plan.goalAndSuccessCriteria.successCriteria.map((sc) => (
              <div key={sc.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{sc.description}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Constraints */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Constraints</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {plan.goalAndSuccessCriteria.constraints.map((c, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase">{c.type.replace(/_/g, ' ')}</div>
                <div className="text-lg font-bold">{c.value}</div>
                {c.description && (
                  <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function TeamRosterSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Users size={24} className="text-primary" />
        Team Roster
      </h2>
      
      <div className="grid gap-4">
        {plan.teamRoster.map((agent) => {
          const backup = plan.teamRoster.find(a => a.id === agent.backupAgent);
          
          return (
            <div key={agent.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{agent.role}</h3>
                  <div className="text-xs text-muted-foreground">ID: {agent.id}</div>
                </div>
                {backup && (
                  <div className="text-sm text-muted-foreground">
                    Backup: <span className="font-medium">{backup.role}</span>
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Responsibilities:</div>
                <ul className="list-disc list-inside space-y-1">
                  {agent.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TaskBreakdownSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle size={24} className="text-primary" />
        Task Breakdown
      </h2>
      
      <div className="space-y-4">
        {plan.taskBreakdown.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i + 1} agents={plan.teamRoster} />
        ))}
      </div>
    </Card>
  );
}

function TaskCard({ task, index, agents }: { task: Task; index: number; agents: any[] }) {
  const owner = agents.find(a => a.id === task.owner);
  const [expanded, setExpanded] = useState(false);
  
  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    'medium-high': 'text-orange-600',
    high: 'text-red-600',
  };
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-primary">Task {index}</span>
              <h3 className="text-lg font-semibold">{task.name}</h3>
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.priority === 'must' ? 'bg-red-100 text-red-700' :
                  task.priority === 'should' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Owner: <span className="font-medium">{owner?.role || task.owner}</span>
            </div>
          </div>
          
          {task.risk && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Risk</div>
              <div className={`text-sm font-semibold ${riskColors[task.risk]}`}>
                {task.risk.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 space-y-4 border-t border-border">
          <div>
            <div className="text-sm font-semibold mb-1">Goal</div>
            <div className="text-sm text-muted-foreground">{task.goal}</div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold mb-2">Inputs</div>
              <div className="space-y-1">
                {task.inputs.map((input, i) => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    {input.required && <span className="text-red-500">*</span>}
                    <span>{input.name}</span>
                    <span className="text-xs text-muted-foreground">({input.source})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-semibold mb-2">Outputs</div>
              <div className="space-y-1">
                {task.outputs.map((output, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium">{output.name}</div>
                    <div className="text-xs text-muted-foreground">{output.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {task.dependencies.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Dependencies</div>
              <div className="flex flex-wrap gap-2">
                {task.dependencies.map((dep) => (
                  <span key={dep} className="px-2 py-1 bg-muted rounded text-xs">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-sm font-semibold mb-2">Acceptance Checks</div>
            <div className="space-y-1">
              {task.acceptanceChecks.map((check) => (
                <div key={check.id} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{check.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          {task.fallback && task.fallback.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-2">Fallback Procedures</div>
              <div className="space-y-2">
                {task.fallback.map((fb, i) => (
                  <div key={i} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <div className="font-medium">If: {fb.condition}</div>
                    <div className="text-muted-foreground">Then: {fb.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 text-xs text-muted-foreground">
            {task.timeoutSeconds && (
              <div>Timeout: {task.timeoutSeconds}s</div>
            )}
            {task.retryCount && (
              <div>Max Retries: {task.retryCount}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DependenciesSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <GitBranch size={24} className="text-primary" />
        Dependencies & Data Flow
      </h2>
      
      <div className="space-y-6">
        {/* Dependency Graph */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Dependency Graph</h3>
          <div className="space-y-2">
            {plan.dependenciesAndDataFlow.dependencyGraph.map((edge, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                  {edge.from}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                  {edge.to}
                </span>
                <span className="text-sm text-muted-foreground flex-1">
                  via: {edge.artifact}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shared Artifacts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Shared Artifacts</h3>
          <div className="grid gap-3">
            {plan.dependenciesAndDataFlow.sharedArtifacts.map((artifact) => {
              const owner = plan.teamRoster.find(a => a.id === artifact.owner);
              
              return (
                <div key={artifact.id} className="p-3 border border-border rounded-lg">
                  <div className="font-semibold mb-1">{artifact.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Owner: <span className="font-medium">{owner?.role || artifact.owner}</span>
                  </div>
                  {artifact.consumers.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Consumers: {artifact.consumers.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Merge Points */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Merge Points</h3>
          <div className="space-y-3">
            {plan.dependenciesAndDataFlow.mergePoints.map((mp) => (
              <div key={mp.id} className="p-4 bg-accent/10 border border-accent rounded-lg">
                <div className="font-semibold mb-1">{mp.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{mp.description}</div>
                <div className="flex flex-wrap gap-2">
                  {mp.inputs.map((input) => (
                    <span key={input} className="px-2 py-1 bg-muted rounded text-xs">
                      {input}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function OrchestrationSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Clock size={24} className="text-primary" />
        Orchestration & Timeline
      </h2>
      
      <div className="space-y-6">
        {/* Pattern & Concurrency */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Execution Pattern</div>
            <div className="text-2xl font-bold capitalize">
              {plan.orchestrationAndTimeline.pattern}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Max Concurrency</div>
            <div className="text-2xl font-bold">
              {plan.orchestrationAndTimeline.concurrencyPlan.maxConcurrency}
            </div>
          </div>
        </div>
        
        {/* Execution Phases */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Execution Phases</h3>
          <div className="space-y-3">
            {plan.orchestrationAndTimeline.concurrencyPlan.phases.map((phase, i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{phase.name}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    phase.parallelizable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {phase.parallelizable ? 'Parallel' : 'Sequential'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {phase.tasks.map((taskId) => (
                    <span key={taskId} className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {taskId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Checkpoints */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Checkpoints</h3>
          <div className="space-y-4">
            {plan.orchestrationAndTimeline.checkpoints.map((cp) => (
              <div key={cp.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold mb-1">{cp.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{cp.description}</div>
                <div className="text-sm font-medium mb-2">Validation Criteria:</div>
                <ul className="space-y-1">
                  {cp.validationCriteria.map((criteria, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RisksSection({ plan }: { plan: MultiAgentExecutionPlan }) {
  const getRiskBadgeColor = (probability: string, impact: string) => {
    if (probability === 'high' && (impact === 'high' || impact === 'critical')) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    if (probability === 'medium' && impact === 'high') {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    }
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Shield size={24} className="text-primary" />
        Risks & Recovery
      </h2>
      
      <div className="space-y-6">
        {/* Top Risks */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Top Risks</h3>
          <div className="space-y-3">
            {plan.risksAndRecovery.risks.map((risk, i) => (
              <div key={risk.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{risk.description}</div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded border ${
                      getRiskBadgeColor(risk.probability, risk.impact)
                    }`}>
                      {risk.probability} / {risk.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Retry Strategy */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Retry Strategy</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Max Attempts</div>
              <div className="text-xl font-bold">{plan.risksAndRecovery.retryStrategy.maxAttempts}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Backoff</div>
              <div className="text-xl font-bold">
                {plan.risksAndRecovery.retryStrategy.backoffSeconds || 0}s
              </div>
            </div>
          </div>
          <div className="text-sm font-medium mb-2">Retry Conditions:</div>
          <ul className="space-y-1">
            {plan.risksAndRecovery.retryStrategy.conditions.map((cond, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Failover Strategy */}
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Failover Strategy</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Triggers:</div>
              <ul className="space-y-1">
                {plan.risksAndRecovery.failoverStrategy.triggers.map((trigger, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Actions:</div>
              <ul className="space-y-1">
                {plan.risksAndRecovery.failoverStrategy.actions.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Escalation Paths */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Escalation Path</h3>
          <div className="space-y-2">
            {plan.risksAndRecovery.escalationPaths.map((ep) => (
              <div key={ep.level} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {ep.level}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{ep.description}</div>
                  <div className="text-sm text-muted-foreground">{ep.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
