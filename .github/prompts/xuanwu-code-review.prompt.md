---
name: xuanwu-code-review
description: 'Review code for correctness, security, performance, maintainability, and readability.'
agent: 'xuanwu-quality'
argument-hint: 'Paste or reference the code to review, or describe the scope (e.g.: review src/features/auth)'
---
# Code Review

Review the provided code.

## Serena lifecycle

- Follow the Serena session-start sequence from [../copilot-instructions.md](../copilot-instructions.md) before repository review work.
- Before finishing, persist durable Serena memory updates when facts changed and rely on the workspace Stop hook for index refresh.

Focus on:

- correctness
- security
- performance
- maintainability
- readability

## Output

Issues found  
Risk level  
Suggested improvements  
Optional refactoring ideas