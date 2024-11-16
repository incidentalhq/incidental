export enum RoutePaths {
  DASHBOARD = '/',
  REGISTER = '/register',
  REGISTER_SUCCESS = '/register/success',
  OAUTH_COMPLETE = '/oauth/complete',
  LOGIN = '/login',
  EMAIL_LOGIN = '/login/email',
  SLACK_LOGIN = '/login/slack',

  SETTINGS_INDEX = '/:organisation/settings',
  SETTINGS_SEVERITY = '/:organisation/settings/severity',
  SETTINGS_TIMESTAMPS = '/:organisation/settings/timestamps',
  SETTINGS_SLACK = '/:organisation/settings/slack',
  SETTINGS_ROLES = '/:organisation/settings/roles',
  SETTINGS_FIELDS = '/:organisation/settings/fields',
  SETTINGS_TYPES = '/:organisation/settings/types',
  SETTINGS_STATUSES = '/:organisation/settings/statuses',

  SETTINGS_FORMS_INDEX = '/:organisation/settings/forms',
  SETTINGS_FORMS_EDIT = '/:organisation/settings/forms/:id',

  SETTINGS_USERS = '/:organisation/settings/users',

  INCIDENTS = '/incidents',
  SHOW_INCIDENT = '/incidents/:id',

  STATUS_PAGES_LIST = '/status-pages',
  STATUS_PAGE_SHOW = '/status-pages/:id',
  STATUS_PAGE_ALL_INCIDENTS = '/status-pages/:id/all-incidents',
  STATUS_PAGE_SHOW_INCIDENT = '/status-pages/:id/incident/:incidentId',

  SLACK_INSTALL = '/slack/install',
  SLACK_INSTALL_COMPLETE = '/slack/install/complete',

  VERIFY_ACCOUNT = '/verify',
  VERIFY_SEND_CODE = '/verify/send'
}
