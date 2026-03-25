# Lottery Collection Copy

## Current State
App has 5 screens: gameselect, home, search, entry, settings. Each game (DS/FB/GB/GL) has isolated workspace with 100-number grid. Bottom navigation has: Home, Search, Entry, Settings tabs.

## Requested Changes (Diff)

### Add
- New "Chat Entry" screen (screen type: `chat`) accessible from bottom nav (5th tab: 💬 Chat)
- Smart text input box (textarea) where user types numbers and amounts in any format
- Parser that auto-detects number-amount pairs from the text
- Supported formats: `5-500`, `5 500`, `5:500`, `5,500` (within a line), multiple entries separated by spaces/newlines/commas
- After parsing, show a preview list of what will be added
- "✚ जोड़ें" button to confirm and add all parsed pairs to current game's grid values
- Display success message showing how many entries were added
- Chat input clears after adding
- Smart parser should handle Hindi context: "5 में 500", "नंबर 5 पे 500", etc.
- Show current totals after adding

### Modify
- Bottom nav: add 5th tab for Chat screen (💬 Chat/चैट)
- Home screen: add a third action button for Chat Entry

### Remove
- Nothing removed

## Implementation Plan
1. Add `chat` to Screen type union
2. Add parser function that extracts (number 1-100, amount) pairs from free text
3. Create ChatScreen UI: textarea input, parsed preview list, confirm add button
4. Wire confirm button to update current game's `values` state
5. Add 💬 tab to bottom navigation
6. Add Chat button card on Home screen
