# ParkPing

## Current State
All in-memory Maps (vehicles, messages, userProfiles, stickerRequests, userProfileDetails, and the authorization userRoles) were declared with `let` and initialized to empty on every canister upgrade. Stable backup arrays existed but were never populated. The result: all data including user roles was wiped on every deployment.

## Requested Changes (Diff)

### Add
- `preupgrade` system hook: serializes all Maps (data + auth) to their stable backup arrays before each upgrade
- `postupgrade` system hook: clears backup arrays after restore to free memory
- `authAdminAssigned` and `authUserRolesEntries` stable vars to persist authorization state

### Modify
- `accessControlState` initialization: now restores `adminAssigned` and `userRoles` from stable vars instead of starting fresh
- All five data Maps: now initialized via `Map.fromArray(stableArray, compare)` instead of `Map.empty()`
- Comments updated to reflect correct persistence strategy

### Remove
- The misleading `--default-persistent-actors` comments (that flag was never configured)

## Implementation Plan
1. Add stable vars for auth state (`authAdminAssigned`, `authUserRolesEntries`) at top of actor
2. Initialize `accessControlState` using those stable vars
3. Initialize all 5 data maps using `Map.fromArray` from their stable backup arrays
4. Add `preupgrade` hook to serialize all maps to stable arrays
5. Add `postupgrade` hook to clear backup arrays
