# Dyad Web Conversion Plan (Minimal Effort POC)

## Overview

Convert Dyad from Electron desktop app to a web application with minimal changes. Focus on getting a working POC quickly, then add complex features like file system management later.

## Phase 1: Basic Web POC (1-2 days)

### Step 1: Create Web-Only Vite Config

**Time: 30 minutes**

Create `vite.web.config.mts` for pure web build:

```typescript
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Remove electron-specific globals
    global: "globalThis",
  },
  build: {
    outDir: "dist-web",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

### Step 2: Create Comprehensive Mock Strategy

**Time: 2 hours**

Create a layered mocking system that allows gradual replacement with real data.

#### A. Create Mock Data Store (`src/lib/mock-data.ts`):

```typescript
import type { App, Chat, UserSettings } from "./schemas";

// Sample data that mirrors real Electron data structure
export const mockData = {
  settings: {
    theme: "dark",
    aiProvider: "openai",
    apiKey: "",
    fontSize: 14,
    // ... match your actual UserSettings schema
  } as UserSettings,

  apps: [
    {
      id: "demo-next",
      name: "Next.js Demo",
      framework: "next",
      path: "/demo-next",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "stopped",
    },
    {
      id: "demo-react",
      name: "React App",
      framework: "vite",
      path: "/demo-react",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "running",
    },
  ] as App[],

  chats: [
    {
      id: 1,
      title: "Welcome Chat",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          role: "assistant",
          content: "Hello! I'm ready to help you build your app.",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ] as Chat[],

  files: {
    "/demo-next/package.json": JSON.stringify(
      {
        name: "demo-next-app",
        scripts: { dev: "next dev", build: "next build" },
      },
      null,
      2,
    ),
    "/demo-next/src/app/page.tsx": `export default function Home() {
  return <div>Hello Next.js!</div>;
}`,
    "/demo-react/package.json": JSON.stringify(
      {
        name: "demo-react-app",
        scripts: { dev: "vite", build: "vite build" },
      },
      null,
      2,
    ),
  } as Record<string, string>,
};

// In-memory store that can be updated
export class MockDataStore {
  private data = JSON.parse(JSON.stringify(mockData)); // Deep clone

  // Apps
  getApps() {
    return this.data.apps;
  }
  getApp(id: string) {
    return this.data.apps.find((app) => app.id === id);
  }
  createApp(app: Partial<App>) {
    const newApp = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "stopped",
      ...app,
    } as App;
    this.data.apps.push(newApp);
    return newApp;
  }
  updateApp(id: string, updates: Partial<App>) {
    const app = this.getApp(id);
    if (app)
      Object.assign(app, { ...updates, updatedAt: new Date().toISOString() });
    return app;
  }
  deleteApp(id: string) {
    this.data.apps = this.data.apps.filter((app) => app.id !== id);
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }
  updateSettings(updates: Partial<UserSettings>) {
    Object.assign(this.data.settings, updates);
    return this.data.settings;
  }

  // Files
  getFile(path: string) {
    return this.data.files[path];
  }
  setFile(path: string, content: string) {
    this.data.files[path] = content;
  }
  deleteFile(path: string) {
    delete this.data.files[path];
  }
  listFiles(dirPath: string) {
    return Object.keys(this.data.files)
      .filter((path) => path.startsWith(dirPath))
      .map((path) => ({ path, isDirectory: false }));
  }

  // Chats
  getChats() {
    return this.data.chats;
  }
  getChat(id: number) {
    return this.data.chats.find((chat) => chat.id === id);
  }
  createChat(title: string) {
    const newChat = {
      id: Date.now(),
      title,
      createdAt: new Date().toISOString(),
      messages: [],
    } as Chat;
    this.data.chats.push(newChat);
    return newChat;
  }
}

export const mockStore = new MockDataStore();
```

#### B. Create Configurable Mock IPC Client (`src/lib/mock-ipc.ts`):

```typescript
import { mockStore } from "./mock-data";
import type { IpcClient } from "../ipc/ipc_client";

