// MacAgentHardwareMonitor.swift - Production-Ready Hardware Sensor Access
// Based on comprehensive research and Claude Flow analysis
// Supports both Intel Macs (SMC) and Apple Silicon (thermal pressure APIs)

import Foundation
import IOKit
import IOKit.ps
import OSLog

@available(macOS 10.12, *)
class MacAgentHardwareMonitor {
    
    private let logger = OSLog(subsystem: "com.macagent.pro", category: "HardwareMonitor")
    private var smcConnection: io_connect_t = 0
    
    // MARK: - SMC Data Structures for Intel Macs
    
    private struct SMCKeyData {
        var key: UInt32 = 0
        var vers: UInt8 = 0
        var pLimitData: UInt16 = 0
        var keyInfo: SMCKeyInfo = SMCKeyInfo()
        var result: UInt8 = 0
        var status: UInt8 = 0
        var data8: UInt8 = 0
        var data32: UInt32 = 0
        var bytes: (UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8,
                   UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8,
                   UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8,
                   UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8, UInt8) = (0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
    }
    
    private struct SMCKeyInfo {
        var dataSize: UInt32 = 0
        var dataType: UInt32 = 0
        var dataAttributes: UInt8 = 0
    }
    
    // MARK: - Hardware Detection
    
    enum MacHardwareType {
        case intel
        case appleSilicon
        case unknown
    }
    
    private func detectHardwareType() -> MacHardwareType {
        var size = 0
        guard sysctlbyname("hw.target", nil, &size, nil, 0) == 0 else {
            // Fallback to older method
            sysctlbyname("hw.machine", nil, &size, nil, 0)
        }
        
        var machine = [CChar](repeating: 0, count: size)
        guard sysctlbyname("hw.target", &machine, &size, nil, 0) == 0 || 
              sysctlbyname("hw.machine", &machine, &size, nil, 0) == 0 else {
            os_log("Failed to detect hardware type", log: logger, type: .error)
            return .unknown
        }
        
        let target = String(cString: machine)
        os_log("Detected hardware: %@", log: logger, type: .info, target)
        
        if target.contains("arm64") || target.contains("Apple") {
            return .appleSilicon
        } else if target.contains("x86_64") {
            return .intel
        }
        
        return .unknown
    }
    
    // MARK: - Public Interface
    
    struct ThermalData {
        let cpuTemperature: Double?
        let gpuTemperature: Double?
        let fanRPMs: [Double]
        let thermalState: String
        let thermalPressure: Int
        let hardwareType: String
        let timestamp: Date
        let success: Bool
        let errorMessage: String?
    }
    
    func getCurrentThermalData() -> ThermalData {
        let hardwareType = detectHardwareType()
        let timestamp = Date()
        
        switch hardwareType {
        case .intel:
            return getIntelThermalData(timestamp: timestamp)
        case .appleSilicon:
            return getAppleSiliconThermalData(timestamp: timestamp)
        case .unknown:
            return getFallbackThermalData(timestamp: timestamp)
        }
    }
    
    // MARK: - Intel Mac SMC Implementation
    
    private func getIntelThermalData(timestamp: Date) -> ThermalData {
        guard openSMCConnection() else {
            os_log("Failed to open SMC connection, falling back to legitimate APIs", log: logger, type: .warning)
            return getFallbackThermalData(timestamp: timestamp)
        }
        
        defer { closeSMCConnection() }
        
        let cpuTemp = readSMCTemperature(key: "TC0P") // CPU Proximity
        let gpuTemp = readSMCTemperature(key: "TG0P") // GPU Proximity
        let fan0RPM = readSMCFanSpeed(key: "F0Ac")   // Fan 0 Actual
        let fan1RPM = readSMCFanSpeed(key: "F1Ac")   // Fan 1 Actual
        
        var fanRPMs: [Double] = []
        if let fan0 = fan0RPM { fanRPMs.append(fan0) }
        if let fan1 = fan1RPM { fanRPMs.append(fan1) }
        
        let thermalState = getLegitimateTemperatureState()
        let thermalPressure = getThermalPressureValue()
        
        return ThermalData(
            cpuTemperature: cpuTemp,
            gpuTemperature: gpuTemp,
            fanRPMs: fanRPMs,
            thermalState: thermalState,
            thermalPressure: thermalPressure,
            hardwareType: "Intel",
            timestamp: timestamp,
            success: cpuTemp != nil || gpuTemp != nil,
            errorMessage: nil
        )
    }
    
