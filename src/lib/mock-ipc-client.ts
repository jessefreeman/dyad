// Simple mock client that returns empty/default responses
export class MockIpcClient {
  private static instance: MockIpcClient;

  private constructor() {}

  public static getInstance(): MockIpcClient {
    if (!MockIpcClient.instance) {
      MockIpcClient.instance = new MockIpcClient();
    }
    return MockIpcClient.instance;
  }

  // Mock all the critical methods your app needs
  async restartDyad(): Promise<void> {
    console.log("[MOCK] restartDyad called");
  }

  async reloadEnvPath(): Promise<void> {
    console.log("[MOCK] reloadEnvPath called");
  }

  async createApp(params: any): Promise<any> {
    console.log("[MOCK] createApp called", params);
    return {
      app: {
        id: 1,
        name: params.name || "Mock App",
        framework: "react",
        path: "/mock-app",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "stopped",
      },
      chatId: 1,
    };
  }

  async getApp(appId: number): Promise<any> {
    console.log("[MOCK] getApp called", appId);
    return {
      id: appId,
      name: "Mock App",
      framework: "react",
      path: "/mock-app",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "stopped",
    };
  }

  async listApps(): Promise<any> {
    console.log("[MOCK] listApps called");
    return {
      apps: [
        {
          id: 1,
          name: "Demo React App",
          framework: "react",
          path: "/demo-react",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "stopped",
        },
      ],
    };
  }

  async getChats(appId?: number): Promise<any> {
    console.log("[MOCK] getChats called", appId);
    return [
      {
        id: 1,
        title: "Welcome Chat",
        appId: appId || 1,
        createdAt: new Date().toISOString(),
        messageCount: 1,
      },
    ];
  }

