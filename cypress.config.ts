import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    excludeSpecPattern:
      process.env.CYPRESS_DOCKER_E2E === "true"
        ? []
        : ["**/*.docker.cy.ts"],
    includeShadowDom: true,
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
