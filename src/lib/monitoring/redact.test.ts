import { describe, expect, it } from "vitest";
import { redactDeep, redactString } from "./redact";

describe("redactString", () => {
  it("hides the token in an absolute or relative URL", () => {
    expect(redactString("https://app.pathway.dev/accept-invite?token=abc123")).toBe(
      "https://app.pathway.dev/accept-invite?token=[redacted]",
    );
    expect(redactString("/accept-invite?token=abc123&ref=email")).toBe(
      "/accept-invite?token=[redacted]&ref=email",
    );
  });

  it("hides it when it is not the first parameter, or sits in a fragment", () => {
    expect(redactString("/accept-invite?ref=email&token=abc123")).toBe(
      "/accept-invite?ref=email&token=[redacted]",
    );
    expect(redactString("/accept-invite#token=abc123")).toBe("/accept-invite#token=[redacted]");
  });

  it("hides it in a bare query string", () => {
    expect(redactString("token=abc123&x=1")).toBe("token=[redacted]&x=1");
  });

  it("hides it inside the encoded return address on the login page", () => {
    expect(redactString("/login?redirect=%2Faccept-invite%3Ftoken%3Dabc123")).toBe(
      "/login?redirect=%2Faccept-invite%3Ftoken%3D[redacted]",
    );
    expect(redactString("/login?redirect=%2Faccept-invite%3Fa%3D1%26token%3Dabc123%26b%3D2")).toBe(
      "/login?redirect=%2Faccept-invite%3Fa%3D1%26token%3D[redacted]%26b%3D2",
    );
  });

  it("hides every token when there are several", () => {
    expect(redactString("/a?token=one and /b?token=two")).toBe(
      "/a?token=[redacted] and /b?token=[redacted]",
    );
  });

  it("leaves other parameters and similarly named ones alone", () => {
    const url = "/careers?level=STUDENT&csrf_token=keep&access_token=keep&tokens=2";
    expect(redactString(url)).toBe(url);
    expect(redactString("/careers/frontend-developer")).toBe("/careers/frontend-developer");
  });
});

describe("redactDeep", () => {
  it("scrubs strings anywhere inside an event", () => {
    const event = {
      request: {
        url: "https://app.pathway.dev/accept-invite?token=abc123",
        query_string: "token=abc123",
      },
      breadcrumbs: [
        { category: "navigation", data: { from: "/login?redirect=%2Faccept-invite%3Ftoken%3Dabc123", to: "/x" } },
      ],
      tags: { page: "accept-invite" },
      count: 3,
      flag: true,
      missing: null,
    };

    expect(redactDeep(event)).toEqual({
      request: {
        url: "https://app.pathway.dev/accept-invite?token=[redacted]",
        query_string: "token=[redacted]",
      },
      breadcrumbs: [
        {
          category: "navigation",
          data: { from: "/login?redirect=%2Faccept-invite%3Ftoken%3D[redacted]", to: "/x" },
        },
      ],
      tags: { page: "accept-invite" },
      count: 3,
      flag: true,
      missing: null,
    });
  });

  it("does not change the original", () => {
    const event = { url: "/accept-invite?token=abc123" };

    redactDeep(event);

    expect(event.url).toBe("/accept-invite?token=abc123");
  });

  it("leaves non-plain objects such as errors and dates as they are", () => {
    const error = new Error("boom");
    const date = new Date(0);

    const result = redactDeep({ error, date });

    expect(result.error).toBe(error);
    expect(result.date).toBe(date);
  });
});
