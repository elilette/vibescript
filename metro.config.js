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
  // Disable package exports to fix Supabase WebSocket issues
  unstable_enablePackageExports: false,
}

module.exports = config
