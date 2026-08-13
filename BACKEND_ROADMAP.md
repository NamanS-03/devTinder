# devTinder — Backend Roadmap

Curated from reading the current frontend (`devTinder-frontend`) and backend (`devTinder-backend`) code. Each item explains **what's wrong / missing**, **why it matters**, and — for new endpoints — **how the API should work**.

Priority: 🔴 Critical bug &nbsp;·&nbsp; 🟠 Missing endpoint the frontend already wants &nbsp;·&nbsp; 🟡 Scalability/robustness &nbsp;·&nbsp; 🟢 General hardening &nbsp;·&nbsp; 🔵 Product gap (frontend + backend both missing it)

---

## 🔴 Critical bugs (fix first)

### 1. JWT secret mismatch
- **Where:** `src/middleware/authMiddleware.js` verifies with a hardcoded string `"DEV@devTinder123"`; `src/models/people.js` (`getJWT`) signs with `process.env.JWT_SECRET`.
- **Why it matters:** if the env var value differs from the hardcoded string (e.g. on a fresh clone, CI, or prod), every authenticated request fails with an opaque 401 — this is the kind of bug that looks like "auth is broken" for no visible reason.
- **Fix:** use `process.env.JWT_SECRET` in both places, and fail startup loudly if the env var is missing (don't silently fall back to a string literal).

### 2. Tokens/cookies never expire
- **Where:** `getJWT()` (no `expiresIn`), login's `res.cookie("token", token)` (no `maxAge`/`expires`).
- **Why it matters:** a token issued once is valid forever — if it leaks (XSS, log capture, shared machine), there's no time-based mitigation, and users are never forced to re-auth.
- **Fix:** `jwt.sign(..., { expiresIn: "7d" })` and matching `res.cookie("token", token, { maxAge: 7*24*60*60*1000, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })`.

### 3. Inverted profile-picture URL validator
- **Where:** `src/models/people.js`, `profilePicUrl` field — `if (validator.isURL(value)) throw new Error(...)` (backwards: rejects valid URLs, accepts invalid ones).
- **Why it matters:** this is likely *why* the frontend gave up on real URLs and started stuffing base64 image data into this field instead (see item 15) — a schema bug quietly reshaped a whole feature.
- **Fix:** flip the condition, and decide deliberately whether this field should hold a URL, a base64 blob, or neither (see item 15 for the real fix).

### 4. `sendConnectionRequest` — wrong `findById` usage + crash on 404
- **Where:** `src/controller/requestController.js` — `People.findById({ _id: toUserId })` should be `People.findById(toUserId)`; the not-found branch calls `receiver.status(400)` where `receiver` is `null`.
- **Why it matters:** `findById({_id: toUserId})` happens to still work with Mongoose's loose query casting, but it's semantically wrong and fragile; the null-receiver `.status()` call throws a `TypeError` that gets caught by the outer try/catch and reported as a generic 400 instead of a clean "user not found" — misleading for frontend error handling and hard to debug from logs.
- **Fix:** `People.findById(toUserId)`; `if (!receiver) return res.status(404).json({ message: "User not found" })`.

---

## 🟠 Missing endpoints the frontend already wants

### 5. `GET /request/sent` — list requests I've sent that are still pending
- **Frontend evidence:** `Network/Requests.jsx` hardcodes `const sentRequests = []` with a comment noting there's no backend support — the "Sent" tab always renders empty.
- **How it should work:**
  - `GET /request/sent` (auth-gated, same `peopleAuth` middleware as the other request routes)
  - Query: `ConnectionRequest.find({ fromUserId: req.people._id, status: "interested" }).populate("toUserId", "firstName lastName profilePicUrl skills")`
  - Response: `{ data: [{ _id, toUserId: {...}, status, createdAt }] }`
  - Optionally support cancel-in-place: pair this with item 6 style deletion so a user can withdraw a sent request.
- **Why:** without this, "Sent" is a dead tab — a shipped UI element with no backing data, which reads as broken to a user who clicks it.

### 6. `DELETE /request/connection/:connectionId` — remove an existing connection
- **Frontend evidence:** `Network/Connections.jsx` renders a "Remove" button per connection card with no `onClick`/dispatch wired up.
- **How it should work:**
  - `DELETE /request/connection/:connectionId` (auth-gated) — `connectionId` is the `ConnectionRequest._id` of the accepted record.
  - Logic: find the request, confirm `req.people._id` is either `fromUserId` or `toUserId` and `status === "accepted"`, then delete the document (or flip status to a new `"removed"` state if you want an audit trail instead of a hard delete).
  - Response: `{ message: "Connection removed" }`
  - Frontend: on success, dispatch a Redux action to remove that connection from `connectionSlice` state without a full refetch.
- **Why:** matches an existing UI affordance; without it the button is a broken promise, and there is currently *no way at all* for a user to undo an accepted connection.

### 7. Chat / messaging (biggest lift — scope separately)
- **Frontend evidence:** `Network/Messages.jsx` is a static `<h1>Messages</h1>` stub, but it's a live routed page (`/messages` in `App.jsx`) that users can navigate to expecting a working feature — worse than not having the link at all.
- **How it should work (rough shape):**
  - New `Message` model: `{ senderId, receiverId, connectionId (ref to accepted ConnectionRequest), text, readAt, createdAt }`.
  - `GET /messages/:connectionId` — paginated message history between two connected users (only allowed if a `ConnectionRequest` with `status: "accepted"` exists between them — chat should be gated on being connected).
  - `POST /messages/:connectionId` — send a message (validate sender is part of the connection).
  - Real-time delivery needs Socket.io (or similar) layered on top of the REST history endpoints — REST alone gives you history, not live delivery.
- **Why:** this is a core "Tinder-style" expectation once two people connect — right now there is no path from "matched" to "talking," which caps the app's usefulness. Recommend treating this as its own project rather than squeezing it in with the smaller fixes above.

### 8. Notifications (unread count + list)
- **Frontend evidence:** `Navbar.jsx` has a bell icon wrapped in an `indicator` div with no unread-count logic or click handler — decorative only.
- **How it should work:**
  - Simplest version: `GET /user/notificationCount` → `{ pendingRequests: N }` (reuse existing `receivedRequest` count logic), polled or fetched on navbar mount.
  - Fuller version: a `Notification` model (`{ peopleId, type, payload, read, createdAt }`) populated whenever a request is sent/accepted, with `GET /notifications` and `PATCH /notifications/:id/read`.
- **Why:** right now a user only discovers a new connection request by manually visiting `/requests` — no passive signal exists anywhere in the UI.

---

## 🔵 Product gaps present in *both* frontend and backend (not a frontend-ahead-of-backend case, just genuinely missing)

### 9. Forgot-password / password reset flow
- **Evidence:** `Login.jsx` renders a "Forgot password?" link with no `href`/`onClick` — not even wired to a dead route. No `/forgot-password` route in `App.jsx`, no reset endpoint in `authController.js`, no email-sending capability anywhere in the backend.
- **How it should work:**
  - `POST /auth/forgotPassword` — body `{ email }`. Generate a signed, short-lived reset token (JWT or random token stored with an expiry field on `People`), email a reset link via a transactional email provider (SendGrid/Resend/SES).
  - `POST /auth/resetPassword/:token` — body `{ newPassword }`. Verify token, hash and save the new password, invalidate the token.
  - Needs an email-sending dependency and an env-configured SMTP/API key — worth scoping as its own small feature.
- **Why:** currently a user who forgets their password has no recovery path except manually editing the DB. This is table-stakes for any auth system.

### 10. File upload for profile pictures (real storage, not base64-in-Mongo)
- **Evidence:** `Profile.jsx` reads the picked file with `FileReader`, downsizes it via `<canvas>`, and PATCHes the resulting base64 JPEG string straight into `profilePicUrl`. There is no multer/S3/Cloudinary anywhere in the backend (confirmed absent from `package.json` and controllers). The model's validator (item 3) was written assuming this field holds a URL, not a blob.
- **Why it matters:**
  - Every profile document balloons with a multi-hundred-KB base64 string, which gets pulled into every feed query too (since `bio`/profile fields are selected there) — this directly slows down `GET /user/feed`, the most-hit endpoint in the app.
  - No CDN caching, no image optimization pipeline, no server-side validation that the uploaded data is actually an image within a size limit (the 6MB cap in `Profile.jsx` is client-side only — a raw API call can bypass it entirely, up to the 8MB global JSON body limit in `app.js`).
- **How it should work:**
  - `POST /profile/uploadPicture` (multipart/form-data, `multer` middleware, memory storage) → upload buffer to S3/Cloudinary → save the returned CDN URL to `profilePicUrl` → return `{ profilePicUrl }`.
  - Frontend swaps its canvas/base64 logic for a plain `<input type="file">` + `FormData` POST.
  - Re-fix the model validator (item 3) once the field is genuinely a URL again.
- **Why:** this is both a correctness fix and a real scalability concern — it's the single most impactful change on the list for feed performance.

### 11. Gender enum mismatch — "others" (model) vs "other" (frontend dropdown)
- **Evidence:** `people.js` schema: `enum: ["male", "female", "others"]`. `Profile.jsx` edit-form dropdown options: `"male"`, `"female"`, `"other"` (no trailing "s").
- **Why it matters:** selecting "Other" and saving triggers a Mongoose enum validation failure server-side — a working-looking UI control that is *guaranteed* to error for that one specific, plausible choice. This is a quick, high-value fix.
- **Fix:** align both sides on one spelling (recommend `"other"`, singular, as it reads more naturally) and add a migration note if any existing data uses `"others"`.

### 12. No `bio` length limit
- **Evidence:** `people.js` `bio` field has a default but no `maxlength`; `Profile.jsx`'s textarea has no `maxLength` attribute or character counter.
- **Why it matters:** a user (or a direct API call) can save an arbitrarily long bio, which bloats every feed page payload (bio is selected in the feed query) and can break card layouts in `Home.jsx` that assume a short blurb.
- **Fix:** add `maxlength: 300` (or similar) to the schema, and mirror it in the frontend textarea with a visible counter.

### 13. No account deletion / deactivation
- **Evidence:** no `DELETE /profile` route, no "Delete account" control anywhere in `Profile.jsx`, no deactivation flag on the model.
- **Why it matters:** users currently have no self-service way to remove their account or data — worth having both for user trust and for basic data-privacy hygiene (GDPR-style "right to erasure" expectations, even for a side project).
- **How it should work:** `DELETE /profile` — soft-delete recommended (set `isDeleted: true` / anonymize PII) rather than a hard delete, so connections/requests referencing the user don't dangle. Cascade: mark the user's `ConnectionRequest` docs and hide them from the other party's lists.

### 14. No session/logout-all-devices concept
- **Evidence:** stateless single JWT cookie only — no token store, no `tokenVersion` field on `People`, no revocation list. `authController.js`'s logout only clears the cookie client-side; the JWT itself stays valid elsewhere until expiry (which currently never happens — see item 2).
- **Why it matters:** there is no way to invalidate a stolen/leaked token, and no way for a user to see or kill sessions on other devices.
- **How it should work (lightweight version):** add a `tokenVersion: Number` field to `People`, embed it in the JWT payload, and check it in `authMiddleware`. A "logout all devices" action just increments `tokenVersion`, instantly invalidating every previously issued token. Full session management (a `Session` collection with per-device tracking) is a bigger lift — start with `tokenVersion` and revisit if needed.

### 15. Match preferences unused despite existing model fields
- **Evidence:** `userController.js`'s `feed()` only excludes the caller plus anyone with *any* existing `ConnectionRequest` in either direction (all statuses lumped together — pending/accepted/rejected/ignored are treated the same). No gender-preference or age-range filtering is applied anywhere, even though `age` and `gender` already exist on the model. Frontend has no filter UI either — this is a case where both sides are missing a commonly-expected feature, not frontend outrunning backend.
- **How it should work:**
  - Add optional preference fields to `People` (`preferredGender`, `ageRangeMin`, `ageRangeMax`) with a `PATCH /profile/preferences` endpoint.
  - `feed()` applies these as additional `$match` filters alongside the existing exclusion logic.
  - Frontend: a small settings/filter panel on the Home or Profile page to set preferences.
- **Note:** also worth deciding intentionally whether a *rejected* request should permanently hide that person from the feed (current behavior) or allow them to reappear after some cooldown — right now this is accidental (a side effect of not filtering by status) rather than a designed choice. Document whichever behavior you keep.

### 16. Dead UI affordances with zero backend behind them (cleanup, not backend work per se, but blocks the roadmap above)
- `Login.jsx` renders an "or continue with" OAuth divider with no provider buttons and no passport/OAuth setup in the backend — either build OAuth (Google/GitHub sign-in) or remove the divider so the login page doesn't promise something absent.
- **Why grouping this here:** OAuth is a real, common feature (`passport-google-oauth20` + a `googleId` field on `People`) — worth a deliberate yes/no decision rather than leaving a dangling UI hint.

---

## 🟡 Scalability / robustness

### 17. Pagination missing on `myConnections` / `receivedRequest`
- **Where:** `userController.js` — both fetch entire lists unbounded, unlike `feed` (capped at 50/page).
- **Why:** as connection counts grow this won't scale, and the frontend already client-filters the full connections list (`Connections.jsx`) — better to paginate + support server-side search together (see item 19).
- **Fix:** add `?page&limit` to both, same pattern as `feed`.

### 18. Missing indexes
- **Where:** `ConnectionRequest` model has no compound index on `(fromUserId, toUserId)` despite being queried together on nearly every request-related endpoint.
- **Fix:** `connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true })` — this also gives you duplicate-request prevention for free at the DB level, instead of relying only on application logic.

### 19. Feed has no stable sort + no server-side search on connections
- **Where:** `feed()` uses `.find()` with no `.sort()`, so results can shift between pages as the collection changes concurrently (duplicates/skips). `Connections.jsx` filters name/skill entirely client-side over a full unpaginated list.
- **Fix:** add `.sort({ _id: 1 })` (or `createdAt`) to `feed()` for stable pagination; once `myConnections` is paginated (item 17), add a `?search=` param there so filtering doesn't require loading everything client-side.

### 20. Skills array has weak validation
- **Where:** `people.js` only checks `value.length > 8`; nothing stops empty strings, excessive length, or case-duplicate entries if the API is called directly (bypassing the frontend's client-side dedupe in `Profile.jsx`).
- **Fix:** add a schema-level validator that trims, lowercases-for-comparison, rejects empty strings, and caps individual skill length (e.g. 30 chars).

### 21. `ConnectionRequest.status` has no `required`/default at schema level
- **Where:** `connectionRequest.js` — currently safe only because every controller path happens to set it explicitly.
- **Fix:** add `required: true` so a future code path can't accidentally save a statusless request.

---

## 🟢 General hardening

### 22. No centralized error handling
- **Evidence:** `app.js` has no `app.use((err, req, res, next) => ...)` error handler and no catch-all 404 route. `src/middleware/` contains only `authMiddleware.js`. Every controller repeats its own inline try/catch → `res.status(400)` pattern.
- **Why it matters:** any error thrown outside those try/catches (a sync error in middleware, an unhandled rejection) has no fallback — the request can hang with no response, or crash the process.
- **Fix:** add `errorMiddleware.js` (final `app.use` with 4 args) and a catch-all 404 handler; have controllers call `next(err)` instead of duplicating `res.status(400).json(...)` everywhere.

### 23. No request logging, `helmet`, or `compression`
- **Evidence:** `app.js`'s middleware stack is just `cors`, `express.json`, `cookieParser`, route mounts.
- **Fix:** add `morgan` (or `pino-http`) for request logs, `helmet()` for standard security headers, `compression()` for response gzip — all low-effort, high-value additions.

### 24. No rate limiting on auth routes
- **Where:** `/login`, `/signup` are unprotected against brute force.
- **Fix:** `express-rate-limit` on the auth router (e.g. 10 requests/15min per IP for `/login`).

### 25. Hardcoded CORS origin and unconfigured cookie flags
- **Where:** `app.js` — CORS origin is hardcoded to `http://localhost:5173`; login's `res.cookie` doesn't set `httpOnly`/`secure`/`sameSite` explicitly (see also item 2).
- **Fix:** move CORS origin to an env var (`process.env.FRONTEND_URL`), set explicit cookie flags so behavior doesn't silently depend on Express defaults.

### 26. No input validation layer beyond ad hoc checks
- **Where:** `editDetailsValidation` only checks *which keys* are allowed, not their types/ranges (e.g. `age` accepts any number).
- **Fix:** introduce a schema validator (zod or joi) at the route layer for all mutating endpoints (signup, updateProfile, updatePassword, send/receive request).

### 27. No tests anywhere
- **Evidence:** no `__tests__`, `*.test.js`, or `*.spec.js` in either `devTinder-backend` or `devTinder-frontend`.
- **Fix:** start with integration tests around auth (signup/login/token validity) and the connection-request lifecycle (send → receive → accept/reject) — these are the two flows most likely to regress as the fixes above land.

---

## Suggested order of attack

1. Items 1–4 (critical bugs) — small, isolated, high-risk-if-left-alone.
2. Item 11 (gender enum) — five-minute fix, currently actively breaking a UI flow.
3. Items 5–6 (sent requests, remove connection) — closes visible dead UI, moderate effort.
4. Item 10 (real file upload) — biggest performance win for the feed; do before optimizing feed pagination further.
5. Items 17–19 (pagination/indexes/sort) — do once item 10 stops bloating documents, so the wins compound.
6. Items 22–26 (hardening) — can be done incrementally alongside anything else.
7. Items 7–9, 13–15 (chat, notifications, password reset, account deletion, match preferences) — scope each as its own mini-project; these are genuinely new features, not fixes.
