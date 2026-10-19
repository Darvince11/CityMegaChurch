/**
 * The canonical permission catalog — the source of truth for the
 * `permissions` seed and for CI validation of every `RequirePermissions`
 * reference. Mirrors docs/RBAC.md §3 exactly.
 */
export interface PermissionSeed {
  key: string;
  name: string;
  module: string;
  description?: string;
}

export const permissionCatalog: PermissionSeed[] = [
  // members
  { key: 'members.read', name: 'Read members', module: 'members' },
  { key: 'members.create', name: 'Create members', module: 'members' },
  { key: 'members.update', name: 'Update members', module: 'members' },
  { key: 'members.delete', name: 'Delete members', module: 'members' },
  // events
  { key: 'events.read', name: 'Read events', module: 'events' },
  { key: 'events.create', name: 'Create events', module: 'events' },
  { key: 'events.update', name: 'Update events', module: 'events' },
  { key: 'events.delete', name: 'Delete events', module: 'events' },
  // locations
  { key: 'locations.read', name: 'Read locations', module: 'locations' },
  { key: 'locations.create', name: 'Create locations', module: 'locations' },
  { key: 'locations.update', name: 'Update locations', module: 'locations' },
  { key: 'locations.delete', name: 'Delete locations', module: 'locations' },
  { key: 'locations.set_current', name: 'Set current location', module: 'locations' },
  // services
  { key: 'services.read', name: 'Read services', module: 'services' },
  { key: 'services.create', name: 'Create services', module: 'services' },
  { key: 'services.update', name: 'Update services', module: 'services' },
  { key: 'services.delete', name: 'Delete services', module: 'services' },
  // church content
  { key: 'church.manage', name: 'Manage church info', module: 'church' },
  { key: 'history.manage', name: 'Manage history', module: 'church' },
  { key: 'leadership.manage', name: 'Manage leadership', module: 'church' },
  // camps
  { key: 'camp.read', name: 'Read camps', module: 'camps' },
  { key: 'camp.create', name: 'Create camps', module: 'camps' },
  { key: 'camp.update', name: 'Update camps', module: 'camps' },
  { key: 'camp.delete', name: 'Delete camps', module: 'camps' },
  { key: 'camp.registration.read', name: 'Read camp registrations', module: 'camps' },
  { key: 'camp.registration.manage', name: 'Manage camp registrations', module: 'camps' },
  { key: 'camp.accommodation.create', name: 'Create accommodation', module: 'camps' },
  { key: 'camp.accommodation.update', name: 'Update accommodation', module: 'camps' },
  { key: 'camp.accommodation.delete', name: 'Delete accommodation', module: 'camps' },
  { key: 'camp.transport.create', name: 'Create transport options', module: 'camps' },
  { key: 'camp.transport.update', name: 'Update transport options', module: 'camps' },
  { key: 'camp.transport.delete', name: 'Delete transport options', module: 'camps' },
  { key: 'camp.checkin.manage', name: 'Manage check-in', module: 'camps' },
  { key: 'camp.payments.read', name: 'Read camp payments', module: 'camps' },
  // first timers
  { key: 'first_timers.read', name: 'Read first-timers', module: 'first-timers' },
  { key: 'first_timers.assign', name: 'Assign first-timers', module: 'first-timers' },
  { key: 'first_timers.update', name: 'Update first-timers', module: 'first-timers' },
  { key: 'first_timers.followup', name: 'Record follow-ups', module: 'first-timers' },
  // sermons / announcements / media
  { key: 'sermons.create', name: 'Create sermons', module: 'sermons' },
  { key: 'sermons.update', name: 'Update sermons', module: 'sermons' },
  { key: 'sermons.delete', name: 'Delete sermons', module: 'sermons' },
  { key: 'announcements.manage', name: 'Manage announcements', module: 'announcements' },
  { key: 'media.upload', name: 'Upload media', module: 'media' },
  { key: 'media.delete', name: 'Delete media', module: 'media' },
  // groups & fellowships
  { key: 'groups.read', name: 'Read groups', module: 'groups' },
  { key: 'groups.create', name: 'Create groups', module: 'groups' },
  { key: 'groups.update', name: 'Update groups', module: 'groups' },
  { key: 'groups.delete', name: 'Delete groups', module: 'groups' },
  { key: 'fellowships.read', name: 'Read fellowships', module: 'fellowships' },
  { key: 'fellowships.manage', name: 'Manage fellowships', module: 'fellowships' },
  // giving
  { key: 'giving.read', name: 'Read giving', module: 'giving' },
  { key: 'giving.manage', name: 'Manage giving', module: 'giving' },
  { key: 'giving.report', name: 'Giving reports', module: 'giving' },
  { key: 'giving_categories.manage', name: 'Manage giving categories', module: 'giving' },
  // administration
  { key: 'users.manage', name: 'Manage users', module: 'administration' },
  { key: 'roles.manage', name: 'Manage roles', module: 'administration' },
  { key: 'permissions.manage', name: 'Manage permissions', module: 'administration' },
  { key: 'audit.read', name: 'Read audit logs', module: 'administration' },
  { key: 'settings.manage', name: 'Manage settings', module: 'administration' },
  { key: 'reports.read_all', name: 'Read all reports', module: 'administration' },
];