import posthog from "posthog-js";

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
    // the internal variable `__loaded` is used intentionally used here.
    // There is currently no public API from posthog for checking this,
    // and this is a recommended way provided the risk is understood
    if (posthog.__loaded) {
      posthog.capture(eventName, properties);
    }
  },

  identify: (userId: string, userProperties?: UserTraits) => {
    if (posthog.__loaded) {
      posthog.identify(userId, userProperties);
    }
  },

  logout: () => {
    if (posthog.__loaded) {
      posthog.reset();
    }
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
