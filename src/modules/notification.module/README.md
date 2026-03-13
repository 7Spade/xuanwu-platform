# notification.module

**Bounded Context:** Notification Engine · Inbox  
**Layer:** SaaS (cross-cutting)

## Purpose

`notification.module` is the platform's notification engine.
It subscribes to domain events from all source modules and dispatches
notifications to accounts via in-app Inbox, email, and mobile push.

## What this module owns

| Concern | Description |
|---------|-------------|
| NotificationRule | Subscriber preferences per event type and channel |
| InboxItem | In-app notification record visible to an account |
| NotificationDispatch | Tracks delivery status across channels |

## Cross-module dependencies

| Module | Direction | Reason |
|--------|-----------|--------|
| `account.module` | → | Notification recipients are Accounts |
| `identity.module` | → | Delivery channel lookup (email, push token) |
| All source modules | ← | Subscribes to domain events to trigger notifications |

## Standard 4-layer structure

```
notification.module/
├── index.ts
├── domain.notification/
│   ├── _entity.ts
│   ├── _value-objects.ts
│   ├── _ports.ts                # IInboxRepository, IEmailPort, IPushPort, INotificationEventSubscriber
│   └── _events.ts
├── core/
├── infra.firestore/
└── _components/
```
