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
