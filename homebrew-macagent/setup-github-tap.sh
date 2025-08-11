#!/bin/bash

# Setup GitHub repository for Homebrew tap
echo "🐙 Setting up GitHub repository for Homebrew tap"

# Initialize git repository
git init
git add .
git commit -m "Initial commit: MacAgent Pro Homebrew tap"

# Create GitHub repository (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "📤 Creating GitHub repository..."
    gh repo create homebrew-macagent --public --description "Official Homebrew tap for MacAgent Pro"
    git remote add origin https://github.com/$(gh api user --jq .login)/homebrew-macagent.git
    git branch -M main
    git push -u origin main
    
    echo "✅ GitHub repository created!"
    echo "🍺 Users can now install with:"
    echo "   brew tap $(gh api user --jq .login)/homebrew-macagent"
    echo "   brew install --cask macagent-pro"
else
    echo "ℹ️  Install GitHub CLI to auto-create repository:"
    echo "   brew install gh"
    echo "   gh auth login"
    echo "   Then run this script again"
fi
