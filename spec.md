# ParkPing

## Current State
- Users can register vehicles and get QR codes
- Users can request weatherproof stickers to be mailed (StickerRequest)
- Admin portal has Users and Sticker Requests tabs
- Admin can mark sticker requests as shipped with tracking note

## Requested Changes (Diff)

### Add
- QrPrintRequest type: tracks requests from users to have their QR code printed by admin
- Each vehicle gets one free QR code print included; replacement prints require $9.99 + shipping
- Backend: `requestQrPrint(vehicleId)` - user requests a QR print; fails if replacement request exists without payment
- Backend: `getAllQrPrintRequests()` - admin only, returns all QR print requests
- Backend: `getMyQrPrintRequests()` - user sees their own requests
- Backend: `markQrPrintComplete(requestId)` - admin marks as printed/fulfilled
- Track `freeQrUsed` per vehicle (bool) to know if first free print has been requested
- Admin dashboard: new "QR Print Requests" tab listing pending requests
- Each request row has a "Print QR" button that opens a print-optimized view with the QR code for that vehicle URL
- Show a note in the admin UI indicating whether it was a free or paid ($9.99) request
- User dashboard vehicle card: "Request QR Print" button; if free slot available shows free, otherwise shows $9.99 + shipping

### Modify
- AdminPortal.tsx: add QR Print Requests tab with print functionality
- Dashboard vehicle cards: add "Request QR Print" button

### Remove
- Nothing removed

## Implementation Plan
1. Add QrPrintRequest type and related functions to backend
2. Generate updated Motoko code
3. Add QR Print Requests tab to admin dashboard with Print QR button that triggers browser print with QR code rendered
4. Add request QR print button to user vehicle cards