// Configuration for what to mock vs what to pass through
interface MockConfig {
  mockApps: boolean;
  mockSettings: boolean;
  mockFiles: boolean;
  mockChats: boolean;
  mockAI: boolean;
  // Add more as needed
}

export class ConfigurableMockIpcClient {
  private config: MockConfig;
  private realClient?: IpcClient; // Optional real client for passthrough

  constructor(config: Partial<MockConfig> = {}, realClient?: IpcClient) {
    this.config = {
      mockApps: true,
      mockSettings: true,
      mockFiles: true,
      mockChats: true,
      mockAI: true,
      ...config,
    };
    this.realClient = realClient;
  }

  // Helper to decide mock vs real
  private async callMockOrReal<T>(
    mockKey: keyof MockConfig,
    mockFn: () => Promise<T> | T,
    realFn?: () => Promise<T>,
  ): Promise<T> {
    if (this.config[mockKey] || !this.realClient || !realFn) {
      return await mockFn();
    }
    return await realFn();
  }

  // Apps API
  async listApps() {
    return this.callMockOrReal(
      "mockApps",
      () => ({ apps: mockStore.getApps() }),
      () => this.realClient!.listApps(),
    );
  }

  async createApp(params: any) {
    return this.callMockOrReal(
      "mockApps",
      () => mockStore.createApp(params),
      () => this.realClient!.createApp(params),
    );
  }

  async runApp(params: any) {
    return this.callMockOrReal(
      "mockApps",
      () => {
        // Mock app execution with fake output
        const app = mockStore.getApp(params.appId);
        if (app) mockStore.updateApp(params.appId, { status: "running" });
        return { success: true, output: "Mock: App started successfully!" };
      },
      () => this.realClient!.runApp(params),
    );
  }

  async stopApp(params: any) {
    return this.callMockOrReal(
      "mockApps",
      () => {
        const app = mockStore.getApp(params.appId);
        if (app) mockStore.updateApp(params.appId, { status: "stopped" });
        return { success: true };
      },
      () => this.realClient!.stopApp(params),
    );
  }

  // Settings API
  async getSettings() {
    return this.callMockOrReal(
      "mockSettings",
      () => mockStore.getSettings(),
      () => this.realClient!.getSettings(),
    );
  }

  async updateSettings(settings: any) {
    return this.callMockOrReal(
      "mockSettings",
      () => mockStore.updateSettings(settings),
      () => this.realClient!.updateSettings(settings),
    );
  }

  // Files API
  async readFile(params: { path: string }) {
    return this.callMockOrReal(
      "mockFiles",
      () => {
        const content = mockStore.getFile(params.path);
        if (!content) throw new Error(`File not found: ${params.path}`);
        return { content };
      },
      () => this.realClient!.readFile(params),
    );
  }

  async writeFile(params: { path: string; content: string }) {
    return this.callMockOrReal(
      "mockFiles",
      () => {
        mockStore.setFile(params.path, params.content);
        return { success: true };
      },
      () => this.realClient!.writeFile(params),
    );
  }

  async listDirectory(params: { path: string }) {
    return this.callMockOrReal(
      "mockFiles",
      () => ({ files: mockStore.listFiles(params.path) }),
      () => this.realClient!.listDirectory(params),
    );
  }

  // Chat API
  async createChat(params: any) {
    return this.callMockOrReal(
      "mockChats",
      () => mockStore.createChat(params.title || "New Chat"),
      () => this.realClient!.createChat(params),
    );
  }

