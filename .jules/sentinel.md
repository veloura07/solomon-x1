## 2023-10-27 - Information Disclosure via /api/health Endpoint
**Vulnerability:** The unauthenticated `/api/health` endpoint returned sensitive environment and configuration states (`hasApiKey` boolean flag and `platform` server version tag).
**Learning:** Returning explicit configuration indicators or precise version tags in public-facing health checks provides footprinting material to attackers.
**Prevention:** Unauthenticated health endpoints should only return essential availability status (e.g., `status: "online"`, timestamp) without leaking state or platform architecture context.

## 2025-02-24 - Unbounded WebSocket Chat History Memory Leak
**Vulnerability:** The server maintained an unbounded array `ws.chatHistories[ringId]` for each client ring to keep track of chat contexts, directly pushing objects upon every user interaction. Without limits, an attacker (or even normal usage) could easily push large amounts of data to cause Node.js to consume all available memory and crash via Out-of-Memory (OOM) exhaustion.
**Learning:** In long-lived stateful instances like WebSockets, holding arrays of user input should ALWAYS be subjected to bounds-checking to prevent process resource exhaustion attacks. Furthermore, when communicating with certain APIs like Gemini, any truncation logic must maintain specific parity rules (such as strict user/model alternation in this case) otherwise subsequent API calls will reject requests with errors.
**Prevention:** Implement a maximum cap on state arrays (e.g. 50 items) and remove oldest items (using `Array.prototype.splice`) whenever the limit is exceeded, factoring in necessary structural boundaries if the data targets LLMs or specific external protocols.
