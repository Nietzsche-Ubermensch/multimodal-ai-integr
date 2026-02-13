/**
 * Multi-Agent Planner Tests
 * 
 * Tests for the multi-agent execution planning system
 */

import { describe, it, expect } from 'vitest';
import {
  createPlanFromTemplate,
  validatePlan,
  detectCircularDependencies,
  getExecutableTasks,
  calculateCriticalPath,
  DEFAULT_GENERAL_PROJECT_TEMPLATE,
} from '../lib/multi-agent-planner';
import type { Task } from '../types/multi-agent';

describe('Multi-Agent Planner', () => {
  describe('createPlanFromTemplate', () => {
    it('should create a plan from the default template', () => {
      const plan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE);
      
      expect(plan).toBeDefined();
      expect(plan.id).toBeDefined();
      expect(plan.createdAt).toBeDefined();
      expect(plan.name).toBe(DEFAULT_GENERAL_PROJECT_TEMPLATE.name);
      expect(plan.teamRoster).toHaveLength(3);
      expect(plan.taskBreakdown).toHaveLength(5);
    });
  });
  
  describe('validatePlan', () => {
    it('should validate a correct plan', () => {
      const plan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE);
      const result = validatePlan(plan);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
  
  describe('detectCircularDependencies', () => {
    it('should detect no circular dependencies in valid plan', () => {
      const plan = createPlanFromTemplate(DEFAULT_GENERAL_PROJECT_TEMPLATE);
      const circular = detectCircularDependencies(plan.taskBreakdown);
      
      expect(circular).toHaveLength(0);
    });
  });
});
