import dotenv from "dotenv";
dotenv.config();
import admin from "firebase-admin";

const ALLOWED_ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setAdminClaim(email) {
  try {
    // Check if email is in whitelist
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      console.error(`❌ Email ${email} is not in the admin whitelist`);
      console.log(
        `✅ Allowed admin emails: ${ALLOWED_ADMIN_EMAILS.join(", ")}`,
      );
      process.exit(1);
    }

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`✅ Admin claim set for: ${email}`);
    console.log(`UID: ${user.uid}`);
    console.log(`⚠️ User must re-login for changes to take effect`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email");
  console.error("Usage: npm run seed:admin your-email@example.com");
  process.exit(1);
}

setAdminClaim(email);
