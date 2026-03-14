import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { WorkItemEntity } from "../domain.work/_entity";
import { buildWorkItem } from "../domain.work/_entity";
import type { WorkItemId, WorkItemStatus, WorkItemPriority } from "../domain.work/_value-objects";
import type { IWorkItemRepository } from "../domain.work/_ports";

export interface WorkItemDTO {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: WorkItemStatus;
  readonly priority: WorkItemPriority;
  readonly assigneeId?: string;
  readonly dueDate?: string;
  readonly createdAt: string;
}

function entityToDTO(w: WorkItemEntity): WorkItemDTO {
  return {
    id: w.id, workspaceId: w.workspaceId, title: w.title,
    description: w.description,
    status: w.status, priority: w.priority,
    assigneeId: w.assigneeId, dueDate: w.dueDate, createdAt: w.createdAt,
  };
}

export interface UpdateWorkItemInput {
  title?: string;
  description?: string;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export async function updateWorkItem(
  repo: IWorkItemRepository,
  id: string,
  input: UpdateWorkItemInput,
): Promise<Result<WorkItemDTO>> {
  try {
    const existing = await repo.findById(id as WorkItemId);
    if (!existing) return fail(new Error(`WorkItem not found: ${id}`));
    const updated: WorkItemEntity = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? input.description === "" ? { description: undefined } : { description: input.description }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined
        ? input.assigneeId === null ? { assigneeId: undefined } : { assigneeId: input.assigneeId }
        : {}),
      ...(input.dueDate !== undefined
        ? input.dueDate === null ? { dueDate: undefined } : { dueDate: input.dueDate }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function createWorkItem(
  repo: IWorkItemRepository,
  id: string,
  workspaceId: string,
  title: string,
  priority: WorkItemPriority,
): Promise<Result<WorkItemDTO>> {
  try {
    const now = new Date().toISOString();
    const item = buildWorkItem(id as WorkItemId, workspaceId, title, priority, now);
    await repo.save(item);
    return ok(entityToDTO(item));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function updateWorkItemStatus(
  repo: IWorkItemRepository,
  id: string,
  newStatus: WorkItemStatus,
): Promise<Result<WorkItemDTO>> {
  try {
    const existing = await repo.findById(id as WorkItemId);
    if (!existing) return fail(new Error(`WorkItem not found: ${id}`));
    const updated: WorkItemEntity = {
      ...existing, status: newStatus, updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function getWorkItemsByWorkspace(
  repo: IWorkItemRepository,
  workspaceId: string,
): Promise<Result<WorkItemDTO[]>> {
  try {
    const items = await repo.findByWorkspaceId(workspaceId);
    return ok(items.map(entityToDTO));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function deleteWorkItem(
  repo: IWorkItemRepository,
  workspaceId: string,
  workItemId: string,
): Promise<Result<void>> {
  try {
    const existing = await repo.findById(workItemId as WorkItemId);
    if (!existing) return fail(new Error(`WorkItem not found: ${workItemId}`));
    if (existing.workspaceId !== workspaceId) return fail(new Error("Forbidden"));
    await repo.deleteById(workItemId as WorkItemId);
    return ok(undefined);
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
