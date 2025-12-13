#!/bin/bash

# Hotel RBS OTA - EC2 Deployment Script
# Run this script on your EC2 instance

echo "🚀 Starting Hotel RBS OTA deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/hotel-rbs
sudo chown -R $USER:$USER /var/www/hotel-rbs

# Clone repository
echo "📥 Cloning repository..."
cd /var/www/hotel-rbs
git clone https://github.com/310511/FINALDEMO.git .

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Install proxy server dependencies
echo "📦 Installing proxy server dependencies..."
cd /var/www/hotel-rbs
npm install express cors node-fetch dotenv

# Create environment file
echo "🔧 Creating environment configuration..."
cat > .env << EOF
# API Configuration
API_BASE_URL=http://api.travzillapro.com/HotelServiceRest
API_USERNAME=your_api_username_here
API_PASSWORD=your_api_password_here
PROXY_SERVER_PORT=3001

# Frontend Configuration
VITE_PROXY_SERVER_URL=http://3.29.217.13:3001/api
VITE_API_BASE_URL=http://api.travzillapro.com/HotelServiceRest
VITE_API_USERNAME=your_api_username_here
VITE_API_PASSWORD=your_api_password_here
EOF

# Build the frontend
echo "🏗️ Building frontend application..."
npm run build

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'hotel-rbs-proxy',
      script: 'proxy-server.js',
      cwd: '/var/www/hotel-rbs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'hotel-rbs-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/var/www/hotel-rbs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

# Install serve for static files
echo "📦 Installing serve for static files..."
npm install -g serve

# Start applications with PM2
echo "🚀 Starting applications..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/hotel-rbs << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        proxy_pass http://3.29.217.13:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://3.29.217.13:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/hotel-rbs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at: http://your-ec2-public-ip"
echo "📊 Check PM2 status with: pm2 status"
echo "📋 View logs with: pm2 logs"
