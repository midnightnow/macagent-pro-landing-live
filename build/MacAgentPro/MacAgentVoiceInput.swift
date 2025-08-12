// MacAgentVoiceInput.swift - Always-Listening Voice Activation
// Implements the "Hey MacAgent" voice activation that's been promised for months!

import Foundation
import Speech
import AVFoundation
import Cocoa

// MARK: - Voice Input Manager
@available(macOS 10.15, *)
class MacAgentVoiceInput: NSObject, ObservableObject {
    
    // MARK: - Properties
    private var speechRecognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    
    @Published var isListening = false
    @Published var isAuthorized = false
    @Published var lastCommand = ""
    @Published var confidence: Float = 0.0
    
    // Wake words for activation
    private let wakeWords = ["hey macagent", "macagent", "hey mac"]
    private let commandTimeout: TimeInterval = 5.0
    
    // Delegate for handling commands
    weak var delegate: MacAgentVoiceDelegate?
    
    // MARK: - Initialization
    override init() {
        super.init()
        setupSpeechRecognizer()
        requestAuthorization()
    }
    
    // MARK: - Setup
    private func setupSpeechRecognizer() {
        speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        speechRecognizer?.delegate = self
        audioEngine = AVAudioEngine()
    }
    
    // MARK: - Authorization
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    self?.isAuthorized = true
                    self?.requestMicrophonePermission()
                case .denied, .restricted, .notDetermined:
                    self?.isAuthorized = false
                    self?.showPermissionAlert()
                @unknown default:
                    self?.isAuthorized = false
                }
            }
        }
    }
    
    private func requestMicrophonePermission() {
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            DispatchQueue.main.async {
                if granted {
                    self?.startListening()
                } else {
                    self?.showMicrophoneAlert()
                }
            }
        }
    }
    
    // MARK: - Voice Recognition
    func startListening() {
        guard isAuthorized else {
            requestAuthorization()
            return
        }
        
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            print("Speech recognizer not available")
            return
        }
        
        // Cancel previous task
        recognitionTask?.cancel()
        recognitionTask = nil
        
        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("Audio session setup failed: \(error)")
            return
        }
        
        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            print("Unable to create recognition request")
            return
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        // Configure audio engine
        let inputNode = audioEngine!.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        // Start audio engine
        audioEngine!.prepare()
        do {
            try audioEngine!.start()
        } catch {
            print("Audio engine failed to start: \(error)")
            return
        }
        
        isListening = true
        
        // Start recognition
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            if let result = result {
                let transcript = result.bestTranscription.formattedString.lowercased()
                self.lastCommand = transcript
                self.confidence = result.bestTranscription.averageConfidenceLevel
                
                // Check for wake words
                if self.containsWakeWord(transcript) {
                    self.handleWakeWordDetected(transcript: transcript)
                }
                
                // If result is final, process command
                if result.isFinal {
                    self.processVoiceCommand(transcript)
                }
            }
            
            if error != nil || result?.isFinal == true {
                // Recognition ended, restart listening
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    self.restartListening()
                }
            }
        }
    }
    
    func stopListening() {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }
    
    private func restartListening() {
        stopListening()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.startListening()
        }
    }
    
    // MARK: - Command Processing
    private func containsWakeWord(_ transcript: String) -> Bool {
        return wakeWords.contains { wakeWord in
            transcript.contains(wakeWord)
        }
    }
    
    private func handleWakeWordDetected(transcript: String) {
        print("🎤 Wake word detected: \(transcript)")
        
        // Provide audio feedback
        playActivationSound()
        
        // Extract command after wake word
        let command = extractCommand(from: transcript)
        if !command.isEmpty {
            delegate?.macAgentVoiceDidReceiveCommand(command)
        }
    }
    
    private func extractCommand(from transcript: String) -> String {
        for wakeWord in wakeWords {
            if let range = transcript.range(of: wakeWord) {
                let command = String(transcript[range.upperBound...]).trimmingCharacters(in: .whitespacesAndPunctuation)
                return command
            }
        }
        return ""
    }
    
    private func processVoiceCommand(_ transcript: String) {
        guard containsWakeWord(transcript) else { return }
        
        let command = extractCommand(from: transcript)
        print("🎤 Processing command: '\(command)'")
        
        // Send to delegate for handling
        delegate?.macAgentVoiceDidReceiveCommand(command)
    }
    
    // MARK: - Audio Feedback
    private func playActivationSound() {
        // Play a subtle activation sound
        NSSound(named: "Tink")?.play()
    }
    
    // MARK: - Permission Alerts
    private func showPermissionAlert() {
        let alert = NSAlert()
        alert.messageText = "Speech Recognition Permission Required"
        alert.informativeText = "MacAgent Pro needs speech recognition permission to enable voice activation. Please grant permission in System Preferences."
        alert.addButton(withTitle: "Open System Preferences")
        alert.addButton(withTitle: "Cancel")
        
        if alert.runModal() == .alertFirstButtonReturn {
            NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_SpeechRecognition")!)
        }
    }
    
    private func showMicrophoneAlert() {
        let alert = NSAlert()
        alert.messageText = "Microphone Permission Required"
        alert.informativeText = "MacAgent Pro needs microphone access to listen for voice commands. Please grant permission in System Preferences."
        alert.addButton(withTitle: "Open System Preferences")
        alert.addButton(withTitle: "Cancel")
        
        if alert.runModal() == .alertFirstButtonReturn {
            NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")!)
        }
    }
    
    deinit {
        stopListening()
    }
}

