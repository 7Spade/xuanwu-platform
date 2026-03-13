---
name: xuanwu-planning
description: 'Create a quick implementation plan for a feature or change, including architecture, task breakdown, and testing strategy.'
agent: 'xuanwu-software-planner'
argument-hint: 'Describe the feature or change to plan'
---
# Software Planning

Create an implementation plan.

## Serena lifecycle

- Follow the Serena session-start sequence from [../copilot-instructions.md](../copilot-instructions.md) before repository planning.
- Before finishing, persist durable Serena memory updates when facts changed and rely on the workspace Stop hook for index refresh.

## Steps

1. Understand the feature or change request.
2. Define requirements.
3. Design architecture.
4. Break into tasks.

## Output format

Overview  
Architecture design  
Task breakdown  
Implementation steps  
Testing strategy