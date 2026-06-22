## 2024-05-24 - Dynamic Accessible Tooltips for Action Buttons
**Learning:** Icon-only action buttons (like Send and Microphone) need not just `aria-label` but also dynamic `title` properties. Tooltips provide contextual help regarding the button state, like "Enter a message to send" or "Sending...". This greatly increases UX understanding of disabled states.
**Action:** Always add dynamic tooltips via `title` in addition to `aria-label` when the action button state changes frequently or its disabled state reason may not be immediately obvious.
