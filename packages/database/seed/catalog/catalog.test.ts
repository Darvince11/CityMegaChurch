import { describe, expect, it } from 'vitest';
import { permissionCatalog, roleCatalog } from './index';

describe('seed authorization catalog', () => {
  it('has unique permission keys and no dangling role grants', () => {
    const keys = new Set(permissionCatalog.map((permission) => permission.key));
    expect(keys.size).toBe(permissionCatalog.length);
    for (const role of roleCatalog) {
      for (const permission of role.permissions) {
        expect(permission === '*' || keys.has(permission)).toBe(true);
      }
    }
  });
  it('never grants wildcard access to new members', () => {
    const member = roleCatalog.find((role) => role.slug === 'member');
    expect(member).toBeDefined();
    expect(member?.permissions).not.toContain('*');
  });
});
