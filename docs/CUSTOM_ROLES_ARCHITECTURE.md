# Custom Roles & Permissions Architecture

## Overview

This document describes the role and permission model for tenant-level custom roles, enabling tenant administrators to define roles beyond the system defaults while maintaining strict security boundaries.

---

## Design Principles

1. **Capability-Based RBAC** - Predefined permissions, assignable to roles
2. **Tenant Isolation** - Custom roles scoped to individual tenants
3. **Privilege Escalation Prevention** - Admins cannot grant permissions they don't have
4. **Simplicity First** - Minimal viable design for Phase 1

---

## Data Models

### Permission (System-Defined)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique permission key (e.g., `candidates.create`) |
| `category` | string | Grouping (candidates, interviews, reports, settings) |
| `description` | string | Human-readable description |
| `level` | enum | `SYSTEM` (platform-only) or `TENANT` (assignable) |

### Role

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `tenantId` | string | Tenant scope (null = system role) |
| `name` | string | Display name |
| `type` | enum | `SYSTEM` or `CUSTOM` |
| `permissions` | string[] | Array of permission IDs |
| `isDefault` | boolean | Auto-assign to new users |

### UserRole

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User reference |
| `tenantId` | string | Tenant scope |
| `roleId` | string | Role reference |

---

## Permission Categories (Phase 1)

```
candidates.*     → create, read, update, delete, export
interviews.*     → create, read, update, delete, schedule
reports.*        → view, export
users.*          → invite, manage, deactivate
settings.*       → view, update
```

**System-Level (Not Assignable by Tenant Admins):**
```
platform.*       → tenant management, billing, system config
```

---

## Role Creation Flow

```
┌─────────────────┐
│  Tenant Admin   │
│  creates role   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Validate:                          │
│  - Name uniqueness within tenant    │
│  - All permissions are TENANT-level │
│  - Admin has all selected perms     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Create Role    │
│  (tenantId set) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Audit Log      │
└─────────────────┘
```

---

## Permission Evaluation Logic

```
function hasPermission(userId, tenantId, permission):
    1. Get user's role(s) for tenant
    2. Collect all permissions from roles
    3. Check if requested permission is in set
    4. Return true/false
```

**Hierarchy Check (Shortcut):**
- SUPERADMIN → bypass, all permissions
- ADMIN → tenant-level only, all permissions
- Custom → explicit permission check

---

## Security Guardrails

| Constraint | Enforcement |
|------------|-------------|
| Tenant isolation | `tenantId` required on all custom roles |
| No system permission grants | Validation rejects `platform.*` permissions |
| No privilege escalation | Creator can only assign perms they possess |
| Default roles protected | `type=SYSTEM` roles cannot be modified |
| Deletion protection | Roles with assigned users cannot be deleted |

---

## Migration Strategy

| Phase | Scope |
|-------|-------|
| **Phase 1** | Permission table, role-permission linking, basic UI |
| **Phase 2** | Custom role CRUD, assignment UI, bulk operations |
| **Phase 3** | Permission inheritance, role templates, analytics |

---

## API Endpoints (Phase 1)

```
GET    /permissions                    # List all assignable permissions
GET    /roles                          # List tenant roles
POST   /roles                          # Create custom role
PATCH  /roles/:id                      # Update role permissions
DELETE /roles/:id                      # Delete role (if unassigned)
POST   /users/:id/roles                # Assign role to user
DELETE /users/:id/roles/:roleId        # Remove role from user
```

---

## Backward Compatibility

Existing fixed roles (ADMIN, MANAGER, RECRUITER, INTERVIEWER) become system roles with predefined permission sets. No data migration required—existing users retain their current access.
