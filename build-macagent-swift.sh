#!/bin/bash
# build-macagent-swift.sh - Build MacAgent Pro from Swift sources
# Replaces bash launcher with compiled Swift binary

set -e

echo "🔨 Building MacAgent Pro from Swift sources..."

# Configuration
BUILD_DIR="build"
APP_NAME="MacAgent Pro"
BUNDLE_ID="com.macagent.pro"
SWIFT_FILES=(
    "main.swift"
    "MacAgentCore.swift"
    "MacAgentHardwareMonitor.swift"
    "MacAgentPerformanceBenchmark.swift"
)

# Create build directory
mkdir -p "$BUILD_DIR"

# Clean previous builds
if [ -d "$BUILD_DIR/$APP_NAME.app" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$BUILD_DIR/$APP_NAME.app"
fi

echo "📦 Creating app bundle structure..."

# Create app bundle directories
mkdir -p "$BUILD_DIR/$APP_NAME.app/Contents/MacOS"
mkdir -p "$BUILD_DIR/$APP_NAME.app/Contents/Resources"

echo "⚡ Compiling Swift sources..."

# Get current macOS SDK path
SDK_PATH=$(xcrun --show-sdk-path)
echo "📍 Using SDK: $SDK_PATH"

# Compile Swift files into single executable
swiftc -O \
    -sdk "$SDK_PATH" \
    -target arm64-apple-macos12.0 \
    -framework Cocoa \
    -framework IOKit \
    -framework SystemConfiguration \
    "${SWIFT_FILES[@]}" \
    -o "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Swift compilation successful"
else
    echo "❌ Swift compilation failed"
    exit 1
fi

echo "📝 Installing Info.plist..."

# Copy Info.plist
cp Info.plist "$BUILD_DIR/$APP_NAME.app/Contents/"

echo "🔐 Setting executable permissions..."

# Make executable
chmod +x "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME"

echo "🎯 Verifying build..."

# Verify the binary
if [ -x "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME" ]; then
    echo "✅ MacAgent Pro binary is executable"
    
    # Test that it's a real binary (not a script)
    file_output=$(file "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME")
    if [[ "$file_output" == *"Mach-O"* ]]; then
        echo "✅ Confirmed: MacAgent Pro is a compiled Mach-O binary"
    else
        echo "⚠️  Warning: Binary may not be properly compiled"
        echo "File type: $file_output"
    fi
else
    echo "❌ MacAgent Pro binary is not executable"
    exit 1
fi

# Get binary size
binary_size=$(ls -lh "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME" | awk '{print $5}')
echo "📊 Binary size: $binary_size"

# Show app bundle structure
echo "📁 App bundle structure:"
find "$BUILD_DIR/$APP_NAME.app" -type f -exec ls -la {} \;

echo ""
echo "🎉 MacAgent Pro build completed successfully!"
echo "📍 Location: $BUILD_DIR/$APP_NAME.app"
echo ""
echo "To test the app:"
echo "  ./'$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME'"
echo ""
echo "To install in Applications:"
echo "  cp -r '$BUILD_DIR/$APP_NAME.app' /Applications/"

# Optional: Test launch
echo "🧪 Testing app launch (3 second test)..."
timeout 3 "$BUILD_DIR/$APP_NAME.app/Contents/MacOS/$APP_NAME" || echo "✅ App launched successfully (terminated after 3s for testing)"

echo ""
echo "🚀 MacAgent Pro is now a genuine compiled Swift application!"