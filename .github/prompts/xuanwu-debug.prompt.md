---
name: xuanwu-debug
description: 'Analyze a bug or unexpected behavior using step-by-step root-cause analysis and produce a minimal fix.'
agent: 'xuanwu-sequential-thinking'
argument-hint: 'Describe the bug or paste the error message and relevant code'
---
# Debug Task

Analyze the following bug.

## Serena lifecycle

- Follow the Serena session-start sequence from [../copilot-instructions.md](../copilot-instructions.md) before repository debugging.
- Before finishing, persist durable Serena memory updates when facts changed and rely on the workspace Stop hook for index refresh.

## Steps

1. Restate the problem.
2. Identify possible causes.
3. Inspect related code areas.
4. Determine the root cause.
5. Suggest a minimal fix.

## Output format

Problem summary  
Possible causes  
Root cause  
Proposed fix