# ScanLink

## Current State
Users can create Digital Identity objects (with name, description, identifier/license plate, category) and set contact info. There is no way to edit an existing object's details after creation.

## Requested Changes (Diff)

### Add
- `updateObject(vehicleId, name, description, identifier, category)` backend function (owner-only)
- `useUpdateObject` mutation hook in useQueries.ts
- `updateObject` method in backend.d.ts and backend.ts
- `EditObjectDialog` component: pre-fills all fields from existing object, same category/extra-field UX as creation, submits update
- Edit button on each object card in Dashboard opens EditObjectDialog

### Modify
- Dashboard: wire Edit (pencil icon) button to open EditObjectDialog for the selected object
- backend.did.js / declarations: add updateObject to Candid interface

### Remove
- Nothing removed

## Implementation Plan
1. Add `updateObject` to `src/backend/main.mo` — validates ownership, updates vehicle fields and category
2. Add `updateObject` to `src/frontend/src/declarations/backend.did.js` (both IDL places)
3. Add `updateObject` signature to `src/frontend/src/backend.d.ts`
4. Add `updateObject` implementation to `src/frontend/src/backend.ts`
5. Add `useUpdateObject` hook to `src/frontend/src/hooks/useQueries.ts`
6. Create `src/frontend/src/components/EditObjectDialog.tsx` (similar to AddVehicleDialog but pre-filled, no contact step, no subscription step)
7. Update `src/frontend/src/pages/Dashboard.tsx` to import EditObjectDialog and open it from the edit button
