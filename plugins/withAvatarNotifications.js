const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

/**
 * iOS setup for Communication Notifications (avatar in place of the app icon).
 *
 * Both pieces are required — without the entitlement iOS silently renders an
 * ordinary notification, which is the failure mode that makes this look like a
 * code bug when it is really a capability bug. Android needs nothing here;
 * MessagingStyle works without any manifest permission.
 */
module.exports = function withAvatarNotifications(config) {
  config = withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.usernotifications.communication'] = true;
    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    const existing = cfg.modResults.NSUserActivityTypes || [];
    if (!existing.includes('INSendMessageIntent')) {
      cfg.modResults.NSUserActivityTypes = [...existing, 'INSendMessageIntent'];
    }
    return cfg;
  });

  return config;
};
