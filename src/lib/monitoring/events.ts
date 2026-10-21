import posthog from "posthog-js";

export interface CustomEvents {
  career_viewed: {
    career_id: string;
    title: string;
    timestamp: string;
    interest: string;
    level: string;
  };

  roadmap_viewed: {
    roadmap_id: string;
    career_id: string;
    career_title: string;
    timestamp: string;
    interest: string;
    level: string;
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
    careerViewed: (
      career_id: string,
      title: string,
      interest?: string,
      level?: string,
    ) => {
      analytics.track("career_viewed", {
        career_id,
        title,
        timestamp: new Date().toISOString(),
        interest: interest ?? "",
        level: level ?? "",
      });
    },

    roadmapViewed: (
      roadmap_id: string,
      career_id: string,
      career_title: string,
      interest?: string,
      level?: string,
    ) => {
      analytics.track("roadmap_viewed", {
        roadmap_id,
        career_id,
        career_title,
        timestamp: new Date().toISOString(),
        interest: interest ?? "",
        level: level ?? "",
      });
    },
  },
};