  async sendMessage(params: any) {
    return this.callMockOrReal(
      "mockAI",
      () => {
        // Simulate AI response delay
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: Date.now(),
              role: "assistant",
              content: `Mock AI response to: "${params.content}"`,
            });
          }, 1000);
        });
      },
      () => this.realClient!.sendMessage(params),
    );
  }

  // Add all other IpcClient methods with same pattern...
  // This is a template - add methods as you need them

  // Utility to update mock configuration on the fly
  updateConfig(newConfig: Partial<MockConfig>) {
    Object.assign(this.config, newConfig);
  }

  // Get current config for debugging
  getConfig() {
    return { ...this.config };
  }
}
```

### Step 3: Create Smart Environment Detection & IPC Factory

**Time: 1 hour**

Create `src/lib/environment.ts` with gradual migration support:

```typescript
import { IpcClient } from "../ipc/ipc_client";
import { ConfigurableMockIpcClient } from "./mock-ipc";

export const isElectron = () => {
  return typeof window !== "undefined" && window.electron;
};

export const isWeb = () => {
  return !isElectron();
};

// Development flags for gradual migration
export interface MigrationConfig {
  // Phase 1: Start with everything mocked
  useRealApps?: boolean;
  useRealSettings?: boolean;
  useRealFiles?: boolean;
  useRealChats?: boolean;
  useRealAI?: boolean;

  // Phase 2: Backend integration
  useWebAPI?: boolean;
  apiBaseUrl?: string;
}

// Get config from environment or localStorage
export const getMigrationConfig = (): MigrationConfig => {
  const defaults: MigrationConfig = {
    useRealApps: false,
    useRealSettings: false,
    useRealFiles: false,
    useRealChats: false,
    useRealAI: false,
    useWebAPI: false,
    apiBaseUrl: "/api",
  };

  if (typeof window === "undefined") return defaults;

  // Allow runtime configuration via localStorage (for testing)
  const saved = localStorage.getItem("dyad-migration-config");
  if (saved) {
    try {
      return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Invalid migration config in localStorage");
    }
  }

  // Environment-based config
  return {
    ...defaults,
    useRealApps: import.meta.env.VITE_USE_REAL_APPS === "true",
    useRealSettings: import.meta.env.VITE_USE_REAL_SETTINGS === "true",
    useRealFiles: import.meta.env.VITE_USE_REAL_FILES === "true",
    useRealChats: import.meta.env.VITE_USE_REAL_CHATS === "true",
    useRealAI: import.meta.env.VITE_USE_REAL_AI === "true",
    useWebAPI: import.meta.env.VITE_USE_WEB_API === "true",
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  };
};

// Factory function with migration support
export const createIpcClient = () => {
  const config = getMigrationConfig();

  if (isElectron()) {
    // In Electron: Use real IPC client
    return new IpcClient();
  } else if (config.useWebAPI) {
    // In Web with backend: Use HTTP client
    return new WebIpcClient(config.apiBaseUrl!);
  } else {
    // In Web with mocking: Use configurable mock
    const mockConfig = {
      mockApps: !config.useRealApps,
      mockSettings: !config.useRealSettings,
      mockFiles: !config.useRealFiles,
      mockChats: !config.useRealChats,
      mockAI: !config.useRealAI,
    };

    return new ConfigurableMockIpcClient(mockConfig);
  }
};

// Utilities for development
export const enableFeature = (
  feature: keyof MigrationConfig,
  enabled: boolean = true,
) => {
  const config = getMigrationConfig();
  config[feature] = enabled;
  localStorage.setItem("dyad-migration-config", JSON.stringify(config));
  console.log(
    `${feature} ${enabled ? "enabled" : "disabled"}. Refresh to apply.`,
  );
};

