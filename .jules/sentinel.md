## 2026-06-29 - [Security Fix] Unauthenticated /api/chat Endpoint
**Vulnerability:** The `/api/chat` and `/api/predict` endpoints lacked authentication, allowing any client to send requests and consume the generative AI backend without providing valid credentials.
**Learning:** All endpoints that interact with a backend service, especially those invoking third-party APIs (such as generative AI models), must enforce proper authentication to prevent abuse and potential denial of service or excessive resource usage.
**Prevention:** Implement a middleware or robust check in every sensitive endpoint to require a valid token (e.g., via the `Authorization` header), and configure the frontend to securely inject and supply this token in its API requests.
