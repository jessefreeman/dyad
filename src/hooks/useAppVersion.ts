import { useState, useEffect } from "react";
import { IpcClient } from "@/lib/universal-ipc";

export function useAppVersion() {
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await IpcClient.getInstance().getAppVersion();
        setAppVersion(version);
      } catch {
        setAppVersion(null);
      }
    };
    fetchVersion();
  }, []);

  return appVersion;
}
