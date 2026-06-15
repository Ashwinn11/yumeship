const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withPhoneOnly(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$['android:requiresSmallestWidthDp'] = '320';
    manifest.$['android:compatibleWidthLimitDp'] = '600';
    return config;
  });
};
