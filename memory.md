# Memory — Project Report Drafting & WebSocket Real-time Standings

Last updated: 2026-07-07T13:17:00+01:00

## What was built
- **WebSocket Real-time Leaderboard Updates**:
  - **Backend (NestJS)**: Installed dependencies (`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`). Implemented `LeaderboardGateway` (`src/module/leaderboard/leaderboard.gateway.ts`) handling connection authentication using Better Auth token queries, room subscriptions (`group_${groupId}`), and a push broadcast handler. Registered it in `LeaderboardModule`.
  - **Global Guard Compatibility**: Updated `GroupRoleGuard` to check `context.getType() === 'http'` and bypass WebSocket handshakes/events, avoiding injection crashes.
  - **Recalculation Push**: Configured `LeaderboardConsumer.updateLeaderboard` to broadcast recomputed standings directly via the gateway.
  - **Frontend (Next.js)**: Installed `socket.io-client`. Integrated a Socket.io listener inside the client group details page (`src/app/groups/[id]/page.tsx`) that joins the group room and dynamically refreshes the leaderboard state upon receipt of `leaderboardUpdated` events.
- **Academic Report Chapters 4 and 5**: Generated chapters under `project_report_chapters_4_5.md` detailing the development stack, security architectures, Kafka event loop execution flow, WebSocket real-time pushes, and Jest testing summaries.
- **Gitignore Exclusions**: Configured `.gitignore` files for client and server to exclude report files, agents instructions, memory modules, and custom skills folders.

## Decisions made
- Handshake token authentication: Extracted Better Auth Bearer tokens from incoming WebSocket handshakes to validate client identity via `authService.api.getSession` prior to room subscription.
- Room isolation: Segregated client socket connections inside virtual rooms named `group_${groupId}` so standings updates are broadcast only to active members of the target group.
- Global mock modules in test: Created a global `MockAuthModule` in `scoring-flow.integration.spec.ts` to satisfy compiler-time dependency injections for AuthService in test suites without pulling in actual ESM modules.
- Check server initialization: Added a safety check on `gateway.server` in `emitLeaderboardUpdate` to prevent null pointer exceptions during unit/integration tests.

## Problems solved
- Solved WebSocket compiler and runtime test suite failures: Mocked AuthService globally inside integration tests and bypassed global guards on non-HTTP contexts.
- Avoided layout flickering: Checked authenticating tokens on client-side route mounts inside a unified PageShell loading container.
- Resolved skipped prediction grading: Filtered out null selection payloads before predictions submission, treating abstentions as non-penalizing "Passes".

## Current state
- The client and server codebases compile clean with 0 warnings.
- All backend unit tests and event-driven scoring integration tests execute and pass successfully (8 suites, 18 specs).
- Real-time WebSockets bindings are fully integrated and functional.

## Next session starts with
- Add matching visual diagrams or screenshots to placeholders in the project report.
- Implement real-time notifications for event activations or match results using the same WebSockets gateway.

## Open questions
- None for the current session.