// Development helper functions (add to window for console access)
if (typeof window !== "undefined") {
  (window as any).dyad = {
    enableFeature,
    getConfig: getMigrationConfig,
    resetConfig: () => {
      localStorage.removeItem("dyad-migration-config");
      console.log("Migration config reset. Refresh to apply.");
    },
  };
}
```

#### Add Web API Client for Backend Integration (`src/lib/web-ipc.ts`):

```typescript
// HTTP-based client for web backend
export class WebIpcClient {
  constructor(private baseUrl: string = "/api") {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Apps API
  async listApps() {
    return this.request("/apps");
  }

  async createApp(params: any) {
    return this.request("/apps", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async runApp(params: any) {
    return this.request(`/apps/${params.appId}/run`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Settings API
  async getSettings() {
    return this.request("/settings");
  }

  async updateSettings(settings: any) {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Files API
  async readFile(params: { path: string }) {
    return this.request(`/files?path=${encodeURIComponent(params.path)}`);
  }

  async writeFile(params: { path: string; content: string }) {
    return this.request("/files", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Add other methods as needed...
}
```

### Step 4: Update Main App Entry Point

**Time: 30 minutes**

Modify where IpcClient is instantiated to use the factory:

```typescript
// In your main App component or context provider
import { createIpcClient } from "./lib/environment";

const ipcClient = createIpcClient();
```

### Step 5: Add Web Scripts to package.json

**Time: 15 minutes**

```json
{
  "scripts": {
    "dev:web": "vite --config vite.web.config.mts",
    "build:web": "vite build --config vite.web.config.mts",
    "preview:web": "vite preview --config vite.web.config.mts"
  }
}
```

### Step 6: Test Basic Web Version

**Time: 30 minutes**

```bash
npm run dev:web
```

Should load the UI with mock data - no functionality yet, but proves the React app works in browser.

## Phase 2: Add Basic Backend API (1-2 days)

### Step 7: Create Simple Express Server

**Time: 2 hours**

Create `server/index.js`:

```javascript
const express = require("express");
const path = require("path");
const fs = require("fs").promises;

const app = express();
app.use(express.json());
app.use(express.static("dist-web"));

// Mock API endpoints
app.get("/api/apps", (req, res) => {
  res.json({ apps: [] }); // Start with empty
});

app.post("/api/apps", (req, res) => {
  res.json({ id: Date.now(), name: req.body.name });
});

app.get("/api/settings", (req, res) => {
  res.json({ theme: "dark" });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist-web", "index.html"));
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
```

### Step 8: Update Mock IPC Client to Use Real API

**Time: 1 hour**

Replace mock methods with fetch calls:

```typescript
export class WebIpcClient {
  async listApps() {
    const response = await fetch("/api/apps");
    return response.json();
  }

  async createApp(params) {
    const response = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.json();
  }

  // Add other methods as needed
}
```

### Step 9: Test Full Stack

**Time: 30 minutes**

```bash
npm run build:web
node server/index.js
```

Visit http://localhost:3001 - should have a working web app with basic API.

## Phase 3: Add Database (1 day)

### Step 10: Create SQLite Web Server with Existing Schema

**Time: 3 hours**

Keep your existing SQLite database and Drizzle setup, just access it from a web server:

```javascript
// server/db.js - Reuse your existing setup
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");

// Import your existing schema
const {
  appsTable,
  chatsTable,
  messagesTable,
  settingsTable,
} = require("../src/db/schema"); // Adjust path as needed

// Use existing database or create new one for web
const dbPath =
  process.env.NODE_ENV === "production"
    ? "./data/dyad-web.db"
    : "./data/dyad-dev.db";

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Run your existing migrations
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
migrate(db, { migrationsFolder: "./drizzle" });

module.exports = { db, appsTable, chatsTable, messagesTable, settingsTable };
```

### Step 11: SQLite-Based API Endpoints

**Time: 3 hours**

Create API endpoints that mirror your IPC handlers:

```javascript
// server/routes/apps.js
const express = require("express");
const { db, appsTable } = require("../db");
const { eq } = require("drizzle-orm");

const router = express.Router();

// GET /api/apps - List all apps
router.get("/", async (req, res) => {
  try {
    const apps = await db.select().from(appsTable);
    res.json({ apps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/apps - Create new app
router.post("/", async (req, res) => {
  try {
    const [app] = await db
      .insert(appsTable)
      .values({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/apps/:id - Update app
router.put("/:id", async (req, res) => {
  try {
    const [app] = await db
      .update(appsTable)
      .set({
        ...req.body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(appsTable.id, req.params.id))
      .returning();
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/apps/:id - Delete app
router.delete("/:id", async (req, res) => {
  try {
    await db.delete(appsTable).where(eq(appsTable.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

```javascript
// server/routes/settings.js
const express = require("express");
const { db, settingsTable } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const settings = await db.select().from(settingsTable).limit(1);
    res.json(settings[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    // Upsert settings
    const existing = await db.select().from(settingsTable).limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(settingsTable)
        .set(req.body)
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(settingsTable)
        .values(req.body)
        .returning();
      res.json(created);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

```javascript
// server/index.js - Updated main server
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dist-web"));

// Routes
app.use("/api/apps", require("./routes/apps"));
app.use("/api/settings", require("./routes/settings"));
// Add other routes as needed

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist-web", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${require("./db").sqlite.name}`);
});
```

## Phase 4: Add Critical Features (2-3 days)

### Step 12: File Management API

**Time: 4 hours**

```javascript
// Basic file operations (later replace with sandboxed system)
app.get("/api/files/*", async (req, res) => {
  const filePath = req.params[0];
  // Read file from workspace directory
  const content = await fs.readFile(`./workspaces/${filePath}`, "utf8");
  res.json({ content });
});

app.post("/api/files/*", async (req, res) => {
  const filePath = req.params[0];
  await fs.writeFile(`./workspaces/${filePath}`, req.body.content);
  res.json({ success: true });
});
```

### Step 13: App Execution

**Time: 4 hours**

```javascript
const { spawn } = require("child_process");

app.post("/api/apps/:id/run", (req, res) => {
  const appId = req.params.id;
  const child = spawn("npm", ["run", "dev"], {
    cwd: `./workspaces/app-${appId}`,
    stdio: "pipe",
  });

  child.stdout.on("data", (data) => {
    // Send output via WebSocket or Server-Sent Events
  });

  res.json({ processId: child.pid });
});
```

### Step 14: WebSocket for Real-time Updates

**Time: 2 hours**

Add WebSocket support for live output streaming:

```javascript
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("run-app", (appId) => {
    // Run app and stream output to this socket
  });
});
```

## Migration Strategy: Gradual Data Source Replacement

### Development Workflow

#### Phase 1A: Pure Mock (Start Here)

```bash
# All data is mocked - perfect for UI development
npm run dev:web
```

#### Phase 1B: Selective Real Data (Test Individual Features)

```javascript
// In browser console - test individual features
window.dyad.enableFeature("useRealSettings", true); // Use real settings
window.dyad.enableFeature("useRealApps", true); // Use real apps
// Refresh page to apply changes
```

#### Phase 1C: Environment-Based Config

```bash
# Create .env.local for controlled testing
VITE_USE_REAL_APPS=true
VITE_USE_REAL_SETTINGS=true
npm run dev:web
```

#### Phase 2: Backend Integration

```bash
# Enable web API mode
VITE_USE_WEB_API=true
npm run build:web
node server/index.js
```

### Data Migration Utilities

Create `scripts/migrate-data.js` to copy data between Electron and web:

```javascript
// scripts/migrate-data.js
const Database = require("better-sqlite3");
const path = require("path");
const os = require("os");

// Paths to databases
const electronDbPath = path.join(os.homedir(), ".dyad", "dyad.db"); // Adjust as needed
const webDbPath = "./data/dyad-web.db";

function migrateElectronToWeb() {
  const electronDb = new Database(electronDbPath, { readonly: true });
  const webDb = new Database(webDbPath);

  console.log("Migrating data from Electron to Web...");

  // Copy apps
  const apps = electronDb.prepare("SELECT * FROM apps").all();
  const insertApp = webDb.prepare(`
    INSERT OR REPLACE INTO apps (id, name, framework, path, createdAt, updatedAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const app of apps) {
    insertApp.run(
      app.id,
      app.name,
      app.framework,
      app.path,
      app.createdAt,
      app.updatedAt,
      app.status,
    );
  }

  // Copy settings
  const settings = electronDb.prepare("SELECT * FROM settings").all();
  const insertSetting = webDb.prepare(`
    INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const setting of settings) {
    insertSetting.run(setting.key, setting.value);
  }

  console.log(`Migrated ${apps.length} apps and ${settings.length} settings`);

  electronDb.close();
  webDb.close();
}

// Run migration
if (require.main === module) {
  migrateElectronToWeb();
}

module.exports = { migrateElectronToWeb };
```

### Testing Different Data Sources

Create `src/lib/data-source-tester.ts` for easy testing:

```typescript
// Test utility for comparing data sources
export class DataSourceTester {
  constructor(private client: any) {}

  async testApps() {
    console.group("🔧 Testing Apps API");
    try {
      const apps = await this.client.listApps();
      console.log("✅ listApps:", apps);

      if (apps.apps?.length > 0) {
        const firstApp = apps.apps[0];
        console.log("✅ Sample app:", firstApp);
      }
    } catch (error) {
      console.error("❌ Apps API failed:", error);
    }
    console.groupEnd();
  }

  async testSettings() {
    console.group("⚙️ Testing Settings API");
    try {
      const settings = await this.client.getSettings();
      console.log("✅ getSettings:", settings);
    } catch (error) {
      console.error("❌ Settings API failed:", error);
    }
    console.groupEnd();
  }

  async testFiles() {
    console.group("📁 Testing Files API");
    try {
      // Test reading a common file
      const packageJson = await this.client.readFile({
        path: "/demo-next/package.json",
      });
      console.log("✅ readFile:", packageJson);
    } catch (error) {
      console.error("❌ Files API failed:", error);
    }
    console.groupEnd();
  }

  async runAllTests() {
    console.log("🚀 Running Data Source Tests...");
    await this.testApps();
    await this.testSettings();
    await this.testFiles();
    console.log("✅ All tests completed");
  }
}

// Add to window for console access
if (typeof window !== "undefined") {
  (window as any).testDataSource = async () => {
    const client = (window as any).dyadClient; // Assuming you expose the client
    if (!client) {
      console.error("No dyad client found. Make sure app is loaded.");
      return;
    }

    const tester = new DataSourceTester(client);
    await tester.runAllTests();
  };
}
```

## Quick Start Commands

```bash
# 1. Start with pure mocking (immediate UI testing)
npm run dev:web

# 2. Test with selective real data (in browser console)
window.dyad.enableFeature('useRealApps', true)

# 3. Test with environment config
echo "VITE_USE_REAL_APPS=true" > .env.local
npm run dev:web

# 4. Build and test with full backend
npm run build:web
node server/index.js

# 5. Migrate existing Electron data
node scripts/migrate-data.js

# 6. Test all data sources (in browser console)
window.testDataSource()
```

## What This Gets You

### ✅ Working Immediately (Phase 1)

- React UI loads in browser
- All components render correctly
- Navigation works
- Mock data shows in interface

### ✅ After Phase 2

- Real backend API
- Database persistence
- Basic app CRUD operations

### ✅ After Phase 4

- File editing capabilities
- App execution
- Real-time output streaming

## What to Add Later (Complex Features)

### 🔄 Enhanced File System

- Proper sandboxing
- Upload/download files
- Project templates

### 🔄 Secure App Execution

- Docker containers
- Resource limits
- Network isolation

### 🔄 Advanced Features

- AI chat integration
- GitHub integration
- Multiple workspace support

## Deployment Options

### Simple Deployment

```bash
# Build everything
npm run build:web

# Deploy to any Node.js hosting
# Render, Railway, DigitalOcean, etc.
```

### Docker Deployment (Later)

```dockerfile
FROM node:18
COPY . .
RUN npm ci && npm run build:web
CMD ["node", "server/index.js"]
```

## Success Metrics

- **Phase 1**: UI loads in browser without errors
- **Phase 2**: Can create/list apps via web interface
- **Phase 3**: Data persists between sessions
- **Phase 4**: Can edit files and run apps

This plan gets you from Electron app to working web app in **4-6 days** with minimal code changes!
