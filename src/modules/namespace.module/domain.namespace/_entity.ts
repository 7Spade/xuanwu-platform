// Namespace aggregate root — enforces namespace registration and path-resolution invariants
// A namespace binds workspaces under an Account's handle (personal or organization).
// Invariants:
//   - A namespace slug must be globally unique across both org and personal namespaces.
//   - A namespace is owned by exactly one Account (AccountType: personal | organization).
//   - Workspace binding is one-way: workspaces are registered under a namespace on creation.
