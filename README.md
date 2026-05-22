# Stacklivo

Stacklivo is a browser-based React and JavaScript playground for building, practicing, and previewing frontend code directly in the browser. It combines a Monaco-powered editor, Sandpack React preview, JavaScript terminal output, a practice question library, and local project management in one focused workspace.

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
- Local login and signup flow using localStorage
- Per-user local project storage for development/demo usage
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

### Local API

- Node.js
- Express
- CORS

### Production API

- Vercel Serverless Functions
- NPM registry API

---

## Screenshots

### Dashboard

<img width="1449" height="790" alt="Stacklivo dashboard" src="https://github.com/user-attachments/assets/da7c653c-92e4-4feb-8214-30b5b08de560" />

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
├── server/
│   └── index.js
├── src/
│   ├── app/
│   ├── entities/
│   ├── features/
│   ├── pages/
│   ├── shared/
│   ├── main.tsx
│   └── styles.scss
├── package.json
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
```

### 4. Start the development app

```bash
npm run dev
```

This starts both:

- Vite frontend dev server
- Local Express API server

Open the app in your browser:

```txt
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev
```

Runs the Vite frontend and local Express API together.

```bash
npm run dev:web
```

Runs only the Vite frontend.

```bash
npm run dev:api
```

Runs only the local Express API.

```bash
npm run build
```

Builds the production frontend.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run start:api
```

Starts the local API server.

---

## Main Routes

```txt
/                 Practice library and new workspace dashboard
/projects         Saved React/JS projects table
/editor/:slug     Code editor workspace
/preview/:slug    Standalone app preview
/login            Local login page
/signup           Local signup page
/api/health       Production health check on Vercel
```

---

## Local Auth and Storage

Stacklivo currently uses localStorage for authentication and project persistence.

This means:

- Users can create local demo accounts
- Each local user gets a separate saved project list
- Projects are stored in the browser
- Practice-library tasks are not shown as saved projects

Important: localStorage auth is for development/demo use only. For production user accounts, replace this with backend authentication and database-backed project storage.

---

## API Behavior

Stacklivo uses package APIs for NPM package search and dependency resolution.

Local development uses:

```txt
server/index.js
```

Vercel production uses:

```txt
api/packages/search.js
api/packages/resolve.js
```

The production API functions include cache headers to reduce repeated NPM registry calls.

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

- Backend authentication
- Cloud project storage
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
