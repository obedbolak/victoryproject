const { withSettingsGradle } = require('@expo/config-plugins');

module.exports = function withVpnLib(config) {
  return withSettingsGradle(config, (config) => {
    const contents = config.modResults.contents;
    const include = `
include ':vpnLib'
project(':vpnLib').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-simple-openvpn/vpnLib')
`;
      config.modResults.contents = contents + include;
    }
    return config;
  });
};
