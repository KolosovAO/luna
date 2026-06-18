## Why

People who follow lunar astrology need a simple way to know the current lunar phase, how long remains until the next meaningful moon event, and whether the young crescent window is active. This change creates a focused assistant that turns lunar timing into a clear, beautiful countdown experience.

## What Changes

- Add a lunar astrology helper that calculates the current lunar cycle state and the next relevant moon event.
- Distinguish the exact astronomical new moon moment from the broader astrological new moon window.
- Show a prominent visual moon treatment with phase-aware styling based on the current moment, using `references/young-crescent-reference.png` as the visual direction and SVG-generated starry sky elements for the background.
- Display a live countdown to the next lunar cycle event when no active window is running.
- Display an active countdown for the first young crescent window after new moon, so the user knows when to show money to the young crescent rather than to the invisible new moon.
- Use the user's local time zone by default, with clear event times.
- Provide concise astrology-oriented copy in Russian for the current state and next action.

## Capabilities

### New Capabilities
- `lunar-cycle-countdown`: Calculate and present lunar cycle timing, current/next phase information, young crescent ritual window state, and live countdown UI.

### Modified Capabilities
- None.

## Impact

- Adds the first app-facing lunar helper experience to the project.
- Establishes the app stack as a browser app built with React, Vite, TypeScript, and Vitest.
- Adds a saved visual reference for the moon style at `references/young-crescent-reference.png`.
- May introduce a moon phase calculation dependency or local astronomical calculation module.
- Affects UI structure, time-based state updates, localization copy, and date/time formatting.
