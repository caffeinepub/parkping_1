# ScanLink

## Current State
- Favicon uses old uploaded logo (`/assets/uploads/image-019d21e8-c67a-74dd-a137-fcd8265741f1-1.png`)
- Privacy Policy and Terms of Service pages have placeholder/outdated content
- RequestStickerDialog shows first sticker as free, replacements at $9.99
- QR codes encode `/message/${vehicleId}` URL — already dynamic by ID, but UI doesn't highlight this
- No delete Digital ID button in Dashboard; backend `deleteVehicle` exists

## Requested Changes (Diff)

### Add
- Delete Digital ID button on each object card in Dashboard with a confirmation AlertDialog warning: "This Digital Identity will be permanently deleted and your QR code will stop working. A new QR code will need to be generated if you register this object again. This action cannot be undone."
- On the QR code section in Dashboard, add a small note: "This QR code is dynamic — it always reflects your latest object info."

### Modify
- `index.html` favicon: change to `/assets/generated/scanlink-logo-transparent.dim_120x120.png`
- `PrivacyPolicy.tsx`: Rewrite with proper ScanLink privacy policy content (data collected, ICP decentralized storage, no selling of data, messaging privacy, contact info visibility settings, GDPR/CCPA mention, contact email)
- `TermsOfService.tsx`: Rewrite with proper ScanLink ToS content (service description, subscription terms $9.99/year, acceptable use, disclaimer, governing law)
- `RequestStickerDialog.tsx`: Remove `isFree` / free first sticker logic entirely. All physical sticker orders cost **$19.99** + shipping + taxes. Update all copy, button text, and toast messages accordingly. Printable (self-print) stickers remain always free — note this in the dialog.

### Remove
- Free sticker pricing logic from RequestStickerDialog (the `isFree` conditional and related copy)

## Implementation Plan
1. Update `index.html` favicon href
2. Rewrite `PrivacyPolicy.tsx` with substantive ScanLink-specific content
3. Rewrite `TermsOfService.tsx` with substantive ScanLink-specific content
4. Update `RequestStickerDialog.tsx` to always show $19.99 pricing
5. Add delete button + AlertDialog confirmation to Dashboard object cards, calling `deleteVehicle` mutation
6. Add dynamic QR note to Dashboard QR display area
