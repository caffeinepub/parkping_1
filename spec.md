# ParkPing

## Current State
- Vehicle registration, QR codes, public messaging, unread tracking, user profiles, and push notifications are all working.
- Authorization with admin/user/guest roles is in place.
- No admin portal exists.

## Requested Changes (Diff)

### Add
- Backend: `AdminStats` type with totalUsers, totalVehicles, totalMessages fields; `getAdminStats()` admin-only query.
- Backend: `getAllUsers()` admin-only query returning list of `{ principal, name }` records.
- Frontend: `/admin` route — protected admin portal page showing platform stats (total users, vehicles, messages) and a table of registered users with their vehicle counts.
- Frontend: Navbar shows "Admin" link when the caller is admin.

### Modify
- App.tsx: add `/admin` route.
- Navbar: show Admin link for admins.

### Remove
- Nothing.

## Implementation Plan
1. Add `AdminStats` record and `getAdminStats()` (admin-only query) to backend.
2. Add `getAllUsers()` (admin-only query) returning `[{ principal: Principal; name: ?Text; vehicleCount: Nat }]`.
3. Regenerate bindings.
4. Add AdminPortal page with stat cards and user table.
5. Add `/admin` route in App.tsx.
6. Show Admin nav link in Navbar when `isCallerAdmin` is true.
