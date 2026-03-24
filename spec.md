# 100 Number Boxes

## Current State
App has a single screen with a 10x10 grid, Search+Add section embedded above the grid, history modal, and save/show functionality. All in one App.tsx.

## Requested Changes (Diff)

### Add
- A Home Screen with two navigation buttons: "Number Khojo & Jodo" and "Entry"
- A dedicated Search+Add Screen accessible from the home screen
- Bottom navigation bar on all screens to switch between Home, Search+Add, and Entry

### Modify
- App.tsx to support screen-based navigation (home | search | entry)
- Remove the embedded Search+Add section from the Entry screen (it will live in its own screen)

### Remove
- Nothing removed permanently; Search+Add section moves to its own screen

## Implementation Plan
1. Add a `screen` state: 'home' | 'search' | 'entry'
2. Create HomeScreen component with two big buttons
3. Create SearchScreen component with dedicated full-page Search+Add UI (shows number, current value, add input, result)
4. Move existing App content into EntryScreen
5. Add a sticky bottom nav bar to navigate between screens
