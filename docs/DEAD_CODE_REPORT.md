# Dead Code Analysis Report

## Summary

This report identifies potentially dead or unused code in the Lineup codebase that can be safely removed or consolidated.

---

## Confirmed Dead Code (Safe to Delete)

### 1. NestJS Boilerplate Files

These are default NestJS scaffolding files that are not registered in any module:

| File | Size | Reason |
|------|------|--------|
| `src/app.controller.ts` | 274 bytes | Not imported in `app.module.ts` |
| `src/app.service.ts` | 142 bytes | Only used by dead `app.controller.ts` |
| `src/app.controller.spec.ts` | - | Test for dead controller |

**Action:** Delete all three files.

---

### 2. Orphaned `/jobs/` Directory

The `/src/jobs/` directory contains stub processors that are not registered anywhere:

| File | Content |
|------|---------|
| `jobs/queues.ts` | Simple queue name constants (not imported) |
| `jobs/processors/email.processor.ts` | Empty stub processor |
| `jobs/processors/sync.processor.ts` | Empty stub processor |
| `jobs/processors/reminder.processor.ts` | Empty stub processor |

**Note:** Each module has its own processor implementations:
- `modules/email/processors/email.processor.ts` (real)
- `modules/interviews/processors/reminder.processor.ts` (real)
- `modules/integrations/processors/sync.processor.ts` (real)

**Action:** Delete entire `/src/jobs/` directory.

---

## Duplicate Code (Consolidate)

### 3. Duplicate Roles Decorator

Two identical implementations exist:

| File | Used By |
|------|---------|
| `common/roles.decorator.ts` | Some older controllers |
| `modules/auth/decorators/roles.decorator.ts` | Most newer controllers |

**Action:** Migrate all usages to `modules/auth/decorators/roles.decorator.ts` and delete `common/roles.decorator.ts`.

---

### 4. Duplicate Guard Files

Multiple guard implementations with overlapping responsibilities:

| File | Purpose | Status |
|------|---------|--------|
| `common/auth.guard.ts` | JWT auth | Used by some legacy controllers |
| `modules/auth/guards/jwt.guard.ts` | JWT auth | Primary implementation |
| `common/rbac.guard.ts` | Role checking | Used by some controllers |
| `modules/auth/guards/rbac.guard.ts` | Role checking | Primary implementation |

**Action:** Audit and consolidate to `modules/auth/guards/`.

---

## Potentially Unused (Verify Before Deleting)

### 5. Common Exception Classes

Check if used anywhere:
- `common/exceptions/business.exception.ts`
- `common/exceptions/not-found.exception.ts`
- `common/exceptions/unauthorized.exception.ts`
- `common/exceptions/validation.exception.ts`

**Action:** Grep for imports before removing.

---

## Cleanup Commands

```bash
# Delete NestJS boilerplate
rm src/app.controller.ts
rm src/app.service.ts
rm src/app.controller.spec.ts

# Delete orphaned jobs directory
rm -rf src/jobs/

# After migrating imports, delete duplicate
rm src/common/roles.decorator.ts
```

---

## Estimated Impact

| Category | Files | Lines Saved |
|----------|-------|-------------|
| Boilerplate | 3 | ~25 |
| Jobs directory | 4 | ~30 |
| Duplicate decorator | 1 | ~2 |
| **Total** | **8** | **~57** |

---

*Report generated: 2024-12-20*
