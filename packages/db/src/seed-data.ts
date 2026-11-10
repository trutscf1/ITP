// Test data for local development (SCF-F-25). The values are the worked example of
// gam-ai-knowledge/concepts/scaffolding.md §10, example 8; they are fictitious and hold no
// personal data. Fixed IDs make the seed idempotent.
export const seedData = {
  authUser: {
    id: "seed-auth-user-1",
    name: "Demo Member",
    email: "demo@stash.local",
  },
  team: {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Demo team",
  },
  rootFolder: {
    id: "00000000-0000-4000-8000-000000000011",
    name: "Demo team",
  },
  folder: {
    id: "00000000-0000-4000-8000-000000000012",
    name: "Documents",
  },
} as const;
