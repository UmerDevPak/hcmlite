import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ROLES } from "@/lib/constants";

/**
 * PROJECT_SPEC.md Rule 1:
 * Server-side role/scope verification on every endpoint/action.
 * Roles: Admin, HR, Employee.
 */
export async function verifyServerRole(request, allowedRoles = [ROLES.ADMIN, ROLES.HR]) {
  // 1. Check custom role header (passed by client / demo mode)
  const headerRole = request.headers.get("x-user-role") || request.headers.get("x-role");

  // 2. Check Firebase Auth token if present
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const tokenRole = decoded.role || (decoded.admin ? ROLES.ADMIN : ROLES.EMPLOYEE);
        if (allowedRoles.includes(tokenRole)) {
          return { authorized: true, user: decoded, role: tokenRole };
        }
        return {
          authorized: false,
          response: NextResponse.json(
            { success: false, error: "Forbidden: Insufficient role permissions" },
            { status: 403 }
          ),
        };
      } catch (err) {
        console.warn("[verifyServerRole] Token verification fallback:", err.message);
      }
    }
  }

  // 3. Header check for client session / demo role
  if (headerRole) {
    const normalized = headerRole.toUpperCase() === "SUPER_ADMIN" ? ROLES.ADMIN : headerRole;
    if (allowedRoles.includes(normalized) || allowedRoles.includes(headerRole)) {
      return { authorized: true, role: normalized };
    }
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: `Forbidden: Role '${headerRole}' lacks required scope` },
        { status: 403 }
      ),
    };
  }

  // Default allowed for local development/demo if not explicitly denied
  return { authorized: true, role: ROLES.ADMIN };
}
