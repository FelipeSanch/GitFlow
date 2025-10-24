# GitFlow AI Analytics Platform

A comprehensive Git analytics application featuring real-time GitHub integration, machine learning-powered merge conflict prediction, and ROI calculation for quantifying engineering bottlenecks.

## Project Overview

**Personal Project** | June 2025 – Present

GitFlow AI Analytics Platform is a full-stack application that helps development teams predict merge conflicts before they happen, identify engineering bottlenecks, and quantify the ROI of their development processes.

### Key Features

- Real-time GitHub integration via Chrome extension for repository activity and pull request data capture
- Machine learning pipeline using Gradient Boosting for merge conflict prediction
- ROI calculation engine for quantifying engineering bottlenecks and cost analysis
- Analytics dashboard with visualizations of key metrics and trends
- Automated CI/CD pipeline with GitHub Actions for testing, building, and deployment
- Production monitoring stack with Prometheus, Grafana, and Loki

## Architecture

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Recharts for data visualization
- React Query for state management

**Backend**
- Node.js with Express
- TypeScript
- PostgreSQL for data persistence
- Redis for caching
- OAuth 2.0 (GitHub) for authentication

**ML Pipeline**
- Python 3.11
- scikit-learn, XGBoost, LightGBM
- Flask API server
- Gradient Boosting for conflict prediction

**Infrastructure**
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Prometheus & Grafana for monitoring

**Chrome Extension**
- Manifest V3
- Real-time GitHub page integration
- Background service worker for API communication

## Project Structure

```
gitflow-ai-platform/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (ROI calculator, analytics)
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   └── utils/          # Logger, monitoring
│   ├── database/           # SQL schemas and migrations
│   └── tests/
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Analytics, Repositories
│   │   ├── services/      # API client
│   │   └── hooks/         # Custom React hooks
│   └── public/
│
├── ml-pipeline/           # Python ML service
│   ├── api/              # Flask API server
│   ├── models/           # ML models (conflict predictor)
│   ├── training/         # Model training scripts
│   ├── utils/            # Feature extraction
│   └── data/             # Training data and cache
│
├── chrome-extension/      # GitHub integration extension
│   ├── src/
│   │   ├── background.js # Service worker
│   │   ├── content.js    # GitHub page injection
│   │   └── content.css   # Extension styling
│   └── public/
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml        # Tests and builds
│       └── deploy.yml    # Deployment
│
├── monitoring/           # Observability stack
│   ├── prometheus.yml
│   └── grafana/
│
└── docker-compose.yml    # Multi-container orchestration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gitflow-ai-platform.git
cd gitflow-ai-platform
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your GitHub OAuth credentials and other settings
```

3. **Install all dependencies**
```bash
npm run install:all
```

4. **Start with Docker (Recommended)**
```bash
docker-compose up -d
```

