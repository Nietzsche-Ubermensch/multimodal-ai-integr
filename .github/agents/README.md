# Claude Code Agent Skills

This directory contains custom skill definitions for Claude Code. Skills extend Claude's capabilities with specialized expertise and knowledge domains.

## Available Skills

### prompt-engineering-expert
**Location**: `prompt-engineering-expert.md`

A comprehensive skill that equips Claude with deep expertise in:
- Prompt engineering best practices
- Advanced prompting techniques (Chain-of-Thought, Few-Shot, XML tags)
- Custom instructions and system prompt design
- Prompt optimization and refinement
- Anti-pattern recognition
- Evaluation and testing frameworks
- Multimodal and advanced prompting

**Use Cases**:
- Refining existing prompts for better performance
- Creating specialized system prompts for specific domains
- Designing custom instructions for AI agents
- Optimizing prompts for consistency and efficiency
- Teaching and implementing prompt engineering best practices

## How to Use Skills

Skills are automatically available to Claude Code when:
1. They are placed in the `.github/agents/` directory
2. They follow the proper YAML frontmatter format:
   ```yaml
   ---
   name: skill-name
   description: Brief description of the skill
   ---
   ```
3. The file has a `.md` extension

Claude Code will automatically detect and load these skills, making them available for use in code reviews, issue responses, and other Claude Code interactions.

## Creating New Skills

To create a new skill:

1. Create a new `.md` file in this directory
2. Add YAML frontmatter with `name` and `description` fields
3. Document the skill's:
   - Core expertise areas
   - Key capabilities
   - Use cases
   - Limitations
   - Integration notes

## Integration with Claude Code

These skills integrate with Claude Code workflows defined in:
- `.github/workflows/claude.yml` - Main Claude Code workflow
- `.github/workflows/claude-code-review.yml` - Automated code review workflow

Skills enhance Claude's ability to:
- Review code with specialized domain knowledge
- Provide expert guidance on specific topics
- Generate more accurate and context-aware responses
- Follow best practices in specialized areas

## Best Practices

- Keep skill definitions focused on a specific domain
- Provide clear examples and use cases
- Document limitations and constraints
- Update skills as best practices evolve
- Reference related skills for comprehensive coverage
