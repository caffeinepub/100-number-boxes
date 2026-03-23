# Lottery Collection Entry App

## Current State
App has 100 numbered input boxes with grand total. Simple layout.

## Requested Changes (Diff)

### Add
- Header controls: Date picker, Game dropdown (DS, etc.), radio buttons (Actual Yantri, Daily Collection, Agent, Patti)
- Select Party dropdown with text input
- PATTI SALE checkbox
- Show button
- USER FILTER section (All Users / Selected Users radio)
- Row totals column (right side of grid, per row of 10)
- Column totals row (bottom of grid, per column)
- Grand Total displayed prominently in red
- B section: 10 boxes labeled B1-B9, B0 with individual inputs and row total
- A section: 10 boxes labeled A1-A9, A0 with individual inputs and row total
- Cutting section: Decrease/Increase radio, Amount field, %Age field
- Multiply section: Multiply N input field
- High Color option

### Modify
- Main 10x10 grid: each cell shows box number (small top-left) and input value
- Column totals shown below grid
- Overall layout to match the screenshot style

### Remove
- Old simple layout

## Implementation Plan
1. Redesign frontend to match screenshot exactly
2. Header row with Date, Game, radio buttons, USER FILTER
3. Select Party row with PATTI SALE and Show button
4. Main 10x10 grid (1-100) with row sums and column sums
5. B section and A section below the grid
6. Grand Total display
7. Cutting and Multiply controls at the bottom
8. All calculations done in real-time on frontend
