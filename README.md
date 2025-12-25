<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

# 🎯 Lineup

**Interview Management Platform** - *In Development*

Lineup is a multi-tenant SaaS platform for recruitment teams to manage candidates, schedule interviews, and automate communications.

> ⚠️ **Development Status**: This is an early-stage implementation with scaffolding in place. Many features are stubbed with TODO markers for future development.

---

## ✨ Planned Features

### 📊 Dashboard
- [ ] Real-time interview statistics and KPIs
- [ ] Candidate pipeline visualization
- [ ] Interviewer load distribution

### 👥 Candidate Management
- [x] Basic CRUD operations
- [ ] Bulk candidate import (CSV)
- [ ] Document & notes management
- [ ] Resume parsing

### 📅 Calendar & Scheduling
- [x] Basic interview scheduling
- [x] Day / Week / Month views
- [ ] Drag-and-drop rescheduling
- [ ] Interviewer availability management
- [ ] Conflict detection

### 💬 Communication Hub
- [ ] Email integration (stubbed)
- [ ] SMS via Twilio (stubbed)
- [ ] WhatsApp integration (stubbed)
- [ ] Message templates

### 🔐 Authentication
- [x] JWT-based authentication
- [x] Multi-tenant architecture
- [ ] Two-Factor Authentication (stubbed)
- [ ] Password reset (stubbed)
- [ ] Email verification (stubbed)

### ⚙️ Integrations
- [ ] Google Calendar sync (planned)
- [ ] Zoho CRM integration (planned)
- [ ] Webhook framework (scaffolded)

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

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11 | Node.js framework |
| PostgreSQL | 15+ | Primary database |
| Prisma | 5 | ORM |
| Redis | 7+ | Caching & rate limiting |
| BullMQ | 5 | Job queues |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or pnpm

### 1. Clone & Install

```bash
git clone <repository-url>
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
# Edit .env with your database credentials

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

## 📁 Project Structure

```
lineup/
├── lineup-backend/          # NestJS backend
│   ├── prisma/              # Database schema & migrations
│   └── src/
│       ├── common/          # Guards, decorators, filters
│       └── modules/         # Feature modules
│           ├── auth/        # Authentication (partial)
│           ├── candidates/  # Candidate management (partial)
│           ├── calendar/    # Scheduling (scaffolded)
│           ├── communication/  # Email, SMS (stubbed)
│           ├── interviews/  # Interview lifecycle (partial)
│           └── integrations/  # External connectors (stubbed)
│
├── lineup-frontend/         # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   └── lib/                 # Utilities & API clients
│
└── docker-compose.yml       # Infrastructure services
```

---

## 🔧 Development Guidelines

### TODO Convention

Features that are stubbed or incomplete are marked with `TODO:` comments:

```typescript
// TODO: Implement email sending via SMTP
console.log('[TODO] Email would be sent:', { to, subject });
```

### Adding Features

1. Check the TODO markers in the relevant service file
2. Implement the actual logic
3. Update tests as needed
4. Remove the TODO marker once complete

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is proprietary software. All rights reserved.
