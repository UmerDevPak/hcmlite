const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function testAuth() {
  const cred = await signInWithEmailAndPassword(auth, "admin@hcmlite.internal", "Password123!");
  console.log(`Successfully logged in as: ${cred.user.email} (UID: ${cred.user.uid})`);

  console.log("\n=== Reading Users Collection ===");
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`Found ${usersSnap.docs.length} users:`);
  usersSnap.docs.forEach((d) => {
    const data = d.data();
    console.log(`User [${d.id}]: email=${data.email}, displayName=${data.displayName}, role=${data.role}, employeeId=${data.employeeId}, avatar=${(data.avatar || "").substring(0, 50)}...`);
  });

  console.log("\n=== Reading Employees Collection ===");
  const empSnap = await getDocs(collection(db, "employees"));
  console.log(`Found ${empSnap.docs.length} employees:`);
  empSnap.docs.forEach((d) => {
    const data = d.data();
    console.log(`Emp [${d.id}]: name=${data.name}, email=${data.email}, role=${data.role}, avatar=${(data.avatar || "").substring(0, 50)}...`);
  });
}

testAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
  });
