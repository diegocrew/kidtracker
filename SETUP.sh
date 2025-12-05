#!/bin/bash
# Run these commands to complete the React Native setup and build

cd /workspaces/kidtracker

# Install updated dependencies
npm install

# Generate placeholder assets (if needed later with icon/splash)
node generate-assets.js

# Commit the changes
git add -A
git commit -m "Fix Expo configuration and dependencies

- Simplify app.json to remove missing asset references
- Update all dependencies to match Expo SDK 54 requirements
- react-native-svg: 15.12.1
- typescript: 5.9.2
- Remove unused dev dependencies"

git push origin main

# Build the APK for testing
eas build --platform android --profile preview

# Or build for production
# eas build --platform android
