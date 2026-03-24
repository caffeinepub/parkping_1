# ParkPing

## Current State
Admin portal shows sticker requests in a read-only table with status badges. No action to update status.

## Requested Changes (Diff)

### Add
- Backend: `trackingNote` field to `StickerRequest` type
- Backend: `updateStickerStatus(id, status, trackingNote)` function — admin only
- Frontend: "Mark as Shipped" button on pending sticker request rows
- Frontend: Dialog/modal to enter tracking number before marking shipped
- Frontend: Mutation hook for `updateStickerStatus`

### Modify
- Sticker requests table to include action column with status-change button

### Remove
- Nothing

## Implementation Plan
1. Add `trackingNote` to `StickerRequest` type and `updateStickerStatus` backend function
2. Regenerate bindings via Motoko codegen
3. Add mutation hook in frontend
4. Update AdminPortal sticker table with action column and ship dialog
