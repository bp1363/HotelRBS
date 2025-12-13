#!/bin/bash

# Production startup script for HotelRBS Backend
# Usage: ./start-production.sh

set -e  # Exit on error

echo "🚀 Starting HotelRBS Backend in PRODUCTION mode"
echo "================================================"

# Change to backend directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your Telr credentials"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing dependencies..."
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Run with Gunicorn
echo ""
echo "✅ Starting Gunicorn production server..."
echo "🌐 Server will be available at: http://0.0.0.0:5001"
echo "🛑 Press Ctrl+C to stop"
echo ""

gunicorn -c gunicorn.conf.py app:app

