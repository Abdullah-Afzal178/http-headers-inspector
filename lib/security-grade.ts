/**
 * Grades a response's security headers. Pure and dependency-free so the rules
 * stay unit testable.
 */

export type CheckStatus = "pass" | "warn" | "fail";

export type SecurityCheck = {
  header: string;
  status: CheckStatus;
  /** Why the header scored the way it did. */
  note: string;
  /** The raw value, when present. */
  value: string;
  /** Contribution to the score when passing. */
  weight: number;
};

export type SecurityReport = {
  checks: SecurityCheck[];
  /** 0-100. */
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  passed: number;
  total: number;
};

type HeaderMap = Record<string, string>;

export function gradeSecurityHeaders(headers: HeaderMap): SecurityReport {
  const get = (name: string) => (headers[name.toLowerCase()] ?? "").trim();

  const checks: SecurityCheck[] = [
    checkHsts(get("strict-transport-security")),
    checkCsp(get("content-security-policy"), get("content-security-policy-report-only")),
    checkFrameOptions(get("x-frame-options"), get("content-security-policy")),
    checkContentTypeOptions(get("x-content-type-options")),
    checkReferrerPolicy(get("referrer-policy")),
    checkPermissionsPolicy(get("permissions-policy")),
  ];

  const earned = checks.reduce(
    (total, check) =>
      total + (check.status === "pass" ? check.weight : check.status === "warn" ? check.weight / 2 : 0),
    0,
  );
  const possible = checks.reduce((total, check) => total + check.weight, 0);
  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  return {
    checks,
    score,
    grade: toGrade(score),
    passed: checks.filter((check) => check.status === "pass").length,
    total: checks.length,
  };
}

function checkHsts(value: string): SecurityCheck {
  const base = { header: "Strict-Transport-Security", value, weight: 25 };

  if (!value) {
    return { ...base, status: "fail", note: "Missing — browsers may still try HTTP first." };
  }

  const maxAge = Number(value.match(/max-age\s*=\s*(\d+)/i)?.[1] ?? "0");

  if (maxAge === 0) {
    return { ...base, status: "fail", note: "max-age is 0, which disables HSTS." };
  }

  // Six months is the common bar for being useful.
  if (maxAge < 15_768_000) {
    return {
      ...base,
      status: "warn",
      note: `max-age is ${maxAge}s — under six months, so protection lapses quickly.`,
    };
  }

  return {
    ...base,
    status: "pass",
    note: /includesubdomains/i.test(value)
      ? "Long max-age and covers subdomains."
      : "Long max-age set. Consider adding includeSubDomains.",
  };
}

function checkCsp(policy: string, reportOnly: string): SecurityCheck {
  const base = { header: "Content-Security-Policy", value: policy || reportOnly, weight: 25 };

  if (!policy && reportOnly) {
    return {
      ...base,
      status: "warn",
      note: "Only set in report-only mode, so nothing is actually blocked.",
    };
  }

  if (!policy) {
    return { ...base, status: "fail", note: "Missing — no restriction on where scripts may load from." };
  }

  if (/unsafe-inline|unsafe-eval/i.test(policy)) {
    return {
      ...base,
      status: "warn",
      note: "Present, but allows unsafe-inline or unsafe-eval, which weakens it considerably.",
    };
  }

  return { ...base, status: "pass", note: "Policy present with no unsafe-inline or unsafe-eval." };
}

function checkFrameOptions(frameOptions: string, csp: string): SecurityCheck {
  const base = { header: "X-Frame-Options", value: frameOptions, weight: 15 };
  const cspFrames = /frame-ancestors/i.test(csp);

  if (!frameOptions && cspFrames) {
    return {
      ...base,
      status: "pass",
      value: "via CSP frame-ancestors",
      note: "Covered by the CSP frame-ancestors directive, which supersedes this header.",
    };
  }

  if (!frameOptions) {
    return { ...base, status: "fail", note: "Missing — the page can be framed, allowing clickjacking." };
  }

  if (/^(deny|sameorigin)$/i.test(frameOptions)) {
    return { ...base, status: "pass", note: "Framing is restricted." };
  }

  return { ...base, status: "warn", note: "Set to a value browsers no longer honour, such as ALLOW-FROM." };
}

function checkContentTypeOptions(value: string): SecurityCheck {
  const base = { header: "X-Content-Type-Options", value, weight: 15 };

  if (!value) {
    return { ...base, status: "fail", note: "Missing — browsers may sniff a different content type." };
  }

  return /nosniff/i.test(value)
    ? { ...base, status: "pass", note: "Set to nosniff." }
    : { ...base, status: "warn", note: "Present but not set to nosniff, so it has no effect." };
}

function checkReferrerPolicy(value: string): SecurityCheck {
  const base = { header: "Referrer-Policy", value, weight: 10 };

  if (!value) {
    return { ...base, status: "warn", note: "Missing — the browser default is used, which may leak full URLs." };
  }

  if (/unsafe-url|^origin-when-cross-origin$|^no-referrer-when-downgrade$/i.test(value)) {
    return { ...base, status: "warn", note: "Set to a permissive value that still shares referrer data." };
  }

  return { ...base, status: "pass", note: "A restrictive referrer policy is set." };
}

function checkPermissionsPolicy(value: string): SecurityCheck {
  const base = { header: "Permissions-Policy", value, weight: 10 };

  return value
    ? { ...base, status: "pass", note: "Browser features are explicitly scoped." }
    : {
        ...base,
        status: "warn",
        note: "Missing — powerful features such as camera and geolocation are not restricted.",
      };
}

function toGrade(score: number): SecurityReport["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 55) return "C";
  if (score >= 35) return "D";
  return "F";
}
