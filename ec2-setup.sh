#!/bin/bash

# Quick EC2 Setup Script for Hotel RBS OTA
# Run this on your EC2 instance

echo "🚀 Setting up Hotel RBS OTA on EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 and serve
sudo npm install -g pm2 serve

# Install Nginx
sudo apt install nginx -y

# Create app directory
sudo mkdir -p /var/www/hotel-rbs
sudo chown -R $USER:$USER /var/www/hotel-rbs

# Clone and setup
cd /var/www/hotel-rbs
git clone https://github.com/310511/FINALDEMO.git .

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
API_BASE_URL=http://api.travzillapro.com/HotelServiceRest
API_USERNAME=your_api_username_here
API_PASSWORD=your_api_password_here
PROXY_SERVER_PORT=3001
VITE_PROXY_SERVER_URL=http://3.29.217.13:3001/api
EOF

# Build frontend
npm run build

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'hotel-rbs-proxy',
      script: 'proxy-server.js',
      env: { NODE_ENV: 'production', PORT: 3001 }
    },
    {
      name: 'hotel-rbs-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      env: { NODE_ENV: 'production', PORT: 3000 }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/sites-available/hotel-rbs << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://3.29.217.13:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location /api/ {
        proxy_pass http://3.29.217.13:3001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/hotel-rbs /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Setup complete!"
echo "🌐 Your app is available at: http://$(curl -s ifconfig.me)"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs"
