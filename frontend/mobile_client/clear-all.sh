#!/bin/bash
set -e

echo "🧹 Clearing all caches and rebuilding..."

# Kill all processes
echo "Stopping Metro bundler..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
pkill -f "cli.js start" 2>/dev/null || true

# Clear React Native caches
echo "Clearing React Native caches..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Clear Metro bundler cache
echo "Clearing Metro cache..."
rm -rf .expo
rm -rf .metro

# Clear watchman
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear Yarn cache for workspace packages
echo "Clearing Yarn workspace cache..."
cd /Users/dogyun/projects/ziririt-1
yarn install --force

echo "✅ All caches cleared!"
echo "Now restart Metro with: yarn start --reset-cache"
