<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

# 🎯 Lineup

**Enterprise-Grade Interview Management Platform**

Lineup is a modern, multi-tenant SaaS platform designed to streamline hiring workflows for recruitment teams. It centralizes candidate management, interview scheduling, team collaboration, and communication automation—all built for scale, security, and extensibility.

---

## ✨ Features

### 📊 Dashboard
- Real-time interview statistics and KPIs
- Candidate pipeline visualization
- Interviewer load distribution
- Quick actions for common tasks

### 👥 Candidate Management
- Single & bulk candidate import (CSV)
- Customizable hiring stages
- Document & notes management
- Kanban board view for pipeline

### 📅 Calendar & Scheduling
- Day / Week / Month calendar views
- Drag-and-drop rescheduling
- Duration resizing
- Interviewer availability management
- Bulk interview scheduling

### 💬 Communication Hub
- Email, SMS & WhatsApp integration
- Twilio SMS with fallback support
- Message templates with variables
- Automated notifications
- Delivery tracking & retry logic

### 🔐 Multi-Tenant Architecture
- Complete data isolation per tenant
- Role-based access control (RBAC)
- Admin / Manager / Recruiter / Interviewer roles
- Team-based permissions

### ⚙️ Integrations
- Webhook framework
- Field mapping configuration
- Extensible connector architecture
- ATS/CRM ready (planned)

### 📈 Reports & Analytics
- Interview performance metrics
- Source effectiveness tracking
- Interviewer load analysis
- Scheduled report delivery

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| Tailwind CSS | 3.4 | Styling |
| Radix UI | Latest | Accessible components |
| TanStack Query | 5 | Server state management |
| Framer Motion | 12 | Animations |
| Recharts | 3 | Data visualization |
| dnd-kit | 6 | Drag and drop |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11 | Node.js framework |
| PostgreSQL | 15+ | Primary database |
| Prisma | 5 | ORM |
| Redis | 7+ | Caching & rate limiting |
| BullMQ | 5 | Job queues |
| Twilio | 5 | SMS integration |

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- MinIO (S3-compatible storage)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

### 1. Clone & Install

```bash
git clone https://github.com/CHINMAYKUDALKAR/Lineup2.git
cd lineup

# Install dependencies
cd lineup-backend && npm install && cd ..
cd lineup-frontend && npm install && cd ..
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d
```

### 3. Configure Environment

```bash
# Backend
cp lineup-backend/.env.example lineup-backend/.env
# Edit with your database credentials

# Frontend
cp lineup-frontend/.env.example lineup-frontend/.env.local
```

### 4. Database Setup

```bash
cd lineup-backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 5. Run the Application

```bash
# Option 1: Use the start script
./start.sh

# Option 2: Run manually
# Terminal 1 - Backend
cd lineup-backend && npm run start:dev

# Terminal 2 - Frontend
cd lineup-frontend && npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

---

## � API Documentation

Lineup provides comprehensive **Swagger/OpenAPI** documentation for all API endpoints.

### Accessing the API Docs

When the backend is running, visit: **http://localhost:3001/api/docs**

### API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | 10+ | Login, signup, JWT tokens, password reset |
| **Candidates** | 15+ | CRUD, bulk import, stage management |
| **Interviews** | 15+ | Scheduling, rescheduling, feedback |
| **Calendar** | 30+ | Availability, slots, working hours, sync |
| **Communication** | 20+ | Messages, templates, automations |
| **Reports** | 10+ | Analytics, exports, scheduled reports |
| **Users** | 7 | Invitations, roles, management |
| **Teams** | 8 | Team creation, member management |
| **Settings** | 10+ | Branding, SSO, SMTP, API keys |
| **Integrations** | 10 | OAuth, field mapping, webhooks |

### Authentication

All protected endpoints require a **Bearer JWT token**:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/candidates
```

### Example Endpoints

```bash
# Login
POST /api/v1/auth/login
{ "email": "user@example.com", "password": "..." }

# List Candidates
GET /api/v1/candidates?stage=Interview&page=1&perPage=20

# Schedule Interview
POST /api/v1/interviews
{ "candidateId": "...", "interviewerIds": [...], "startAt": "...", "durationMins": 60 }

# Get Availability
GET /api/v1/calendar/availability?userIds=...&start=...&end=...
```

---


## �📁 Project Structure

```
lineup/
├── lineup-backend/          # NestJS backend
│   ├── prisma/              # Database schema & migrations
│   ├── src/
│   │   ├── common/          # Guards, decorators, filters
│   │   └── modules/         # Feature modules
│   │       ├── auth/        # Authentication & JWT
│   │       ├── candidates/  # Candidate management
│   │       ├── calendar/    # Scheduling engine
│   │       ├── communication/  # Email, SMS, WhatsApp
│   │       ├── interviews/  # Interview lifecycle
│   │       ├── reports/     # Analytics & reporting
│   │       ├── settings/    # Tenant configuration
│   │       └── integrations/  # External connectors
│   └── test/                # E2E tests
│
├── lineup-frontend/         # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities & API clients
│   └── types/               # TypeScript definitions
│
├── performance/             # Load testing & benchmarks
└── docker-compose.yml       # Infrastructure services
```

---

## � Security

- **JWT Authentication** with refresh tokens
- **Rate Limiting** per tenant/user with Redis
- **SQL Injection Protection** via Prisma parameterized queries
- **RBAC Guards** at controller & service level
- **Tenant Isolation** on all database queries
- **Audit Logging** for sensitive actions

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| API Response (p95) | < 200ms |
| Page Load (p95) | < 2s |
| Database Query | < 100ms |
| System Uptime | 99.5% |
| Concurrent Users | 5,000+ |

---

## 🗺️ Roadmap

- [x] Multi-tenant architecture
- [x] Calendar scheduling engine
- [x] Communication module (Email, SMS, WhatsApp)
- [x] Twilio integration
- [x] Rate limiting
- [x] Hiring stages customization
- [ ] Google Calendar sync
- [ ] Microsoft Outlook sync
- [ ] External ATS integrations
- [ ] AI-powered resume parsing
- [ ] Interview conflict detection
- [ ] Mobile app (React Native)

---

## 📄 License

This project is proprietary software. All rights reserved.


