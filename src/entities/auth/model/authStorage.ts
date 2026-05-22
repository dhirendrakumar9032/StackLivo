const USERS_KEY = "stacklivo_users_v1";
const SESSION_KEY = "stacklivo_session_v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Unable to parse ${key}`, error);
    return fallback;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function loadUsers() {
  const users = readJson(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadCurrentUser() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const session = readJson(SESSION_KEY, null);

  if (!session?.userId) {
    return null;
  }

  const users = loadUsers();
  return sanitizeUser(users.find((user) => user.id === session.userId));
}

export function createLocalUser({ name, email, password }) {
  const users = loadUsers();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password || !String(name || "").trim()) {
    throw new Error("Enter name, email, and password.");
  }

  if (password.length < 6) {
    throw new Error("Password should be at least 6 characters.");
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account already exists for this email.");
  }

  const timestamp = new Date().toISOString();
  const user = {
    id: crypto?.randomUUID?.() || `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    createdAt: timestamp,
  };

  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));

  return sanitizeUser(user);
}

export function authenticateLocalUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const users = loadUsers();
  const user = users.find((entry) => entry.email === normalizedEmail && entry.password === password);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return sanitizeUser(user);
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY);
}
