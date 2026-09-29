/**
 * Descriptions and grouping for common HTTP headers. Pure and dependency-free
 * so it can be unit tested and used on either side of the render boundary.
 */

export type HeaderCategory =
  | "security"
  | "caching"
  | "content"
  | "client"
  | "cors"
  | "server"
  | "other";

export type HeaderInfo = {
  /** Canonical display casing, e.g. "Content-Type". */
  label: string;
  category: HeaderCategory;
  description: string;
};

export const CATEGORY_LABELS: Record<HeaderCategory, string> = {
  security: "Security",
  caching: "Caching",
  content: "Content",
  client: "Client",
  cors: "CORS",
  server: "Server",
  other: "Other",
};

const CATALOG: Record<string, HeaderInfo> = {
  // Security
  "strict-transport-security": {
    label: "Strict-Transport-Security",
    category: "security",
    description: "Tells browsers to only reach this site over HTTPS for the given max-age.",
  },
  "content-security-policy": {
    label: "Content-Security-Policy",
    category: "security",
    description: "Restricts which sources scripts, styles, and frames may load from.",
  },
  "content-security-policy-report-only": {
    label: "Content-Security-Policy-Report-Only",
    category: "security",
    description: "Reports policy violations without enforcing them — useful while testing a policy.",
  },
  "x-frame-options": {
    label: "X-Frame-Options",
    category: "security",
    description: "Controls whether the page may be embedded in a frame, blocking clickjacking.",
  },
  "x-content-type-options": {
    label: "X-Content-Type-Options",
    category: "security",
    description: "With 'nosniff', stops the browser guessing a response's content type.",
  },
  "referrer-policy": {
    label: "Referrer-Policy",
    category: "security",
    description: "Controls how much of the current URL is sent in the Referer header.",
  },
  "permissions-policy": {
    label: "Permissions-Policy",
    category: "security",
    description: "Enables or blocks browser features such as camera, microphone, and geolocation.",
  },
  "cross-origin-opener-policy": {
    label: "Cross-Origin-Opener-Policy",
    category: "security",
    description: "Isolates the browsing context from cross-origin windows.",
  },
  "cross-origin-embedder-policy": {
    label: "Cross-Origin-Embedder-Policy",
    category: "security",
    description: "Requires cross-origin resources to opt in before they can be embedded.",
  },
  "cross-origin-resource-policy": {
    label: "Cross-Origin-Resource-Policy",
    category: "security",
    description: "Limits which origins may load this resource.",
  },
  "x-xss-protection": {
    label: "X-XSS-Protection",
    category: "security",
    description: "Legacy XSS filter toggle. Modern browsers ignore it; use a CSP instead.",
  },

  // Caching
  "cache-control": {
    label: "Cache-Control",
    category: "caching",
    description: "Directives for how, where, and how long the response may be cached.",
  },
  etag: {
    label: "ETag",
    category: "caching",
    description: "A version identifier the client can send back to revalidate cheaply.",
  },
  expires: {
    label: "Expires",
    category: "caching",
    description: "Legacy absolute expiry time. Cache-Control takes precedence when both are set.",
  },
  "last-modified": {
    label: "Last-Modified",
    category: "caching",
    description: "When the resource last changed, used for conditional requests.",
  },
  age: {
    label: "Age",
    category: "caching",
    description: "Seconds the response has been sitting in a proxy or CDN cache.",
  },
  vary: {
    label: "Vary",
    category: "caching",
    description: "Which request headers change the response, so caches key on them too.",
  },

  // Content
  "content-type": {
    label: "Content-Type",
    category: "content",
    description: "The media type and character set of the body.",
  },
  "content-length": {
    label: "Content-Length",
    category: "content",
    description: "Size of the body in bytes.",
  },
  "content-encoding": {
    label: "Content-Encoding",
    category: "content",
    description: "Compression applied to the body, such as gzip or br.",
  },
  "content-language": {
    label: "Content-Language",
    category: "content",
    description: "The natural language of the content.",
  },
  "content-disposition": {
    label: "Content-Disposition",
    category: "content",
    description: "Whether the body is shown inline or downloaded, and its filename.",
  },
  location: {
    label: "Location",
    category: "content",
    description: "Where a redirect points.",
  },

  // Client request headers
  "user-agent": {
    label: "User-Agent",
    category: "client",
    description: "Identifies the browser, engine, operating system, and device making the request.",
  },
  accept: {
    label: "Accept",
    category: "client",
    description: "Media types the client can handle, in order of preference.",
  },
  "accept-language": {
    label: "Accept-Language",
    category: "client",
    description: "Languages the client prefers — often enough to infer a region.",
  },
  "accept-encoding": {
    label: "Accept-Encoding",
    category: "client",
    description: "Compression formats the client supports.",
  },
  referer: {
    label: "Referer",
    category: "client",
    description: "The page that linked here. Misspelled in the original spec and never fixed.",
  },
  dnt: {
    label: "DNT",
    category: "client",
    description: "Legacy 'Do Not Track' signal. Almost universally ignored.",
  },
  "sec-ch-ua": {
    label: "Sec-CH-UA",
    category: "client",
    description: "Client hint listing the browser brands and major versions.",
  },
  "sec-ch-ua-mobile": {
    label: "Sec-CH-UA-Mobile",
    category: "client",
    description: "Client hint indicating whether this is a mobile device.",
  },
  "sec-ch-ua-platform": {
    label: "Sec-CH-UA-Platform",
    category: "client",
    description: "Client hint naming the operating system.",
  },
  "sec-fetch-site": {
    label: "Sec-Fetch-Site",
    category: "client",
    description: "Relationship between the request origin and the target origin.",
  },
  "sec-fetch-mode": {
    label: "Sec-Fetch-Mode",
    category: "client",
    description: "The request mode, such as navigate, cors, or no-cors.",
  },
  "sec-fetch-dest": {
    label: "Sec-Fetch-Dest",
    category: "client",
    description: "What the result will be used for, such as document or image.",
  },
  "upgrade-insecure-requests": {
    label: "Upgrade-Insecure-Requests",
    category: "client",
    description: "Signals the client would rather receive an HTTPS version.",
  },
  cookie: {
    label: "Cookie",
    category: "client",
    description: "Cookies the client is sending back to this origin.",
  },
  "x-forwarded-for": {
    label: "X-Forwarded-For",
    category: "client",
    description: "Original client IP as recorded by proxies in front of the server.",
  },
  "x-real-ip": {
    label: "X-Real-IP",
    category: "client",
    description: "Client IP set by a reverse proxy such as nginx.",
  },
  "cf-connecting-ip": {
    label: "CF-Connecting-IP",
    category: "client",
    description: "Original client IP as recorded by Cloudflare.",
  },

  // CORS
  "access-control-allow-origin": {
    label: "Access-Control-Allow-Origin",
    category: "cors",
    description: "Which origins may read this response from a browser.",
  },
  "access-control-allow-credentials": {
    label: "Access-Control-Allow-Credentials",
    category: "cors",
    description: "Whether cookies and auth headers may be sent cross-origin.",
  },
  "access-control-allow-methods": {
    label: "Access-Control-Allow-Methods",
    category: "cors",
    description: "HTTP methods allowed for cross-origin requests.",
  },
  "access-control-allow-headers": {
    label: "Access-Control-Allow-Headers",
    category: "cors",
    description: "Request headers allowed on cross-origin requests.",
  },

  // Server / infrastructure
  server: {
    label: "Server",
    category: "server",
    description: "Software handling the request. Often trimmed or faked deliberately.",
  },
  date: {
    label: "Date",
    category: "server",
    description: "When the server generated the response.",
  },
  "x-powered-by": {
    label: "X-Powered-By",
    category: "server",
    description: "Framework or runtime behind the response. Usually worth removing.",
  },
  "cf-ray": {
    label: "CF-Ray",
    category: "server",
    description: "Cloudflare request identifier, useful for support tickets.",
  },
  "cf-cache-status": {
    label: "CF-Cache-Status",
    category: "server",
    description: "Whether Cloudflare served this from cache.",
  },
  "x-cache": {
    label: "X-Cache",
    category: "server",
    description: "CDN cache hit or miss, commonly set by Fastly, Varnish, or CloudFront.",
  },
  "x-served-by": {
    label: "X-Served-By",
    category: "server",
    description: "Which edge node handled the request.",
  },
  "alt-svc": {
    label: "Alt-Svc",
    category: "server",
    description: "Advertises alternative protocols such as HTTP/3.",
  },
  connection: {
    label: "Connection",
    category: "server",
    description: "Whether the TCP connection stays open for further requests.",
  },
  "transfer-encoding": {
    label: "Transfer-Encoding",
    category: "server",
    description: "How the body is chunked for transfer.",
  },
  "set-cookie": {
    label: "Set-Cookie",
    category: "server",
    description: "Cookies the server is asking the client to store.",
  },
};

export function describeHeader(name: string): HeaderInfo {
  const key = name.toLowerCase();
  const known = CATALOG[key];

  if (known) {
    return known;
  }

  return {
    label: toTitleCase(name),
    category: key.startsWith("sec-ch-") ? "client" : "other",
    description: "",
  };
}

/** "x-my-header" -> "X-My-Header" */
export function toTitleCase(name: string): string {
  return name
    .split("-")
    .map((part) =>
      part.length === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join("-");
}

export const CATEGORY_ORDER: HeaderCategory[] = [
  "security",
  "caching",
  "content",
  "cors",
  "client",
  "server",
  "other",
];