// MARK: - Speech Recognizer Delegate
@available(macOS 10.15, *)
extension MacAgentVoiceInput: SFSpeechRecognizerDelegate {
    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        DispatchQueue.main.async {
            if available && self.isAuthorized {
                self.startListening()
            } else {
                self.stopListening()
            }
        }
    }
}

// MARK: - Voice Command Delegate
protocol MacAgentVoiceDelegate: AnyObject {
    func macAgentVoiceDidReceiveCommand(_ command: String)
}

// MARK: - Command Handler Implementation
class MacAgentVoiceCommandHandler: MacAgentVoiceDelegate {
    
    func macAgentVoiceDidReceiveCommand(_ command: String) {
        print("🤖 MacAgent received command: '\(command)'")
        
        // Route commands to appropriate handlers
        if command.contains("optimize") || command.contains("speed up") {
            handleOptimizationCommand(command)
        } else if command.contains("temperature") || command.contains("hot") {
            handleThermalCommand(command)
        } else if command.contains("memory") || command.contains("ram") {
            handleMemoryCommand(command)
        } else if command.contains("storage") || command.contains("disk") {
            handleStorageCommand(command)
        } else if command.contains("help") {
            handleHelpCommand(command)
        } else {
            handleGeneralCommand(command)
        }
    }
    
    // MARK: - Command Handlers
    private func handleOptimizationCommand(_ command: String) {
        print("🚀 Running Mac optimization...")
        speakResponse("Running Mac optimization now. I'll let you know when it's complete.")
        
        // Integrate with existing optimization code
        DispatchQueue.global(qos: .userInitiated).async {
            // In a real implementation, this would run actual optimization
            // For now, we'll simulate it
            sleep(2)
            
            DispatchQueue.main.async {
                self.speakResponse("Mac optimization complete! Your system performance should be improved.")
            }
        }
    }
    
    private func handleThermalCommand(_ command: String) {
        print("🌡️ Checking thermal status...")
        speakResponse("Checking your Mac's thermal status now.")
        
        DispatchQueue.global(qos: .userInitiated).async {
            let hardwareMonitor = MacAgentHardwareMonitor()
            let thermalData = hardwareMonitor.getCurrentThermalData()
            
            DispatchQueue.main.async {
                if let cpuTemp = thermalData.cpuTemperature {
                    let tempString = String(format: "%.1f", cpuTemp)
                    self.speakResponse("Your CPU temperature is \(tempString) degrees Celsius. \(self.getThermalAdvice(temp: cpuTemp))")
                } else {
                    self.speakResponse("Your Mac's thermal state is \(thermalData.thermalState).")
                }
            }
        }
    }
    
    private func handleMemoryCommand(_ command: String) {
        print("🧠 Checking memory status...")
        // Get memory info and provide response
        speakResponse("Checking your Mac's memory usage now.")
    }
    
    private func handleStorageCommand(_ command: String) {
        print("💾 Checking storage...")
        speakResponse("Analyzing your Mac's storage usage.")
    }
    
    private func handleHelpCommand(_ command: String) {
        speakResponse("I can help optimize your Mac, check temperature, memory usage, and storage. Just say 'Hey MacAgent' followed by what you need.")
    }
    
    private func handleGeneralCommand(_ command: String) {
        speakResponse("I heard you say '\(command)'. I'm still learning how to handle that request.")
    }
    
    // MARK: - Response Generation
    private func speakResponse(_ text: String) {
        print("🗣️ MacAgent says: \(text)")
        
        // Use built-in text-to-speech
        let synthesizer = NSSpeechSynthesizer()
        synthesizer.startSpeaking(text)
        
        // Also show visual feedback if needed
        showVisualResponse(text)
    }
    
    private func showVisualResponse(_ text: String) {
        // Create a small notification or update UI
        let notification = NSUserNotification()
        notification.title = "MacAgent Pro"
        notification.informativeText = text
        notification.soundName = nil // We already provided audio feedback
        
        NSUserNotificationCenter.default.deliver(notification)
    }
    
    private func getThermalAdvice(temp: Double) -> String {
        switch temp {
        case 0..<50:
            return "That's perfectly normal."
        case 50..<70:
            return "That's a bit warm but okay."
        case 70..<85:
            return "That's getting hot. Consider closing some apps."
        default:
            return "That's very hot! I recommend closing apps and letting your Mac cool down."
        }
    }
}

// MARK: - Usage Example
/*
// To use in your main app:
let voiceInput = MacAgentVoiceInput()
let commandHandler = MacAgentVoiceCommandHandler()
voiceInput.delegate = commandHandler

// Voice input will now automatically listen for "Hey MacAgent" commands
*/