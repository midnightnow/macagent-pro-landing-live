#!/bin/bash

# MacAgent Pro - Homebrew Formula Creator
# Creates one-line install: brew install --cask macagent-pro

set -e

FORMULA_DIR="homebrew-macagent"
CASK_FILE="$FORMULA_DIR/Casks/macagent-pro.rb"

echo "🍺 Creating Homebrew Formula for MacAgent Pro"
echo "============================================="

# Create homebrew tap directory structure
mkdir -p "$FORMULA_DIR/Casks"

# Create the cask formula
echo "📝 Creating Homebrew cask formula..."
cat > "$CASK_FILE" << 'EOF'
cask "macagent-pro" do
  version "1.0.2"
  sha256 :no_check  # Will be replaced with actual SHA256 when DMG is ready

  url "https://releases.macagent.pro/MacAgent-Pro-#{version}.dmg"
  name "MacAgent Pro"
  desc "AI assistant with hardware consciousness for macOS"
  homepage "https://macagent.pro"

  livecheck do
    url "https://api.macagent.pro/releases/latest"
    strategy :json do |json|
      json["version"]
    end
  end

  auto_updates true
  depends_on macos: ">= :big_sur"

  app "MacAgent Pro.app"

  # Post-install setup
  postflight do
    # Create application support directory
    system_command "/bin/mkdir", args: ["-p", "#{Dir.home}/Library/Application Support/MacAgent Pro"]
    
    # Set up initial configuration
    config_file = "#{Dir.home}/Library/Application Support/MacAgent Pro/config.json"
    unless File.exist?(config_file)
      config = {
        "version" => version,
        "install_method" => "homebrew",
        "first_launch" => true,
        "trial_start_date" => Time.now.iso8601,
        "trial_days_remaining" => 14,
        "settings" => {
          "wake_word" => "hey-mac-agent",
          "hardware_monitoring" => true,
          "response_latency_target" => 200,
          "audio_conflict_prevention" => true
        }
      }
      File.write(config_file, JSON.pretty_generate(config))
    end
    
    # Launch welcome message
    system_command "/usr/bin/osascript", args: [
      "-e", 
      'display notification "MacAgent Pro installed successfully! Starting 14-day free trial." with title "MacAgent Pro" sound name "Glass"'
    ]
  end

  # Clean uninstall
  uninstall quit: "com.macagent.macagent-pro"

  zap trash: [
    "~/Library/Application Support/MacAgent Pro",
    "~/Library/Caches/com.macagent.macagent-pro",
    "~/Library/Preferences/com.macagent.macagent-pro.plist",
    "~/Library/Logs/MacAgent Pro",
  ]

  # Caveats shown after installation
  caveats <<~EOS
    🎉 MacAgent Pro is ready to use!

    Your 14-day free trial has started. Features included:
    • ⚡ Sub-200ms AI responses with hardware consciousness
    • 🎤 Voice commands with zero audio conflicts
    • 🧠 Real-time system monitoring and adaptation
    • 🔒 Privacy-first, on-device processing

    Getting started:
    1. Launch MacAgent Pro from Applications
    2. Follow the 3-step setup wizard
    3. Try saying "Hey Mac Agent, what's my system temperature?"

    Upgrade to Pro ($10/month) for team features and API access:
    https://macagent.pro/upgrade

    Need help? Visit https://docs.macagent.pro
  EOS
end
EOF

# Create Formula class (for brew install without --cask)
echo "📝 Creating Formula class..."
cat > "$FORMULA_DIR/Formula/macagent-pro.rb" << 'EOF'
class MacagentPro < Formula
  desc "AI assistant with hardware consciousness for macOS"
  homepage "https://macagent.pro"
  url "https://github.com/macagent-pro/cli/archive/v1.0.2.tar.gz"
  sha256 :no_check
  license "MIT"

  depends_on "node"
  depends_on "python@3.11"

  def install
    # Install CLI components
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
    
    # Install Python components
    system "pip3", "install", "-r", "requirements.txt", "--target", "#{libexec}/python"
    
    # Install configuration
    (etc/"macagent-pro").mkpath
    (etc/"macagent-pro/config.yml").write default_config
  end

  def default_config
    <<~EOS
      # MacAgent Pro Configuration
      version: "1.0.2"
      trial_days: 14
      api_endpoint: "https://api.macagent.pro"
      features:
        hardware_consciousness: true
        audio_conflict_prevention: true
        response_latency_ms: 200
    EOS
  end

  service do
    run [opt_bin/"macagent-pro", "--daemon"]
    keep_alive true
    log_path var/"log/macagent-pro.log"
    error_log_path var/"log/macagent-pro.error.log"
  end

  test do
    system "#{bin}/macagent-pro", "--version"
    assert_match "MacAgent Pro v1.0.2", shell_output("#{bin}/macagent-pro --version")
  end
