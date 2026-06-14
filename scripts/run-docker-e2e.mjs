import { spawnSync } from "node:child_process";

const command =
  process.platform === "win32"
    ? "node_modules\\.bin\\cypress.cmd"
    : "node_modules/.bin/cypress";

const result = spawnSync(
  command,
  [
    "run",
    "--config",
    "baseUrl=http://localhost:8080",
    "--env",
    "apiUrl=http://localhost:3000/api,mailpitUrl=http://localhost:8025",
    "--spec",
    "cypress/e2e/api-real.docker.cy.ts",
  ],
  {
    env: {
      ...process.env,
      CYPRESS_DOCKER_E2E: "true",
    },
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
