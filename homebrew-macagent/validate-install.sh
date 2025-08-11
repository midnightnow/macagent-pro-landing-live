#!/bin/bash

# Validate MacAgent Pro installation
echo "🔍 Validating MacAgent Pro installation..."

# Check if app is installed
if [ -d "/Applications/MacAgent Pro.app" ]; then
    echo "✅ MacAgent Pro.app found in Applications"
else
    echo "❌ MacAgent Pro.app not found in Applications"
    exit 1
fi

# Check if configuration exists
if [ -f "$HOME/Library/Application Support/MacAgent Pro/config.json" ]; then
    echo "✅ Configuration file exists"
    cat "$HOME/Library/Application Support/MacAgent Pro/config.json" | jq .version
else
    echo "❌ Configuration file missing"
fi

# Test app launch (briefly)
echo "🚀 Testing app launch..."
timeout 5s open "/Applications/MacAgent Pro.app" && echo "✅ App launches successfully"

echo "🎯 Installation validation complete!"
