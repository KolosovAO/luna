## Context

This project is a new astrology helper, so the first implementation can choose a small client-side architecture rather than integrating with existing modules. The main user value is a calm, attractive moon-focused screen that answers three questions immediately: what lunar state is active, when the next relevant lunar event happens, and whether the young crescent money ritual window is active right now.

The domain model must distinguish three related ideas: astronomical new moon is an exact moment when the Moon is not normally visible; the astrological new moon window is an approximate period around that moment; and the money ritual window belongs to the first visible young crescent after new moon, usually 1-3 evenings later.

The app should treat lunar timing as calculated data, not static copy. Browser-local time zone detection is enough for the first version, but all displayed timestamps must make the time zone explicit enough that the user can trust the countdown.

The chosen stack is a browser app built with React, Vite, TypeScript, and Vitest. The lunar timing engine should be pure TypeScript modules that do not depend on React, DOM APIs, or rendering state.

The saved reference image at `references/young-crescent-reference.png` defines the visual direction: deep star field, soft blue-white moon glow, a visible but dim unlit lunar disk, and a bright crescent edge. The implemented moon must remain dynamic and reflect the calculated current lunar phase rather than using the reference as a fixed moon image. SVG is the preferred medium for generating the starry sky background, including varied star sizes, soft glows, and subtle nebula-like haze.

## Goals / Non-Goals

**Goals:**
- Build a single focused web experience for lunar cycle timing.
- Calculate current lunar phase, exact new moon moment, astrological new moon window, next major lunar event, and a young crescent money window.
- Show a live countdown that updates without a page refresh.
- Present the experience in Russian with a visually polished moon and countdown treatment.
- Keep calculation logic isolated from presentation so it can be tested independently.

**Non-Goals:**
- Full natal chart or broader astrology interpretation.
- Location-specific moon visibility, horizon, weather, or sunset-based crescent visibility.
- Medical, financial, or guaranteed ritual outcome claims.
- User accounts, saved preferences, or notifications in the first version.

## Decisions

1. Use a client-side web app as the initial delivery shape.

   Rationale: the requested helper is time-based, visual, and personal; it does not require server persistence. A client app keeps the first version simple and fast to iterate.

   Alternative considered: server-rendered calculations. This would add deployment and time zone complexity before the app has a need for server-side state.

2. Use React + Vite + TypeScript for the browser UI and Vitest for tests.

   Rationale: this stack gives fast local iteration, typed UI code, and lightweight test coverage without adding application server complexity.

   Alternative considered: plain static HTML and JavaScript. That would be smaller, but less maintainable once countdown state, phase visuals, and tested calculation logic are added.

3. Isolate lunar calculations in a pure TypeScript engine module.

   Rationale: phase math, next-event lookup, ritual-window derivation, and dynamic moon rendering inputs need tests and should not be embedded in UI components. The module should return structured values such as `currentPhase`, `illuminationFraction`, `isWaxing`, `nextEvent`, `youngCrescentWindow`, `isYoungCrescentActive`, and countdown durations.

   Alternative considered: calculate directly in UI state. That would make the first screen quicker to sketch, but harder to verify and adjust.

4. Use a tested astronomical calculation dependency or a documented deterministic algorithm.

   Rationale: moon phase timing is easy to approximate poorly. A dependency such as an astronomy calculation library is preferred if available; otherwise, the implementation must centralize and document the approximation.

   Alternative considered: hard-coded lunar dates. This would become stale and cannot support ongoing countdowns.

5. Define new moon and young crescent windows explicitly.

   Rationale: "new moon" and "young moon" can mean different things culturally and astronomically. The first version should use clear defaults: astrological new moon from 24 hours before the astronomical new moon moment until 24 hours after it, and the young crescent money window from 24 hours after new moon until 72 hours after new moon while the Moon is waxing. The UI should show start and end times so the rule is transparent.

   Alternative considered: treat the entire waxing crescent phase as the money ritual window. That is simpler but less aligned with the user's note that money is shown after the first visible crescent appears, not during invisible new moon.

6. Update countdown state on a fixed interval.

   Rationale: seconds-level updates make the countdown feel alive. Calculated event times can be recomputed on load and when the countdown reaches zero.

   Alternative considered: recalculate the full lunar model every tick. That is unnecessary work and increases the chance of UI jitter.

7. Render the moon from phase data instead of shipping static phase images.

   Rationale: the user wants the Moon to be shown as it is at the current moment. A generated CSS/SVG/canvas moon can use the current illumination fraction and waxing or waning direction while still matching the reference mood.

   Alternative considered: a small set of static moon phase images. This would be easier visually but would not smoothly match the current time and would make intermediate crescent states feel approximate.

8. Generate the starry sky with SVG.

   Rationale: SVG can create a crisp, scalable night sky with deterministic stars, glow filters, gradients, and atmospheric haze without requiring a large background asset. It also lets the UI keep the reference mood while staying responsive across viewport sizes.

   Alternative considered: raster background image. This can look rich but is less flexible, harder to adapt to different screens, and would not benefit from procedural variation.

## Risks / Trade-offs

- Calculation accuracy depends on the selected library or algorithm -> Mitigation: add tests around known new moon dates and phase transitions.
- The young crescent ritual window is culturally variable and true visibility depends on sky conditions and location -> Mitigation: label it as an approximate first-crescent window, make the default rule visible in UI copy, and keep it isolated for later configurability.
- Dynamic moon rendering may not perfectly match real sky orientation for every hemisphere and location -> Mitigation: derive the lit side from waxing or waning state for the first version and avoid claiming location-perfect orientation.
- SVG star generation can become visually noisy or expensive if overdone -> Mitigation: cap the number of rendered stars, use grouped layers, and verify performance on mobile widths.
- Browser time zone and clock can be wrong -> Mitigation: format all event times clearly and base countdowns on the current device clock for consistency.
- Visual polish can crowd out clarity -> Mitigation: keep the primary screen centered on phase, active/next state, and countdown, with supporting text secondary.
