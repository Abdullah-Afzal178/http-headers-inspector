/**
 * Blocklist for outbound fetches. The inspector fetches URLs supplied by the
 * visitor, so every resolved address must be checked before a request is made,
 * otherwise the tool becomes an SSRF proxy into private infrastructure.
 *
 * Pure and dependency-free so the rules can be unit tested directly.
 */

export type BlockReason = string | null;

/** Returns a reason string when the address must not be fetched, else null. */
export function blockReasonForIp(ip: string): BlockReason {
  const address = ip.trim().toLowerCase().replace(/^\[|\]$/g, "");

  if (address === "") {
    return "empty address";
  }

  return address.includes(":") ? blockReasonForIpv6(address) : blockReasonForIpv4(address);
}

function blockReasonForIpv4(address: string): BlockReason {
  const parts = address.split(".");

  if (parts.length !== 4) {
    return "not a valid IPv4 address";
  }

  const octets = parts.map((part) => Number(part));

  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return "not a valid IPv4 address";
  }

  const [a, b] = octets;

  if (a === 0) return "unspecified range";
  if (a === 10) return "private range (10/8)";
  if (a === 127) return "loopback";
  if (a === 169 && b === 254) return "link-local";
  if (a === 172 && b >= 16 && b <= 31) return "private range (172.16/12)";
  if (a === 192 && b === 168) return "private range (192.168/16)";
  if (a === 100 && b >= 64 && b <= 127) return "carrier-grade NAT";
  if (a === 192 && b === 0) return "IETF protocol assignment";
  if (a === 198 && (b === 18 || b === 19)) return "benchmarking range";
  if (a >= 224) return "multicast or reserved range";

  return null;
}

function blockReasonForIpv6(address: string): BlockReason {
  // IPv4-mapped and IPv4-compatible forms delegate to the IPv4 rules.
  const embedded = address.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);

  if (embedded) {
    return blockReasonForIpv4(embedded[1]) ?? null;
  }

  const groups = expandIpv6(address);

  if (!groups) {
    return "not a valid IPv6 address";
  }

  if (groups.every((group) => group === 0)) {
    return "unspecified range";
  }

  if (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return "loopback";
  }

  const [first] = groups;

  if ((first & 0xfe00) === 0xfc00) return "unique local address";
  if ((first & 0xffc0) === 0xfe80) return "link-local";
  if ((first & 0xff00) === 0xff00) return "multicast";

  return null;
}

function expandIpv6(value: string): number[] | null {
  const text = value.split("%")[0];

  if (!text.includes(":")) {
    return null;
  }

  const doubleColons = text.match(/::/g)?.length ?? 0;

  if (doubleColons > 1) {
    return null;
  }

  let head: string[];
  let tail: string[];

  if (doubleColons === 1) {
    const [left, right] = text.split("::");
    head = left === "" ? [] : left.split(":");
    tail = right === "" ? [] : right.split(":");
  } else {
    head = text.split(":");
    tail = [];
  }

  const parts = [...head, ...tail];

  if (parts.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) {
    return null;
  }

  if (doubleColons === 1 ? parts.length > 7 : parts.length !== 8) {
    return null;
  }

  return [
    ...head.map((part) => Number.parseInt(part, 16)),
    ...Array.from({ length: 8 - parts.length }, () => 0),
    ...tail.map((part) => Number.parseInt(part, 16)),
  ];
}

/** Hostnames that must never be fetched regardless of what DNS says. */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
]);

export function blockReasonForHostname(hostname: string): BlockReason {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");

  if (host === "") {
    return "empty hostname";
  }

  if (BLOCKED_HOSTNAMES.has(host)) {
    return "reserved hostname";
  }

  // .internal, .local and friends are never public.
  if (/\.(internal|local|localdomain|home|lan|intranet|corp|private)$/.test(host)) {
    return "internal-only domain suffix";
  }

  return null;
}

/** Only these schemes are ever fetched. */
export function blockReasonForProtocol(protocol: string): BlockReason {
  const scheme = protocol.replace(/:$/, "").toLowerCase();

  return scheme === "http" || scheme === "https"
    ? null
    : `unsupported scheme "${scheme}"`;
}
