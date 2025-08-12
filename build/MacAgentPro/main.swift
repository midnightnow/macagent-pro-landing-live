#!/usr/bin/env swift

// main.swift - MacAgent Pro Main Application Entry Point
// Integrates all components into a functional macOS app
// Replaces the bash script launcher with compiled Swift binary

import Foundation
import Cocoa
import OSLog

@main
struct MacAgentProApp {
    static func main() {
        let app = NSApplication.shared
        let delegate = MacAgentAppDelegate()
        app.delegate = delegate
        
        // Enable logging
        let logger = OSLog(subsystem: "com.macagent.pro", category: "Main")
        os_log("🚀 MacAgent Pro launching with hardware-aware AI", log: logger, type: .info)
        
        // Run the application
        app.run()
    }
}

class MacAgentAppDelegate: NSObject, NSApplicationDelegate {
    
    private let logger = OSLog(subsystem: "com.macagent.pro", category: "AppDelegate")
    private var macAgentCore: MacAgentIntelligence?
    private var hardwareMonitor: MacAgentHardwareMonitor?
    private var performanceBenchmark: MacAgentPerformanceBenchmark?
    private var statusItem: NSStatusItem?
    private var onboardingWindow: OnboardingWindowController?
    private var voiceInput: MacAgentVoiceInput?
    private var voiceCommandHandler: MacAgentVoiceCommandHandler?
    
    // MARK: - App Lifecycle
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        os_log("🎯 MacAgent Pro application did finish launching", log: logger, type: .info)
        
        initializeComponents()
        setupMenuBarInterface()
        setupVoiceInput()
        checkFirstLaunch()
        startHardwareMonitoring()
        
