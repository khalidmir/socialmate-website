#!/bin/bash

# Social Mate Events UAE - Quick Deployment Script
# Deploy to Cloudflare Pages on KreativeMinds account

set -e

echo "🚀 Social Mate Events UAE - Cloudflare Pages Deployment"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
  echo "❌ Error: index.html not found. Please run this from the SocialMate directory."
  exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Error: Git not initialized. Run: git init"
  exit 1
fi

# Get project info
PROJECT_NAME="socialmate"
ACCOUNT_ID="d8ac64aacf6579f90ba1a98393b2444e"
DOMAIN="socialmate.org"

echo "📋 Deployment Configuration"
echo "  Project Name: $PROJECT_NAME"
echo "  Account ID: $ACCOUNT_ID"
echo "  Domain: $DOMAIN"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "📦 Installing Wrangler CLI..."
  npm install -g @wrangler/cli
fi

echo "Wrangler version:"
wrangler --version
echo ""

# Check for CF_API_TOKEN
if [ -z "$CF_API_TOKEN" ]; then
  echo "⚠️  CF_API_TOKEN not set in environment"
  echo "   Please set it: export CF_API_TOKEN=<your-token>"
  echo ""
  read -p "Enter your Cloudflare API Token: " CF_API_TOKEN
  export CF_API_TOKEN
fi

# Verify git status
echo "📝 Git Status:"
git status --short
echo ""

read -p "Deploy these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# Deploy
echo ""
echo "🚀 Deploying to Cloudflare Pages..."
echo ""

wrangler pages deploy . \
  --project-name=$PROJECT_NAME \
  --account-id=$ACCOUNT_ID \
  --production

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Live URL: https://$DOMAIN"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify site loads: https://$DOMAIN"
echo "  2. Test all pages"
echo "  3. Check mobile responsiveness"
echo "  4. Submit sitemap to Google Search Console"
echo ""
