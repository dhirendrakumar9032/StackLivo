# Stacklivo

Stacklivo is a browser-based React and JavaScript playground for building, practicing, and previewing frontend code directly in the browser. It combines a Monaco-powered editor, Sandpack React preview, JavaScript terminal output, a practice question library, and MongoDB-backed project management in one focused workspace.

Live app: [https://stack-livo.vercel.app/](https://stack-livo.vercel.app/)

---

## Features

- Create React projects and JavaScript playgrounds from the dashboard
- Practice DSA and React machine-coding questions from a searchable library
- Open practice tasks directly inside the matching editor experience
- Edit code with Monaco Editor
- Preview React apps with Sandpack and an iframe-based live preview
- Open React preview in a standalone browser tab
- Run JavaScript playground code and view clean output/errors in an xterm.js terminal
- Show or hide Explorer, Preview, and Terminal panels
- Resize the file explorer on desktop
- Responsive stacked layout for smaller screens
- Add, edit, collapse, and expand files and folders
- Search and install NPM packages
- Keep practice tasks separate from manually created projects
- Manage saved React/JS projects on a dedicated Projects page
- Backend login and signup with HTTP-only JWT cookies
- Per-user MongoDB project storage
- Vercel-ready API functions for package search and package resolution

---

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Sass
- Monaco Editor
- Sandpack
- xterm.js
- Lucide React
- React Arborist

### Backend

- Node.js
- Express
- CORS
- MongoDB
- Mongoose
- JWT

### Production API

- Vercel Serverless Functions
- NPM registry API

---

## Screenshots

### Dashboard

<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/9908c417-1421-47d2-b873-4df5acb64937" />

### Editor

<img width="1469" height="790" alt="Stacklivo editor" src="https://github.com/user-attachments/assets/1c8cb6ed-1cd5-47a4-a586-339fccf26265" />

---

## Project Structure

```bash
react-online-editor/
├── api/
│   ├── health.js
│   └── packages/
│       ├── resolve.js
│       └── search.js
├── backend/
│   ├── src/
│   ├── package.json
│   └── README.md
├── src/
│   ├── app/
│   ├── entities/
│   ├── features/
│   ├── pages/
│   ├── shared/
│   ├── main.tsx
│   └── styles.scss
├── package.json
├── .env.example
├── vercel.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dhirendrakumar9032/Replit.git
```

### 2. Navigate to the project

```bash
cd Replit
```

### 3. Install dependencies

```bash
npm install
npm --prefix backend install
```

### 4. Configure environment files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

For local development, `VITE_API_URL` can stay empty because Vite proxies `/api` to the backend.

### 5. Start the development app

```bash
npm run dev
```

This starts both:

- Vite frontend dev server
- Separate Express/MongoDB backend from `backend/`

Open the app in your browser:

```txt
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev
```

Runs the Vite frontend and the separate backend app together.

```bash
npm run dev:web
```

Runs only the Vite frontend.

```bash
npm run dev:backend
```

Runs only the separate backend app from `backend/`.

```bash
npm run build
```

Builds the production frontend.

```bash
npm run preview
```

Serves the production build locally.

## Main Routes

```txt
/                 Practice library and new workspace dashboard
/projects         Saved React/JS projects table
/editor/:id       Code editor workspace
/preview/:id      Standalone app preview
/login            Login page
/signup           Signup page
/api/health       Production health check on Vercel
```

---

## Auth and Storage

Stacklivo uses the separate Express backend for authentication and project persistence.

This means:

- Users can create backend accounts
- Auth sessions use HTTP-only JWT cookies
- Each user gets a separate saved project list
- Projects are stored in MongoDB
- Practice-library tasks are not shown as saved projects

For local development, keep MongoDB running in Compass or as a local MongoDB service and copy `backend/.env.example` to `backend/.env`.

---

## API Behavior

Stacklivo uses the backend API for auth, project storage, NPM package search, and dependency resolution.

Local development uses the separate backend app:

```txt
backend/src/server.js
```

The lightweight Vercel API functions currently provide:

```txt
api/health.js
api/packages/search.js
api/packages/resolve.js
```

For production auth and project storage, deploy the backend separately and set `VITE_API_URL` in the frontend environment to that backend URL.

---

## Deployment

The app is prepared for Vercel deployment.

### Vercel settings

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

The `vercel.json` file keeps frontend routes working after refresh:

```txt
/editor/:slug
/preview/:slug
/projects
/login
/signup
```

---

## Future Improvements

- Hosted backend deployment
- User profile and saved progress
- Infinite scroll for the practice library
- Practice completion tracking
- AI code suggestions
- Collaboration mode
- One-click project sharing
- Better bundle splitting for Monaco, Sandpack, and preview routes
- Deploy user-created React apps instantly

---

## Contributing

Contributions, issues, and feature requests are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build`
5. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

Dhirendra Kumar

- GitHub: [https://github.com/dhirendrakumar9032](https://github.com/dhirendrakumar9032)
- LinkedIn: [https://www.linkedin.com/](https://www.linkedin.com/)
- Live app: [https://stack-livo.vercel.app/](https://stack-livo.vercel.app/)
