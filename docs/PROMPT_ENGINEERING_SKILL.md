# Prompt Engineering Expert Skill Documentation

## Overview

The **prompt-engineering-expert** skill is a comprehensive Claude Code skill that equips Claude with deep expertise in prompt engineering, custom instructions design, and prompt optimization. This skill enables Claude to provide expert guidance on crafting effective AI prompts, designing agent instructions, and iteratively improving prompt performance.

## Location

- **Skill Definition**: `.github/agents/prompt-engineering-expert.md`
- **Directory README**: `.github/agents/README.md`

## Purpose

This skill enhances Claude Code's ability to:

1. **Analyze Prompts**: Review existing prompts and identify areas for improvement
2. **Design Custom Instructions**: Create specialized instructions for AI agents and skills
3. **Optimize Performance**: Refine prompts to improve consistency, reliability, and efficiency
4. **Teach Best Practices**: Provide expert guidance on prompt engineering principles
5. **Prevent Common Mistakes**: Recognize and correct anti-patterns in prompt design

## Core Expertise Areas

### 1. Prompt Writing Best Practices
- Clear, unambiguous instructions
- Proper structure and formatting
- Specific examples and expected outputs
- Balanced context management
- Appropriate tone and style

### 2. Advanced Techniques
- **Chain-of-Thought (CoT)**: Step-by-step reasoning for complex tasks
- **Few-Shot Prompting**: 1-shot, 2-shot, and multi-shot examples
- **XML Tags**: Structured formatting for clarity
- **Role-Based Prompting**: Persona assignment for specialized tasks
- **Prefilling**: Response guidance and format control
- **Prompt Chaining**: Sequential prompts for complex workflows

### 3. Custom Instructions & System Prompts
- System prompt design for specialized domains
- Behavioral guidelines and constraints
- Consistent personality and voice
- Clear scope definition

### 4. Optimization & Refinement
- Performance analysis and metrics
- Iterative improvement workflows
- A/B testing strategies
- Consistency enhancement
- Token optimization

### 5. Anti-Patterns Recognition
- Vagueness identification
- Contradiction detection
- Over-specification warnings
- Hallucination risk assessment
- Context leakage prevention
- Jailbreak vulnerability mitigation

### 6. Evaluation & Testing
- Success criteria definition
- Comprehensive test case development
- Failure analysis
- Regression testing
- Edge case handling

### 7. Multimodal & Advanced
- Vision prompting for image analysis
- File-based prompting strategies
- Embeddings integration
- Tool use optimization
- Extended thinking patterns

## Use Cases

### For Developers
- Refining API request prompts for AI services
- Creating effective system prompts for chatbots
- Optimizing RAG (Retrieval-Augmented Generation) prompts
- Designing prompts for code generation tools

### For AI Integration Platform
- Improving model comparison prompts
- Optimizing testing prompts for different models
- Creating better examples for model documentation
- Designing effective evaluation criteria

### For Documentation
- Writing clear usage instructions
- Creating helpful examples
- Documenting best practices
- Teaching prompt engineering concepts

### For Code Review
- Reviewing AI-generated code quality
- Suggesting prompt improvements
- Identifying potential issues with AI integrations
- Recommending optimization strategies

## Integration with Claude Code

The prompt-engineering-expert skill integrates seamlessly with:

### Claude Code Workflows
- **Main Workflow** (`.github/workflows/claude.yml`): Triggered by `@claude` mentions
- **Code Review** (`.github/workflows/claude-code-review.yml`): Automatic PR reviews

### Other Repository Features
- **Copilot Instructions** (`.github/copilot-instructions.md`): General coding guidelines
- **CLAUDE.md**: Project-specific instructions for Claude Code
- **Documentation** (`docs/`): Comprehensive guides and references

## How to Use the Skill

### Activating the Skill

The skill is automatically available when:
1. Interacting with Claude Code via `@claude` mentions
2. During automated code reviews on PRs
3. When discussing prompt-related topics

### Example Interactions

#### 1. Prompt Review
```
@claude Can you review this prompt for our API testing feature?
I want to test if the model can explain code:

"Explain this code"
```

Claude will analyze the prompt using the prompt-engineering-expert skill and suggest improvements like:
- Adding context about the code language
- Specifying the desired explanation level
- Including format expectations
- Providing examples of good explanations

#### 2. Custom Instruction Design
```
@claude I need to create custom instructions for a code review agent.
What should I include?
```

Claude will leverage the skill to recommend:
- Core expertise areas to define
- Behavioral guidelines
- Scope and limitations
- Integration considerations
- Testing strategies

#### 3. Optimization Request
```
@claude This prompt is giving inconsistent results:
"Write a function to process user data"

How can I make it more consistent?
```

Claude will apply optimization techniques:
- Add specific requirements
- Define expected input/output
- Include error handling expectations
- Specify coding standards
- Add example implementations

## Best Practices for Using the Skill

### 1. Be Specific About Your Needs
Instead of: "Help me with a prompt"
Use: "I need to optimize this prompt for code generation to be more consistent"

### 2. Provide Context
Include:
- Current prompt version
- Observed issues or inconsistencies
- Desired outcomes
- Target AI model (if relevant)

### 3. Iterate Based on Feedback
- Test recommendations
- Report results back to Claude
- Request further refinements
- Document what works

### 4. Combine with Other Skills
The prompt-engineering-expert skill works well with:
- Code review capabilities
- Testing and validation tools
- Documentation generation
- Problem analysis

## Limitations

The skill:
- Does **not** execute prompts or run tests (analysis only)
- Cannot access real-time data or external APIs
- Provides guidance based on best practices, not guarantees
- Requires human testing and validation
- Does not replace domain expertise in critical applications

## Examples of Skill Impact

### Before Skill
**Original Prompt**: "Make this better"
**Issue**: Vague, no context, unclear expectations

### After Skill Guidance
**Improved Prompt**:
```
Refactor this TypeScript function to improve:
1. Type safety (add explicit types)
2. Error handling (add try/catch where appropriate)
3. Code clarity (add JSDoc comments)

Current function:
[code here]

Expected output:
- Well-typed function signature
- Proper error handling
- Clear documentation
- Maintains existing functionality
```

## Contributing to the Skill

To improve or extend the prompt-engineering-expert skill:

1. **Edit the skill file**: `.github/agents/prompt-engineering-expert.md`
2. **Follow the format**:
   - YAML frontmatter (name, description)
   - Markdown sections for each area
   - Clear, actionable guidance
3. **Test changes**: Create a PR and observe Claude's behavior
4. **Document updates**: Update this guide when adding new capabilities

## Related Documentation

- [Claude Code Skills README](.github/agents/README.md)
- [Claude Code Workflows](.github/workflows/)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Project Documentation](docs/)

## Support and Feedback

For questions or issues with the prompt-engineering-expert skill:

1. Create an issue in the repository
2. Mention `@claude` with your question
3. Tag with `documentation` or `claude-skills` labels
4. Provide specific examples of the behavior

## Version History

- **v1.0.0** (2026-02-13): Initial implementation with comprehensive prompt engineering expertise

## Future Enhancements

Potential areas for expansion:
- Domain-specific prompt patterns (coding, data analysis, creative writing)
- Integration with specific AI models and their quirks
- Automated prompt testing frameworks
- Prompt versioning and A/B testing tools
- Performance metrics and benchmarking
