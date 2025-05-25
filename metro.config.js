const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

// Add resolver configuration to handle Node.js modules
config.resolver = {
  ...config.resolver,
  alias: {
    // Polyfill Node.js modules for React Native
    crypto: "react-native-get-random-values",
    stream: "readable-stream",
    url: "react-native-url-polyfill",
  },
  // Ignore problematic WebSocket modules that cause bundling issues
  blockList: [/node_modules\/ws\/.*/],
}

module.exports = config
