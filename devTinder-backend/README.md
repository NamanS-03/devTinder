# devTinder Backend

Express 5 + MongoDB (Mongoose) API for devTinder.

## Running

```bash
cp .env.example .env   # then fill in the values
npm install
npm run dev            # nodemon, for development
npm start              # plain node, for production
```

## Project structure

A request flows **route → middleware/validator → controller → service → repository → model**.
Each layer only talks to the one below it.

```
src/
├── server.js         # entry point: connects to DB, starts listening, graceful shutdown
├── app.js            # builds the express app (middleware + routes + error handler)
├── config/           # env loading/validation, DB connection, cookie options
├── constants/        # statuses, allowed fields, limits - no magic strings elsewhere
├── routes/           # URL → middleware chain → controller. No logic.
├── middlewares/      # auth (peopleAuth), validate, 404 + central error handler
├── validators/       # request-shape checks (body/params); throw ApiError(400)
├── controllers/      # read req, call a service, shape the HTTP response
├── services/         # business rules (e.g. "can't send a request twice")
├── repositories/     # all mongoose queries live here
├── models/           # mongoose schemas
├── adapters/         # wrappers around third-party libs (bcrypt, jsonwebtoken)
└── utils/            # ApiError, pagination helper
```

### Where does new code go?

| You want to…                              | Put it in        |
| ----------------------------------------- | ---------------- |
| Add an endpoint                           | `routes/` + `controllers/` |
| Reject a bad request body / param         | `validators/`    |
| Add a business rule                       | `services/`      |
| Write a new DB query                      | `repositories/`  |
| Use a new external library / API (email, S3, …) | `adapters/` |

### Errors

Throw `ApiError` (`ApiError.notFound("...")`, `ApiError.conflict("...")`, …) from anywhere.
Express 5 forwards thrown/rejected errors to `middlewares/error.middleware.js`, which also
maps Mongoose/JWT errors to the right status. Every error response is `{ "message": "..." }`.

## How the code flows

### 1. Layers at a glance

Every request passes through the same stack. Arrows show who calls whom. A layer never
skips downwards (a controller never runs a query) and never calls upwards.

```mermaid
flowchart TD
    Client(["Frontend / HTTP client"])
    Global["app.js global middleware<br/>cors, express.json, cookieParser"]
    Router["routes/index.js<br/>mounts /, /profile, /request, /user"]

    subgraph PerRoute["Per-route chain, defined in routes/*.routes.js"]
        direction TB
        Auth["middlewares/auth.middleware.js<br/>peopleAuth, sets req.user"]
        Validate["middlewares/validate.middleware.js<br/>runs validators/*.validator.js"]
        Controller["controllers/*.controller.js<br/>read req, send res"]
        Auth --> Validate --> Controller
    end

    Service["services/*.service.js<br/>business rules"]
    Adapters["adapters/<br/>hash.adapter = bcrypt<br/>token.adapter = jsonwebtoken"]
    Repo["repositories/*.repository.js<br/>mongoose queries"]
    Model["models/*.model.js<br/>schemas"]
    DB[("MongoDB")]

    ErrorMw["middlewares/error.middleware.js<br/>errorHandler"]
    Success(["Response: 2xx + JSON"])
    Failure(["Response: 4xx/5xx + { message }"])

    Client --> Global --> Router --> Auth
    Controller --> Service
    Service --> Adapters
    Service --> Repo --> Model --> DB
    Controller == "res.json" ==> Success

    Auth -. "401" .-> ErrorMw
    Validate -. "400" .-> ErrorMw
    Service -. "404 / 409 / ..." .-> ErrorMw
    Repo -. "mongoose errors" .-> ErrorMw
    ErrorMw ==> Failure
```

`config/`, `constants/` and `utils/` are shared helpers that any layer may import, so they
are left out of the diagram.

### 2. Which route goes where

```mermaid
flowchart LR
    subgraph Public["No login needed"]
        S["POST /signup"] --> VS["validateSignup"] --> CS["auth.signup"]
        L["POST /login"] --> VL["validateLogin"] --> CL["auth.login"]
        O["POST /logout"] --> CO["auth.logout"]
        H["GET /health"]
    end

    subgraph Protected["peopleAuth runs first"]
        PV["GET /profile/view"] --> CPV["profile.view"]
        PU["PATCH /profile/updateProfile"] --> VPU["validateEditProfile"] --> CPU["profile.editDetails"]
        PP["PATCH /profile/updatePassword"] --> VPP["validateUpdatePassword"] --> CPP["profile.updatePassword"]
        RS["POST /request/send/:status/:toUserId"] --> VRS["validateSendRequest"] --> CRS["request.sendConnectionRequest"]
        RR["POST /request/receive/:status/:requestId"] --> VRR["validateReviewRequest"] --> CRR["request.acknowledgeConnectionRequest"]
        UR["GET /user/receivedRequest"] --> CUR["user.pendingConnectionRequest"]
        UC["GET /user/myConnections"] --> CUC["user.acceptedConnectionRequest"]
        UF["GET /user/feed?page&limit"] --> CUF["user.feed"]
    end
```

