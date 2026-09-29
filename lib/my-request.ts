import "server-only";

import { headers } from "next/headers";

import { blockReasonForIp } from "@/lib/ip-guard";

type JsonObject = Record<string, unknown>;

export type ParsedUserAgent = {
  name: string;
  type: string;
  version: string;
  deviceName: string;
  deviceType: string;
  engineName: string;
  osName: string;
  osVersion: string;
};

export type ClientNetwork = {
  ip: string;
  countryName: string;
  countryEmoji: string;
  city: string;
  organization: string;
  asNumber: string;
};

export type MyRequestData = {
  /** Every header the server received, lower-cased keys. */
  headers: Record<string, string>;
  userAgent: string;
  parsedUserAgent: ParsedUserAgent | null;
  client: ClientNetwork | null;
  /** Populated when an enrichment call failed, for an inline note. */
  note: string | null;
};

const UA_ENDPOINT = "https://api.ipgeolocation.io/v3/user-agent";
const GEO_ENDPOINT = "https://api.ipgeolocation.io/v3/ipgeo";
const GEO_FIELDS = [
  "ip",
  "asn",
  "company",
  "location.country_name",
  "location.country_emoji",
  "location.city",
].join(",");

/** Headers whose values are secrets or long noise; shown as redacted. */
const REDACTED = new Set(["cookie", "authorization", "proxy-authorization"]);

export async function getMyRequest(): Promise<MyRequestData> {
  const headerStore = await headers();
  const collected: Record<string, string> = {};

  headerStore.forEach((value, key) => {
    const name = key.toLowerCase();
    collected[name] = REDACTED.has(name)
      ? `[redacted — ${value.length} characters]`
      : value;
  });

  const userAgent = headerStore.get("user-agent") ?? "";
  const clientIp = pickPublicIp(headerStore);
  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return {
      headers: collected,
      userAgent,
      parsedUserAgent: null,
      client: null,
      note: "Set IPGEOLOCATION_API_KEY in your .env file to parse the User-Agent and locate the client IP.",
    };
  }

  const [parsedUserAgent, client] = await Promise.all([
    parseUserAgent(userAgent, apiKey),
    clientIp ? locateIp(clientIp, apiKey) : Promise.resolve(null),
  ]);

  return {
    headers: collected,
    userAgent,
    parsedUserAgent,
    client,
    note: clientIp
      ? null
      : "Your request arrived from a local address, so there is no public IP to look up.",
  };
}

/**
 * The free tier parses the User-Agent from the request header on a GET call,
 * so the string is forwarded as a header rather than a POST body.
 */
async function parseUserAgent(
  userAgent: string,
  apiKey: string,
): Promise<ParsedUserAgent | null> {
  const safe = userAgent.replace(/[\x00-\x1F\x7F]/g, "").trim();

  if (!safe) {
    return null;
  }

  try {
    const response = await fetch(`${UA_ENDPOINT}?apiKey=${encodeURIComponent(apiKey)}`, {
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": safe },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonObject;
    const device = asObject(payload.device);
    const engine = asObject(payload.engine);
    const os = asObject(payload.operating_system);

    return {
      name: clean(readString(payload.name)),
      type: clean(readString(payload.type)),
      version: clean(readString(payload.version)),
      deviceName: clean(readString(device?.name)),
      deviceType: clean(readString(device?.type)),
      engineName: clean(readString(engine?.name)),
      osName: clean(readString(os?.name)),
      osVersion: clean(readString(os?.version)),
    };
  } catch {
    return null;
  }
}

async function locateIp(ip: string, apiKey: string): Promise<ClientNetwork | null> {
  try {
    const params = new URLSearchParams({ apiKey, ip, fields: GEO_FIELDS });
    const response = await fetch(`${GEO_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonObject;
    const location = asObject(payload.location);
    const asn = asObject(payload.asn);
    const company = asObject(payload.company);

    return {
      ip: readString(payload.ip) ?? ip,
      countryName: readString(location?.country_name) ?? "",
      countryEmoji: readString(location?.country_emoji) ?? "",
      city: readString(location?.city) ?? "",
      organization:
        readString(company?.name) ?? readString(asn?.organization) ?? "",
      asNumber: readString(asn?.as_number) ?? "",
    };
  } catch {
    return null;
  }
}

function pickPublicIp(headerStore: Headers): string | null {
  const candidates = [
    headerStore.get("x-forwarded-for"),
    headerStore.get("x-real-ip"),
    headerStore.get("cf-connecting-ip"),
    headerStore.get("x-vercel-forwarded-for"),
  ];

  for (const value of candidates) {
    const candidate = value
      ?.split(",")
      .map((item) => item.trim())
      .find(Boolean)
      ?.replace(/^\[|\]$/g, "");

    if (candidate && !blockReasonForIp(candidate)) {
      return candidate;
    }
  }

  return null;
}

/** The API uses "??" for values it could not determine. */
function clean(value: string | null) {
  const text = (value ?? "").trim();
  return text === "" || text === "??" ? "" : text;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}
