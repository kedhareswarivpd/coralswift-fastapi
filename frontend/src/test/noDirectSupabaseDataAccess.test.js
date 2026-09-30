import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Permanent regression guard, two generations of the same requirement:
 *
 * 1. CF-AUD-002: the browser used to read/write business tables (employees,
 *    clients, projects, tasks, invoices, ...) directly via the Supabase anon
 *    key with zero RLS policies (frontend/src/lib/db.js, deleted in the
 *    remediation that originally added this test). All business data must go
 *    through the authorized CoralSwift backend API instead.
 *
 * 2. Supabase Auth removal: the backend has fully migrated off Supabase Auth
 *    onto its own session model (httpOnly cf_access_token/cf_refresh_token
 *    cookies + cf_csrf_token double-submit — see backend/app/core/cookies.py
 *    and app/services/auth_service.py). frontend/src/lib/supabase.js (the
 *    former `.auth.*` session-management client) was deleted alongside it.
 *    There must be zero `@supabase/supabase-js` imports, zero
 *    `supabase.auth.*` calls, and no `@supabase/supabase-js` dependency
 *    anywhere in this codebase going forward.
 */

const FRONTEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_DIR = path.join(FRONTEND_ROOT, 'src');
const DATA_ACCESS_PATTERN = /supabase\s*\.\s*(from|rpc|storage)\s*\(/;
const SUPABASE_IMPORT_PATTERN = /@supabase\/supabase-js|supabase\s*\.\s*auth\s*\./;
const ALLOWED_FILES = new Set([
  'test/noDirectSupabaseDataAccess.test.js', // this file's own comments describe the banned patterns
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full, files);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('Supabase Auth / direct-DB-access regression guard', () => {
  it('no source file calls supabase.from()/.rpc()/.storage() for business data', () => {
    const offenders = [];
    for (const file of walk(SRC_DIR)) {
      const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/');
      if (ALLOWED_FILES.has(rel)) continue;
      const content = fs.readFileSync(file, 'utf-8');
      if (DATA_ACCESS_PATTERN.test(content)) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no source file imports @supabase/supabase-js or calls supabase.auth.*', () => {
    const offenders = [];
    for (const file of walk(SRC_DIR)) {
      const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/');
      if (ALLOWED_FILES.has(rel)) continue;
      const content = fs.readFileSync(file, 'utf-8');
      if (SUPABASE_IMPORT_PATTERN.test(content)) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('frontend/src/lib/db.js (the old direct-DB-access module) does not exist', () => {
    expect(fs.existsSync(path.join(SRC_DIR, 'lib/db.js'))).toBe(false);
  });

  it('frontend/src/lib/supabase.js (the old Supabase Auth session client) does not exist', () => {
    expect(fs.existsSync(path.join(SRC_DIR, 'lib/supabase.js'))).toBe(false);
  });

  it('@supabase/supabase-js is not a declared dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(FRONTEND_ROOT, 'package.json'), 'utf-8'));
    expect(pkg.dependencies?.['@supabase/supabase-js']).toBeUndefined();
    expect(pkg.devDependencies?.['@supabase/supabase-js']).toBeUndefined();
  });

  it('no source file stores an access/refresh token in localStorage or sessionStorage', () => {
    // Cookie-based auth means the frontend must never persist a session
    // token itself — httpOnly cookies are the only thing the browser holds.
    const TOKEN_STORAGE_PATTERN = /(local|session)Storage\.setItem\(\s*['"`][^'"`]*(access[_-]?token|refresh[_-]?token|jwt)/i;
    const offenders = [];
    for (const file of walk(SRC_DIR)) {
      const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/');
      if (ALLOWED_FILES.has(rel)) continue;
      const content = fs.readFileSync(file, 'utf-8');
      if (TOKEN_STORAGE_PATTERN.test(content)) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });
});
