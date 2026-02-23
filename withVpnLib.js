const { withSettingsGradle } = require('@expo/config-plugins');

module.exports = function withVpnLib(config) {
  return withSettingsGradle(config, (config) => {
    const contents = config.modResults.contents;
    const include = "\ninclude ':vpnLib'\nproject(':vpnLib').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-simple-openvpn/vpnLib')\n";
    if (contents.indexOf(':vpnLib') === -1) {
      config.modResults.contents = contents + include;
    }
    return config;
  });
};