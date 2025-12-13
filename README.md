# HotelRBS - Hotel Booking Platform

A modern hotel booking platform built with React, TypeScript, and Vite, featuring real-time hotel search, interactive maps, and seamless booking experience.

## 🚀 Features

- **Hotel Search**: Search hotels by destination, dates, and guest preferences
- **Hotel Details**: Comprehensive hotel information with amenities, policies, and location
- **Booking System**: Complete booking flow with guest information and payment
- **Interactive Maps**: Mapbox integration for location-based hotel discovery
- **Real-time API**: Integration with Travzilla API for live hotel data
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful components built with Radix UI and shadcn/ui
- **Secure API**: Environment-based credential management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui
- **Maps**: Mapbox GL JS
- **State Management**: React Query (TanStack Query)
- **Backend**: Express.js (Proxy Server)
- **API**: Travzilla Hotel API

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Mapbox API key (for maps functionality)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd hotel-rbs-showcase-58
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# API Configuration
API_BASE_URL=http://pfort.travelapihost.com/HotelServiceRest
API_USERNAME=UHM|Hotel_RBS
API_PASSWORD=zjpUPOjhAGf47Uso
PROXY_SERVER_PORT=3001

# Frontend Environment Variables (for Vite)
VITE_API_BASE_URL=http://pfort.travelapihost.com/HotelServiceRest
VITE_PROXY_SERVER_URL=http://localhost:3001/api
VITE_API_USERNAME=UHM|Hotel_RBS
VITE_API_PASSWORD=zjpUPOjhAGf47Uso
```

### 4. Start the Development Servers

You need to run both the frontend and proxy server:

**Terminal 1 - Start the Proxy Server:**
```bash
node proxy-server.js
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:8080
- Proxy Server: http://localhost:3001

## 🏗️ Project Structure

```
hotel-rbs-showcase-58/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── data/               # Static data
│   └── lib/                # Utility functions
├── proxy-server.js         # Express proxy server
├── .env.example           # Environment variables template
├── .env                   # Your environment variables (not committed)
└── README.md
```

## 🔐 Security Notes

- **Never commit `.env` files** - They contain sensitive API credentials
- The `.env` file is already added to `.gitignore`
- Use `.env.example` as a template for other developers
- API credentials are handled server-side through the proxy

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend Deployment
The proxy server needs to be deployed to a Node.js hosting service:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2

### Environment Variables for Production
Make sure to set the following environment variables in your production environment:

```env
API_BASE_URL=your_production_api_url
API_USERNAME=your_production_username
API_PASSWORD=your_production_password
PROXY_SERVER_PORT=3001
```

## 🧪 Testing

```bash
# Run the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 API Integration

This project integrates with the Travzilla Hotel API through a local proxy server to handle CORS issues. The proxy server:

1. Receives requests from the frontend
2. Adds authentication headers
3. Forwards requests to the Travzilla API
4. Returns responses with proper CORS headers

### Available API Endpoints

- **Hotel Search**: `/api/hotel-search` - Search for hotels by destination and dates
- **Hotel Details**: `/api/hotel-details` - Get detailed information about a specific hotel
- **Room Availability**: Direct API call for room availability and pricing

### Data Security

- All API credentials are stored in environment variables
- No sensitive data is exposed in the frontend code
- Proxy server handles all authentication securely
- `.env` files are excluded from version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the proxy server is running on port 3001
2. **API Errors**: Check your API credentials in the `.env` file
3. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Getting Help

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure both servers (frontend and proxy) are running
4. Check the network tab in browser dev tools for API call status

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.