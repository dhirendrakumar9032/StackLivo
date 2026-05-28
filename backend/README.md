# Stacklivo Backend

Standalone Node.js, Express, and MongoDB backend for Stacklivo.

## Local Setup

1. Install MongoDB Community Server.
2. Open MongoDB Compass and connect to:

```txt
mongodb://127.0.0.1:27017
```

3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Create local env file:

```bash
cp .env.example .env
```

5. Start the backend:

```bash
npm run dev
```

The backend runs on:

```txt
http://localhost:4000
```

## Main API Routes

```txt
GET    /api/health
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
GET    /api/practice/progress
PATCH  /api/practice/progress/:questionId
GET    /api/packages/search?q=react
GET    /api/packages/resolve?name=react
```
