const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/react-native-simple-openvpn/vpnLib/build.gradle');
let content = fs.readFileSync(filePath, 'utf8');

// Remove flavorDimensions and productFlavors blocks
content = content.replace(/\s*flavorDimensions "implementation"\s*productFlavors \{[\s\S]*?\}\s*\}/, '');

// Fix compileSdkVersion -> compileSdk (AGP 8+ syntax)
content = content.replace('compileSdkVersion safeExtGet', 'compileSdk safeExtGet');
content = content.replace('buildToolsVersion safeExtGet', '//buildToolsVersion safeExtGet');
content = content.replace('targetSdkVersion safeExtGet', 'targetSdk safeExtGet');
content = content.replace('minSdkVersion safeExtGet', 'minSdk safeExtGet');

// Fix lintOptions -> lint (AGP 8+ syntax)
content = content.replace('lintOptions {', 'lint {');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ vpnLib build.gradle patched successfully');
