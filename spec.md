# ScanLink

## Current State
Backend has both `--default-persistent-actors` and manual `preupgrade`/`postupgrade` hooks. The `postupgrade` hook clears all stable backup arrays after every deployment. The `preupgrade` hook saves in-memory maps to stable arrays. Both mechanisms exist but conflict: `postupgrade` deletes the stable safety net right after each deployment, so any edge case in map preservation leaves no fallback.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Remove the body of `postupgrade` (stop clearing stable arrays). Stable arrays should persist as permanent backup. `preupgrade` will keep them updated before each upgrade.

### Remove
- The 10 lines inside `postupgrade` that clear stable arrays

## Implementation Plan
1. Edit `src/backend/main.mo`: replace the `postupgrade` body with empty (no clearing). This ensures stable arrays always hold the last-known-good snapshot of all data.
