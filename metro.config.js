/**
 * Metro Configuration for React Native
 * 
 * @format
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Increase timeout for slow networks/builds
config.server = config.server || {};
config.server.timeout = 120000; // 2 minutes

// Add additional asset extensions
config.resolver.assetExts.push('bin');

module.exports = config; 