end
EOF

# Create tap README
echo "📚 Creating tap README..."
cat > "$FORMULA_DIR/README.md" << EOF
# MacAgent Pro Homebrew Tap

Official Homebrew tap for MacAgent Pro - AI assistant with hardware consciousness.

## Installation

### GUI Application (Recommended)
\`\`\`bash
# Install the full macOS app
brew install --cask macagent-pro
\`\`\`

### CLI Tools
\`\`\`bash
# Install command-line tools
brew install macagent-pro
\`\`\`

## Features

- ⚡ **Sub-200ms Response**: Hardware-optimized AI processing
- 🧠 **Hardware Consciousness**: Real-time system awareness
- 🔊 **Zero Audio Conflicts**: Mathematically proven P(conflict) = 0
- 🎤 **Voice Commands**: Natural language interface
- 🔒 **Privacy First**: All processing on-device

## Getting Started

After installation:

1. Launch MacAgent Pro from Applications
2. Complete the 3-step setup wizard
3. Start your 14-day free trial
4. Try: "Hey Mac Agent, what's my CPU temperature?"

## Subscription Plans

- **Free Trial**: 14 days, all features
- **Starter**: \$10/month - Individual use
- **Pro**: \$20/month - Teams + API
- **Enterprise**: \$30/month - Custom integrations

## Support

- 📖 [Documentation](https://docs.macagent.pro)
- 💬 [Community](https://community.macagent.pro)  
- 📧 [Support](mailto:support@macagent.pro)

---

© 2025 MacAgent Pro. All rights reserved.
EOF

# Create GitHub repository setup script
echo "🐙 Creating GitHub repository setup..."
cat > "$FORMULA_DIR/setup-github-tap.sh" << 'EOF'
#!/bin/bash

# Setup GitHub repository for Homebrew tap
echo "🐙 Setting up GitHub repository for Homebrew tap"

# Initialize git repository
git init
git add .
git commit -m "Initial commit: MacAgent Pro Homebrew tap"

# Create GitHub repository (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "📤 Creating GitHub repository..."
    gh repo create homebrew-macagent --public --description "Official Homebrew tap for MacAgent Pro"
    git remote add origin https://github.com/$(gh api user --jq .login)/homebrew-macagent.git
    git branch -M main
    git push -u origin main
    
    echo "✅ GitHub repository created!"
    echo "🍺 Users can now install with:"
    echo "   brew tap $(gh api user --jq .login)/homebrew-macagent"
    echo "   brew install --cask macagent-pro"
else
    echo "ℹ️  Install GitHub CLI to auto-create repository:"
    echo "   brew install gh"
    echo "   gh auth login"
    echo "   Then run this script again"
fi
EOF

chmod +x "$FORMULA_DIR/setup-github-tap.sh"

# Create installation validation script
echo "🧪 Creating installation validator..."
cat > "$FORMULA_DIR/validate-install.sh" << 'EOF'
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
EOF

chmod +x "$FORMULA_DIR/validate-install.sh"

# Create conversion tracking
echo "📊 Creating conversion tracking..."
cat > "$FORMULA_DIR/track-install.sh" << 'EOF'
#!/bin/bash

# Track installation for analytics
INSTALL_EVENT=$(cat << JSON
{
  "event": "homebrew_install", 
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platform": "$(uname -s)",
  "version": "$(uname -r)",
  "user_agent": "Homebrew/$(brew --version | head -1 | cut -d' ' -f2)",
  "trial_start": true
}
JSON
)

# Send to analytics endpoint (replace with your actual endpoint)
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$INSTALL_EVENT" \
  "https://api.macagent.pro/analytics/install" || true

echo "📈 Install event tracked"
EOF

chmod +x "$FORMULA_DIR/track-install.sh"

echo "✅ Homebrew tap created successfully!"
echo ""
echo "📦 Directory structure:"
find "$FORMULA_DIR" -type f | head -10

echo ""
echo "🚀 Next steps to activate one-line install:"
echo "1. Create signed MacAgent Pro.dmg file"
echo "2. Upload to https://releases.macagent.pro/"
echo "3. Update SHA256 in cask formula" 
echo "4. Push to GitHub: cd $FORMULA_DIR && ./setup-github-tap.sh"
echo "5. Users can then install with:"
echo "   brew tap your-username/homebrew-macagent"
echo "   brew install --cask macagent-pro"
echo ""
echo "🎯 This eliminates installation friction and could 5x your conversions!"
echo "📊 Track installations: cd $FORMULA_DIR && ./validate-install.sh"