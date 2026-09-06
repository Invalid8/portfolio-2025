/**
 * Database seeding script.
 *
 * Run once during setup, or whenever the source data in /data changes:
 *   npm run seed
 *
 * Writes through better-content's `seedItemMap` rather than talking to
 * firebase-admin directly, which is what keeps it honest about two things the
 * hand-rolled version got wrong:
 *
 * 1. It wrote the portfolio sections with `updatedAt` but no `createdAt`.
 *    Firestore reads here order by `createdAt` and Firestore **excludes
 *    documents that lack the field being ordered by**, so every section was
 *    invisible to `loadItemMap` and the site silently rendered its hardcoded
 *    fallbacks instead. `seedItemMap` routes every write through
 *    `createWithId`, which stamps `createdAt`.
 * 2. A replace is `delete` then `createWithId`, not `set`. `set` overwrites
 *    without restoring the ordering field, which is how (1) survived re-runs.
 *
 * The two modes match what this seed always meant:
 *   - `portfolio` is `byId`: sections are singletons addressed by a stable id,
 *     and nothing else in the collection is touched.
 *   - the list collections are `replace`: the source arrays become the
 *     collection, so rows deleted from /data disappear from the database.
 *
 * DESTRUCTIVE, and /data is not currently the whole truth. As of 2026-09-06
 * Firestore held 15 projects while /data/projects.ts has 9, so six were added
 * through the admin UI and exist nowhere in source. `replace` deletes them.
 * The previous version of this script did the same, so this is not new, but it
 * is worth knowing before running: either export those rows into /data first,
 * or seed only the sections, which is the part that fixes the bug above and
 * touches nothing else:
 *
 *   await seedItemMap(data, { portfolio: sections });
 */

import "dotenv/config";
import * as admin from "firebase-admin";
import { FirestoreDataAdapter } from "better-content/adapters/firestore";
import { seedItemMap } from "better-content/server";
import type { Item } from "better-content/core";
import { projects } from "../data/projects";
import { experiences } from "../data/experiences";
import { skills } from "../data/skills";

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
  });
}

const data = new FirestoreDataAdapter({ db: admin.firestore() });

/** The editable copy for each singleton section, addressed by a stable id. */
const portfolioSections: Record<string, Record<string, unknown>> = {
  navbar: {
    logo: "dalgoridim",
  },
  banner: {
    titleLine: "Frontend~~br~~^^Developer^^",
    subtitle:
      "A Nigerian based **^^Frontend Developer^^** passionate about building accessible and user friendly **^^websites^^**.",
    resume:
      "^^__**[My Resume](https://drive.google.com/file/d/1ixmuBYgzXQdXrTn1n9aoz4SWYRU715h-/view)**__^^",
    skills: skills.slice(0, 15),
  },
  about: {
    leading1:
      "I am a Frontend Developer based in Nigeria with a strong foundation in Computer Science. I specialize in building accessible and user-friendly web applications, with a particular focus on React.js, React Native, Next.js, and TypeScript. Passionate about solving complex problems.",
    leading2:
      "When I'm not coding, I enjoy gaming, playing Mobile Legends, and diving into new technologies to stay ahead in my field. Always curious and eager to learn, I aim to create impactful solutions through technology.",
  },
  stats: {
    yearsExperience: "5+",
    projectsCompleted: "20+",
    hackathonsWon: "2",
  },
  images: {
    aboutImg: "/images/AstronutCat.svg",
  },
  "projects-header": {
    title: "SELECTED WORKS",
    subtitle:
      "A showcase of projects where creativity meets functionality. Each piece tells a story of innovation and problem-solving.",
  },
  "experience-header": {
    title: "EXPERIENCE",
    subtitle:
      "My professional journey building exceptional digital experiences.",
  },
  "skills-header": {
    title: "SKILLS & TECHNOLOGIES",
    subtitle:
      "Technologies and tools I work with to build exceptional digital experiences.",
  },
  contact: {
    title: "LET'S WORK TOGETHER",
    subtitle:
      "Have a project in mind? Let's discuss how we can work together to bring your ideas to life.",
    email: "b.fadamitan2019@gmail.com",
    phone: "+234 703 4797 467",
    location: "Lagos, Nigeria",
  },
};

const sections: Item[] = Object.entries(portfolioSections).map(
  ([id, fields]) => ({ id, ...fields }),
);

// `Item` addresses records by a string id; the source data types theirs as
// `number | string`.
const withId = <T extends { id: number | string }>(rows: T[]): Item[] =>
  rows.map((row) => ({ ...row, id: String(row.id) }));

// The section half is safe: singletons written by id, nothing else touched.
// The list half is a replace and deletes rows absent from /data, which is not
// currently the whole truth. `--sections` runs only the safe half, which is
// what fixes the invisible-sections bug.
const sectionsOnly = process.argv.includes("--sections");

async function main() {
  console.log(
    sectionsOnly
      ? "Seeding portfolio sections only...\n"
      : "Starting full database seed...\n",
  );

  await seedItemMap(
    data,
    sectionsOnly
      ? { portfolio: sections }
      : {
          portfolio: sections,
          projects: {
            items: withId(projects).map((p) => ({
              ...p,
              date: new Date(p.date as string).toISOString(),
            })),
            mode: "replace",
          },
          experiences: { items: withId(experiences), mode: "replace" },
          skills: { items: withId(skills), mode: "replace" },
        },
  );

  console.log(`Seeded ${sections.length} portfolio sections`);
  if (sectionsOnly) {
    console.log("Skipped the list collections (--sections).");
    return;
  }
  console.log(`Seeded ${projects.length} projects`);
  console.log(`Seeded ${experiences.length} experiences`);
  console.log(`Seeded ${skills.length} skills`);
  console.log("\nDatabase seeded successfully.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
