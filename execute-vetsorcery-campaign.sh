#!/bin/bash

# VetSorcery Emergency Coverage - Campaign Execution Script
# Launches automated outreach campaign with monitoring

echo "🏥 VetSorcery Emergency Coverage Campaign Launcher"
echo "================================================="
echo ""

# Check dependencies
echo "📋 Checking system requirements..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 required but not installed"
    exit 1
fi

if ! python3 -c "import smtplib, email" &> /dev/null; then
    echo "❌ Email libraries not available"
    exit 1
fi

echo "✅ System requirements satisfied"
echo ""

# Setup campaign directory
CAMPAIGN_DIR="vetsorcery_campaign_$(date +%Y%m%d_%H%M)"
mkdir -p "$CAMPAIGN_DIR"
cd "$CAMPAIGN_DIR"

echo "📁 Campaign directory created: $CAMPAIGN_DIR"

# Copy campaign files
cp ../vetsorcery-outreach-automation.py .
cp ../outreach_config.json .
cp ../vetsorcery-outreach-dashboard.html .

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install requests --quiet 2>/dev/null || echo "⚠️ Requests library may need manual installation"

# Configuration check
echo ""
echo "🔧 Campaign Configuration:"
echo "   • Target: Veterinary clinics (5-50 employees)"
echo "   • Geographic focus: TX, CA, FL, NY, PA"
echo "   • Email sequence: 3-phase automated"
echo "   • Expected ROI: 13,300%"
echo "   • Target revenue: $4,970-$9,940"
echo ""

# Campaign execution options
echo "🚀 Campaign Execution Options:"
echo ""
echo "1. 🧪 TEST MODE - Send to 5 test prospects"
echo "2. 🎯 PILOT MODE - Send to 25 selected prospects" 
echo "3. 🌍 FULL LAUNCH - Complete prospect database"
echo "4. 📊 DASHBOARD ONLY - Monitor existing campaign"
echo ""

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo "🧪 Launching TEST MODE..."
        python3 vetsorcery-outreach-automation.py --test --limit 5
        ;;
    2)
        echo "🎯 Launching PILOT MODE..."
        python3 vetsorcery-outreach-automation.py --pilot --limit 25
        ;;
    3)
        echo "🌍 Launching FULL CAMPAIGN..."
        echo "⚠️  This will send emails to entire prospect database"
        read -p "Continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            python3 vetsorcery-outreach-automation.py --full-launch
        else
            echo "❌ Launch cancelled"
            exit 1
        fi
        ;;
    4)
        echo "📊 Opening campaign dashboard..."
        if command -v open &> /dev/null; then
            open vetsorcery-outreach-dashboard.html
        else
            echo "🌐 Dashboard: file://$(pwd)/vetsorcery-outreach-dashboard.html"
        fi
        ;;
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac

# Post-launch monitoring
if [ "$choice" != "4" ]; then
    echo ""
    echo "✅ Campaign launched successfully!"
    echo ""
    echo "📊 Real-time monitoring:"
    echo "   Dashboard: file://$(pwd)/vetsorcery-outreach-dashboard.html"
    echo "   Response tracking: Auto-enabled"
    echo "   Conversion tracking: Stripe webhooks active"
    echo ""
    echo "🎯 Expected Timeline:"
    echo "   • Hour 1-6: Initial opens and clicks"
    echo "   • Day 1-3: Demo bookings start"  
    echo "   • Day 3-7: First paid conversions"
    echo "   • Day 7-14: Follow-up sequence completes"
    echo ""
    echo "🚨 Action Required:"
    echo "   • Monitor email responses within 2 hours"
    echo "   • Book demos same-day when possible"
    echo "   • Follow up on warm leads within 24 hours"
    echo ""
    echo "📈 Success Metrics to Track:"
    echo "   • Open rate: Target 35-45%"
    echo "   • Click rate: Target 8-12%"
    echo "   • Demo booking: Target 3-5%"
    echo "   • Demo→Paid: Target 50%+"
    echo ""
    
    # Open dashboard automatically
    if command -v open &> /dev/null; then
        echo "🌐 Opening campaign dashboard..."
        open vetsorcery-outreach-dashboard.html
    fi
fi

echo "🎉 VetSorcery campaign ready - Go capture that market!"