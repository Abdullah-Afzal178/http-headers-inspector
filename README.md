# HTTP Headers Inspector

Two things in one tool: see **every header your browser sends**, and inspect **any site's response headers** with a security grade, the redirect chain, and details of the server that answered — powered by [ipgeolocation.io](https://ipgeolocation.io).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)
[![Powered by ipgeolocation.io](https://img.shields.io/badge/Powered%20by-ipgeolocation.io-1a73e8)](https://ipgeolocation.io)

<!-- Add a screenshot of the tool running locally at ./public/tool.png and reference it here -->

---

## What It Does

### `/` — Your request headers

Every header the server received from your browser, shown raw and then grouped and explained. Plus:

- **Your User-Agent parsed** into browser, version, engine, OS, and device via the ipgeolocation.io User-Agent API
- **Your IP located** — country, city, organisation, and ASN
- **Cookies and authorization headers redacted** before anything is rendered

### `/check?url=…` — Any site's response headers

- **Security grade** — six weighted checks (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) scored A–F with a specific reason for each
- **Redirect chain** — every hop followed and listed
- **The server that answered** — IP, organisation, ASN, country, plus CDN and anycast flags
- **Raw and annotated views** — the wire format, then every header grouped by purpose

Real results: `github.com` grades **B** (4 of 6, score 83); `example.com` grades **F** (0 of 6, score 10).

---

## Fetching user-supplied URLs safely

A tool that fetches whatever URL a visitor types is an SSRF hazard by default — it could be pointed at internal services or cloud metadata endpoints. The guards in [`lib/ip-guard.ts`](lib/ip-guard.ts) are pure, dependency-free, and covered by 56 unit assertions:

- **Scheme allowlist** — only `http` and `https`. `file:`, `gopher:`, `ftp:`, and `data:` are refused.
- **Hostname blocklist** — `localhost`, `metadata.google.internal`, and `.internal` / `.local` / `.lan` style suffixes.
- **Address blocklist** — loopback, `10/8`, `172.16/12`, `192.168/16`, link-local (including **`169.254.169.254`**, the cloud metadata address), CGNAT, unspecified, multicast, and reserved ranges, for both IPv4 and IPv6.
- **IPv4-mapped IPv6 is decoded first**, so `::ffff:127.0.0.1` cannot slip past the IPv6 rules.
- **Every resolved address is checked**, not just the first, so a hostname with one public and one private record is still refused.
- **Every redirect hop is re-validated** before it is followed, so a public URL cannot redirect into private space.
- **Malformed input fails closed** — anything unparseable is blocked rather than allowed.
- Requests time out after 10s, follow at most 5 redirects, and **never read the response body**.

> One known limitation: validation happens before the request, so a DNS rebinding attack that changes the answer between the check and the connection is not fully prevented. Deploy behind an egress policy if that matters for your threat model.

---

## Why ipgeolocation.io

Headers alone only tell half the story — who sent them matters too:

- **User-Agent parsing** — the [User-Agent API](https://ipgeolocation.io/documentation/user-agent-api.html) turns the raw string into browser, engine, OS, and device without shipping a regex database.
- **Client and server geolocation** — the [IP Geolocation API](https://ipgeolocation.io/documentation/ip-location-api.html) identifies where a request came from and which host answered it.
- **CDN and anycast flags** — `include=network` shows whether an edge network served the response.
- **Free tier** — every endpoint this tool uses works on the free plan.

**[Get your free API key →](https://ipgeolocation.io/signup)**

---

## Features

- **Headers grouped by purpose** — security, caching, content, CORS, client, server
- **Plain-English description** for ~60 common headers
- **Raw wire view** alongside the annotated view
- **Weighted security scoring** — partial credit for partial hardening, with the reason shown
- **CSP `frame-ancestors` recognised** as superseding `X-Frame-Options`
- **Redirect chain** with status codes
- **Secrets redacted** — cookie and authorization values are replaced with a length before rendering
- **Nothing stored** — requests are inspected and discarded
- **Server-side API calls only** — your API key is never exposed to the browser
- **SEO-ready** — Open Graph tags, meta description, `robots.txt`, `sitemap.xml`, and favicon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| DNS | Node `dns/promises` |
| Icons | [lucide-react](https://lucide.dev/) |
| Enrichment | [ipgeolocation.io](https://ipgeolocation.io) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [ipgeolocation.io](https://ipgeolocation.io/signup) API key (free tier is enough). Headers still render without one; only the User-Agent parsing and IP enrichment need it.

### Run It Locally

1. Clone the repo:

```bash
git clone https://github.com/Abdullah-Afzal178/http-headers-inspector.git
cd http-headers-inspector
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
IPGEOLOCATION_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IPGEOLOCATION_API_KEY` | No | Your [ipgeolocation.io](https://ipgeolocation.io/signup) API key. Without it, headers still render but the User-Agent is not parsed and IPs are not located. |
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL if you choose to deploy (used for sitemap and OG metadata) |

---

## How It Works

**Your headers (`/`)** — the server reads the incoming request headers, redacts cookie and authorization values, forwards the User-Agent to the User-Agent API for parsing, and looks up the client IP. Private client addresses are skipped.

**URL check (`/check`)** — the URL is parsed and guarded, the hostname resolved and every address checked, then fetched with `redirect: "manual"` so each hop can be re-validated. Response headers are graded, and the answering server's IP is enriched with geo, ASN, and CDN data.

---

## Project Structure

```
http-headers-inspector/
├── app/
│   ├── check/            # Response header checker (?url=…)
│   ├── layout.tsx
│   ├── page.tsx          # Your request headers
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── header-table.tsx    # Grouped, annotated headers
│   ├── raw-block.tsx       # Wire-format view
│   ├── security-card.tsx   # Grade and per-check reasons
│   └── site-header.tsx
├── lib/
│   ├── ip-guard.ts       # SSRF blocklist (no API, no deps, unit tested)
│   ├── security-grade.ts # Security header scoring (no API, no deps, unit tested)
│   ├── header-catalog.ts # Header descriptions and grouping
│   ├── inspect.ts        # Guarded fetch + server enrichment (server only)
│   └── my-request.ts     # Request headers + UA parsing (server only)
├── .env                  # API key (not committed)
└── README.md
```

---

## Want to Deploy It?

Needs the Node runtime for DNS resolution:

- **Vercel** — import the repo, add `IPGEOLOCATION_API_KEY`, deploy.
- **Netlify**, **Railway**, **Render** — similar process.
- **Self-hosted** — `npm run build && npm start`.

---

## License

MIT — see [LICENSE](LICENSE) for details.
