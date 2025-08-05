import { IpcClient } from "../ipc/ipc_client";
import { MockIpcClient } from "./mock-ipc-client";

export const isElectron = () => {
  return typeof window !== "undefined" && (window as any).electron;
};

export const isWeb = () => {
  return !isElectron();
};

// Factory function to get the right client
export const createIpcClient = () => {
  if (isElectron()) {
    // In Electron: Use real IPC client
    return IpcClient.getInstance();
  } else {
    // In Web: Use mock client
    return MockIpcClient.getInstance() as any; // Cast to match IpcClient interface
  }
};

// Global client instance
let globalIpcClient: any = null;

export const getIpcClient = () => {
  if (!globalIpcClient) {
    globalIpcClient = createIpcClient();
  }
  return globalIpcClient;
};

// Development helper for debugging
if (typeof window !== "undefined") {
  (window as any).dyadEnv = {
    isElectron: isElectron(),
    isWeb: isWeb(),
    client: getIpcClient(),
  };
}