        os_log("✅ MacAgent Pro fully initialized", log: logger, type: .info)
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        os_log("🔄 MacAgent Pro terminating", log: logger, type: .info)
        cleanupResources()
    }
    
    // MARK: - Component Initialization
    
    private func initializeComponents() {
        os_log("🔧 Initializing MacAgent components", log: logger, type: .info)
        
        // Initialize core intelligence engine
        macAgentCore = MacAgentIntelligence()
        
        // Initialize hardware monitoring
        hardwareMonitor = MacAgentHardwareMonitor()
        
        // Initialize performance benchmarking
        performanceBenchmark = MacAgentPerformanceBenchmark()
        
        // Log initial system intelligence capabilities
        if let core = macAgentCore {
            let scores = core.calculateIntelligenceScore()
            os_log("🧠 Intelligence Scores - Basic: %.1f%%, Pro: %.1f%%, Max: %.1f%%, Ultra: %.1f%%", 
                   log: logger, type: .info, 
                   scores.basic, scores.pro, scores.max, scores.ultra)
        }
    }
    
    private func setupMenuBarInterface() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        
        if let button = statusItem?.button {
            button.title = "🧠"
            button.toolTip = "MacAgent Pro - Hardware-Aware AI"
        }
        
        let menu = NSMenu()
        
        // System Status
        let statusMenuItem = NSMenuItem()
        statusMenuItem.title = "System Status"
        statusMenuItem.isEnabled = false
        menu.addItem(statusMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Thermal Status
        let thermalMenuItem = NSMenuItem(title: "Show Thermal Data", 
                                       action: #selector(showThermalData), 
                                       keyEquivalent: "")
        thermalMenuItem.target = self
        menu.addItem(thermalMenuItem)
        
        // Performance Benchmark
        let benchmarkMenuItem = NSMenuItem(title: "Run Performance Benchmark", 
                                         action: #selector(runBenchmark), 
                                         keyEquivalent: "")
        benchmarkMenuItem.target = self
        menu.addItem(benchmarkMenuItem)
        
        // Hardware Test
        let hardwareTestMenuItem = NSMenuItem(title: "Hardware Monitor Test", 
                                            action: #selector(runHardwareTest), 
                                            keyEquivalent: "")
        hardwareTestMenuItem.target = self
        menu.addItem(hardwareTestMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Voice Input Test
        let voiceTestMenuItem = NSMenuItem(title: "Test Voice Input", 
                                         action: #selector(testVoiceInput), 
                                         keyEquivalent: "")
        voiceTestMenuItem.target = self
        menu.addItem(voiceTestMenuItem)
        
        // Permissions
        let permissionsMenuItem = NSMenuItem(title: "Grant Permissions", 
                                           action: #selector(requestPermissions), 
                                           keyEquivalent: "")
        permissionsMenuItem.target = self
        menu.addItem(permissionsMenuItem)
        
        menu.addItem(NSMenuItem.separator())
        
        // Quit
        let quitMenuItem = NSMenuItem(title: "Quit MacAgent Pro", 
                                    action: #selector(quitApp), 
                                    keyEquivalent: "q")
        quitMenuItem.target = self
        menu.addItem(quitMenuItem)
        
        statusItem?.menu = menu
        
        os_log("📱 Menu bar interface configured", log: logger, type: .info)
    }
    
    // MARK: - Voice Input Setup
    
    private func setupVoiceInput() {
        if #available(macOS 10.15, *) {
            os_log("🎤 Setting up voice input system", log: logger, type: .info)
            
            // Initialize voice command handler
            voiceCommandHandler = MacAgentVoiceCommandHandler()
            
            // Initialize voice input with handler
            voiceInput = MacAgentVoiceInput()
            voiceInput?.delegate = voiceCommandHandler
            
            os_log("🎤 Voice input 'Hey MacAgent' ready!", log: logger, type: .info)
        } else {
            os_log("⚠️ Voice input requires macOS 10.15 or later", log: logger, type: .info)
        }
    }
    
    // MARK: - Menu Actions
    
    @objc private func showThermalData() {
        guard let monitor = hardwareMonitor else { return }
        
        let thermalData = monitor.getCurrentThermalData()
        
        var message = """
        MacAgent Pro - Thermal Intelligence
        
        Hardware Type: \(thermalData.hardwareType)
        Thermal State: \(thermalData.thermalState)
        Thermal Pressure: \(thermalData.thermalPressure)
        """
        
        if let cpuTemp = thermalData.cpuTemperature {
            message += "\nCPU Temperature: \(String(format: "%.1f", cpuTemp))°C"
        }
        
        if let gpuTemp = thermalData.gpuTemperature {
            message += "\nGPU Temperature: \(String(format: "%.1f", gpuTemp))°C"
        }
        
        if !thermalData.fanRPMs.isEmpty {
            message += "\n\nFan Speeds:"
            for (index, rpm) in thermalData.fanRPMs.enumerated() {
                message += "\n  Fan \(index): \(Int(rpm)) RPM"
            }
        }
        
        if let error = thermalData.errorMessage {
            message += "\n\nNote: \(error)"
        }
        
        showAlert(title: "Thermal Data", message: message)
    }
    
    @objc private func runBenchmark() {
        guard let benchmark = performanceBenchmark else { return }
        
        DispatchQueue.global(qos: .userInitiated).async {
            let results = benchmark.runComprehensiveBenchmark()
            let report = benchmark.generateBenchmarkReport(results)
            
            DispatchQueue.main.async {
                self.showAlert(title: "Performance Benchmark Results", message: report)
            }
        }
    }
    
    @objc private func runHardwareTest() {
        guard let monitor = hardwareMonitor else { return }
        
        let testReport = monitor.performHardwareTest()
        showAlert(title: "Hardware Monitor Test", message: testReport)
    }
    
    @objc private func testVoiceInput() {
        if #available(macOS 10.15, *) {
            guard let voiceInput = voiceInput else {
                showAlert(title: "Voice Input Not Available", 
                         message: "Voice input system not initialized. Please restart MacAgent Pro.")
                return
            }
            
            let message = """
            🎤 Voice Input Test
            
            Status: \(voiceInput.isListening ? "🟢 Listening" : "🔴 Not Listening")
            Authorized: \(voiceInput.isAuthorized ? "✅ Yes" : "❌ No")
            Last Command: "\(voiceInput.lastCommand.isEmpty ? "None" : voiceInput.lastCommand)"
            Confidence: \(String(format: "%.1f%%", voiceInput.confidence * 100))
            
            Try saying: "Hey MacAgent, check temperature"
            """
            
            showAlert(title: "Voice Input Status", message: message)
            
            // If not authorized, prompt for permissions
            if !voiceInput.isAuthorized {
                voiceInput.requestAuthorization()
            }
        } else {
            showAlert(title: "Voice Input Unavailable", 
                     message: "Voice input requires macOS 10.15 or later.")
        }
    }
    
    @objc private func requestPermissions() {
        guard let core = macAgentCore else { return }
        
        core.requestPermissions { granted in
            DispatchQueue.main.async {
                let message = granted ? 
                    "✅ Permissions granted! MacAgent Pro can now access full hardware intelligence." :
                    "⚠️ Some permissions were not granted. MacAgent Pro will work with reduced capabilities."
                
                self.showAlert(title: "Permissions Update", message: message)
                
                // Update menu bar status
                self.updateMenuBarStatus()
            }
        }
    }
    
    @objc private func quitApp() {
        NSApplication.shared.terminate(self)
    }
    
    // MARK: - First Launch and Onboarding
    
    private func checkFirstLaunch() {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, 
                                                in: .userDomainMask).first?
            .appendingPathComponent("MacAgent Pro")
        let firstLaunchFlag = appSupport?.appendingPathComponent(".first_launch_complete")
        
        if let flagURL = firstLaunchFlag, !FileManager.default.fileExists(atPath: flagURL.path) {
            os_log("🎉 First launch detected, showing onboarding", log: logger, type: .info)
            
            // Create app support directory
            do {
                try FileManager.default.createDirectory(at: appSupport!, 
                                                      withIntermediateDirectories: true)
                FileManager.default.createFile(atPath: flagURL.path, contents: nil)
            } catch {
                os_log("Failed to create first launch flag: %@", log: logger, type: .error, error.localizedDescription)
            }
            
            showOnboarding()
        }
    }
    
    private func showOnboarding() {
        let alert = NSAlert()
        alert.messageText = "Welcome to MacAgent Pro!"
        alert.informativeText = """
        🎯 Hardware-Aware AI for Mac
        
        MacAgent Pro uses advanced hardware monitoring to provide intelligent system insights:
        
        • Real-time thermal monitoring
        • Performance optimization
        • Permission-based intelligence scaling
        • 30-300x faster than manual diagnostics
        
        Ready to unlock your Mac's full potential?
        """
        alert.addButton(withTitle: "Get Started")
        alert.addButton(withTitle: "Skip Setup")
        
        if alert.runModal() == .alertFirstButtonReturn {
            requestPermissions()
        }
    }
    
    // MARK: - Hardware Monitoring
    
    private func startHardwareMonitoring() {
        guard let monitor = hardwareMonitor else { return }
        
        monitor.startThermalMonitoring { [weak self] thermalData in
            self?.handleThermalStateChange(thermalData)
        }
        
        os_log("🌡️ Hardware monitoring started", log: logger, type: .info)
    }
    
    private func handleThermalStateChange(_ thermalData: MacAgentHardwareMonitor.ThermalData) {
        os_log("🌡️ Thermal state: %@ (pressure: %d)", 
               log: logger, type: .info, 
               thermalData.thermalState, thermalData.thermalPressure)
        
        // Update menu bar to reflect thermal state
        updateMenuBarStatus()
        
        // Notify user if thermal state is concerning
        if thermalData.thermalState == "Critical" || thermalData.thermalPressure > 50 {
            DispatchQueue.main.async {
                self.showAlert(
                    title: "⚠️ High Thermal Activity",
                    message: "MacAgent Pro detected elevated thermal activity. Consider closing resource-intensive applications."
                )
            }
        }
    }
    
    private func updateMenuBarStatus() {
        guard let monitor = hardwareMonitor,
              let button = statusItem?.button else { return }
        
        let thermalData = monitor.getCurrentThermalData()
        
        switch thermalData.thermalState {
        case "Nominal":
            button.title = "🧠"
        case "Fair":
            button.title = "🟡"
        case "Serious":
            button.title = "🟠"
        case "Critical":
            button.title = "🔴"
        default:
            button.title = "🧠"
        }
        
        // Update tooltip with current temperature
        if let temp = thermalData.cpuTemperature {
            button.toolTip = "MacAgent Pro - CPU: \(String(format: "%.1f", temp))°C"
        } else {
            button.toolTip = "MacAgent Pro - Thermal State: \(thermalData.thermalState)"
        }
    }
    
    // MARK: - Utility Functions
    
    private func showAlert(title: String, message: String) {
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }
    
    private func cleanupResources() {
        hardwareMonitor?.stopThermalMonitoring()
        voiceInput?.stopListening()
        
        hardwareMonitor = nil
        macAgentCore = nil
        performanceBenchmark = nil
        voiceInput = nil
        voiceCommandHandler = nil
        
        os_log("🧹 Resources cleaned up", log: logger, type: .info)
    }
}

