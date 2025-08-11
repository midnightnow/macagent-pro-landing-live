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
