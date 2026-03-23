# 100 Number Boxes

## Current State
New project with empty scaffolding.

## Requested Changes (Diff)

### Add
- 100 numbered input boxes (1–100) arranged in a 10x10 grid
- Each input accepts numeric values
- Grand total displayed prominently, updating in real-time as user types
- Clean page layout with header showing the total

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
- Frontend-only React app
- Use local state (array of 100 numbers) to track values
- Derive grand total via reduce on state array
- Grid layout: 10 columns using CSS grid
- Each cell: numbered label + number input
- Grand total shown prominently in a sticky/prominent header or footer card