// MARK: - Onboarding Window Controller

class OnboardingWindowController: NSWindowController {
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        window?.title = "MacAgent Pro Setup"
        window?.setContentSize(NSSize(width: 600, height: 400))
        window?.center()
        
        setupOnboardingContent()
    }
    
    private func setupOnboardingContent() {
        // Simplified onboarding - in production would be more comprehensive
        let contentView = NSView()
        
        let titleLabel = NSTextField(labelWithString: "🎯 MacAgent Pro Setup")
        titleLabel.font = NSFont.boldSystemFont(ofSize: 24)
        titleLabel.frame = NSRect(x: 50, y: 320, width: 500, height: 40)
        contentView.addSubview(titleLabel)
        
        let descriptionLabel = NSTextField(labelWithString: """
        MacAgent Pro provides hardware-aware AI for your Mac.
        
        To unlock full capabilities, we need a few permissions:
        • Full Disk Access (for deep system analysis)
        • Accessibility (for automation features)
        • Screen Recording (for visual AI assistance)
        """)
        descriptionLabel.frame = NSRect(x: 50, y: 180, width: 500, height: 120)
        descriptionLabel.isEditable = false
        descriptionLabel.isBordered = false
        descriptionLabel.backgroundColor = NSColor.clear
        contentView.addSubview(descriptionLabel)
        
        let continueButton = NSButton(title: "Continue Setup", target: self, action: #selector(continueSetup))
        continueButton.frame = NSRect(x: 400, y: 50, width: 150, height: 32)
        contentView.addSubview(continueButton)
        
        let skipButton = NSButton(title: "Skip", target: self, action: #selector(skipSetup))
        skipButton.frame = NSRect(x: 320, y: 50, width: 70, height: 32)
        contentView.addSubview(skipButton)
        
        window?.contentView = contentView
    }
    
    @objc private func continueSetup() {
        // Open System Settings
        NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security")!)
        close()
    }
    
    @objc private func skipSetup() {
        close()
    }
}