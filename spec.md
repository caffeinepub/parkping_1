# Scanlink

## Current State
App is ParkPing — a vehicle-only digital QR platform. Backend has a `Vehicle` type with `name`, `description`, `licensePlate` fields. All frontend copy is vehicle-centric (cars, windshields, license plates). Navbar/footer say "ParkPing". AddVehicleDialog only supports vehicle registration.

## Requested Changes (Diff)

### Add
- `category` field to Vehicle type (backend + frontend type)
- Category selector in the Create Digital ID dialog with options: Vehicle, Bicycle/Scooter, Pet/Animal, Luggage/Bag, Electronics/Laptop, Keys/Personal Item, Other
- Category-specific extra fields (e.g. licensePlate for Vehicle, serialNumber for Bike, breed for Pet)
- Category icons in the objects list
- "How It Works" universality messaging on the landing page
- Marketing copy examples on landing page

### Modify
- Backend: Add `category` to Vehicle type; update `registerVehicle` to accept `category`
- Navbar: "ParkPing" → "Scanlink"
- Footer: all ParkPing references → Scanlink, update tagline
- LandingPage: hero copy, steps, features all updated to universal "Digital ID for Anything" language
- Dashboard: "Your Vehicles" → "My Objects", empty state updated, card icons use category icons
- AddVehicleDialog: renamed to AddObjectDialog, category selector, context-specific fields
- PublicMessagePage: "vehicle" references → "object", "ParkPing" → "Scanlink"
- AdminPortal: vehicle column labels → object, stats labels updated
- PrintQRButton: update sticker text

### Remove
- All hard-coded vehicle-only assumptions and copy

## Implementation Plan
1. Update backend `main.mo` to add `category` field to Vehicle type
2. Update `backend.d.ts` with new Vehicle type including category
3. Rewrite AddVehicleDialog as AddObjectDialog with category selector + context fields
4. Update Dashboard with new copy, icons per category
5. Update LandingPage with universal copy and marketing examples
6. Update Navbar/Footer: ParkPing → Scanlink
7. Update PublicMessagePage copy
8. Update AdminPortal column/label text
9. Update PrintQRButton sticker branding
