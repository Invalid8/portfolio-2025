/**
 * Database Seeding Script - UPDATED
 *
 * Run this ONCE during initial setup:
 * npm run seed
 *
 * This imports data from your /data folder and populates Firebase.
 * UPDATED: Now includes stats, complete contact data, and better date handling
 */

import "dotenv/config";
import * as admin from "firebase-admin";
import { projects } from "../data/projects";
import { experiences } from "../data/experiences";
import { skills } from "../data/skills";

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const databaseURL = process.env.FIREBASE_DB_URL;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL,
  });
}

const db = admin.firestore();

async function seedProjects() {
  console.log("🌱 Seeding projects...");

  const batch = db.batch();
  const existingDocs = await db.collection("projects").get();

  existingDocs.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  for (const project of projects) {
    await db
      .collection("projects")
      .doc(String(project.id))
      .set({
        ...project,
        // Ensure date is in ISO format
        date: new Date(project.date).toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  console.log(`✅ Seeded ${projects.length} projects`);
}

async function seedExperiences() {
  console.log("🌱 Seeding experiences...");

  const batch = db.batch();
  const existingDocs = await db.collection("experiences").get();

  existingDocs.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  for (const exp of experiences) {
    await db
      .collection("experiences")
      .doc(String(exp.id))
      .set({
        ...exp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  console.log(`✅ Seeded ${experiences.length} experiences`);
}

async function seedSkills() {
  console.log("🌱 Seeding skills...");

  const batch = db.batch();
  const existingDocs = await db.collection("skills").get();

  existingDocs.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  for (const skill of skills) {
    await db
      .collection("skills")
      .doc(String(skill.id))
      .set({
        ...skill,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  console.log(`✅ Seeded ${skills.length} skills`);
}

async function seedPortfolioSections() {
  console.log("🌱 Seeding portfolio sections...");

  const sections = {
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
    // UPDATED: Complete contact data
    contact: {
      title: "LET'S WORK TOGETHER",
      subtitle:
        "Have a project in mind? Let's discuss how we can work together to bring your ideas to life.",
      email: "b.fadamitan2019@gmail.com",
      phone: "+234 703 4797 467",
      location: "Lagos, Nigeria",
    },
  };

  for (const [key, data] of Object.entries(sections)) {
    await db
      .collection("portfolio")
      .doc(key)
      .set({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  console.log(`✅ Seeded ${Object.keys(sections).length} portfolio sections`);
}

async function main() {
  try {
    console.log("🚀 Starting database seed...\n");

    await seedPortfolioSections();
    await seedProjects();
    await seedExperiences();
    await seedSkills();

    console.log("\n✨ Database seeded successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Start your dev server: npm run dev");
    console.log("2. Login to set yourself as admin");
    console.log("3. Start editing your portfolio!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main();