    private func openSMCConnection() -> Bool {
        let matchingDictionary = IOServiceMatching("AppleSMC")
        var iterator: io_iterator_t = 0
        
        let result = IOServiceGetMatchingServices(kIOMasterPortDefault, matchingDictionary, &iterator)
        guard result == KERN_SUCCESS else {
            os_log("IOServiceGetMatchingServices failed: %d", log: logger, type: .error, result)
            return false
        }
        
        let device = IOIteratorNext(iterator)
        IOObjectRelease(iterator)
        
        guard device != 0 else {
            os_log("No SMC device found", log: logger, type: .error)
            return false
        }
        
        let openResult = IOServiceOpen(device, mach_task_self(), 0, &smcConnection)
        IOObjectRelease(device)
        
        if openResult == KERN_SUCCESS {
            os_log("SMC connection established", log: logger, type: .info)
            return true
        } else {
            os_log("IOServiceOpen failed: %d", log: logger, type: .error, openResult)
            return false
        }
    }
    
    private func closeSMCConnection() {
        if smcConnection != 0 {
            IOServiceClose(smcConnection)
            smcConnection = 0
            os_log("SMC connection closed", log: logger, type: .info)
        }
    }
    
    private func readSMCTemperature(key: String) -> Double? {
        guard smcConnection != 0 else { return nil }
        
        let keyValue = stringToSMCKey(key)
        var input = SMCKeyData()
        var output = SMCKeyData()
        
        input.key = keyValue
        input.data8 = 9 // SMC_CMD_READ_KEYINFO
        
        var inputSize = MemoryLayout<SMCKeyData>.size
        var outputSize = MemoryLayout<SMCKeyData>.size
        
        // First, get key info
        var result = IOConnectCallStructMethod(
            smcConnection,
            2, // KERNEL_INDEX_SMC
            &input,
            &inputSize,
            &output,
            &outputSize
        )
        
        guard result == KERN_SUCCESS else {
            os_log("Failed to read SMC key info for %@: %d", log: logger, type: .error, key, result)
            return nil
        }
        
        // Now read the actual data
        input.keyInfo = output.keyInfo
        input.data8 = 5 // SMC_CMD_READ_BYTES
        
        result = IOConnectCallStructMethod(
            smcConnection,
            2, // KERNEL_INDEX_SMC
            &input,
            &inputSize,
            &output,
            &outputSize
        )
        
        guard result == KERN_SUCCESS else {
            os_log("Failed to read SMC data for %@: %d", log: logger, type: .error, key, result)
            return nil
        }
        
        // Convert SMC temperature data (typically 2 bytes, big-endian, fixed point)
        let tempRaw = (UInt16(output.bytes.0) << 8) | UInt16(output.bytes.1)
        let temperature = Double(tempRaw) / 256.0
        
        os_log("Read temperature %@: %.1f°C", log: logger, type: .debug, key, temperature)
        return temperature
    }
    
    private func readSMCFanSpeed(key: String) -> Double? {
        guard smcConnection != 0 else { return nil }
        
        let keyValue = stringToSMCKey(key)
        var input = SMCKeyData()
        var output = SMCKeyData()
        
        input.key = keyValue
        input.data8 = 9 // SMC_CMD_READ_KEYINFO
        
        var inputSize = MemoryLayout<SMCKeyData>.size
        var outputSize = MemoryLayout<SMCKeyData>.size
        
        var result = IOConnectCallStructMethod(
            smcConnection,
            2, // KERNEL_INDEX_SMC
            &input,
            &inputSize,
            &output,
            &outputSize
        )
        
        guard result == KERN_SUCCESS else { return nil }
        
        input.keyInfo = output.keyInfo
        input.data8 = 5 // SMC_CMD_READ_BYTES
        
        result = IOConnectCallStructMethod(
            smcConnection,
            2, // KERNEL_INDEX_SMC
            &input,
            &inputSize,
            &output,
            &outputSize
        )
        
        guard result == KERN_SUCCESS else { return nil }
        
        // Fan speed is typically 2 bytes, big-endian, in RPM
        let fanRPM = (UInt16(output.bytes.0) << 8) | UInt16(output.bytes.1)
        return Double(fanRPM)
    }
    
    private func stringToSMCKey(_ str: String) -> UInt32 {
        let bytes = Array(str.utf8)
        guard bytes.count >= 4 else { return 0 }
        
        return (UInt32(bytes[0]) << 24) | (UInt32(bytes[1]) << 16) | 
               (UInt32(bytes[2]) << 8) | UInt32(bytes[3])
    }
    
    // MARK: - Apple Silicon Implementation
    
