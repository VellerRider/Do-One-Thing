#!/bin/bash

# Package script for Chrome Web Store submission

echo "📦 Packaging DoOneThing for Chrome Web Store..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Run 'npm run build' first."
    exit 1
fi

# Remove old zip if exists
if [ -f "do-one-thing.zip" ]; then
    rm do-one-thing.zip
    echo "🗑️  Removed old package"
fi

# Create zip file
cd dist
zip -r ../do-one-thing.zip . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

# Check if zip was created successfully
if [ -f "do-one-thing.zip" ]; then
    SIZE=$(du -h do-one-thing.zip | cut -f1)
    echo "✅ Package created successfully!"
    echo "📦 File: do-one-thing.zip"
    echo "📏 Size: $SIZE"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Go to https://chrome.google.com/webstore/devconsole"
    echo "2. Click 'New Item'"
    echo "3. Upload do-one-thing.zip"
    echo ""
    echo "📖 See PUBLISH_GUIDE.md for detailed instructions"
else
    echo "❌ Failed to create package"
    exit 1
fi
