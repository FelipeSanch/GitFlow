# Quick Setup Guide

## 1. GitHub OAuth App Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: GitFlow AI Analytics
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Save the Client ID and Client Secret

## 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=generate_a_random_32_char_string
```

## 3. Quick Start with Docker

```bash
# Install dependencies
npm run install:all

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 4. Manual Start (Development)

```bash
# Terminal 1: Start backend
cd backend
npm install
npm run dev

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev

# Terminal 3: Start ML pipeline
cd ml-pipeline
pip install -r requirements.txt
python api/server.py
```

## 5. Install Chrome Extension

1. Build the extension:
```bash
cd chrome-extension
npm install
npm run build
```

2. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `chrome-extension` directory

## 6. Access Applications

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- ML API: http://localhost:5000

## Troubleshooting

**Database connection issues:**
```bash
docker-compose down
docker-compose up -d postgres
# Wait 10 seconds for DB to start
docker-compose up -d
```

**Port already in use:**
```bash
# Check what's using the port
lsof -i :3001
# Kill the process or change the port in .env
```

**Chrome extension not loading:**
- Make sure you've run `npm run build` in the chrome-extension folder
- Check Chrome console for errors
- Verify manifest.json is valid
