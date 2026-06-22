## 2025-06-22 - Prevent Internal Error Details Leakage
**Vulnerability:** Express application endpoints (`/api/chat`, `/api/predict`, and WebSocket handlers) were leaking `err.message` within error responses directly to the client, leading to a risk of sensitive stack traces, API keys, or application internals being disclosed on error. Express was also returning the `x-powered-by` header.
**Learning:** Default error handling that blindly proxies internal exceptions is dangerous since many Node.js SDK exceptions contain configuration hints, auth errors, and file paths.
**Prevention:** Avoid forwarding `err.message` in 500 error responses and return safe generic system error messages instead. Added `app.disable('x-powered-by');` to mitigate framework reconnaissance.
