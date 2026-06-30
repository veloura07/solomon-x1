## 2023-10-27 - Information Disclosure via /api/health Endpoint
**Vulnerability:** The unauthenticated `/api/health` endpoint returned sensitive environment and configuration states (`hasApiKey` boolean flag and `platform` server version tag).
**Learning:** Returning explicit configuration indicators or precise version tags in public-facing health checks provides footprinting material to attackers.
**Prevention:** Unauthenticated health endpoints should only return essential availability status (e.g., `status: "online"`, timestamp) without leaking state or platform architecture context.