  async getChat(chatId: number): Promise<any> {
    console.log("[MOCK] getChat called", chatId);
    return {
      id: chatId,
      title: "Welcome Chat",
      appId: 1,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          role: "assistant",
          content: "Hello! This is a mock chat in web mode.",
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getUserSettings(): Promise<any> {
    console.log("[MOCK] getUserSettings called");
    return {
      selectedModel: {
        providerId: "openai",
        modelId: "gpt-4",
        modelName: "GPT-4",
      },
      providerSettings: {
        openai: {
          apiKey: {
            value: "",
            encrypted: false,
          },
        },
        anthropic: {
          apiKey: {
            value: "",
            encrypted: false,
          },
        },
        google: {
          apiKey: {
            value: "",
            encrypted: false,
          },
        },
        auto: {
          apiKey: {
            value: "",
            encrypted: false,
          },
        },
        openrouter: {
          apiKey: {
            value: "",
            encrypted: false,
          },
        },
      },
      autoApproveChanges: false,
      telemetryConsent: "unset",
      hasRunBefore: false,
      enableDyadPro: false,
    };
  }

  async setUserSettings(settings: any): Promise<any> {
    console.log("[MOCK] setUserSettings called", settings);
    return { success: true };
  }

  async getLanguageModelProviders(): Promise<any[]> {
    console.log("[MOCK] getLanguageModelProviders called");
    return [
      {
        id: "openai",
        name: "OpenAI",
        hasFreeTier: false,
        websiteUrl: "https://openai.com",
        envVarName: "OPENAI_API_KEY",
        type: "cloud",
      },
      {
        id: "anthropic",
        name: "Anthropic",
        hasFreeTier: false,
        websiteUrl: "https://anthropic.com",
        envVarName: "ANTHROPIC_API_KEY",
        type: "cloud",
      },
      {
        id: "google",
        name: "Google AI",
        hasFreeTier: true,
        websiteUrl: "https://ai.google.dev",
        envVarName: "GOOGLE_API_KEY",
        type: "cloud",
      },
      {
        id: "auto",
        name: "Auto (Dyad Pro)",
        hasFreeTier: true,
        type: "cloud",
      },
      {
        id: "openrouter",
        name: "OpenRouter",
        hasFreeTier: false,
        websiteUrl: "https://openrouter.ai",
        envVarName: "OPENROUTER_API_KEY",
        type: "cloud",
      },
    ];
  }

  async listVersions({ appId }: { appId: number }): Promise<any[]> {
    console.log("[MOCK] listVersions called", appId);
    return [
      {
        oid: "abc123def456",
        message: "Initial commit",
        timestamp: Date.now() - 86400000, // 1 day ago
        dbTimestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        oid: "def456ghi789",
        message: "Added new feature",
        timestamp: Date.now() - 3600000, // 1 hour ago
        dbTimestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        oid: "ghi789jkl012",
        message: "Latest changes",
        timestamp: Date.now(),
        dbTimestamp: new Date().toISOString(),
      },
    ];
  }

  async getCurrentBranch(appId: number): Promise<{ branch: string }> {
    console.log("[MOCK] getCurrentBranch called", appId);
    return {
      branch: "main",
    };
  }

  async getProposal(chatId: number): Promise<any | null> {
    console.log("[MOCK] getProposal called", chatId);
    // Sometimes return null (no proposal), sometimes return a mock proposal
    if (Math.random() > 0.5) {
      return null;
    }

    return {
      proposal: {
        type: "code-proposal",
        title: "Add new feature",
        securityRisks: [],
        filesChanged: [
          {
            path: "/src/components/NewComponent.tsx",
            changeType: "create",
            content: "// New component code here",
          },
        ],
        packagesAdded: ["react-query"],
        sqlQueries: [],
      },
      chatId: chatId,
      messageId: Date.now(),
    };
  }

  async getAppEnvVars(params: {
    appId: number;
  }): Promise<{ key: string; value: string }[]> {
    console.log("[MOCK] getAppEnvVars called", params);
    return [
      { key: "NODE_ENV", value: "development" },
      { key: "REACT_APP_API_URL", value: "http://localhost:3001" },
      { key: "VITE_APP_TITLE", value: "Mock App" },
    ];
  }

  async countTokens(params: { chatId: number; input: string }): Promise<any> {
    console.log("[MOCK] countTokens called", params);
    // Return realistic mock token counts
    const inputLength = params.input.length;
    const estimatedInputTokens = Math.ceil(inputLength / 4); // Rough estimate: ~4 chars per token

    return {
      totalTokens: estimatedInputTokens + 150, // Add some for context
      messageHistoryTokens: 50,
      codebaseTokens: 75,
      inputTokens: estimatedInputTokens,
      systemPromptTokens: 25,
      contextWindow: 8000,
    };
  }

  async rejectProposal(params: {
    chatId: number;
    messageId: number;
  }): Promise<void> {
    console.log("[MOCK] rejectProposal called", params);
    // Mock rejecting a proposal - just log it
  }

  async approveProposal(params: {
    chatId: number;
    messageId: number;
  }): Promise<{ extraFiles?: string[]; extraFilesError?: string }> {
    console.log("[MOCK] approveProposal called", params);
    // Mock approving a proposal - return success with no extra files
    return {
      extraFiles: [],
    };
  }

  // Mock streaming with fake delay
  streamMessage(prompt: string, options: any): void {
    console.log("[MOCK] streamMessage called", prompt, options);
    const { onUpdate, onEnd, chatId } = options;

    // Simulate streaming response
    setTimeout(() => {
      const mockMessage = {
        id: Date.now(),
        role: "assistant",
        content: `Mock response to: "${prompt}"`,
        createdAt: new Date().toISOString(),
      };

      onUpdate([mockMessage]);

      setTimeout(() => {
        onEnd({
          chatId,
          messageId: mockMessage.id,
          success: true,
        });
      }, 500);
    }, 1000);
  }

  // Mock all other methods with console logs
  async runApp(appId: number, onOutput: any): Promise<void> {
    console.log("[MOCK] runApp called", appId);
    // Simulate some output
    setTimeout(() => {
      onOutput({
        type: "stdout",
        message: "Mock: App started successfully!",
        appId,
        timestamp: Date.now(),
      });
    }, 1000);
  }

  async stopApp(appId: number): Promise<void> {
    console.log("[MOCK] stopApp called", appId);
  }

  async readAppFile(appId: number, filePath: string): Promise<string> {
    console.log("[MOCK] readAppFile called", appId, filePath);
    return `// Mock file content for ${filePath}\nexport default function MockComponent() {\n  return <div>Mock Content</div>;\n}`;
  }

  async editAppFile(
    appId: number,
    filePath: string,
    content: string,
  ): Promise<any> {
    console.log("[MOCK] editAppFile called", appId, filePath, content);
    return { success: true };
  }

  // Add any other methods your app calls, all returning mock data
  async deleteApp(appId: number): Promise<void> {
    console.log("[MOCK] deleteApp called", appId);
  }

  async createChat(appId: number): Promise<number> {
    console.log("[MOCK] createChat called", appId);
    return Date.now();
  }

  async deleteChat(chatId: number): Promise<void> {
    console.log("[MOCK] deleteChat called", chatId);
  }

  async openExternalUrl(url: string): Promise<void> {
    console.log("[MOCK] openExternalUrl called", url);
    window.open(url, "_blank");
  }

  async getAppVersion(): Promise<string> {
    return "0.16.0-web";
  }

  async getSystemPlatform(): Promise<string> {
    return "web";
  }

  // Add method stubs for any other IPC calls
  on(channel: string, _callback: any): void {
    console.log("[MOCK] event listener registered", channel);
  }

  removeListener(channel: string, _callback: any): void {
    console.log("[MOCK] event listener removed", channel);
  }

  // Add all other methods as stubs that return appropriate mock data
  async minimizeWindow(): Promise<void> {
    console.log("[MOCK] minimizeWindow");
  }
  async maximizeWindow(): Promise<void> {
    console.log("[MOCK] maximizeWindow");
  }
  async closeWindow(): Promise<void> {
    console.log("[MOCK] closeWindow");
  }
  async showItemInFolder(path: string): Promise<void> {
    console.log("[MOCK] showItemInFolder", path);
  }
  async getEnvVars(): Promise<Record<string, string | undefined>> {
    return {};
  }

  async getNodejsStatus(): Promise<any> {
    console.log("[MOCK] getNodejsStatus called");
    return {
      nodeVersion: "v18.17.0",
      pnpmVersion: "8.6.0",
      nodeDownloadUrl: "https://nodejs.org/download/",
    };
  }

  async restartApp(
    appId: number,
    _onOutput: any,
    _removeNodeModules?: boolean,
  ): Promise<any> {
    console.log("[MOCK] restartApp", appId);
    return { success: true };
  }

  onDeepLinkReceived(_callback: (data: any) => void): () => void {
    console.log("[MOCK] onDeepLinkReceived called");
    // Return a no-op cleanup function since we don't actually listen to anything in mock mode
    return () => {
      console.log("[MOCK] onDeepLinkReceived cleanup called");
    };
  }

  // === Missing core IPC methods ===

  async setAppEnvVars(params: {
    appId: number;
    envVars: { key: string; value: string }[];
  }): Promise<void> {
    console.log("[MOCK] setAppEnvVars called", params);
  }

  async updateChat(params: { chatId: number; title?: string }): Promise<void> {
    console.log("[MOCK] updateChat called", params);
  }

  async deleteMessages(chatId: number): Promise<void> {
    console.log("[MOCK] deleteMessages called", chatId);
  }

  async respondToAppInput(params: {
    appId: number;
    input: string;
  }): Promise<void> {
    console.log("[MOCK] respondToAppInput called", params);
  }

  async revertVersion(params: { appId: number; oid: string }): Promise<void> {
    console.log("[MOCK] revertVersion called", params);
  }

  async checkoutVersion(params: { appId: number; oid: string }): Promise<void> {
    console.log("[MOCK] checkoutVersion called", params);
  }

  async renameApp(params: { appId: number; newName: string }): Promise<void> {
    console.log("[MOCK] renameApp called", params);
  }

  async copyApp(params: {
    appId: number;
    newAppName: string;
  }): Promise<{ app: any }> {
    console.log("[MOCK] copyApp called", params);
    return {
      app: {
        id: Date.now(),
        name: params.newAppName,
        framework: "react",
        path: `/mock-${params.newAppName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "stopped",
      },
    };
  }

  async resetAll(): Promise<void> {
    console.log("[MOCK] resetAll called");
  }

  async addDependency(params: {
    appId: number;
    packageName: string;
    version?: string;
  }): Promise<void> {
    console.log("[MOCK] addDependency called", params);
  }

  // === GitHub Integration ===

  startGithubDeviceFlow(appId: number | null): void {
    console.log("[MOCK] startGithubDeviceFlow called", appId);
  }

  onGithubDeviceFlowUpdate(_callback: (data: any) => void): () => void {
    console.log("[MOCK] onGithubDeviceFlowUpdate called");
    return () => console.log("[MOCK] onGithubDeviceFlowUpdate cleanup");
  }

  onGithubDeviceFlowSuccess(_callback: (data: any) => void): () => void {
    console.log("[MOCK] onGithubDeviceFlowSuccess called");
    return () => console.log("[MOCK] onGithubDeviceFlowSuccess cleanup");
  }

  onGithubDeviceFlowError(_callback: (error: any) => void): () => void {
    console.log("[MOCK] onGithubDeviceFlowError called");
    return () => console.log("[MOCK] onGithubDeviceFlowError cleanup");
  }

  async listGithubRepos(): Promise<any[]> {
    console.log("[MOCK] listGithubRepos called");
    return [
      {
        id: 1,
        name: "mock-repo-1",
        full_name: "user/mock-repo-1",
        private: false,
      },
      {
        id: 2,
        name: "mock-repo-2",
        full_name: "user/mock-repo-2",
        private: true,
      },
    ];
  }

  async getGithubRepoBranches(params: {
    owner: string;
    repo: string;
  }): Promise<any[]> {
    console.log("[MOCK] getGithubRepoBranches called", params);
    return [
      { name: "main", commit: { sha: "abc123" } },
      { name: "develop", commit: { sha: "def456" } },
    ];
  }

  async connectToExistingGithubRepo(params: any): Promise<void> {
    console.log("[MOCK] connectToExistingGithubRepo called", params);
  }

  async checkGithubRepoAvailable(params: {
    owner: string;
    repo: string;
  }): Promise<boolean> {
    console.log("[MOCK] checkGithubRepoAvailable called", params);
    return true;
  }

  async createGithubRepo(params: any): Promise<any> {
    console.log("[MOCK] createGithubRepo called", params);
    return {
      id: Date.now(),
      name: params.name,
      full_name: `user/${params.name}`,
    };
  }

  async syncGithubRepo(params: { appId: number }): Promise<void> {
    console.log("[MOCK] syncGithubRepo called", params);
  }

  async disconnectGithubRepo(appId: number): Promise<void> {
    console.log("[MOCK] disconnectGithubRepo called", appId);
  }

  // === Vercel Integration ===

  async saveVercelAccessToken(_params: { token: string }): Promise<void> {
    console.log("[MOCK] saveVercelAccessToken called");
  }

  async listVercelProjects(): Promise<any[]> {
    console.log("[MOCK] listVercelProjects called");
    return [
      { id: "mock-project-1", name: "Mock Project 1" },
      { id: "mock-project-2", name: "Mock Project 2" },
    ];
  }

  async connectToExistingVercelProject(params: any): Promise<void> {
    console.log("[MOCK] connectToExistingVercelProject called", params);
  }

  async isVercelProjectAvailable(params: { name: string }): Promise<boolean> {
    console.log("[MOCK] isVercelProjectAvailable called", params);
    return true;
  }

  async createVercelProject(params: any): Promise<any> {
    console.log("[MOCK] createVercelProject called", params);
    return { id: `mock-${Date.now()}`, name: params.name };
  }

  async getVercelDeployments(params: { appId: number }): Promise<any[]> {
    console.log("[MOCK] getVercelDeployments called", params);
    return [
      {
        uid: "mock-deployment-1",
        url: "https://mock-app-1.vercel.app",
        state: "READY",
      },
    ];
  }

  async disconnectVercelProject(params: { appId: number }): Promise<void> {
    console.log("[MOCK] disconnectVercelProject called", params);
  }

  // === Supabase Integration ===

  async listSupabaseProjects(): Promise<any[]> {
    console.log("[MOCK] listSupabaseProjects called");
    return [{ id: "mock-supabase-1", name: "Mock Supabase Project" }];
  }

  async setSupabaseAppProject(params: {
    appId: number;
    projectId: string;
  }): Promise<void> {
    console.log("[MOCK] setSupabaseAppProject called", params);
  }

  async unsetSupabaseAppProject(appId: number): Promise<void> {
    console.log("[MOCK] unsetSupabaseAppProject called", appId);
  }

  async fakeHandleSupabaseConnect(params: {
    code: string;
    state: string;
  }): Promise<void> {
    console.log("[MOCK] fakeHandleSupabaseConnect called", params);
  }

  async fakeHandleNeonConnect(): Promise<void> {
    console.log("[MOCK] fakeHandleNeonConnect called");
  }

  async createNeonProject(params: {
    appId: number;
    name: string;
  }): Promise<any> {
    console.log("[MOCK] createNeonProject called", params);
    return { id: `mock-neon-${Date.now()}`, name: params.name };
  }

  async getNeonProject(params: { appId: number }): Promise<any> {
    console.log("[MOCK] getNeonProject called", params);
    return { id: "mock-neon-1", name: "Mock Neon DB" };
  }

  // === System & Debug ===

  async getSystemDebugInfo(): Promise<any> {
    console.log("[MOCK] getSystemDebugInfo called");
    return {
      platform: "web",
      version: "0.16.0-web",
      nodeVersion: "v18.17.0",
    };
  }

  async getChatLogs(chatId: number): Promise<any> {
    console.log("[MOCK] getChatLogs called", chatId);
    return {
      logs: [`Mock log entry for chat ${chatId}`],
    };
  }

  async uploadToSignedUrl(params: { url: string; file: File }): Promise<void> {
    console.log("[MOCK] uploadToSignedUrl called", params);
  }

  // === Local Models ===

  async listLocalOllamaModels(): Promise<any[]> {
    console.log("[MOCK] listLocalOllamaModels called");
    return [
      { name: "llama2", size: "3.8GB" },
      { name: "codellama", size: "3.8GB" },
    ];
  }

  async listLocalLMStudioModels(): Promise<any[]> {
    console.log("[MOCK] listLocalLMStudioModels called");
    return [{ name: "mock-lm-studio-model", size: "4.2GB" }];
  }

  // === Language Model Providers ===

  async getLanguageModels(params: { providerId: string }): Promise<any[]> {
    console.log("[MOCK] getLanguageModels called", params);
    return [
      { id: "gpt-4", name: "GPT-4", providerId: params.providerId },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        providerId: params.providerId,
      },
    ];
  }

  async getLanguageModelsByProviders(): Promise<Record<string, any[]>> {
    console.log("[MOCK] getLanguageModelsByProviders called");
    return {
      openai: [
        { id: "gpt-4", name: "GPT-4" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
      ],
      anthropic: [{ id: "claude-3-opus", name: "Claude 3 Opus" }],
    };
  }

  async createCustomLanguageModelProvider(params: any): Promise<any> {
    console.log("[MOCK] createCustomLanguageModelProvider called", params);
    return { id: `custom-${Date.now()}`, name: params.name };
  }

  async createCustomLanguageModel(params: any): Promise<any> {
    console.log("[MOCK] createCustomLanguageModel called", params);
    return { id: `custom-model-${Date.now()}`, name: params.name };
  }

  async deleteCustomLanguageModel(modelId: string): Promise<void> {
    console.log("[MOCK] deleteCustomLanguageModel called", modelId);
  }

  // === App Management ===

  async selectAppFolder(): Promise<{ path: string; canceled: boolean }> {
    console.log("[MOCK] selectAppFolder called");
    return { path: "/mock/selected/folder", canceled: false };
  }

  async checkAiRules(params: { appId: number }): Promise<boolean> {
    console.log("[MOCK] checkAiRules called", params);
    return true;
  }

  async importApp(params: { path: string; appName: string }): Promise<any> {
    console.log("[MOCK] importApp called", params);
    return {
      app: {
        id: Date.now(),
        name: params.appName,
        path: params.path,
        framework: "react",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "stopped",
      },
    };
  }

  async renameBranch(params: {
    appId: number;
    oldName: string;
    newName: string;
  }): Promise<void> {
    console.log("[MOCK] renameBranch called", params);
  }

  // === User Budget & Context ===

  async getUserBudget(): Promise<any | null> {
    console.log("[MOCK] getUserBudget called");
    return {
      budget: 100,
      used: 25,
      remaining: 75,
    };
  }

  async getChatContextResults(params: { chatId: number }): Promise<any> {
    console.log("[MOCK] getChatContextResults called", params);
    return {
      results: ["Mock context result 1", "Mock context result 2"],
    };
  }

  async setChatContext(params: {
    chatId: number;
    context: any;
  }): Promise<void> {
    console.log("[MOCK] setChatContext called", params);
  }

  // === App Upgrades ===

  async getAppUpgrades(params: { appId: number }): Promise<any[]> {
    console.log("[MOCK] getAppUpgrades called", params);
    return [
      {
        id: "upgrade-1",
        name: "React 18 Upgrade",
        description: "Upgrade to React 18",
      },
    ];
  }

  async executeAppUpgrade(params: {
    appId: number;
    upgradeId: string;
  }): Promise<void> {
    console.log("[MOCK] executeAppUpgrade called", params);
  }

  // === Capacitor (Mobile) ===

  async isCapacitor(params: { appId: number }): Promise<boolean> {
    console.log("[MOCK] isCapacitor called", params);
    return false;
  }

  async syncCapacitor(params: { appId: number }): Promise<void> {
    console.log("[MOCK] syncCapacitor called", params);
  }

  async openIos(params: { appId: number }): Promise<void> {
    console.log("[MOCK] openIos called", params);
  }

  async openAndroid(params: { appId: number }): Promise<void> {
    console.log("[MOCK] openAndroid called", params);
  }

  // === Problem Checking ===

  async checkProblems(params: { appId: number }): Promise<any[]> {
    console.log("[MOCK] checkProblems called", params);
    return [
      {
        type: "warning",
        message: "Mock warning: Consider updating dependencies",
      },
    ];
  }

  // === Templates ===

  async getTemplates(): Promise<any[]> {
    console.log("[MOCK] getTemplates called");
    return [
      {
        id: "react-basic",
        name: "React Basic",
        description: "A basic React template",
      },
      { id: "next-js", name: "Next.js", description: "A Next.js template" },
    ];
  }

  // === Portal Migration ===

  async portalMigrateCreate(params: { appId: number }): Promise<void> {
    console.log("[MOCK] portalMigrateCreate called", params);
  }

  // === Release Notes ===

  async doesReleaseNoteExist(version: string): Promise<boolean> {
    console.log("[MOCK] doesReleaseNoteExist called", version);
    return true;
  }

  // === Event Handlers ===

  cancelChatStream(chatId: number): void {
    console.log("[MOCK] cancelChatStream called", chatId);
  }

  // Add any other methods as needed...
}
