// Account domain services — logic spanning multiple account aggregates.

// MemberInvitationService — coordinates the full invite lifecycle:
//   1. Check if the target personal account exists.
//   2. Check that the invitee is not already a member.
//   3. Create a pending MembershipRecord.
//   4. Emit AccountMemberInvited event (notification.module listens).
//   Invariant: only an owner or admin may invite members.
//
// AccountTransferService — transfers org ownership between personal accounts:
//   1. Validate the new owner holds an active membership with at least admin role.
//   2. Update ownerId on the AccountEntity.
//   3. Update the previous owner's role to admin (prevent accidental lockout).
//   4. Emit AccountOwnershipTransferred event.
//
// ProfileSyncService — synchronises handle changes with namespace.module:
//   After AccountHandleChanged is emitted, this service ensures the corresponding
//   namespace record is renamed via INamespaceSyncPort to keep slugs consistent.
