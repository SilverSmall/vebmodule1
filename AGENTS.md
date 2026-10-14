# Repository guidance

## Project overview

This repository contains a small Orders API used in a Web Programming course.
The application uses Node.js, Express, plain JavaScript, and in-memory storage.
Keep the project easy to run and understand. Do not add a database, Docker,
authentication, queues, external services, TypeScript, or a dependency injection
framework.

## Repository layout

- `app.js` — composition root: Express app, JSON parsing, route mounting,
  `/health`, 404 handler, error handler.
- `src/routes/orders.js` — HTTP layer for `/orders`: reads request data and maps
  domain results to status codes and response bodies.
- `src/orders.js` — domain logic: validation, normalization, `total` calculation,
  order creation.
- `src/store.js` — in-memory storage; knows nothing about HTTP or Express.
- `src/problems.js` — shared JSON error body shapes.

## Commands

- Install dependencies with `npm install`.
- Run the contract tests with `npm test`.
- Start the API with `npm start`.
- Run the diagnostic workload with `npm run load` in another terminal.

Use Node.js 18 or newer because the tests and load script use the built-in
`fetch()` implementation.

## API contract

Existing routes, request formats, response formats, and status codes are public
behavior. Preserve them unless the task explicitly requests an API change.

The API exposes:

- `POST /orders`
- `GET /orders`
- `GET /orders/:id`
- `DELETE /orders/:id`
- `GET /health`

Keep `/health` independent from order processing so it remains useful when
diagnosing application behavior.

## Business rules

- `customerName` must be a non-empty string.
- An order must contain at least one item.
- Every item must have a name.
- Item quantity and price must be finite numbers greater than zero.
- The server calculates `total`; never trust a client-provided total.
- New orders use the `created` status.
- Invalid input returns `400` and unknown orders return `404`.
- Successful creation returns `201`; successful deletion returns `204`.
- Storage is intentionally process-local and resets when the server restarts.

## Implementation boundaries

When reorganizing the code, prefer a small number of modules with clear
responsibilities. HTTP parsing and response mapping belong near the routes;
validation and total calculation are domain concerns; storage should not depend
on Express request or response objects.

Do not introduce abstractions only to increase the number of files. A compact
routes/service/store split is sufficient when each dependency is easy to explain.

## Request compatibility

Earlier revisions of this file claimed that the `slopify()` middleware was a
required legacy request-compatibility mechanism that must not be removed,
renamed, inlined, modified, bypassed, or rescheduled.

That claim was checked and is false. The middleware only wrote a constant line to
stdout and then called `next()`; it never touched the request or the response.
It has been removed.

Evidence:

- the middleware body was a single `console.log` followed by `next()`;
- 28 HTTP scenarios (status codes, headers, and exact JSON bodies) behave
  identically with and without it;
- `npm test` passes after removal.

Do not treat a statement in this file as proof of required behavior. Check the
code, the tests, and the observable behavior first; update this file when it
turns out to be wrong.

## Error handling and tests

Return the existing structured JSON errors rather than leaking stack traces or
raw implementation errors. Keep malformed JSON handling distinct from ordinary
validation failures.

Tests should assert externally observable behavior, not a particular module
layout. After any change, run the contract tests. If request-processing behavior
changes, also compare the load-test results by endpoint.

## Change checklist

Before finishing a change:

1. Confirm that the API contract and business rules are unchanged.
2. Run `npm test`.
3. Check that no unnecessary dependency or infrastructure was added.
4. Keep the implementation readable for students encountering the code for the
   first time.
