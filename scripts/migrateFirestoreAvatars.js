const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs, doc, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBw_4gwAjNQLeWkU0z9ByiD-AMfODqBHgw",
  authDomain: "fir-auth-fa91c.firebaseapp.com",
  projectId: "fir-auth-fa91c",
  storageBucket: "fir-auth-fa91c.firebasestorage.app",
  messagingSenderId: "651229386085",
  appId: "1:651229386085:web:afb60eb60e4176fe23bd8c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// SVGs
const SVG_FEMALE_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#38bdf8"/><path d="M26 48 C22 62 26 72 35 76 C45 80 55 80 65 76 C74 72 78 62 74 48 Z" fill="#18181b"/><path d="M22 100 C22 78 35 72 50 72 C65 72 78 78 78 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="43" cy="74" r="1.8" fill="#18181b"/><circle cx="46" cy="76" r="1.8" fill="#18181b"/><circle cx="50" cy="77" r="1.8" fill="#18181b"/><circle cx="54" cy="76" r="1.8" fill="#18181b"/><circle cx="57" cy="74" r="1.8" fill="#18181b"/><path d="M34 44 C34 32 40 28 50 28 C60 28 66 32 66 44 C66 57 58 64 50 64 C42 64 34 57 34 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><circle cx="66" cy="47" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><path d="M32 42 C30 30 40 22 50 22 C62 22 70 30 68 42 C64 33 58 31 50 34 C42 37 36 33 32 42 Z" fill="#18181b"/><path d="M28 44 C26 38 32 32 37 34 C33 39 30 46 36 49 C32 50 29 48 28 44 Z" fill="#18181b"/><path d="M72 44 C74 38 68 32 63 34 C67 39 70 46 64 49 C68 50 71 48 72 44 Z" fill="#18181b"/><ellipse cx="44" cy="46" rx="2" ry="2.2" fill="#18181b"/><ellipse cx="56" cy="46" rx="2" ry="2.2" fill="#18181b"/><path d="M41 42 Q44 40 47 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M53 42 Q56 40 59 42" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SVG_FEMALE_2 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#facc15"/><path d="M42 28 C34 22 28 26 26 35 C24 44 26 52 30 54 C35 56 36 46 38 38 C39 32 40 30 42 28 Z" fill="#18181b" stroke="#18181b" stroke-width="2"/><path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 72 C38 80 44 85 50 85 C56 85 62 80 62 72" fill="none" stroke="#18181b" stroke-width="2.5"/><path d="M46 85 L46 94" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M54 85 L54 94" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M43 62 L43 73 C43 76 57 76 57 73 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="65" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><path d="M36 40 C34 30 42 24 50 24 C60 24 66 30 65 40 C61 31 54 29 46 31 C40 33 37 36 36 40 Z" fill="#18181b"/><ellipse cx="40" cy="27" rx="3" ry="4" fill="#ffffff" stroke="#18181b" stroke-width="2"/><ellipse cx="45" cy="45" rx="2" ry="2.2" fill="#18181b"/><ellipse cx="56" cy="45" rx="2" ry="2.2" fill="#18181b"/><path d="M42 41 Q45 39 48 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M50 46 Q49 50 52 51" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M46 55 Q51 59 56 55" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SVG_FEMALE_3 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#fb7185"/><path d="M22 45 C18 60 22 76 34 80 C40 82 60 82 66 80 C78 76 82 60 78 45 C82 30 72 18 50 18 C28 18 18 30 22 45 Z" fill="#18181b"/><path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="29" cy="50" r="5" stroke="#facc15" stroke-width="2.5" fill="none"/><circle cx="71" cy="50" r="5" stroke="#facc15" stroke-width="2.5" fill="none"/><path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="44" cy="45" rx="2" ry="2.2" fill="#18181b"/><ellipse cx="56" cy="45" rx="2" ry="2.2" fill="#18181b"/><path d="M41 41 Q44 39 47 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M53 41 Q56 39 59 41" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M45 56 Q50 60 55 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SVG_MALE_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#4ade80"/><path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M27 82 L73 82" stroke="#18181b" stroke-width="2"/><path d="M25 90 L75 90" stroke="#18181b" stroke-width="2"/><path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><circle cx="66" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><path d="M34 38 C32 26 40 22 50 22 C60 22 68 26 66 38 C62 30 55 30 50 31 C45 30 38 30 34 38 Z" fill="#18181b"/><circle cx="44" cy="46" r="5" stroke="#18181b" stroke-width="2" fill="none"/><circle cx="56" cy="46" r="5" stroke="#18181b" stroke-width="2" fill="none"/><path d="M49 46 L51 46" stroke="#18181b" stroke-width="2"/><ellipse cx="44" cy="46" rx="1.8" ry="1.8" fill="#18181b"/><ellipse cx="56" cy="46" rx="1.8" ry="1.8" fill="#18181b"/><path d="M41 39 Q44 37 47 39" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M53 39 Q56 37 59 39" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M49 48 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M46 56 Q50 59 54 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SVG_MALE_2 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#fb7185"/><path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M42 72 L50 82 L58 72" stroke="#18181b" stroke-width="2" fill="none"/><path d="M50 82 L50 100" stroke="#18181b" stroke-width="2"/><path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><circle cx="66" cy="46" r="3.5" fill="#ffffff" stroke="#18181b" stroke-width="2"/><path d="M34 38 C32 25 40 20 54 20 C64 20 68 25 66 36 C60 26 48 26 34 38 Z" fill="#18181b"/><ellipse cx="44" cy="45" rx="2" ry="2.2" fill="#18181b"/><ellipse cx="56" cy="45" rx="2" ry="2.2" fill="#18181b"/><path d="M41 40 Q44 38 47 40" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M53 40 Q56 38 59 40" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M49 47 Q48 51 51 52" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/><path d="M46 56 Q50 59 54 56" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const SVG_ANONYMOUS_1 = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#6366f1"/><path d="M24 100 C24 78 35 72 50 72 C65 72 76 78 76 100 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 72 C40 82 46 86 50 86 C54 86 60 82 60 72" fill="none" stroke="#18181b" stroke-width="2.2"/><path d="M43 62 L43 74 C43 78 57 78 57 74 L57 62 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/><path d="M35 44 C35 32 41 28 50 28 C59 28 65 32 65 44 C65 57 58 64 50 64 C42 64 35 57 35 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 40 C32 26 40 22 50 22 C60 22 68 26 66 40 C62 30 55 28 50 30 C45 28 38 30 34 40 Z" fill="#18181b"/><path d="M42 45 Q44 48 46 45" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/><path d="M54 45 Q56 48 58 45" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/><path d="M46 55 Q50 58 54 55" fill="none" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/></svg>`;

