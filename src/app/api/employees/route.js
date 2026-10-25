import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { INITIAL_EMPLOYEES } from "@/lib/seedData";
import { verifyServerRole } from "@/lib/serverAuth";
import { ROLES } from "@/lib/constants";

export async function GET(request) {
  // Rule 1: Server-side role/scope verification
  const authCheck = await verifyServerRole(request, [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]);
  if (!authCheck.authorized) return authCheck.response;

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    const db = getAdminFirestore();
    if (db) {
      try {
        let query = db.collection("employees");
        if (department) {
          query = query.where("department", "==", department);
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          return NextResponse.json({ success: true, count: list.length, data: list });
        }
      } catch (e) {
        console.warn("[API /employees] Firestore query fallback:", e.message);
      }
    }

    let list = INITIAL_EMPLOYEES;
    if (department) {
      list = list.filter((e) => e.department === department);
    }
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Rule 1: Server-side role/scope verification (Only Admin & HR can register employees)
  const authCheck = await verifyServerRole(request, [ROLES.ADMIN, ROLES.HR]);
  if (!authCheck.authorized) return authCheck.response;

  try {
    const body = await request.json();
    const newId = `EMP-${String(Math.floor(Math.random() * 900) + 100)}`;
    const tempPassword = `HCM-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;

    const newEmp = {
      id: newId,
      ...body,
      temporaryPassword: tempPassword,
      mustChangePassword: true, // Rule 2
      createdAt: new Date().toISOString(),
    };

    const db = getAdminFirestore();
    if (db) {
      try {
        await db.collection("employees").doc(newId).set(newEmp);
      } catch (e) {
        console.warn("[API /employees POST] Firestore write fallback:", e.message);
      }
    }

    return NextResponse.json({ success: true, data: newEmp }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
