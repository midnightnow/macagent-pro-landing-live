class MacagentPro < Formula
  desc "Hardware-conscious AI assistant with physics-limited <200ms latency"
  homepage "https://macagent.pro"
  url "https://github.com/macagent/macagent-pro/archive/v1.0.2.tar.gz"
  sha256 "0019dfc4b32d63c1392aa264aed2253c1e0c2fb09216f8e2cc269bbfb8bb49b5"
  version "1.0.2"

  depends_on "swift" => :build
  depends_on macos: :monterey

  def install
    # Build the Swift binary
    system "swift", "build", "--configuration", "release", "--arch", "arm64", "--arch", "x86_64"
    
    # Install the universal binary
    bin.install ".build/release/macagent-pro"
    
    # Install resources if they exist
    if Dir.exist?("Resources")
      prefix.install "Resources"
    end
    
    # Install documentation
    doc.install "README.md" if File.exist?("README.md")
    doc.install "LICENSE" if File.exist?("LICENSE")
    
    # Create config directory
    (var/"macagent-pro").mkpath
  end

  service do
    run [opt_bin/"macagent-pro", "--daemon"]
    keep_alive true
    log_path var/"log/macagent-pro.log"
    error_log_path var/"log/macagent-pro.log"
    working_dir var/"macagent-pro"
  end

  test do
    # Test the binary exists and responds
    assert_match "MacAgent Pro v1.0.2", shell_output("#{bin}/macagent-pro --version")
    
    # Test it can show help
    assert_match "Hardware-conscious AI", shell_output("#{bin}/macagent-pro --help")
    
    # Test basic functionality (non-interactive)
    assert_match "P95 latency", shell_output("#{bin}/macagent-pro --benchmark --no-audio 2>&1")
  end
end