import "server-only";

import dns from "node:dns/promises";
import { isIP } from "node:net";

import {
  blockReasonForHostname,
  blockReasonForIp,
  blockReasonForProtocol,
} from "@/lib/ip-guard";
import { gradeSecurityHeaders, type SecurityReport } from "@/lib/security-grade";

type JsonObject = Record<string, unknown>;

export type ServerInfo = {
  ip: string;
  countryName: string;
  countryEmoji: string;
  city: string;
  organization: string;
  asNumber: string;
  isCdn: boolean;
  cdnProviderName: string;
  isAnycast: boolean;
};

export type InspectionData = {
  /** Final URL after redirects. */
  url: string;
  requestedUrl: string;
  status: number;
  statusText: string;
  /** Lower-cased header name → value. */
  headers: Record<string, string>;
  redirects: Array<{ from: string; status: number; to: string }>;
  security: SecurityReport;
  server: ServerInfo | null;
  elapsedMs: number;
};

export type InspectionResult =
  | { ok: true; data: InspectionData }
  | { ok: false; error: { title: string; message: string } };

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10_000;

const GEO_ENDPOINT = "https://api.ipgeolocation.io/v3/ipgeo";
const GEO_FIELDS = [
  "ip",
  "network",
  "asn",
  "company",
  "location.country_name",
  "location.country_emoji",
  "location.city",
].join(",");

export async function inspectUrl(input: string): Promise<InspectionResult> {
  const raw = input.trim();

  if (!raw) {
    return fail("Missing URL", "Enter a URL to inspect.");
  }

  let url: URL;

  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return fail("Invalid URL", `"${raw}" could not be parsed as a URL.`);
  }

  const started = Date.now();
  const redirects: InspectionData["redirects"] = [];
  let current = url;
  let response: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const guard = await guardUrl(current);

    if (guard) {
      return fail("Blocked target", guard);
    }

    let hopResponse: Response;

    try {
      hopResponse = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          // A normal browser UA, since many sites vary headers by client.
          "User-Agent":
            "Mozilla/5.0 (compatible; HTTPHeadersInspector/1.0; +https://ipgeolocation.io)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    } catch (error) {
      return fail(
        "Request failed",
        error instanceof Error && error.name === "TimeoutError"
          ? `The request to ${current.host} timed out after ${TIMEOUT_MS / 1000}s.`
          : error instanceof Error
            ? error.message
            : "The request could not be completed.",
      );
    }

    // The body is never read; only headers are inspected.
    void hopResponse.body?.cancel();

    const location = hopResponse.headers.get("location");

    if (isRedirect(hopResponse.status) && location && hop < MAX_REDIRECTS) {
      let next: URL;

      try {
        next = new URL(location, current);
      } catch {
        response = hopResponse;
        break;
      }

      redirects.push({
        from: current.toString(),
        status: hopResponse.status,
        to: next.toString(),
      });
      current = next;
      continue;
    }

    response = hopResponse;
    break;
  }

  if (!response) {
    return fail("Too many redirects", `The URL redirected more than ${MAX_REDIRECTS} times.`);
  }

  const headers: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    ok: true,
    data: {
      url: current.toString(),
      requestedUrl: url.toString(),
      status: response.status,
      statusText: response.statusText,
      headers,
      redirects,
      security: gradeSecurityHeaders(headers),
      server: await describeServer(current.hostname),
      elapsedMs: Date.now() - started,
    },
  };
}

/**
 * Rejects anything that is not a public http(s) target. Every redirect hop is
 * checked, because only validating the first URL would let a redirect walk into
 * private space.
 */
async function guardUrl(url: URL): Promise<string | null> {
  const protocolReason = blockReasonForProtocol(url.protocol);

  if (protocolReason) {
    return `Only http and https URLs can be inspected (${protocolReason}).`;
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const hostnameReason = blockReasonForHostname(host);

  if (hostnameReason) {
    return `"${host}" points at internal infrastructure (${hostnameReason}).`;
  }

  if (isIP(host) !== 0) {
    const reason = blockReasonForIp(host);
    return reason ? `"${host}" is not a public address (${reason}).` : null;
  }

  let addresses: string[];

  try {
    const [v4, v6] = await Promise.all([
      dns.resolve4(host).catch(() => [] as string[]),
      dns.resolve6(host).catch(() => [] as string[]),
    ]);
    addresses = [...v4, ...v6];
  } catch {
    return `"${host}" could not be resolved.`;
  }

  if (addresses.length === 0) {
    return `"${host}" did not resolve to any address.`;
  }

  // Every resolved address must be public, not merely the first one.
  for (const address of addresses) {
    const reason = blockReasonForIp(address);

    if (reason) {
      return `"${host}" resolves to a non-public address ${address} (${reason}).`;
    }
  }

  return null;
}

async function describeServer(hostname: string): Promise<ServerInfo | null> {
  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return null;
  }

  const host = hostname.replace(/^\[|\]$/g, "");
  let ip = host;

  if (isIP(host) === 0) {
    const [v4, v6] = await Promise.all([
      dns.resolve4(host).catch(() => [] as string[]),
      dns.resolve6(host).catch(() => [] as string[]),
    ]);
    ip = v4[0] ?? v6[0] ?? "";
  }

  if (!ip || blockReasonForIp(ip)) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      ip,
      include: "network",
      fields: GEO_FIELDS,
    });
    const response = await fetch(`${GEO_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as JsonObject;
    const network = asObject(payload.network);
    const asn = asObject(payload.asn);
    const company = asObject(payload.company);
    const location = asObject(payload.location);

    return {
      ip: readString(payload.ip) ?? ip,
      countryName: readString(location?.country_name) ?? "",
      countryEmoji: readString(location?.country_emoji) ?? "",
      city: readString(location?.city) ?? "",
      organization:
        readString(company?.name) ?? readString(asn?.organization) ?? "",
      asNumber: readString(asn?.as_number) ?? "",
      isCdn: network?.is_cdn === true,
      cdnProviderName: readString(network?.cdn_provider_name) ?? "",
      isAnycast: network?.is_anycast === true,
    };
  } catch {
    return null;
  }
}

function isRedirect(status: number) {
  return [301, 302, 303, 307, 308].includes(status);
}

function fail(title: string, message: string): InspectionResult {
  return { ok: false, error: { title, message } };
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}
