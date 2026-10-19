export interface RoleSeed {
  slug: string;
  name: string;
  description: string;
  requires2fa: boolean;
  /** Permission keys granted to this role (docs/RBAC.md §4). '*' = full access. */
  permissions: string[];
}

export const roleCatalog: RoleSeed[] = [
  {
    slug: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access; may manage roles and audit logs. 2FA required.',
    requires2fa: true,
    permissions: ['*'],
  },
  {
    slug: 'pastor',
    name: 'Pastor',
    description: 'Broad delegation set with oversight. 2FA required.',
    requires2fa: true,
    permissions: [
      'members.read',
      'events.read',
      'events.update',
      'locations.set_current',
      'sermons.create',
      'sermons.update',
      'sermons.delete',
      'leadership.manage',
      'reports.read_all',
      'audit.read',
    ],
  },
  {
    slug: 'group-leader',
    name: 'Group Leader',
    description: 'Scoped to assigned group(s).',
    requires2fa: false,
    permissions: ['members.read', 'groups.update', 'events.read'],
  },
  {
    slug: 'secretary',
    name: 'Secretary',
    description: 'Operational: events, member registration desk.',
    requires2fa: false,
    permissions: ['events.create', 'events.update', 'members.create', 'services.read'],
  },
  {
    slug: 'fellowship-leader',
    name: 'Fellowship Leader',
    description: 'Scoped to own fellowship.',
    requires2fa: false,
    permissions: ['fellowships.manage', 'members.read'],
  },
  {
    slug: 'member',
    name: 'Member',
    description: 'Portal self-service.',
    requires2fa: false,
    permissions: ['events.read', 'camp.read', 'giving.read', 'fellowships.read'],
  },
  {
    slug: 'first-timers-team',
    name: 'First-Timers Team',
    description: 'Manage first-timer intake and follow-up.',
    requires2fa: false,
    permissions: [
      'first_timers.read',
      'first_timers.assign',
      'first_timers.update',
      'first_timers.followup',
    ],
  },
  {
    slug: 'finance-officer',
    name: 'Finance Officer',
    description: 'Giving/finance scope; 2FA required.',
    requires2fa: true,
    permissions: [
      'giving.read',
      'giving.report',
      'giving.manage',
      'camp.payments.read',
      'reports.read_all',
    ],
  },
  {
    slug: 'camp-manager',
    name: 'Camp Manager',
    description: 'Full camp scope.',
    requires2fa: false,
    permissions: [
      'camp.read',
      'camp.create',
      'camp.update',
      'camp.delete',
      'camp.registration.read',
      'camp.registration.manage',
      'camp.accommodation.create',
      'camp.accommodation.update',
      'camp.accommodation.delete',
      'camp.transport.create',
      'camp.transport.update',
      'camp.transport.delete',
      'camp.checkin.manage',
      'camp.payments.read',
    ],
  },
  {
    slug: 'event-manager',
    name: 'Event Manager',
    description: 'Event scope.',
    requires2fa: false,
    permissions: ['events.read', 'events.create', 'events.update', 'events.delete', 'locations.read'],
  },
  {
    slug: 'media-admin',
    name: 'Media Administrator',
    description: 'Media and sermons.',
    requires2fa: false,
    permissions: ['media.upload', 'media.delete', 'sermons.create', 'sermons.update', 'sermons.delete'],
  },
  {
    slug: 'content-manager',
    name: 'Content Manager',
    description: 'Website content.',
    requires2fa: false,
    permissions: [
      'announcements.manage',
      'sermons.update',
      'history.manage',
      'leadership.manage',
      'settings.manage',
    ],
  },
];

export const churchPositionSeeds = [
  { name: 'Pastor', hierarchyLevel: 1 },
  { name: 'Group Leader', hierarchyLevel: 2 },
  { name: 'Secretary', hierarchyLevel: 3 },
  { name: 'Fellowship Leader', hierarchyLevel: 4 },
  { name: 'Member', hierarchyLevel: 5 },
];