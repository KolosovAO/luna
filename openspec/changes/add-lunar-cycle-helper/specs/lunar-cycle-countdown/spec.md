## ADDED Requirements

### Requirement: Current lunar state
The system SHALL calculate and display the current lunar phase state using the user's current device time and local time zone, including whether the Moon is normally visible for the current state.

#### Scenario: User opens the helper
- **WHEN** the user opens the lunar helper
- **THEN** the system displays the current lunar phase name, whether the Moon is waxing or waning, whether the current state is normally visible, and the current local date and time used for the calculation

#### Scenario: Device time changes
- **WHEN** the current device time moves into a different lunar phase state
- **THEN** the system updates the displayed lunar state without requiring the user to reload the page

### Requirement: Next lunar event countdown
The system SHALL identify the next major lunar cycle event and show a live countdown to it when no new moon or young crescent window is active.

#### Scenario: No special window is active
- **WHEN** neither the astrological new moon window nor the young crescent money window is active
- **THEN** the system displays the next lunar event name, its local date and time, and a countdown in days, hours, minutes, and seconds

#### Scenario: Countdown reaches zero
- **WHEN** the countdown to the next lunar event reaches zero
- **THEN** the system recalculates the current lunar state and the next relevant lunar event

### Requirement: Astronomical and astrological new moon
The system SHALL calculate the astronomical new moon as an exact moment and SHALL calculate the astrological new moon window from 24 hours before that moment until 24 hours after that moment.

#### Scenario: Astronomical new moon is current
- **WHEN** the current time matches the astronomical new moon moment within the calculation precision
- **THEN** the system displays that new moon is a moment and that the Moon is normally not visible

#### Scenario: Astrological new moon window is active
- **WHEN** the current time is within 24 hours before or 24 hours after the astronomical new moon moment
- **THEN** the system displays that the astrological new moon window is active and shows a countdown until the window ends

#### Scenario: New moon window is upcoming
- **WHEN** the next astrological new moon window has not started yet
- **THEN** the system displays the local start time, exact new moon time, local end time, and countdown until the window starts

### Requirement: Young crescent money window
The system SHALL calculate an approximate young crescent money window from 24 hours after astronomical new moon until 72 hours after astronomical new moon while the Moon is waxing, and SHALL present this window as the time to show money to the young crescent rather than to the invisible new moon.

#### Scenario: Money window is active
- **WHEN** the current time is inside the young crescent money window
- **THEN** the system displays that the young crescent money window is active and shows a countdown until the window ends

#### Scenario: Money window has not started
- **WHEN** the current time is before the young crescent money window for the next new moon
- **THEN** the system displays the local start time for the young crescent money window and a countdown until it begins

#### Scenario: Money window ended
- **WHEN** the current time is after the young crescent money window end
- **THEN** the system displays the next relevant lunar event instead of the active ritual countdown

### Requirement: Moon-focused visual presentation
The system SHALL present the lunar helper as a visually polished moon-focused experience with a dynamic phase-aware moon visual and Russian-language guidance.

#### Scenario: Phase visual is shown
- **WHEN** the system displays the current lunar state
- **THEN** the visible moon treatment reflects the current phase category and does not obscure the countdown or event text

#### Scenario: Current phase shape is rendered
- **WHEN** the current lunar phase changes the illuminated fraction or waxing or waning direction
- **THEN** the system updates the rendered moon shape so the visible bright portion matches the current calculated phase state

#### Scenario: Reference mood is preserved
- **WHEN** the system renders the moon-focused screen
- **THEN** the screen uses the saved reference direction of a dark star field, soft moon glow, dim unlit lunar disk, and bright crescent edge

#### Scenario: Star field is generated
- **WHEN** the system renders the moon-focused screen
- **THEN** the background uses SVG-generated stars and atmospheric glow layers that scale to the viewport without obscuring the moon, countdown, or guidance text

#### Scenario: Russian guidance is shown
- **WHEN** the user views the helper
- **THEN** the system shows concise Russian text explaining the current state and the next timing action

### Requirement: Transparent timing rule
The system SHALL make the timing basis for both the astrological new moon window and the young crescent money window visible to the user.

#### Scenario: User reviews the new moon window
- **WHEN** the system shows the astrological new moon window
- **THEN** the system displays the local start time, exact astronomical new moon time, and local end time of the window

#### Scenario: User reviews the young crescent money window
- **WHEN** the system shows the young crescent money window
- **THEN** the system displays the local start time and local end time of that future window
