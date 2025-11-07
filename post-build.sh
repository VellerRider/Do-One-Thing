#!/bin/bash

# Post-build script to copy blocked page and ensure structure is correct

echo "📦 Running post-build tasks..."

# Create blocked directory
mkdir -p dist/blocked

# Copy blocked page and script
cp src/blocked/index.html dist/blocked/index.html
cp src/blocked/blocked.js dist/blocked/blocked.js
echo "✅ Copied blocked page and script"

# Check if all required files exist
if [ -f "dist/background.js" ] && [ -f "dist/content.js" ] && [ -f "dist/src/popup/index.html" ]; then
    echo "✅ All core files present"
else
    echo "❌ Missing core files!"
    exit 1
fi

# Check manifest
if [ -f "dist/manifest.json" ]; then
    echo "✅ Manifest present"
else
    echo "❌ Manifest missing!"
    exit 1
fi

echo "🎉 Build complete and ready to load!"
echo ""
echo "📋 Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'dist' directory"
