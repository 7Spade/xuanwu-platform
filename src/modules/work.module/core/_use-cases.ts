import { ok, fail } from "@/shared";
import type { Result } from "@/shared";
import type { WorkItemEntity } from "../domain.work/_entity";
import { buildWorkItem } from "../domain.work/_entity";
import type { WorkItemId, WorkItemStatus, WorkItemPriority } from "../domain.work/_value-objects";
import type { IWorkItemRepository } from "../domain.work/_ports";
import type { WorkItemDTO } from "../domain.work/_dto";

export type { WorkItemDTO } from "../domain.work/_dto";

function entityToDTO(w: WorkItemEntity): WorkItemDTO {
  return {
    id: w.id, workspaceId: w.workspaceId, title: w.title,
    description: w.description,
    status: w.status, priority: w.priority,
    assigneeId: w.assigneeId, dueDate: w.dueDate, createdAt: w.createdAt,
    parentId: w.parentId,
    type: w.type,
    quantity: w.quantity,
    unitPrice: w.unitPrice,
    discount: w.discount,
    subtotal: w.subtotal,
    completedQuantity: w.completedQuantity,
    location: w.location,
    photoURLs: w.photoURLs,
  };
}

export interface UpdateWorkItemInput {
  title?: string;
  description?: string;
  status?: WorkItemStatus;
  priority?: WorkItemPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  // Wave 43 extended fields
  type?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  discount?: number | null;
  completedQuantity?: number | null;
  location?: { building?: string; floor?: string; room?: string; description?: string } | null;
  photoURLs?: string[] | null;
}

export async function updateWorkItem(
  repo: IWorkItemRepository,
  id: string,
  input: UpdateWorkItemInput,
): Promise<Result<WorkItemDTO>> {
  try {
    const existing = await repo.findById(id as WorkItemId);
    if (!existing) return fail(new Error(`WorkItem not found: ${id}`));
    // Compute subtotal if budget fields are being changed
    const qty = input.quantity !== undefined ? (input.quantity ?? existing.quantity) : existing.quantity;
    const price = input.unitPrice !== undefined ? (input.unitPrice ?? existing.unitPrice) : existing.unitPrice;
    const disc = input.discount !== undefined ? (input.discount ?? existing.discount) : existing.discount;
    const newSubtotal = (qty !== undefined && price !== undefined)
      ? Math.max(0, (qty * price) - (disc ?? 0))
      : existing.subtotal;

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
      // Wave 43 extended fields
      ...(input.type !== undefined
        ? input.type === null ? { type: undefined } : { type: input.type }
        : {}),
      ...(input.quantity !== undefined
        ? input.quantity === null ? { quantity: undefined } : { quantity: input.quantity }
        : {}),
      ...(input.unitPrice !== undefined
        ? input.unitPrice === null ? { unitPrice: undefined } : { unitPrice: input.unitPrice }
        : {}),
      ...(input.discount !== undefined
        ? input.discount === null ? { discount: undefined } : { discount: input.discount }
        : {}),
      ...(newSubtotal !== undefined ? { subtotal: newSubtotal } : {}),
      ...(input.completedQuantity !== undefined
        ? input.completedQuantity === null ? { completedQuantity: undefined } : { completedQuantity: input.completedQuantity }
        : {}),
      ...(input.location !== undefined
        ? input.location === null ? { location: undefined } : { location: input.location }
        : {}),
      ...(input.photoURLs !== undefined
        ? input.photoURLs === null ? { photoURLs: undefined } : { photoURLs: input.photoURLs }
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

/** Wave 43: Create a child work item under a given parent. */
export async function createChildWorkItem(
  repo: IWorkItemRepository,
  id: string,
  workspaceId: string,
  parentId: string,
  title: string,
  priority: WorkItemPriority,
): Promise<Result<WorkItemDTO>> {
  try {
    const now = new Date().toISOString();
    const item = buildWorkItem(id as WorkItemId, workspaceId, title, priority, now);
    const withParent: WorkItemEntity = { ...item, parentId: parentId as WorkItemId };
    await repo.save(withParent);
    return ok(entityToDTO(withParent));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}

/** Wave 43: Report progress by updating completedQuantity. */
export async function reportProgress(
  repo: IWorkItemRepository,
  workItemId: string,
  completedQuantity: number,
): Promise<Result<WorkItemDTO>> {
  try {
    const existing = await repo.findById(workItemId as WorkItemId);
    if (!existing) return fail(new Error(`WorkItem not found: ${workItemId}`));
    const updated: WorkItemEntity = {
      ...existing,
      completedQuantity,
      updatedAt: new Date().toISOString(),
    };
    await repo.save(updated);
    return ok(entityToDTO(updated));
  } catch (err) {
    return fail(err instanceof Error ? err : new Error(String(err)));
  }
}