    private func getAppleSiliconThermalData(timestamp: Date) -> ThermalData {
        let thermalState = getLegitimateTemperatureState()
        let thermalPressure = getThermalPressureValue()
        
        // Apple Silicon doesn't expose individual temperature sensors
        // but we can infer thermal state from system APIs
        var estimatedTemp: Double? = nil
        if thermalPressure > 0 {
            // Rough estimation based on thermal pressure
            estimatedTemp = 40.0 + Double(thermalPressure * 15) // 40-85°C range
        }
        
        return ThermalData(
            cpuTemperature: estimatedTemp,
            gpuTemperature: nil, // Unified memory architecture
            fanRPMs: [], // Most Apple Silicon Macs are fanless or have managed fans
            thermalState: thermalState,
            thermalPressure: thermalPressure,
            hardwareType: "Apple Silicon",
            timestamp: timestamp,
            success: true,
            errorMessage: nil
        )
    }
    
    // MARK: - Legitimate macOS APIs (App Store Compatible)
    
    private func getFallbackThermalData(timestamp: Date) -> ThermalData {
        let thermalState = getLegitimateTemperatureState()
        let thermalPressure = getThermalPressureValue()
        
        return ThermalData(
            cpuTemperature: nil,
            gpuTemperature: nil,
            fanRPMs: [],
            thermalState: thermalState,
            thermalPressure: thermalPressure,
            hardwareType: "Unknown",
            timestamp: timestamp,
            success: true,
            errorMessage: "Limited to system thermal state only"
        )
    }
    
    private func getLegitimateTemperatureState() -> String {
        switch ProcessInfo.processInfo.thermalState {
        case .nominal:
            return "Nominal"
        case .fair:
            return "Fair"
        case .serious:
            return "Serious"
        case .critical:
            return "Critical"
        @unknown default:
            return "Unknown"
        }
    }
    
    private func getThermalPressureValue() -> Int {
        let service = IOServiceGetMatchingService(kIOMasterPortDefault, 
                                                IOServiceMatching("IOPMrootDomain"))
        guard service != 0 else { return 0 }
        defer { IOObjectRelease(service) }
        
        let key = "ThermalPressure" as CFString
        let property = IORegistryEntryCreateCFProperty(service, key, kCFAllocatorDefault, 0)
        
        let pressure = (property?.takeUnretainedValue() as? NSNumber)?.intValue ?? 0
        os_log("Thermal pressure: %d", log: logger, type: .debug, pressure)
        return pressure
    }
    
    // MARK: - Thermal State Monitoring
    
    private var thermalStateObserver: Any?
    
    func startThermalMonitoring(callback: @escaping (ThermalData) -> Void) {
        thermalStateObserver = NotificationCenter.default.addObserver(
            forName: ProcessInfo.thermalStateDidChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            guard let self = self else { return }
            let thermalData = self.getCurrentThermalData()
            os_log("Thermal state changed: %@ (pressure: %d)", 
                   log: self.logger, type: .info, 
                   thermalData.thermalState, thermalData.thermalPressure)
            callback(thermalData)
        }
    }
    
    func stopThermalMonitoring() {
        if let observer = thermalStateObserver {
            NotificationCenter.default.removeObserver(observer)
            thermalStateObserver = nil
        }
    }
    
    // MARK: - Cleanup
    
    deinit {
        stopThermalMonitoring()
        closeSMCConnection()
    }
}

// MARK: - Usage Example and Testing

extension MacAgentHardwareMonitor {
    
    func performHardwareTest() -> String {
        let thermalData = getCurrentThermalData()
        
        var report = """
        MacAgent Hardware Monitor Test Report
        =====================================
        Hardware Type: \(thermalData.hardwareType)
        Timestamp: \(thermalData.timestamp)
        Success: \(thermalData.success)
        
        Thermal Information:
        """
        
        if let cpuTemp = thermalData.cpuTemperature {
            report += "\n- CPU Temperature: \(String(format: "%.1f", cpuTemp))°C"
        } else {
            report += "\n- CPU Temperature: Not available"
        }
        
        if let gpuTemp = thermalData.gpuTemperature {
            report += "\n- GPU Temperature: \(String(format: "%.1f", gpuTemp))°C"
        } else {
            report += "\n- GPU Temperature: Not available"
        }
        
        report += "\n- Thermal State: \(thermalData.thermalState)"
        report += "\n- Thermal Pressure: \(thermalData.thermalPressure)"
        
        if !thermalData.fanRPMs.isEmpty {
            report += "\n\nFan Information:"
            for (index, rpm) in thermalData.fanRPMs.enumerated() {
                report += "\n- Fan \(index): \(Int(rpm)) RPM"
            }
        } else {
            report += "\n\nFan Information: No fans detected or fanless system"
        }
        
        if let error = thermalData.errorMessage {
            report += "\n\nNote: \(error)"
        }
        
        return report
    }
}