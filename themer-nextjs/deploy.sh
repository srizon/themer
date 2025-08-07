#!/bin/bash

# Color Palette Generator - Deployment Script
echo "🚀 Deploying Color Palette Generator..."

# Build the application
echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Deployment Options:"
    echo "1. Vercel (Recommended):"
    echo "   - Push to GitHub"
    echo "   - Connect repository to Vercel"
    echo "   - Deploy automatically"
    echo ""
    echo "2. Netlify:"
    echo "   - Push to GitHub"
    echo "   - Connect repository to Netlify"
    echo "   - Build command: npm run build"
    echo "   - Publish directory: .next"
    echo ""
    echo "3. Railway:"
    echo "   - Push to GitHub"
    echo "   - Connect repository to Railway"
    echo "   - Deploy automatically"
    echo ""
    echo "4. Manual deployment:"
    echo "   - Run: npm start"
    echo "   - Or use: npx serve .next"
    echo ""
    echo "📋 Next steps:"
    echo "- Push your code to GitHub"
    echo "- Choose your deployment platform"
    echo "- Follow platform-specific instructions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
