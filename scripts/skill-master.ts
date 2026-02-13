#!/usr/bin/env tsx
/**
 * skill-master CLI
 * 
 * Discover codebase patterns and auto-generate SKILL files
 * 
 * Usage:
 *   npm run skill-master discover  # Discover patterns and report gaps
 *   npm run skill-master generate  # Generate SKILL files
 */

import * as fs from 'fs';
import * as path from 'path';

// Import the compiled module
const skillMasterPath = path.join(process.cwd(), 'src', 'lib', 'skill-master.ts');

// Use dynamic import to handle TypeScript
import(skillMasterPath).then(module => {
  module.main(process.argv.slice(2));
}).catch(err => {
  console.error('Error loading skill-master:', err.message);
  process.exit(1);
});
