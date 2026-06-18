## 1. Project Setup

- [x] 1.1 Initialize the React + Vite frontend app structure for the astrology helper.
- [x] 1.2 Add or configure TypeScript, linting, and Vitest test tooling for calculation and UI work.
- [x] 1.3 Select and add a lunar phase calculation dependency or document the deterministic local algorithm.

## 2. Lunar Calculation Model

- [x] 2.1 Implement a pure TypeScript lunar engine module that returns current phase, illumination fraction, waxing or waning state, and calculation timestamp.
- [x] 2.2 Implement next major lunar event lookup with local date and time output.
- [x] 2.3 Implement astronomical new moon moment lookup and the astrological new moon window from 24 hours before to 24 hours after that moment.
- [x] 2.4 Implement the young crescent money window from 24 to 72 hours after astronomical new moon while waxing.
- [x] 2.5 Implement countdown duration helpers for future events and active windows.

## 3. User Interface

- [x] 3.1 Build the main moon-focused screen using `references/young-crescent-reference.png` as the visual direction.
- [x] 3.2 Show current lunar state, next event, and local timing details in Russian.
- [x] 3.3 Render the moon shape dynamically from illumination fraction and waxing or waning direction rather than using a static moon image.
- [x] 3.4 Generate the starry sky background with SVG stars, glow filters, and subtle haze layers.
- [x] 3.5 Show the standard countdown when no new moon or young crescent money window is active.
- [x] 3.6 Show the active astrological new moon countdown and explain that the Moon is normally not visible.
- [x] 3.7 Show the active young crescent money-window countdown when the first-crescent window is active.
- [x] 3.8 Show future new moon and young crescent window start and end times when those windows have not started yet.

## 4. Verification

- [x] 4.1 Add unit tests for lunar phase state, next event selection, new moon window boundaries, and young crescent money window boundaries.
- [x] 4.2 Add UI tests or component checks for normal countdown, active new moon window, active young crescent money window, and future window states.
- [x] 4.3 Verify the app visually on desktop and mobile widths so the moon visual and SVG star field do not overlap countdown text.
- [x] 4.4 Check that the SVG background remains responsive and performant on mobile widths.
- [x] 4.5 Run the full test and build checks before marking the change complete.
