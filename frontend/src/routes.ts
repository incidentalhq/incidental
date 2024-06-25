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

  INCIDENTS = '/incidents',
  SHOW_INCIDENT = '/incidents/:id',

  SLACK_INSTALL = '/slack/install',
  SLACK_INSTALL_COMPLETE = '/slack/install/complete'
}