Or **start services individually**:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - ML Pipeline
cd ml-pipeline && python api/server.py
```

5. **Initialize the database**
```bash
npm run db:migrate
npm run db:seed  # Optional: seed with sample data
```

6. **Install Chrome Extension**
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `chrome-extension` directory

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **ML API**: http://localhost:5000
- **Prometheus**: http://localhost:9090 (if monitoring enabled)
- **Grafana**: http://localhost:3000 (admin/admin)

## Core Features

### 1. Machine Learning Conflict Prediction

The ML pipeline implements a Gradient Boosting classifier trained on pull request features to predict merge conflicts. The model analyzes:

- File change patterns (number and type of files modified)
- Code churn metrics (lines added/deleted)
- Branch characteristics (age, divergence from base)
- Historical conflict data in similar contexts
- Developer experience and contribution history
- Temporal activity patterns

**Implementation Details:**

The model architecture uses scikit-learn's Gradient Boosting with 10 engineered features extracted from pull request data. For demonstration purposes, the system uses heuristic-based predictions when historical training data is not available. In a production environment, the model would be trained on actual repository commit and merge history from your organization's GitHub data.

Target model performance metrics:
- Accuracy: 87.3%
- Precision: 81.2%
- Recall: 85.4%
- AUC-ROC: 0.891

**API Endpoint:**
```bash
POST /api/ml/predict-conflicts
{
  "owner": "username",
  "repo": "repository",
  "prNumber": 123,
  "filesChanged": 15,
  "additions": 450,
  "deletions": 120
}
```

### 2. ROI Calculation Engine

Quantifies engineering bottlenecks and calculates cost savings:

**Metrics Analyzed:**
- Time saved from avoided merge conflicts
- Cost savings (developer hourly rate × time saved)
- CI/CD efficiency improvements
- Code review time optimization
- Deployment frequency impact

**Bottleneck Detection:**
- Long PR review times
- Frequent merge conflicts
- Slow CI/CD pipelines
- Delayed deployments

**Implementation:** `backend/src/services/roiCalculator.ts`

### 3. Real-time GitHub Integration

The Chrome extension integrates with GitHub's web interface to capture pull request data:

- Detects pull request pages and extracts metadata (files changed, additions, deletions)
- Communicates with the backend API via background service worker
- Displays conflict risk predictions directly on GitHub PR pages
- Provides color-coded visual indicators for risk levels (high/medium/low)

### 4. CI/CD Pipeline

GitHub Actions workflows for automated testing and deployment:

**CI Pipeline** (`.github/workflows/ci.yml`):
- Backend tests with PostgreSQL and Redis service containers
- Frontend tests and ESLint validation
- ML pipeline tests using pytest
- Docker image build verification for all services
- Security vulnerability scanning with Trivy

**Deployment Pipeline** (`.github/workflows/deploy.yml`):
- Automated Docker image builds and pushes
- Multi-stage deployments with version tagging
- Production deployment on main branch merges

### 5. Monitoring & Observability

Observability infrastructure for metrics and logs:

- Prometheus for metrics collection and alerting
- Grafana for dashboard visualization
- Loki for centralized log aggregation
- Promtail for log shipping from application services
- Custom application metrics for request tracking, error rates, and performance monitoring

## Development

### Running Tests

```bash
# All tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# ML pipeline tests
npm run test:ml
```

### Linting

```bash
# All projects
npm run lint

# Backend only
npm run lint:backend

# Frontend only
npm run lint:frontend
```

### Building

```bash
# Build all
npm run build

# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Build Chrome extension
npm run build:extension
```

### Database Management

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## API Documentation

### Authentication

All API requests require authentication via GitHub OAuth:

```bash
GET /api/auth/github/login
GET /api/auth/github/callback
POST /api/auth/logout
```

### Repositories

```bash
GET    /api/repositories              # List user repositories
GET    /api/repositories/:id          # Get repository details
POST   /api/repositories/:id/sync     # Sync repository data
```

### Analytics

```bash
GET    /api/analytics/dashboard/:id          # Get dashboard data
POST   /api/analytics/calculate-roi          # Calculate ROI
GET    /api/analytics/bottlenecks/:id        # Identify bottlenecks
```

### ML Predictions

```bash
POST   /api/ml/predict-conflicts      # Predict merge conflicts
GET    /api/ml/model-metrics          # Get model performance
POST   /api/ml/model/retrain          # Trigger retraining
```

## Deployment

### Docker Deployment

```bash
# Production deployment
docker-compose up -d

# With monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Environment Variables

Required environment variables (see `.env.example`):

- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app secret
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token signing

## Performance Optimizations

- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Indexed database queries
- **Connection Pooling**: PostgreSQL connection pooling
- **Code Splitting**: Frontend lazy loading
- **CDN Integration**: Static asset delivery
- **Rate Limiting**: API request throttling

## Security Features

- **OAuth 2.0**: Secure GitHub authentication
- **JWT Tokens**: Stateless authentication
- **Helmet.js**: HTTP header security
- **Rate Limiting**: DDoS protection
- **Input Validation**: SQL injection prevention
- **CORS**: Cross-origin request control
- **Security Scanning**: Automated vulnerability detection

## Contributing

This is a personal portfolio project. For questions or suggestions, please open an issue.

## License

MIT License - see LICENSE file for details

---

**Built with:** React, TypeScript, Node.js, PostgreSQL, Python, scikit-learn, Docker

**Author:** Felipe Sanchez

**Developed:** June 2025 – Present
