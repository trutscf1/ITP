# Principles

Four principles shape every document the gam- skills produce:

1. **Goal first** — every project starts with one project goal of at most 200 characters; everything else is derived from it and must not contradict it (P-GOAL).
2. **Readable by humans and AI** — user stories, acceptance criteria, and requirements are written once in a form both can read; only content that cannot serve both gets a separate human summary (Part H). This holds for every artifact people read: documents, issues, MRs, commit subjects, release notes (P-HUM-1…4).
3. **Traceable workflow** — every user story is an issue with its acceptance criteria, weight, and assignee; every change goes through an MR checked against the acceptance criteria and the Definition of Done, reviewed by another person and merged as the project's merge policy allows; status is current the moment work reaches `dev` (P-TRK, P-MR, P-ROAD-4). Time tracking is optional and for humans only (P-TIME).
4. **Solo or team** — when several developers work on the project, the profile travels with the repo and the volatile documents are split per developer, so everyone can run the same profile on their own machine without merge fights (P-TEAM).
