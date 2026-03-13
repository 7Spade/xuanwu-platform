/**
 * IRepository — generic repository port interface.
 *
 * Infrastructure adapters MUST implement this interface.
 * Application layer use cases depend only on this abstraction.
 */
export interface IRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
  delete(id: TId): Promise<void>;
}

/**
 * IQueryRepository — read-only side of the repository port.
 * Useful when CQRS is applied to a bounded context.
 */
export interface IQueryRepository<TEntity, TFilter = Record<string, unknown>> {
  findAll(filter?: TFilter): Promise<TEntity[]>;
  findById(id: string): Promise<TEntity | null>;
}

/**
 * IEventBus — domain event dispatcher port.
 *
 * Application services publish events; infrastructure adapters dispatch them.
 */
export type DomainEventHandler<TEvent = unknown> = (event: TEvent) => Promise<void>;

export interface IEventBus {
  publish<TEvent>(eventName: string, event: TEvent): Promise<void>;
  subscribe<TEvent>(eventName: string, handler: DomainEventHandler<TEvent>): void;
}

/**
 * IUnitOfWork — transactional boundary port.
 */
export interface IUnitOfWork {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
