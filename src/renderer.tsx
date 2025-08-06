import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./router";
import { RouterProvider } from "@tanstack/react-router";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { getTelemetryUserId, isTelemetryOptedIn } from "./hooks/useSettings";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { showError } from "./lib/toast";
import { isWeb } from "./lib/environment";

// @ts-ignore
console.log("Running in mode:", import.meta.env.MODE);

interface MyMeta extends Record<string, unknown> {
  showErrorToast: boolean;
}

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: MyMeta;
    mutationMeta: MyMeta;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.showErrorToast) {
        showError(error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.showErrorToast) {
        showError(error);
      }
    },
  }),
});

// Only initialize PostHog if we're not in web mode and telemetry is potentially opted in
const shouldInitializePostHog = !isWeb();

const posthogClient = shouldInitializePostHog
  ? posthog.init("phc_5Vxx0XT8Ug3eWROhP6mm4D6D2DgIIKT232q4AKxC2ab", {
      api_host: "https://us.i.posthog.com",
      // @ts-ignore
      debug: import.meta.env.MODE === "development",
      autocapture: false,
      capture_exceptions: true,
      capture_pageview: false,
      before_send: (event) => {
        if (!isTelemetryOptedIn()) {
          console.debug("Telemetry not opted in, skipping event");
          return null;
        }
        const telemetryUserId = getTelemetryUserId();
        if (telemetryUserId) {
          posthogClient?.identify(telemetryUserId);
        }

        if (event?.properties["$ip"]) {
          event.properties["$ip"] = null;
        }

        console.debug(
          "Telemetry opted in - UUID:",
          telemetryUserId,
          "sending event",
          event,
        );
        return event;
      },
      persistence: "localStorage",
    })
  : undefined;

function App() {
  useEffect(() => {
    // Only set up navigation tracking if PostHog is initialized
    if (!posthogClient) return;

    // Subscribe to navigation state changes
    const unsubscribe = router.subscribe("onResolved", (navigation) => {
      // Capture the navigation event in PostHog
      posthogClient.capture("navigation", {
        toPath: navigation.toLocation.pathname,
        fromPath: navigation.fromLocation?.pathname,
      });

      // Optionally capture as a standard pageview as well
      posthogClient.capture("$pageview", {
        path: navigation.toLocation.pathname,
      });
    });

    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {posthogClient ? (
        <PostHogProvider client={posthogClient}>
          <App />
        </PostHogProvider>
      ) : (
        <App />
      )}
    </QueryClientProvider>
  </StrictMode>,
);
