## 2023-10-27 - [Unauthenticated /api/predict Endpoint Fix]
**Vulnerability:** The `/api/predict` endpoint was unauthenticated, allowing arbitrary requests to the backend AI model which could lead to API key exhaustion or potential model interaction abuse.
**Learning:** All endpoints that interact with external services (especially paid/rate-limited APIs like Gemini) must enforce proper authentication.
**Prevention:** Always secure all exposed internal API routes with some form of authentication, such as a Bearer token verification checking against environment variables.
