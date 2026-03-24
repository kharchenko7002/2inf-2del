# Temperature & Humidity Monitoring

Full-stack web application for monitoring temperature and humidity sensor data with user authentication, admin panel, charts, and theme support.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, TanStack Query, Axios |
| Backend | Node.js, Express, TypeScript, MySQL2, JWT (httpOnly cookies), Bcrypt, Zod, Helmet |
| Database | MySQL — existing `sensor_data` table + new tables |

---

## Project Structure

```
kostian_task/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/         # DB connection pool
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # SQL queries
│   │   ├── middlewares/    # Auth, admin, error, 404
│   │   ├── utils/          # JWT, bcrypt, response helpers
│   │   ├── validators/     # Zod schemas
│   │   ├── types/          # TypeScript interfaces
│   │   └── scripts/
│   │       └── seed.ts     # DB init + admin user seed
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx         # Redirects to /dashboard or /login
    │   ├── login/
    │   ├── register/
    │   ├── dashboard/       # Main page with charts and gauges
    │   ├── profile/
    │   ├── faq/
    │   └── admin/           # Admin panel (role-protected)
    ├── components/
    │   ├── layout/          # Header, ProtectedRoute
    │   ├── ui/              # Button, Input, Card, ThemeSwitcher
    │   ├── charts/          # SensorChart (Recharts)
    │   ├── dashboard/       # TemperatureGauge, HumidityCard, RangeFilter, MetricToggle
    │   └── forms/           # LoginForm, RegisterForm
    ├── context/             # AuthContext, ThemeContext
    ├── hooks/               # useAuth, useSensorData
    ├── services/            # Axios API client with auto token refresh
    ├── types/
    ├── styles/
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## Setup

### Prerequisites

- Node.js 18+
- MySQL server running with database `temperature_db`
- Existing table `sensor_data(id, temp, fukt, created_at)`

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=temperature_db

JWT_ACCESS_SECRET=your_access_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm install
npm run seed    # creates tables and seeds admin user
npm run dev     # starts server on port 4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

```bash
npm install
npm run dev     # starts on port 3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database

The seed script (`npm run seed`) creates these new tables without touching `sensor_data`:

```sql
-- Users with roles and theme preference
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user', 'admin') DEFAULT 'user',
  theme       ENUM('white', 'dark', 'blue') DEFAULT 'white',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- JWT refresh tokens
CREATE TABLE refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(512) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FAQ entries
CREATE TABLE faq (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Also adds index on `sensor_data(created_at)` for faster history queries.

---

## Default Admin Account

Created automatically by the seed script:

| Field | Value |
|-------|-------|
| Email | admin@gmail.com |
| Password | qwerty1234 |
| Role | admin |

> Password is stored as a bcrypt hash. The seed skips creation if admin already exists.

Access the admin panel at: [http://localhost:3000/admin](http://localhost:3000/admin)
(No link on the site — navigate manually by URL)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (clears cookies) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PATCH | `/api/user/profile` | Update name/email/password |
| PATCH | `/api/user/theme` | Update theme preference |

### Sensor Readings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readings/latest` | Latest sensor record |
| GET | `/api/readings/history?range=1h` | History: `1h`, `6h`, `12h`, `24h`, `7d`, `30d`, `all` |
| GET | `/api/readings/history?startDate=...&endDate=...` | Custom date range |
| GET | `/api/readings/history?range=24h&includeTemp=true&includeFukt=false` | Filter metrics |

### FAQ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faq` | List all FAQ |
| GET | `/api/faq/:id` | Get single FAQ item |
| POST | `/api/admin/faq` | Create FAQ (admin only) |
| PATCH | `/api/admin/faq/:id` | Update FAQ (admin only) |
| DELETE | `/api/admin/faq/:id` | Delete FAQ (admin only) |

### Admin — Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PATCH | `/api/admin/users/:id` | Update user data |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## Features

- **Dashboard** — SVG circular temperature gauge, humidity card, Recharts line chart
- **History filters** — 1h / 6h / 12h / 24h / 7d / 30d / all / custom date range
- **Metric toggles** — show temperature only, humidity only, or both
- **Themes** — white / dark / blue, stored per user in DB, applied via CSS variables
- **Auth** — httpOnly cookie JWTs, automatic token refresh on 401
- **Route protection** — unauthenticated users redirected to /login; non-admins blocked from /admin
- **Admin panel** — full CRUD for users and FAQ, role management
- **Security** — Helmet, CORS with credentials, rate limiting, Zod input validation, bcrypt passwords

---

## Build & Production

### Backend

```bash
cd backend
npm run build   # compiles TypeScript to dist/
npm run start   # runs dist/server.js
```

### Frontend

```bash
cd frontend
npm run build   # Next.js production build
npm run start   # starts on port 3000
```

---

## Deploy on Local Linux Server with PM2

```bash
npm install -g pm2

# Backend
cd /path/to/backend
npm run build
pm2 start dist/server.js --name "temp-backend"

# Frontend
cd /path/to/frontend
npm run build
pm2 start npm --name "temp-frontend" -- start

# Save and enable autostart
pm2 save
pm2 startup
```

---

## Nginx Reverse Proxy (recommended)

```nginx
server {
    listen 80;
    server_name your-server-ip;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

When using Nginx, update `.env.local` in frontend:
```env
NEXT_PUBLIC_API_URL=http://your-server-ip/api
```
And update `FRONTEND_URL` in backend `.env` to match your domain.

---

## Post-Launch Checklist

- [ ] Backend responds: `curl http://localhost:4000/api/readings/latest`
- [ ] Frontend loads: `http://localhost:3000`
- [ ] Login with `admin@gmail.com` / `qwerty1234` works
- [ ] `/admin` is accessible after admin login
- [ ] `/admin` redirects non-admin users to `/dashboard`
- [ ] Dashboard shows current temperature and humidity
- [ ] Chart renders with range filter buttons
- [ ] Theme switching works (white / dark / blue)
- [ ] Register a new user and verify `/admin` is blocked
- [ ] FAQ visible on `/faq`, editable in `/admin`
