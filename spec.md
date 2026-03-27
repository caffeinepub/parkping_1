# ScanLink

## Current State
Admin panel has a 'QR Codes' tab (AdminQRCodesTab) that lets admin generate batches of printable QR codes with unique identifiers for selling as physical stickers. The backend has `generatePrintableQRCodes`, `getAllPrintableQRCodes`, `revokePrintableQRCode` methods. Subscription is $9.99/year but there is no promo/discount code system.

## Requested Changes (Diff)

### Add
- Backend: `PromoCode` data type with fields: id, code (string), discountPercent (Nat, 0-100), description (Text), maxUses (Nat), usedCount (Nat), createdBy (Principal), createdAt (Int), isActive (Bool), usedBy ([Principal])
- Backend: `generatePromoCode(code: Text, discountPercent: Nat, description: Text, maxUses: Nat)` — admin only
- Backend: `listPromoCodes()` — admin only, returns all promo codes
- Backend: `redeemPromoCode(code: Text)` — any authenticated user, validates code, marks as used, records subscription discount on user
- Backend: `getMySubscriptionInfo()` — returns subscription status including promo applied
- Admin portal: Replace 'QR Codes' tab entirely with 'Promo Codes' tab
- Promo Codes tab: form to generate a new code (custom code string or auto-generated, discount %, description, max uses), table of all existing codes showing code, discount, uses, status
- Print button per code: prints a business-card-sized card with the promo code prominently displayed
- Signup/profile setup flow: promo code field where users can enter a code to get discounted or free subscription

### Modify
- Admin tab list: rename 'QR Codes' tab to 'Promo Codes'
- AdminStats: add totalPromoCodes count
- ProfileSetup component: add optional promo code field

### Remove
- AdminQRCodesTab component and its tab entry in AdminPortal
- QR Codes stats card in admin overview (or repurpose to Promo Codes)

## Implementation Plan
1. Add PromoCode type and stable storage to backend main.mo
2. Add generatePromoCode, listPromoCodes, redeemPromoCode, getMySubscriptionInfo backend functions
3. Update AdminStats to include totalPromoCodes
4. Regenerate backend.d.ts bindings
5. Replace AdminQRCodesTab with AdminPromoCodesTab in AdminPortal.tsx
6. Add promo code input to ProfileSetup.tsx (signup flow)
7. Show subscription status (including promo) on Dashboard
