// This file provides a universal IPC client that works in both Electron and Web environments
import { getIpcClient } from "./environment";

// Create a singleton instance
let universalIpcClient: any = null;

// Export a class-like interface that matches the original IpcClient
export class IpcClient {
  static getInstance() {
    if (!universalIpcClient) {
      universalIpcClient = getIpcClient();
    }
    return universalIpcClient;
  }
}

// Also export the function directly for convenience
export const getUniversalIpcClient = getIpcClient;
