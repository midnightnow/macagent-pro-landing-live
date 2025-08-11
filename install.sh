#!/bin/bash

# MacAgent Pro v1.0.2 - One-Command Install Script
# Copyright 2025 HardCard Systems
# Installation URL: https://macagent.pro/install

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MACAGENT_VERSION="1.0.2"
DOWNLOAD_URL="https://macagent.pro/downloads/MacAgent-Pro-v${MACAGENT_VERSION}-Signed.zip"
INSTALL_DIR="/Applications"
TEMP_DIR="/tmp/macagent-install"

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "🤖 MacAgent Pro v${MACAGENT_VERSION} - One-Command Install"
echo "================================================="
echo "World's first hardware-conscious AI assistant"
echo "🔒 100% Private | ⚡ 200ms Response | 🧠 Hardware Aware"
echo -e "${NC}"

# System checks
check_system() {
    log_info "Checking system requirements..."
    
    # Check macOS version
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "This installer is for macOS only"
        exit 1
    fi
    
    # Check macOS version (10.15+)
    local macos_version=$(sw_vers -productVersion)
    local major_version=$(echo $macos_version | cut -d '.' -f 1)
    local minor_version=$(echo $macos_version | cut -d '.' -f 2)
    
    if [[ $major_version -lt 10 ]] || [[ $major_version -eq 10 && $minor_version -lt 15 ]]; then
        log_error "macOS 10.15 Catalina or later required (found: $macos_version)"
        exit 1
    fi
    
    log_success "macOS $macos_version - Compatible"
    
    # Check Python (should be built-in on modern macOS)
    if ! command -v python3 &> /dev/null; then
        log_warning "Python 3 not found - will use system Python"
    else
        local python_version=$(python3 --version 2>&1 | awk '{print $2}')
        log_success "Python $python_version - Available"
    fi
    
    # Check available space (need ~50MB)
    local available_space=$(df -h "$INSTALL_DIR" 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/[^0-9]*//g')
    if [[ $available_space -lt 100 ]]; then
        log_warning "Low disk space - installation may fail"
    fi
    
    # Check curl
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    # Check unzip
    if ! command -v unzip &> /dev/null; then
        log_error "unzip is required but not installed"
        exit 1
    fi
}

# Download and install
install_macagent() {
    log_info "Creating temporary directory..."
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    log_info "Downloading MacAgent Pro v${MACAGENT_VERSION}..."
    if curl -fsSL --progress-bar "$DOWNLOAD_URL" -o "MacAgent-Pro-v${MACAGENT_VERSION}.zip"; then
        log_success "Download completed"
    else
        log_error "Download failed - please check your internet connection"
        exit 1
    fi
    
    log_info "Extracting application..."
    if unzip -q "MacAgent-Pro-v${MACAGENT_VERSION}.zip"; then
        log_success "Extraction completed"
    else
        log_error "Extraction failed - download may be corrupted"
        exit 1
    fi
    
    # Find the .app bundle
    local app_bundle=$(find . -name "*.app" -type d | head -1)
    if [[ -z "$app_bundle" ]]; then
        log_error "MacAgent Pro.app not found in download"
        exit 1
    fi
    
    log_info "Installing to $INSTALL_DIR..."
    
    # Remove existing installation if present
    if [[ -d "$INSTALL_DIR/MacAgent Pro.app" ]]; then
        log_warning "Removing existing installation..."
        rm -rf "$INSTALL_DIR/MacAgent Pro.app"
    fi
    
    # Move to Applications
    if mv "$app_bundle" "$INSTALL_DIR/"; then
        log_success "MacAgent Pro installed to Applications folder"
    else
        log_error "Failed to move application to Applications folder"
        log_info "You may need to run with sudo or move manually"
        exit 1
    fi
    
    # Set execute permissions
    chmod +x "$INSTALL_DIR/MacAgent Pro.app/Contents/MacOS/"* 2>/dev/null || true
}

# Setup permissions
setup_permissions() {
    log_info "Setting up permissions..."
    
    # Try to open the app once to trigger permission dialogs
    log_info "Opening MacAgent Pro to setup permissions..."
    open "$INSTALL_DIR/MacAgent Pro.app" || true
    
    echo
    log_warning "IMPORTANT: Permission Setup Required"
    echo "MacAgent Pro needs the following permissions:"
    echo "  🎤 Microphone - For voice recognition"
    echo "  🖥️  Accessibility - For system automation"
    echo
    echo "When prompted:"
    echo "1. Click 'Open System Preferences'"
    echo "2. Grant microphone access to MacAgent Pro"
    echo "3. Grant accessibility access to MacAgent Pro"
    echo "4. Return to MacAgent Pro and try voice commands"
    echo
}

# Post-install
post_install() {
    log_success "Installation completed successfully!"
    echo
    echo -e "${GREEN}🎉 MacAgent Pro v${MACAGENT_VERSION} is ready!${NC}"
    echo
    echo "Next steps:"
    echo "1. Grant required permissions when prompted"
    echo "2. Look for the 🤖 icon in your menu bar"
    echo "3. Say 'Hey MacAgent' to start using voice commands"
    echo
    echo "Documentation: https://macagent.info"
    echo "Support: support@macagent.pro"
    echo
    
    # Launch success animation
    echo -e "${BLUE}🚀 Ready to experience the future of AI assistants!${NC}"
}

# Cleanup
cleanup() {
    log_info "Cleaning up temporary files..."
    cd /
    rm -rf "$TEMP_DIR"
    log_success "Cleanup completed"
}

# Error handling
handle_error() {
    log_error "Installation failed at step: $1"
    log_info "Cleaning up..."
    cleanup || true
    echo
    echo "Troubleshooting:"
    echo "- Check your internet connection"
    echo "- Ensure you have write access to /Applications"
    echo "- Try running with sudo if needed"
    echo "- Visit https://macagent.info/support for help"
    exit 1
}

# Main installation flow
main() {
    trap 'handle_error "System check"' ERR
    check_system
    
    trap 'handle_error "Download and install"' ERR
    install_macagent
    
    trap 'handle_error "Permission setup"' ERR
    setup_permissions
    
    trap 'handle_error "Post-install"' ERR
    post_install
    
    trap 'handle_error "Cleanup"' ERR
    cleanup
    
    log_success "MacAgent Pro installation completed! 🎯"
}

# Run installation
main "$@"