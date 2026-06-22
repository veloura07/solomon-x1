## 2024-06-21 - Security Findings

No critical or high-priority vulnerabilities discovered initially.
Proceeding to deeper code inspection for medium-priority issues.
## 2024-06-21 - Security Fixes: Information Leakage & Input Validation
**Vulnerability:** Express app exposed internal stack/error messages when Gemini API threw errors. It also lacked validation on user-controlled inputs for `/api/chat` and `/api/predict` array parameters. Furthermore, standard security headers were completely missing.
**Learning:** Returning `err.message` in JSON payloads or WebSocket transmissions directly to clients presents an information leakage risk as internal paths or sensitive details might be exposed. Additionally, when destructuring arrays in Express, it's critical to type-check their elements to prevent Object injection or unexpectedly typed input attacks.
**Prevention:** Always sanitize or override internal `err.message` values with generic user-friendly strings before sending responses. Always validate arrays of input. Apply standard HTTP headers via a custom middleware or the `helmet` package.
