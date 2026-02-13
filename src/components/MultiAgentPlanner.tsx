/**
 * Multi-Agent Planner Page
 * 
 * Main interface for creating and managing multi-agent execution plans
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Folder, 
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Sparkle
} from '@phosphor-icons/react';
import { MultiAgentPlanViewer } from './MultiAgentPlanViewer';
import {
  createPlanFromTemplate,
  validatePlan,
  getAvailableTemplates,
  DEFAULT_GENERAL_PROJECT_TEMPLATE,
} from '@/lib/multi-agent-planner';
import type { MultiAgentExecutionPlan } from '@/types/multi-agent';

export function MultiAgentPlanner() {
  const [plans, setPlans] = useState<MultiAgentExecutionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MultiAgentExecutionPlan | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  
  const handleCreateFromTemplate = (templateId: string) => {
    const templates = getAvailableTemplates();
    const template = templates[templateId]?.template;
    
    if (template) {
      const newPlan = createPlanFromTemplate(template, {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
      });
      
      setPlans([...plans, newPlan]);
      setSelectedPlan(newPlan);
      setShowTemplateLibrary(false);
    }
  };
  
  const handleCreateDefault = () => {
    const newPlan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE, {
      name: `General Project - ${new Date().toLocaleDateString()}`,
    });
    
    setPlans([...plans, newPlan]);
    setSelectedPlan(newPlan);
  };
  
  const handleValidatePlan = (plan: MultiAgentExecutionPlan) => {
    const result = validatePlan(plan);
    
    if (result.valid) {
      alert('✅ Plan validation passed! No errors found.');
    } else {
      alert(`❌ Plan validation failed:\n\n${result.errors.join('\n')}`);
    }
  };
  
  const handleImportPlan = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string) as MultiAgentExecutionPlan;
            setPlans([...plans, imported]);
            setSelectedPlan(imported);
          } catch (error) {
            alert('Failed to import plan. Invalid JSON format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleExportPlan = (plan: MultiAgentExecutionPlan) => {
    const json = JSON.stringify(plan, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkle size={36} className="text-primary" weight="fill" />
          Multi-Agent Execution Planner
        </h1>
        <p className="text-muted-foreground">
          Create and manage comprehensive execution plans for multi-agent coordination
        </p>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={handleCreateDefault} className="gap-2">
          <Plus size={16} />
          New Plan (Default Template)
        </Button>
        
        <Button variant="outline" onClick={() => setShowTemplateLibrary(!showTemplateLibrary)} className="gap-2">
          <Folder size={16} />
          Template Library
        </Button>
        
        <Button variant="outline" onClick={handleImportPlan} className="gap-2">
          <Upload size={16} />
          Import Plan
        </Button>
        
        {selectedPlan && (
          <>
            <Button 
              variant="outline" 
              onClick={() => handleValidatePlan(selectedPlan)} 
              className="gap-2"
            >
              <CheckCircle size={16} />
              Validate Plan
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExportPlan(selectedPlan)} 
              className="gap-2"
            >
              <Download size={16} />
              Export JSON
            </Button>
          </>
        )}
      </div>
      
      {/* Template Library */}
      {showTemplateLibrary && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Template Library</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(getAvailableTemplates()).map(([id, entry]) => (
              <div key={id} className="p-4 border border-border rounded-lg hover:border-primary transition-colors">
                <h3 className="font-semibold mb-2">{entry.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{entry.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-muted rounded">
                    {entry.category}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => handleCreateFromTemplate(id)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Plans List */}
      {plans.length > 0 && !selectedPlan && (
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Plans</h2>
          <div className="grid gap-3">
            {plans.map((plan) => {
              const validation = validatePlan(plan);
              
              return (
                <div 
                  key={plan.id} 
                  className="p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Version: {plan.version}</span>
                        <span>Tasks: {plan.taskBreakdown.length}</span>
                        <span>Agents: {plan.teamRoster.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.valid ? (
                        <CheckCircle size={20} className="text-green-500" weight="fill" />
                      ) : (
                        <XCircle size={20} className="text-red-500" weight="fill" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      {/* Plan Viewer */}
      {selectedPlan && (
        <div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedPlan(null)}
            className="mb-4"
          >
            ← Back to Plans List
          </Button>
          
          <MultiAgentPlanViewer 
            plan={selectedPlan}
            onExport={() => console.log('Plan exported')}
          />
        </div>
      )}
      
      {/* Empty State */}
      {plans.length === 0 && (
        <Card className="p-12 text-center">
          <Sparkle size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Plans Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first multi-agent execution plan to get started
          </p>
          <Button onClick={handleCreateDefault} className="gap-2">
            <Plus size={16} />
            Create Your First Plan
          </Button>
        </Card>
      )}
      
      {/* Help Card */}
      <Card className="p-6 mt-6 bg-blue-50/50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2">📚 Documentation</h3>
        <p className="text-sm text-muted-foreground mb-3">
          For comprehensive guidance on creating and customizing multi-agent execution plans, 
          see the <strong>MULTI_AGENT_EXECUTION_GUIDE.md</strong> documentation file.
        </p>
        <div className="text-sm space-y-1">
          <p><strong>Quick Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Start with the default template and customize as needed</li>
            <li>Validate your plan to check for errors and circular dependencies</li>
            <li>Export to markdown for sharing with your team</li>
            <li>Use checkpoints to ensure alignment at critical milestones</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
