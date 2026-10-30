import type { PostHog, PostHogConfig } from "posthog-js";

// PostHog is ~280 KB, so it loads in its own chunk after the app starts.
// Calls made while it loads are queued; calls made when analytics was never
// started (no project token) are dropped.
let client: PostHog | null = null;
let queued: Array<(posthog: PostHog) => void> | null = null;

function withClient(call: (posthog: PostHog) => void) {
  if (client) {
    call(client);
  } else {
    queued?.push(call);
  }
}

export function initAnalytics(
  apiKey: string | undefined,
  config: Partial<PostHogConfig>,
): Promise<void> {
  if (!apiKey || client || queued) {
    return Promise.resolve();
  }

  queued = [];
  return import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(apiKey, config);
      client = posthog;
      queued?.forEach((call) => call(posthog));
    })
    .catch(() => {
      // Analytics is optional; a blocked or failed chunk shouldn't surface.
    })
    .finally(() => {
      queued = null;
    });
}

export interface CustomEvents {
  career_detail_viewed: {
    career_id: string;
    title: string;
    timestamp: string;
    interest: string;
    levels: string[];
  };

  career_viewed: {
    career_id: string;
    title: string;
    timestamp: string;
    interest: string;
    levels: string[];
  };

  roadmap_viewed: {
    roadmap_id: string;
    career_id: string;
    career_title: string;
    timestamp: string;
  };

  resource_opened: {
    resource_id: string;
    title: string;
    provider: string;
    kind: string;
    timestamp: string;
  };
}

export interface UserTraits {
  email?: string;
  name?: string;
  timestamp?: string;
}

export const analytics = {
  track: <K extends keyof CustomEvents>(
    eventName: K,
    properties: CustomEvents[K],
  ) => {
    withClient((posthog) => posthog.capture(eventName, properties));
  },

  identify: (userId: string, userProperties?: UserTraits) => {
    withClient((posthog) => posthog.identify(userId, userProperties));
  },

  logout: () => {
    withClient((posthog) => posthog.reset());
  },

  trackFeature: {
    careerDetailViewed: (
      career_id: string,
      title: string,
      interest?: string,
      levels?: string[],
    ) => {
      analytics.track("career_detail_viewed", {
        career_id,
        title,
        timestamp: new Date().toISOString(),
        interest: interest ?? "",
        levels: levels ?? [],
      });
    },

    careerViewed: (
      career_id: string,
      title: string,
      interest?: string,
      levels?: string[],
    ) => {
      analytics.track("career_viewed", {
        career_id,
        title,
        timestamp: new Date().toISOString(),
        interest: interest ?? "",
        levels: levels ?? [],
      });
    },

    roadmapViewed: (
      roadmap_id: string,
      career_id: string,
      career_title: string,
    ) => {
      analytics.track("roadmap_viewed", {
        roadmap_id,
        career_id,
        career_title,
        timestamp: new Date().toISOString(),
      });
    },

    resourceOpened: (
      resource_id: string,
      title: string,
      provider: string,
      kind: string,
    ) => {
      analytics.track("resource_opened", {
        resource_id,
        title,
        provider,
        kind,
        timestamp: new Date().toISOString(),
      });
    },
  },
};
