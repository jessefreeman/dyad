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
      theme: "dark",
      aiProvider: "openai",
      apiKey: "",
      fontSize: 14,
    };
  }

  async setUserSettings(settings: any): Promise<any> {
    console.log("[MOCK] setUserSettings called", settings);
    return settings;
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

  // Add any other methods as needed...
}
