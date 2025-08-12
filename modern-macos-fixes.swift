// RED ZEN FIXES: Modern macOS Implementation
// Addresses deprecated APIs and TCC permission requirements

import Foundation
import Cocoa
import UserNotifications  // RED ZEN FIX: Modern notifications
import ServiceManagement   // For privileged operations
import OSLog               // Modern logging
import IOKit

// MARK: - Modern Notification System
class ModernNotificationManager: NSObject, UNUserNotificationCenterDelegate {
    
    override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
        requestPermission()
    }
    
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge, .provisional]
        ) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    os_log("✅ Notification permission granted", type: .info)
                } else {
                    os_log("❌ Notification permission denied: %@", 
                           type: .error, error?.localizedDescription ?? "Unknown")
                }
            }
        }
    }
    
    func showHealthAlert(healthScore: Int, criticalIssues: [String]) {
        let content = UNMutableNotificationContent()
        content.title = "Mac Health Alert"
        content.subtitle = "Health Score: \(healthScore)%"
        
        if healthScore < 50 {
            content.body = "Critical issues found. Click to optimize."
            content.sound = .defaultCritical
        } else {
            content.body = "Maintenance recommended."
            content.sound = .default
        }
        
        // Add custom data
        content.userInfo = [
            "healthScore": healthScore,
            "issueCount": criticalIssues.count,
            "action": "optimize"
        ]
        
        // Action buttons
        let optimizeAction = UNNotificationAction(
            identifier: "OPTIMIZE_NOW",
            title: "Optimize Now",
            options: [.foreground]
        )
        
        let laterAction = UNNotificationAction(
            identifier: "REMIND_LATER", 
            title: "Remind Later",
            options: []
        )
        
        let category = UNNotificationCategory(
            identifier: "MAC_HEALTH",
            actions: [optimizeAction, laterAction],
            intentIdentifiers: [],
            hiddenPreviewsBodyPlaceholder: "Mac optimization alert",
            options: [.customDismissAction]
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([category])
        content.categoryIdentifier = "MAC_HEALTH"
        
        let request = UNNotificationRequest(
            identifier: "health_alert_\(Date().timeIntervalSince1970)",
            content: content,
            trigger: nil
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // Handle notification responses
    func userNotificationCenter(_ center: UNUserNotificationCenter, 
                              didReceive response: UNNotificationResponse,
                              withCompletionHandler completionHandler: @escaping () -> Void) {
        
        switch response.actionIdentifier {
        case "OPTIMIZE_NOW":
            NotificationCenter.default.post(name: .startOptimization, object: nil)
        case "REMIND_LATER":
            scheduleReminderNotification()
        default:
            break
        }
        
        completionHandler()
    }
    
    private func scheduleReminderNotification() {
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3600, repeats: false) // 1 hour
        let content = UNMutableNotificationContent()
        content.title = "Mac Optimization Reminder"
        content.body = "Your Mac still needs attention"
        
        let request = UNNotificationRequest(identifier: "reminder", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Secure System Operations with TCC Compliance
class SecureSystemOperations {
    private let logger = Logger(subsystem: "com.macagent.pro", category: "system")
    
    // RED ZEN FIX: Handle TCC permissions properly
    func requestSystemAccess() -> Bool {
        // Check if we have necessary permissions
        let accessibilityEnabled = AXIsProcessTrusted()
        
        if !accessibilityEnabled {
            // Show permission dialog
            showAccessibilityPermissionAlert()
            return false
        }
        
        return true
    }
    
    private func showAccessibilityPermissionAlert() {
        let alert = NSAlert()
        alert.messageText = "MacAgent Pro Needs System Access"
        alert.informativeText = """
        To optimize your Mac, MacAgent Pro needs accessibility permissions to:
        • Monitor system processes
        • Manage memory usage
        • Optimize CPU performance
        
        This is safe and your data stays private.
        """
        alert.addButton(withTitle: "Open System Preferences")
        alert.addButton(withTitle: "Cancel")
        
        if alert.runModal() == .alertFirstButtonReturn {
            // Open System Preferences to Accessibility
            NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")!)
        }
    }
    
    // Safe process management (no sudo required)
    func getRunningProcesses() -> [ProcessInfo] {
        var processes: [ProcessInfo] = []
        
        let task = Process()
        task.launchPath = "/bin/ps"
        task.arguments = ["-eo", "pid,ppid,%cpu,%mem,comm"]
        
        let pipe = Pipe()
        task.standardOutput = pipe
        
        do {
            try task.run()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            
            // Parse process information safely
            processes = parseProcessOutput(output)
        } catch {
            logger.error("Failed to get processes: \(error)")
        }
        
        return processes
    }
    
    // RED ZEN FIX: No more dangerous SSD defrag claims
    func getDiskUsageInfo() -> DiskInfo {
        // Use proper disk usage APIs, avoid defrag claims
        let fileManager = FileManager.default
        
        do {
            let systemAttributes = try fileManager.attributesOfFileSystem(forPath: "/")
            let freeSize = (systemAttributes[.systemFreeSize] as? NSNumber)?.int64Value ?? 0
            let totalSize = (systemAttributes[.systemSize] as? NSNumber)?.int64Value ?? 0
            
            return DiskInfo(
                totalBytes: totalSize,
                freeBytes: freeSize,
                usedPercentage: Double(totalSize - freeSize) / Double(totalSize) * 100,
                optimizationTips: generateSafeDiskTips(freeGB: Double(freeSize) / 1_000_000_000)
            )
        } catch {
            logger.error("Failed to get disk info: \(error)")
            return DiskInfo(totalBytes: 0, freeBytes: 0, usedPercentage: 0, optimizationTips: [])
        }
    }
    
    private func generateSafeDiskTips(freeGB: Double) -> [String] {
        var tips: [String] = []
        
        if freeGB < 10 {
            tips.append("Clear cache files and temporary data")
            tips.append("Empty Trash and Downloads folder")
            tips.append("Remove old iOS backups")
        }
        
        // RED ZEN FIX: No defrag claims for SSD/APFS
        tips.append("Clean up system logs and cache files")
        tips.append("Remove unused applications")
        tips.append("Archive old files to external storage")
        
        return tips
    }
    
    // Thermal monitoring with IOKit (safe)
    func getCPUTemperature() -> Double? {
        // Use IOKit to read thermal sensors safely
        // This is a simplified version - production would need proper sensor reading
        let service = IOServiceGetMatchingService(kIOMasterPortDefault, 
                                                IOServiceMatching("IOHWSensor"))
        
        guard service != IO_OBJECT_NULL else {
            return nil
        }
        
        defer { IOObjectRelease(service) }
        
        // Read temperature sensor data
        // Implementation would depend on specific Mac model and sensor availability
        return nil // Return actual temperature if available
    }
}

// MARK: - Data Structures
struct ProcessInfo {
    let pid: Int32
    let parentPid: Int32
    let cpuUsage: Double
    let memoryUsage: Double
    let name: String
}

struct DiskInfo {
    let totalBytes: Int64
    let freeBytes: Int64
    let usedPercentage: Double
    let optimizationTips: [String]
}

// MARK: - Helper Extensions
extension Notification.Name {
    static let startOptimization = Notification.Name("startOptimization")
    static let systemHealthUpdated = Notification.Name("systemHealthUpdated")
}

// MARK: - Modern Logging
extension Logger {
    static let systemOps = Logger(subsystem: "com.macagent.pro", category: "system")
    static let agents = Logger(subsystem: "com.macagent.pro", category: "agents")
    static let security = Logger(subsystem: "com.macagent.pro", category: "security")
}

// Usage Example:
/*
let notificationManager = ModernNotificationManager()
let systemOps = SecureSystemOperations()

// Request permissions first
if systemOps.requestSystemAccess() {
    // Proceed with system operations
    let processes = systemOps.getRunningProcesses()
    let diskInfo = systemOps.getDiskUsageInfo()
    
    // Show health alert if needed
    if diskInfo.usedPercentage > 90 {
        notificationManager.showHealthAlert(
            healthScore: 30, 
            criticalIssues: ["Disk space critical", "High CPU usage"]
        )
    }
}
*/

print("✅ Modern macOS implementation ready:")
print("- UserNotifications framework (replaces deprecated NSUserNotification)")
print("- Proper TCC permission handling")
print("- Safe system operations (no sudo required)")
print("- No SSD defrag claims (APFS doesn't need it)")
print("- Modern logging with OSLog")
print("- Accessibility permission UI")