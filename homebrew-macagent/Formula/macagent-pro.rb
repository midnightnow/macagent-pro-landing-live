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
