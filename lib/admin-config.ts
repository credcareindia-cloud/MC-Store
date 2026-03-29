// Admin Security Configuration
export const ADMIN_CONFIG = {
  // Secret access key - change this to your own secret
  SECRET_ACCESS_KEY: process.env.ADMIN_SECRET_KEY || "motoclub-admin-change-me",
  
  // Set ADMIN_REGISTRATION_ENABLED=true in .env to allow /admin/register (still capped by MAX_ADMIN_USERS)
  REGISTRATION_ENABLED: process.env.ADMIN_REGISTRATION_ENABLED === "true",
  REQUIRE_INVITATION: true,
  
  // Maximum number of admin users allowed
  MAX_ADMIN_USERS: parseInt(process.env.MAX_ADMIN_USERS || "5"),
  
  // Super admin configuration
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@motoclub.in",
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2025",
  
  // Admin roles
  ROLES: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    MODERATOR: "moderator"
  }
}

// Check if admin access is allowed
export function isValidAdminAccess(secretKey?: string): boolean {
  if (!secretKey) return false
  return secretKey === ADMIN_CONFIG.SECRET_ACCESS_KEY
}

// Check if registration is allowed
export async function canRegisterAdmin(): Promise<{ allowed: boolean; reason?: string }> {
  if (!ADMIN_CONFIG.REGISTRATION_ENABLED) {
    return { allowed: false, reason: "Admin registration is disabled. Only super admin can add users." }
  }
  
  // Check max admin limit (you'll need to implement this check in your registration API)
  return { allowed: true }
}

// Check if user is super admin
export function isSuperAdmin(email?: string, role?: string): boolean {
  if (!email || !role) return false
  return email === ADMIN_CONFIG.SUPER_ADMIN_EMAIL && role === ADMIN_CONFIG.ROLES.SUPER_ADMIN
}

// Check if user has permission to manage other admins
export function canManageAdmins(role?: string): boolean {
  return role === ADMIN_CONFIG.ROLES.SUPER_ADMIN
}

// Get role hierarchy (higher number = more permissions)
export function getRoleLevel(role: string): number {
  switch (role) {
    case ADMIN_CONFIG.ROLES.SUPER_ADMIN:
      return 3
    case ADMIN_CONFIG.ROLES.ADMIN:
      return 2
    case ADMIN_CONFIG.ROLES.MODERATOR:
      return 1
    default:
      return 0
  }
}

// Check if user can perform action on target user
export function canManageUser(currentUserRole: string, targetUserRole: string): boolean {
  return getRoleLevel(currentUserRole) > getRoleLevel(targetUserRole)
}