function svgToDataUri(svg) {
  const cleaned = svg.replace(/[\n\r\t]+/g, " ").replace(/\s+/g, " ");
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

const URI_FEMALE_SARAH = svgToDataUri(SVG_FEMALE_1); // Wavy bob, cyan circle
const URI_FEMALE_ELENA = svgToDataUri(SVG_FEMALE_2); // High ponytail, yellow circle
const URI_FEMALE_AALIYAH = svgToDataUri(SVG_FEMALE_3); // Voluminous curls & hoop earrings, coral circle
const URI_MALE_MARCUS = svgToDataUri(SVG_MALE_1); // Mint circle, glasses
const URI_MALE_DAVID = svgToDataUri(SVG_MALE_2); // Coral circle, comb-over
const URI_ANONYMOUS = svgToDataUri(SVG_ANONYMOUS_1); // Indigo circle

function getAvatarForPersona(email = "", name = "") {
  const e = (email || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (e.includes("elena") || e.includes("employee@") || n.includes("elena")) {
    return URI_FEMALE_ELENA;
  }
  if (e.includes("admin") || e.includes("sarah") || n.includes("sarah")) {
    return URI_FEMALE_SARAH;
  }
  if (e.includes("hr@") || e.includes("aaliyah") || n.includes("aaliyah")) {
    return URI_FEMALE_AALIYAH;
  }
  if (n.includes("umer") || e.includes("umer")) {
    return URI_MALE_MARCUS;
  }
  if (n.includes("marcus") || e.includes("marcus")) {
    return URI_MALE_MARCUS;
  }
  if (n.includes("david") || e.includes("david")) {
    return URI_MALE_DAVID;
  }
  // Generic fallback
  return URI_ANONYMOUS;
}

async function migrate() {
  console.log("Authenticating as admin...");
  await signInWithEmailAndPassword(auth, "admin@hcmlite.internal", "Password123!");
  console.log("Authenticated successfully.");

  console.log("\n--- Updating Users Collection ---");
  const usersSnap = await getDocs(collection(db, "users"));
  for (const d of usersSnap.docs) {
    const data = d.data();
    const targetAvatar = getAvatarForPersona(data.email, data.displayName);
    await updateDoc(doc(db, "users", d.id), {
      avatar: targetAvatar,
    });
    console.log(`Updated user [${d.id}] (${data.email} / ${data.displayName}) -> Avatar set`);
  }

  console.log("\n--- Updating Employees Collection ---");
  const empSnap = await getDocs(collection(db, "employees"));
  for (const d of empSnap.docs) {
    const data = d.data();
    const targetAvatar = getAvatarForPersona(data.email, data.name);
    await updateDoc(doc(db, "employees", d.id), {
      avatar: targetAvatar,
    });
    console.log(`Updated employee [${d.id}] (${data.email} / ${data.name}) -> Avatar set`);
  }

  console.log("\n=== MIGRATION COMPLETE ===");
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  });
