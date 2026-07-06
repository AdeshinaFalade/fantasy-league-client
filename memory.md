# Memory — Fantasy League Client & Server Updates

Last updated: 2026-07-06T12:04:00+01:00

## What was built
- **Authentication State Storage**: Configured `login` and `register` pages to store the backend's root-level `token` response.
- **Route Guarding**: Implemented page-shell level redirects. Protected pages redirect to `/login` if unauthenticated, and anonymous-only pages redirect to `/dashboard` if authenticated. Prevented children mounting before verification completes.
- **Group Member Administration**: Created members dashboard page supporting promote/demote (role toggle) and remove actions for group admins. Added a group delete button.
- **Event Creation & Postponement**: 
  - Built an event creation form modal on the group detail page for admins. Made the "Starts At" field **required** to prevent immediate activation upon creation.
  - Implemented an **"Edit Event" details modal** for admins to change event properties (such as postponing the `startsAt` date to a future time), which automatically re-opens predictions for group members even if the original start time has elapsed.
- **Group Overview Dashboard Cleanup**:
  - Removed the confusing, hardcoded rules display of the first event in the bottom-left.
  - Removed the redundant quick actions panel, creating a clean dashboard layout (Events on the left, Leaderboard on the right).
- **Interactive Tri-state Predictions**: 
  - Added a **"Pass"** choice in the prediction form. User selections default to unselected (`null`) and any skipped rules are omitted from the array sent to the backend, preventing neutral default predictions from being evaluated as incorrect.
- **Prediction Scorecards with Match Results**: 
  - Created a detailed scorecard view for members on the event page. It compares their predictions (Yes, No, or Passed) directly against recorded match values, showing clear correctness status and points earned.
- **Dynamic Results Recording**: Replaced the raw JSON textarea with labeled numeric inputs dynamically generated for every player + metric combination in the event rules.

## Decisions made
- Updated backend `EventsService.findOne` to include the event's recorded results (`results: true`) in the query payload so the frontend has access to match statistics.
- Added a PATCH `/events/:id` route to update event parameters (name, description, startsAt, status) on the NestJS backend.
- Filtered out unselected prediction rules (where selection is `null` or `undefined`) on the client before forwarding to the backend `/predictions` endpoint.
- Corrected frontend types (`Prediction.selections` and `CreatePredictionDto.selections`) to match the backend database array structure.

## Problems solved
- Fixed double-declaration errors in `button.tsx` and `input.tsx`.
- Resolved hook-ordering warnings by restructuring early returns.
- Fixed authentication loop/flicker where unauthenticated components mounted and requested data before page shell redirection occurred.
- Resolved typecheck compile errors in backend Jest specs (`events.controller.spec.ts`, `events.service.spec.ts`, and `scoring-flow.integration.spec.ts`) by mocking the group member relationship and adjusting the results payload schema to be a nested record instead of an array.

## Current state
- Both frontend and backend compile completely clean with 0 warnings or errors.
- All backend test suites and integration flows pass successfully.
