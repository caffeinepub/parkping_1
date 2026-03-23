# ParkPing

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Vehicle registration: authenticated owners can register vehicles with a name/description and license plate
- QR code generation: each registered vehicle gets a unique QR code linking to a public message page
- Public message page: anyone who scans the QR can leave a message (name optional, message required) — no login needed
- Owner dashboard: authenticated owners see their registered vehicles and all messages left for each vehicle
- Mark messages as read/resolved
- Landing/marketing page explaining the concept

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: vehicle CRUD for authenticated owners, public message submission endpoint (no auth), message retrieval per vehicle
2. Frontend: marketing landing page, owner auth + dashboard, vehicle detail page with QR code display, public message-leave page (accessed via QR link)
3. QR codes rendered in-browser using a QR library pointing to the public message URL
4. Routing: `/` (landing), `/dashboard` (owner), `/vehicle/:id` (public message page)
