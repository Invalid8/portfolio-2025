/**
 * Seed the local Postgres backend (the headless-cms JSONB `documents` table).
 *
 *   DATABASE_URL=postgresql://postgres:test@localhost:5440/hcms \
 *     npm run seed:pg
 *
 * Mirrors scripts/seed-database.ts but writes to Postgres via the package's
 * PostgresDataAdapter. All collections are unregistered → stored as JSONB.
 */

import "dotenv/config";
import { PostgresDataAdapter } from "@dalgoridim/headless-cms/adapters/postgres";
import { projects } from "../data/projects";
import { experiences } from "../data/experiences";
import { skills } from "../data/skills";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is required");
  process.exit(1);
}

const data = new PostgresDataAdapter({ connectionString });

const sections: Record<string, Record<string, unknown>> = {
  navbar: { logo: "dalgoridim" },
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
  stats: { yearsExperience: "5+", projectsCompleted: "20+", hackathonsWon: "2" },
  images: { aboutImg: "/images/AstronutCat.svg" },
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

async function upsertDoc(
  collection: string,
  id: string,
  payload: Record<string, unknown>,
) {
  // upsert = insert-or-merge, so re-running the seed is idempotent.
  await data.upsert(collection, id, { collection, ...payload });
}

async function main() {
  console.log("🚀 Seeding Postgres...\n");
  await data.migrate();

  for (const [key, payload] of Object.entries(sections)) {
    await upsertDoc("portfolio", key, payload);
  }
  console.log(`✅ ${Object.keys(sections).length} portfolio sections`);

  for (const p of projects) {
    await upsertDoc("projects", String(p.id), {
      ...p,
      date: new Date(p.date).toISOString(),
    });
  }
  console.log(`✅ ${projects.length} projects`);

  for (const e of experiences) {
    await upsertDoc("experiences", String(e.id), { ...e });
  }
  console.log(`✅ ${experiences.length} experiences`);

  for (const s of skills) {
    await upsertDoc("skills", String(s.id), { ...s });
  }
  console.log(`✅ ${skills.length} skills`);

  console.log("\n✨ Postgres seeded. Run:");
  console.log(
    `   DATA_BACKEND=postgres DATABASE_URL=${connectionString} npm run dev\n`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
