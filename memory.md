# Memory — Heroku Deployment & Dissertation Appendix Compilation

Last updated: 2026-07-09T14:15:00+01:00

## What was built
- **Backend Heroku Setup**:
  - Configured `package.json` to generate the Prisma client before building NestJS (`prisma generate && nest build`) and updated production start script.
  - Created backend `Procfile` running NestJS in production (`web: npm run start:prod`).
  - Added SSL support to `KafkaService` for connecting to Apache Kafka on Heroku using certificates (`KAFKA_TRUSTED_CERT`, `KAFKA_CLIENT_CERT`, `KAFKA_CLIENT_CERT_KEY`).
  - Added dynamic topic and consumer group prefixing using `KAFKA_PREFIX` (mandatory for Heroku Basic multi-tenant plans).
  - Adjusted topic creation replication factor dynamically (defaulting to 3 on Heroku SSL, 1 locally) and caught Admin API topic creation errors safely to prevent boot crashes.
- **Frontend Heroku Setup**:
  - Created frontend `Procfile` specifying dynamic port binding (`web: npx next start -p $PORT`).
- **Dissertation Appendix compilation**:
  - Captured 9 screenshots of major user routes (Landing Page, Register Page, Dashboard, Profile, Group Creation, Admin Group Page, Rule/Event Details, Join Group, and Event Predictions).
  - Drafted comprehensive master's thesis dissertation Appendix in academic LaTeX style containing Appendices A to I.
  - Written to `/Users/shredder/.gemini/antigravity-ide/brain/5ad89651-d4c6-474c-b05e-4cb343515619/project_appendix.md`.

## Decisions made
- Removed database migration from release phase: The database is hosted on Prisma Cloud (`db.prisma.io`) and is already active and populated, rendering `prisma migrate deploy` unnecessary since there are no local migration files in this repository.
- Kept image references relative within the artifacts directory to ensure high-fidelity import compatibility with Google Docs.

## Problems solved
- Solved missing `dist/main` crash: Adjusted the `start:prod` script to point to `dist/src/main` since the TypeScript compiler preserves the `src/` directory structure.
- Solved browser subagent scratchpad read failures by running a clean session and mapping direct routes.

## Current state
- The backend and frontend apps are deployed on Heroku, but have been scaled down to `0` dynos to preserve credits.
- The Heroku Kafka add-on has been destroyed to stop all billing charges.
- The entire dissertation Appendix package is complete.

## Next session starts with
- Re-provision the Kafka add-on and re-create topics/consumer group using the **Kafka Recreation Protocol** below.
- Scale backend and frontend dynos back up to `1` using `npx heroku ps:scale web=1`.
- Verify socket connection dynamically in the UI and test production workflow actions (register, login, join group, submit prediction).
- Configure SSL certificate verification if custom domain names are added.

## Kafka Recreation Protocol (Do Not Overwrite)
If the Kafka add-on is destroyed to save credits, use these exact commands to provision it and recreate all topics and groups:

1. **Provision the Kafka addon**:
   ```bash
   npx heroku addons:create heroku-kafka:basic-0 -a <backend-app-name>
   ```
   Wait for the addon to transition to the `created` state (check with `npx heroku addons:info <addon-name>`).

2. **Retrieve the auto-generated prefix**:
   ```bash
   npx heroku config:get KAFKA_PREFIX -a <backend-app-name>
   ```
   *(e.g., `colorado-85695.`)*

3. **Install the CLI plugin (if not present)**:
   ```bash
   npx heroku plugins:install heroku-kafka
   ```

4. **Create the 4 required namespaced topics** (replace `<prefix>` with your retrieved prefix):
   ```bash
   npx heroku kafka:topics:create <prefix>prediction.submitted -a <backend-app-name>
   npx heroku kafka:topics:create <prefix>result.recorded -a <backend-app-name>
   npx heroku kafka:topics:create <prefix>score.computed -a <backend-app-name>
   npx heroku kafka:topics:create <prefix>leaderboard.updated -a <backend-app-name>
   ```

5. **Create the consumer group** (replace `<prefix>` with your retrieved prefix):
   ```bash
   npx heroku kafka:consumer-groups:create <prefix>fantasy-league-group -a <backend-app-name>
   ```

6. **Restart backend dynos**:
   ```bash
   npx heroku ps:restart -a <backend-app-name>
   ```

## Open questions
- None.