### 3. Example: login, then an authenticated request

```mermaid
sequenceDiagram
    autonumber
    actor U as Frontend
    participant R as auth.routes
    participant V as auth.validator
    participant C as auth.controller
    participant S as auth.service
    participant PR as people.repository
    participant H as hash.adapter
    participant T as token.adapter
    participant DB as MongoDB

    U->>R: POST /login {email, password}
    R->>V: validateLogin(req)
    V-->>R: ok (or throws 400)
    R->>C: login(req, res)
    C->>S: login({email, password})
    S->>PR: findByEmail(email)
    PR->>DB: People.findOne
    DB-->>PR: user or null
    PR-->>S: user
    S->>H: compare(password, user.password)
    H-->>S: true / false
    alt wrong email or password
        S-->>U: ApiError 401 "Invalid Email or Password" (via errorHandler)
    else correct
        S->>T: sign({_id})
        T-->>S: JWT (expires in 7d)
        S-->>C: {user, token}
        C-->>U: 200 + Set-Cookie token (httpOnly) + {message, data: user}
    end

    Note over U,DB: Every later protected request
    U->>R: GET /profile/view (cookie: token)
    R->>S: peopleAuth calls getUserFromToken(token)
    S->>T: verify(token)
    T-->>S: {_id} (or throws, which becomes 401)
    S->>PR: findById(_id)
    PR-->>S: user
    S-->>R: req.user = user
    R->>C: controller runs with req.user
```

### 4. Example: sending a connection request

This is the flow with the most business rules, and all of them live in `request.service.js`.

```mermaid
flowchart TD
    A["POST /request/send/:status/:toUserId"] --> B{"peopleAuth:<br/>valid token?"}
    B -- no --> E401["401"]
    B -- yes --> C{"validateSendRequest:<br/>status is ignored/interested<br/>and toUserId is an ObjectId?"}
    C -- no --> E400["400"]
    C -- yes --> D{"service: sending<br/>to yourself?"}
    D -- yes --> E400b["400"]
    D -- no --> F{"repo: does toUserId exist?"}
    F -- no --> E404["404 User Not Found"]
    F -- yes --> G{"repo: any request between<br/>these two users,<br/>in either direction?"}
    G -- yes --> E409["409 already exists"]
    G -- no --> H["repo: create ConnectionRequest"]
    H --> OK["201 + data"]
```

### 5. Life of a connection request

```mermaid
stateDiagram-v2
    [*] --> interested: sender swipes right<br/>POST /request/send/interested/:id
    [*] --> ignored: sender swipes left<br/>POST /request/send/ignored/:id
    interested --> accepted: receiver accepts<br/>POST /request/receive/accepted/:requestId
    interested --> rejected: receiver rejects<br/>POST /request/receive/rejected/:requestId
    ignored --> [*]
    accepted --> [*]
    rejected --> [*]
```

- Only `interested` requests appear in the receiver's `GET /user/receivedRequest`.
- Only `accepted` requests appear in `GET /user/myConnections`.
- Anyone the user has a request with, in **any** state and either direction, is left out of `GET /user/feed`.

### 6. How errors become responses

```mermaid
flowchart LR
    T["Anything thrown in a<br/>middleware, controller,<br/>service or repository"] --> X["Express 5 forwards it<br/>to errorHandler"]
    X --> N{"normalizeError"}
    N -- ApiError --> K["its own statusCode"]
    N -- "Mongoose ValidationError / CastError" --> B400["400"]
    N -- "duplicate key 11000" --> B409["409"]
    N -- "JWT expired / invalid" --> B401["401"]
    N -- "bad JSON body" --> J400["400"]
    N -- "body over 8mb" --> B413["413"]
    N -- "anything else" --> B500["500, logged to console,<br/>details hidden in production"]
    K & B400 & B409 & B401 & J400 & B413 & B500 --> R["{ message: '...' }"]
```

## Environment variables

See [.env.example](.env.example). `PORT`, `DB_CONNECTION_STRING` and `JWT_SECRET` are
required - the server refuses to start without them.
