# ParkPing

## Current State
ParkPing is a decentralized ICP app for vehicle owners to receive messages via QR codes. Existing backend has: Vehicle, Message, StickerRequest entities, authorization (admin/user), Stripe, HTTP outcalls. Frontend has: LandingPage, Dashboard, AdminPortal, VehicleMessages, PublicMessagePage.

## Requested Changes (Diff)

### Add
- **PrintableQRCode entity** in Motoko backend:
  - `id: Nat`
  - `uniqueIdentifier: Text` (e.g. QR-A7X9K2, unique, no confusing chars 0/O/1/I)
  - `qrData: Text` (URL: `https://parkping.app/assign?code=<identifier>`)
  - `status: Text` (generated | assigned | revoked)
  - `assignedVehicleId: ?VehicleId`
  - `assignedAt: ?Time`
  - `generatedBy: Principal`
  - `createdAt: Time`
- **Backend functions:**
  - `generatePrintableQRCodes(quantity: Nat, prefix: Text): [PrintableQRCode]` — admin only, generates batch with unique identifiers
  - `getAllPrintableQRCodes(): [PrintableQRCode]` — admin only
  - `assignPrintableQRCode(uniqueIdentifier: Text, vehicleId: VehicleId): ()` — user only, validates QR exists + status=generated, user owns vehicle
  - `revokePrintableQRCode(id: Nat): ()` — admin only
- **Admin QR Codes tab** in AdminPortal:
  - Form: quantity input + optional prefix + "Generate" button
  - Preview grid of generated codes with QR images
  - Filterable table of all codes by status
  - Download as PDF (print layout, multiple per page) or individual PNGs
- **User: Assign Printed QR Code** in Dashboard vehicle cards:
  - Button "Assign Printed QR Code" on each vehicle card
  - Modal with identifier input + vehicle dropdown
  - On success: show QR code image + identifier on vehicle card
- **AdminStats** updated to include `totalPrintableQRCodes: Nat`

### Modify
- `main.mo`: add PrintableQRCode map, counter, stable backup, preupgrade/postupgrade
- `AdminPortal.tsx`: add "QR Codes" tab
- `Dashboard.tsx`: add "Assign Printed QR Code" button + modal per vehicle card
- `useQueries.ts`: add hooks for new backend functions
- `backend.d.ts`: updated automatically by bindgen

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` with PrintableQRCode type, identifier generation logic, and all 4 new functions; update AdminStats; add stable backup arrays
2. Regenerate backend bindings via `generate_motoko_code`
3. Frontend: Add `useGeneratePrintableQRCodes`, `useGetAllPrintableQRCodes`, `useAssignPrintableQRCode`, `useRevokePrintableQRCode` hooks
4. Frontend: Add Admin QR Codes tab in AdminPortal with generate form, preview grid, status-filtered table, PDF download
5. Frontend: Add AssignPrintableQRDialog component; integrate into Dashboard vehicle cards
6. Validate and deploy
